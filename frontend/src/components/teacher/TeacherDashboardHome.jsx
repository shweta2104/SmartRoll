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

// Register ChartJS components
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
    const [teacher, setTeacher] = useState(null);
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
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [monthlyData, setMonthlyData] = useState({ labels: [], data: [] });
    const [subjectWiseData, setSubjectWiseData] = useState({ labels: [], data: [] });
    const [lowAttendanceStudents, setLowAttendanceStudents] = useState([]);

    useEffect(() => {
        fetchTeacherData();
    }, []);

    const fetchTeacherData = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch teacher details
            const teacherRes = await fetch(`/api/teachers/userId/${userId}`, { headers });
            if (teacherRes.ok) {
                const teacherData = await teacherRes.json();
                setTeacher(teacherData);

                // Fetch all related data
                await Promise.all([
                    fetchClasses(teacherData.id, headers),
                    fetchSubjects(headers),
                    fetchSchedules(teacherData.id, headers),
                    fetchNotifications(teacherData.userId, headers)
                ]);
            }
        } catch (err) {
            console.error('Error fetching teacher data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async (teacherId, headers) => {
        try {
            const res = await fetch(`/api/classes/teacher/${teacherId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setClasses(data);
                setStats(prev => ({ ...prev, totalClasses: data.length, totalStudents: 0 }));

                // Calculate total students
                let totalStudents = 0;
                for (const cls of data) {
                    const studentsRes = await fetch(`/api/students/class/${cls.id}`, { headers });
                    if (studentsRes.ok) {
                        const students = await studentsRes.json();
                        totalStudents += students.length;
                    }
                }
                setStats(prev => ({ ...prev, totalStudents }));

                // Fetch analytics for these classes
                const classIds = data.map(c => c.id);
                await fetchAnalytics(classIds, headers);
            }
        } catch (err) {
            console.error('Error fetching classes:', err);
        }
    };

    const fetchSubjects = async (headers) => {
        try {
            const res = await fetch('/api/subjects', {});
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
                setStats(prev => ({ ...prev, subjectsHandled: data.length }));
            }
        } catch (err) {
            console.error('Error fetching subjects:', err);
        }
    };

    const fetchSchedules = async (teacherId, headers) => {
        try {
            const res = await fetch(`/api/schedules/teacher/${teacherId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setSchedules(data);

                // Find today's class
                const today = new Date();
                const dayOfWeek = today.getDay();
                const todaySchedule = data.find(s => {
                    const scheduleDate = new Date(s.startTime);
                    return scheduleDate.getDay() === dayOfWeek;
                });

                if (todaySchedule) {
                    const classInfo = classes.find(c => c.id === todaySchedule.classId);
                    const subjectInfo = subjects.find(s => s.id === todaySchedule.subjectId);
                    setTodayClass({
                        ...todaySchedule,
                        className: classInfo?.className || 'N/A',
                        subjectName: subjectInfo?.name || 'N/A',
                        startTime: new Date(todaySchedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        endTime: new Date(todaySchedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching schedules:', err);
        }
    };

    const fetchNotifications = async (userId, headers) => {
        try {
            // Fetch notifications for this teacher
            const res = await fetch(`/api/notifications/user/${userId}`, { headers });
            if (res.ok) {
                const data = await res.json();
                const pendingLeaves = data.filter(n => !n.isRead && n.title.toLowerCase().includes('leave'));
                setNotifications(data);
                setStats(prev => ({ ...prev, pendingLeaves: pendingLeaves.length }));
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    const fetchAnalytics = async (classIds, headers) => {
        try {
            if (!classIds || classIds.length === 0) {
                console.log('No classIds available for analytics');
                return;
            }

            // Build query string for classIds
            const classIdsParam = classIds.join(',');

            // Fetch today's attendance percentage
            try {
                const todayPercentRes = await fetch(`/api/attendance/dashboard/today-percentage?classIds=${classIdsParam}`, { headers });
                if (todayPercentRes.ok) {
                    const todayPercent = await todayPercentRes.json();
                    setStats(prev => ({ ...prev, todayAttendance: Math.round(todayPercent) }));
                }
            } catch (err) {
                console.error('Error fetching today attendance percentage:', err);
            }

            // Fetch today's absent students count
            try {
                const absentRes = await fetch(`/api/attendance/dashboard/today-absent?classIds=${classIdsParam}`, { headers });
                if (absentRes.ok) {
                    const absentCount = await absentRes.json();
                    setStats(prev => ({ ...prev, absentToday: absentCount }));
                }
            } catch (err) {
                console.error('Error fetching absent count:', err);
            }

            // Fetch monthly attendance trend (last 6 months)
            try {
                const today = new Date();
                const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
                const startDate = sixMonthsAgo.toISOString().split('T')[0];
                const endDate = today.toISOString().split('T')[0];

                const monthlyRes = await fetch(`/api/attendance/dashboard/monthly-trend?classIds=${classIdsParam}&startDate=${startDate}&endDate=${endDate}`, { headers });
                if (monthlyRes.ok) {
                    const monthlyDataRaw = await monthlyRes.json();

                    // Group attendance by month and calculate percentage
                    const monthMap = {};
                    monthlyDataRaw.forEach(attendance => {
                        const month = new Date(attendance.date).toLocaleString('default', { month: 'short' });
                        if (!monthMap[month]) {
                            monthMap[month] = { total: 0, present: 0 };
                        }
                        monthMap[month].total++;
                        if (attendance.status === 'PRESENT') {
                            monthMap[month].present++;
                        }
                    });

                    const months = Object.keys(monthMap);
                    const percentData = months.map(m =>
                        monthMap[m].total > 0 ? Math.round((monthMap[m].present / monthMap[m].total) * 100) : 0
                    );

                    setMonthlyData({
                        labels: months,
                        data: percentData
                    });
                }
            } catch (err) {
                console.error('Error fetching monthly trend:', err);
            }

            // Fetch subject-wise attendance
            try {
                const subjectWiseRes = await fetch(`/api/attendance/dashboard/subject-wise?classIds=${classIdsParam}`, { headers });
                if (subjectWiseRes.ok) {
                    const subjectData = await subjectWiseRes.json();

                    const labels = [];
                    const data = [];

                    subjectData.forEach(item => {
                        const subject = subjects.find(s => s.id === item[1]);
                        labels.push(subject ? subject.name : `Subject ${item[1]}`);
                        data.push(Math.round(item[2] || 0));
                    });

                    setSubjectWiseData({
                        labels: labels,
                        data: data
                    });
                }
            } catch (err) {
                console.error('Error fetching subject-wise attendance:', err);
            }

            // Fetch low attendance students
            try {
                const lowAttendanceRes = await fetch(`/api/attendance/dashboard/low-attendance?classIds=${classIdsParam}`, { headers });
                if (lowAttendanceRes.ok) {
                    const lowAttendanceData = await lowAttendanceRes.json();

                    // Get student details for each low attendance record
                    const lowStudents = [];
                    for (const item of lowAttendanceData) {
                        try {
                            const studentRes = await fetch(`/api/students/${item[0]}`, { headers });
                            if (studentRes.ok) {
                                const student = await studentRes.json();
                                lowStudents.push({
                                    id: student.id,
                                    name: `${student.firstName} ${student.lastName}`,
                                    rollNo: student.rollNo,
                                    attendance: Math.round(item[1])
                                });
                            }
                        } catch (err) {
                            console.error('Error fetching student details:', err);
                        }
                    }

                    setLowAttendanceStudents(lowStudents);
                }
            } catch (err) {
                console.error('Error fetching low attendance students:', err);
            }

        } catch (err) {
            console.error('Error fetching analytics:', err);
        }
    };

    const getCurrentDate = () => {
        const date = new Date();
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const handleApproveLeave = async (notificationId) => {
        // Handle approve leave logic
        alert('Leave approved!');
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setStats(prev => ({ ...prev, pendingLeaves: prev.pendingLeaves - 1 }));
    };

    const handleRejectLeave = async (notificationId) => {
        // Handle reject leave logic
        alert('Leave rejected!');
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setStats(prev => ({ ...prev, pendingLeaves: prev.pendingLeaves - 1 }));
    };

    const lineChartData = {
        labels: monthlyData.labels,
        datasets: [
            {
                label: 'Attendance %',
                data: monthlyData.data,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="teacher-dashboard-home">
            {/* 1. Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-4 col-sm-6 mb-3">
                    <div className="card summary-card bg-primary text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Classes Assigned</h6>
                            <h2 className="mb-0">{stats.totalClasses}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 col-sm-6 mb-3">
                    <div className="card summary-card bg-success text-white">
                        <div className="card-body">
                            <h6 className="card-title">Total Students</h6>
                            <h2 className="mb-0">{stats.totalStudents}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 col-sm-6 mb-3">
                    <div className="card summary-card bg-info text-white">
                        <div className="card-body">
                            <h6 className="card-title">Today's Attendance %</h6>
                            <h2 className="mb-0">{stats.todayAttendance}%</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 col-sm-6 mb-3">
                    <div className="card summary-card bg-warning text-white">
                        <div className="card-body">
                            <h6 className="card-title">Absent Today</h6>
                            <h2 className="mb-0">{stats.absentToday}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 col-sm-6 mb-3">
                    <div className="card summary-card bg-danger text-white">
                        <div className="card-body">
                            <h6 className="card-title">Subjects Handled</h6>
                            <h2 className="mb-0">{stats.subjectsHandled}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 col-sm-6 mb-3">
                    <div className="card summary-card bg-secondary text-white">
                        <div className="card-body">
                            <h6 className="card-title">Pending Leave Requests</h6>
                            <h2 className="mb-0">{stats.pendingLeaves}</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Attendance Analytics Section */}
            <div className="row mb-4">
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">📊 Monthly Attendance Trend</h5>
                        </div>
                        <div className="card-body" style={{ height: '300px' }}>
                            <Line data={lineChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">📚 Subject-wise Attendance</h5>
                        </div>
                        <div className="card-body" style={{ height: '300px' }}>
                            <Bar data={barChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Low Attendance Alert Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-danger">
                        <div className="card-header bg-danger text-white">
                            <h5 className="mb-0">⚠️ Low Attendance Alert (Below 75%)</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Roll No</th>
                                            <th>Attendance %</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lowAttendanceStudents.map(student => (
                                            <tr key={student.id} className="table-danger">
                                                <td>{student.name}</td>
                                                <td>{student.rollNo}</td>
                                                <td>{student.attendance}%</td>
                                                <td>
                                                    <span className="badge bg-danger">⚠ Warning</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {lowAttendanceStudents.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center text-success">
                                                    All students have good attendance!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Today's Class Section */}
            <div className="row mb-4">
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">📅 Today's Class</h5>
                        </div>
                        <div className="card-body">
                            <p><strong>📅 Date:</strong> {getCurrentDate()}</p>
                            {todayClass ? (
                                <>
                                    <p><strong>📚 Subject:</strong> {todayClass.subjectName}</p>
                                    <p><strong>🏫 Class:</strong> {todayClass.className}</p>
                                    <p><strong>⏰ Time:</strong> {todayClass.startTime} – {todayClass.endTime}</p>
                                    <p><strong>🚪 Room:</strong> {todayClass.room || 'N/A'}</p>
                                    <div className="mt-3">
                                        <Link to="/teacher/attendance" className="btn btn-primary me-2">
                                            📝 Mark Attendance
                                        </Link>
                                        <button className="btn btn-secondary">
                                            📱 Generate QR Code
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted">No class scheduled for today.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 5. Leave Requests Section */}
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-header bg-warning text-dark">
                            <h5 className="mb-0">📩 Leave Requests</h5>
                        </div>
                        <div className="card-body">
                            {notifications.length > 0 ? (
                                <div className="leave-requests-list">
                                    {notifications.slice(0, 3).map(notification => (
                                        <div key={notification.id} className="border-bottom pb-3 mb-3">
                                            <p className="mb-1"><strong>{notification.title}</strong></p>
                                            <p className="mb-2 text-muted small">{notification.message}</p>
                                            <div>
                                                <button
                                                    className="btn btn-sm btn-success me-2"
                                                    onClick={() => handleApproveLeave(notification.id)}
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleRejectLeave(notification.id)}
                                                >
                                                    ✗ Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted">No pending leave requests.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. Quick Action Buttons */}
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">⚡ Quick Actions</h5>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-wrap gap-2">
                                <Link to="/teacher/attendance" className="btn btn-primary">
                                    ➕ Add Attendance
                                </Link>
                                <Link to="/teacher/schedule" className="btn btn-info">
                                    📊 View Reports
                                </Link>
                                <button className="btn btn-secondary">
                                    📄 Export PDF
                                </button>
                                <Link to="/teacher/students" className="btn btn-success">
                                    👥 View Student List
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .summary-card {
                    border-radius: 10px;
                    transition: transform 0.2s;
                }
                .summary-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                .card {
                    border-radius: 10px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
};

export default TeacherDashboardHome;
