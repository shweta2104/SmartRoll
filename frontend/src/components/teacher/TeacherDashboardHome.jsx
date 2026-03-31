import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const TeacherDashboardHome = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClasses: 0,
        totalStudents: 0,
        todayAttendance: 0,
        absentToday: 0,
        subjectsHandled: 0,
        pendingLeaves: 0
    });

    const [todayClass, setTodayClass] = useState(null);
    const [monthlyData, setMonthlyData] = useState({ labels: [], data: [] });
    const [subjectWiseData, setSubjectWiseData] = useState({ labels: [], data: [] });
    const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            try {
                // First: Fetch classes to get classIds
                const classesRes = await fetch('/api/classes', { headers, credentials: 'include' });
                let classIds = [];
                let allClasses = [];

                if (classesRes.ok) {
                    allClasses = await classesRes.json();
                    classIds = Array.isArray(allClasses) ? allClasses.map(c => c.id) : [];
                }

                let newStats = { ...stats };
                newStats.totalClasses = classIds.length;

                // Second: Fetch remaining data in parallel
                const [studentsRes, teacherRes, scheduleRes] = await Promise.all([
                    fetch('/api/students', { headers, credentials: 'include' }),
                    fetch(`/api/teachers/userId/${userId}`, { headers, credentials: 'include' }),
                    fetch('/api/teacher-subject-class/teacher', { headers, credentials: 'include' })
                ]);

                // Total Students
                if (studentsRes.ok) {
                    const studentData = await studentsRes.json();
                    newStats.totalStudents = Array.isArray(studentData) ? studentData.length : 0;
                }

                // Teacher Info
                if (teacherRes.ok) {
                    const teacher = await teacherRes.json();
                    setTodayClass(teacher);
                }

                // Subject-wise Data
                if (scheduleRes.ok) {
                    const schedules = await scheduleRes.json();
                    if (Array.isArray(schedules) && schedules.length > 0) {
                        const subjectGroups = {};
                        schedules.forEach(sch => {
                            const subject = sch.subject?.subjectName || 'Unknown';
                            if (!subjectGroups[subject]) {
                                subjectGroups[subject] = 0;
                            }
                            subjectGroups[subject]++;
                        });
                        newStats.subjectsHandled = Object.keys(subjectGroups).length;
                        setSubjectWiseData({
                            labels: Object.keys(subjectGroups).slice(0, 5),
                            data: Object.values(subjectGroups).slice(0, 5).map(v => Math.min(100, v * 15))
                        });
                    }
                }

                // Third: Fetch attendance data if we have class IDs
                if (classIds.length > 0) {
                    const classIdsParam = classIds.join(',');

                    const [attendanceRes, absentRes, monthlyRes] = await Promise.all([
                        fetch(`/api/attendance/dashboard/today-percentage?classIds=${classIdsParam}`, { headers, credentials: 'include' }),
                        fetch(`/api/attendance/dashboard/today-absent?classIds=${classIdsParam}`, { headers, credentials: 'include' }),
                        fetch(`/api/attendance/dashboard/monthly-trend?classIds=${classIdsParam}&startDate=${new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`, { headers, credentials: 'include' })
                    ]);

                    // Today's Attendance %
                    if (attendanceRes.ok) {
                        const attData = await attendanceRes.json();
                        newStats.todayAttendance = typeof attData === 'number' ? Math.round(attData) : 0;
                    }

                    // Absent Today
                    if (absentRes.ok) {
                        const absentData = await absentRes.json();
                        newStats.absentToday = typeof absentData === 'number' ? absentData : 0;
                    }

                    // Monthly Trend
                    if (monthlyRes.ok) {
                        const monthlyRecords = await monthlyRes.json();
                        if (Array.isArray(monthlyRecords) && monthlyRecords.length > 0) {
                            // Process monthly data
                            const dateMap = {};
                            monthlyRecords.forEach(record => {
                                const date = record.date;
                                if (!dateMap[date]) {
                                    dateMap[date] = { present: 0, total: 0 };
                                }
                                dateMap[date].total++;
                                if (record.status === 'PRESENT') {
                                    dateMap[date].present++;
                                }
                            });

                            const sortedDates = Object.keys(dateMap).sort().slice(-7); // Last 7 days
                            setMonthlyData({
                                labels: sortedDates.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                                data: sortedDates.map(d => Math.round((dateMap[d].present / dateMap[d].total) * 100))
                            });
                        }
                    }
                }

                newStats.pendingLeaves = 0;
                setStats(newStats);
                setLowAttendanceStudents([]);

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getCurrentDate = () => {
        const date = new Date();
        return date.toDateString();
    };

    const lineChartData = {
        labels: monthlyData.labels,
        datasets: [
            {
                label: 'Attendance %',
                data: monthlyData.data,
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78,115,223,0.2)',
                tension: 0.4,
            },
        ],
    };

    const barChartData = {
        labels: subjectWiseData.labels,
        datasets: [
            {
                label: 'Attendance %',
                data: subjectWiseData.data,
                backgroundColor: '#1cc88a',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
    };

    if (loading) {
        return (
            <div className="loader-container">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-home">

            {/* SUMMARY CARDS */}
            <div className="dashboard-grid">
                <div className="dashboard-card gradient-blue">
                    <h6>Total Classes</h6>
                    <h2>{stats.totalClasses}</h2>
                </div>

                <div className="dashboard-card gradient-green">
                    <h6>Total Students</h6>
                    <h2>{stats.totalStudents}</h2>
                </div>

                <div className="dashboard-card gradient-purple">
                    <h6>Attendance %</h6>
                    <h2>{stats.todayAttendance}%</h2>
                </div>

                <div className="dashboard-card gradient-orange">
                    <h6>Absent Today</h6>
                    <h2>{stats.absentToday}</h2>
                </div>

                <div className="dashboard-card gradient-red">
                    <h6>Subjects</h6>
                    <h2>{stats.subjectsHandled}</h2>
                </div>

                <div className="dashboard-card gradient-dark">
                    <h6>Pending Leaves</h6>
                    <h2>{stats.pendingLeaves}</h2>
                </div>
            </div>

            {/* CHARTS */}
            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="glass-card">
                        <h5>📊 Monthly Trend</h5>
                        <div className="chart-box">
                            <Line data={lineChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="glass-card">
                        <h5>📚 Subject-wise</h5>
                        <div className="chart-box">
                            <Bar data={barChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* LOW ATTENDANCE */}
            <div className="glass-card mt-4">
                <h5 className="text-danger">⚠ Low Attendance</h5>

                <div className="table-responsive">
                    <table className="table custom-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Roll</th>
                                <th>%</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowAttendanceStudents.length > 0 ? (
                                lowAttendanceStudents.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.name}</td>
                                        <td>{s.rollNo}</td>
                                        <td>{s.attendance}%</td>
                                        <td><span className="badge bg-danger">Warning</span></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-success text-center">
                                        All Good 🎉
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* TODAY CLASS */}
            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="glass-card">
                        <h5>📅 Quick Info</h5>

                        {todayClass ? (
                            <>
                                <p className="text-muted">{getCurrentDate()}</p>
                                <p><b>{todayClass.firstName} {todayClass.lastName}</b></p>
                                <p>Dept: {todayClass.dept || 'N/A'}</p>
                                <p className="small text-muted">{todayClass.email}</p>

                                <Link to="/teacher/attendance" className="btn btn-primary mt-2">
                                    Mark Attendance
                                </Link>
                            </>
                        ) : (
                            <p className="text-muted">Loading...</p>
                        )}
                    </div>
                </div>

                {/* LEAVE REQUEST */}
                <div className="col-md-6">
                    <div className="glass-card">
                        <h5>📩 Leave Requests</h5>

                        {notifications.length === 0 ? (
                            <p className="text-muted">No requests</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="leave-box">
                                    <p>{n.title}</p>
                                    <button className="btn btn-success btn-sm">Approve</button>
                                    <button className="btn btn-danger btn-sm">Reject</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="glass-card mt-4">
                <h5>⚡ Quick Actions</h5>

                <div className="quick-actions">
                    <Link to="/teacher/attendance" className="btn btn-primary">Add Attendance</Link>
                    <Link to="/teacher/students" className="btn btn-success">Students</Link>
                    <Link to="/teacher/schedule" className="btn btn-info">Reports</Link>
                </div>
            </div>

        </div>
    );
};

export default TeacherDashboardHome;