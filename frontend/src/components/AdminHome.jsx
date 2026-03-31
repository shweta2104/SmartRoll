import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminHome = () => {
    const [counts, setCounts] = useState({
        students: 0,
        teachers: 0,
        subjects: 0,
        classes: 0
    });
    const [recentSchedules, setRecentSchedules] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE = '/api';
    const token = localStorage.getItem('token');
    const AUTH_HEADER = token ? { 'Authorization': `Bearer ${token}` } : {};

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const [studentsRes, teachersRes, subjectsRes, classesRes, schedulesRes, classesAllRes, subjectsAllRes, teachersAllRes] = await Promise.all([
                fetch(`${API_BASE}/students/count`, { headers: AUTH_HEADER, credentials: 'include' }),
                fetch(`${API_BASE}/teachers/count`, { headers: AUTH_HEADER, credentials: 'include' }),
                fetch(`${API_BASE}/subjects/count`, { headers: AUTH_HEADER, credentials: 'include' }),
                fetch(`${API_BASE}/classes/count`, { headers: AUTH_HEADER, credentials: 'include' }),
                fetch(`${API_BASE}/schedules`, { headers: AUTH_HEADER, credentials: 'include' }),
                fetch(`${API_BASE}/classes`, { headers: AUTH_HEADER, credentials: 'include' }),
                fetch(`${API_BASE}/subjects`, { headers: AUTH_HEADER, credentials: 'include' }),
                fetch(`${API_BASE}/teachers`, { headers: AUTH_HEADER, credentials: 'include' })
            ]);


            if (!studentsRes.ok || !teachersRes.ok || !subjectsRes.ok || !classesRes.ok) {
                throw new Error('Failed to fetch counts');
            }

            const studentsCount = await studentsRes.json();
            const teachersCount = await teachersRes.json();
            const subjectsCount = await subjectsRes.json();
            const classesCount = await classesRes.json();
            const schedulesData = await schedulesRes.json();
            const classesData = await classesAllRes.json();
            const subjectsData = await subjectsAllRes.json();
            const teachersData = await teachersAllRes.json();
            const recentSchedules = schedulesData.slice(-3); // Last 3 schedules

            setRecentSchedules(recentSchedules);
            setClasses(classesData);
            setSubjects(subjectsData);
            setTeachers(teachersData);

            setCounts({
                students: studentsCount,
                teachers: teachersCount,
                subjects: subjectsCount,
                classes: classesCount
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-5">Loading dashboard...</div>;
    if (error) return <div className="alert alert-danger">Error loading dashboard: {error}</div>;

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="display-4">Admin Dashboard</h1>
                    <p className="lead">Welcome, Admin 👋</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3 mb-3">
                    <Link to="students">
                        <div className="card text-center">
                            <div className="card-body">
                                <div className="card-title h1">👨‍🎓</div>
                                <h5 className="card-title">Students</h5>
                                <p className="card-text display-4">{counts.students}</p>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-3 mb-3">
                    <Link to="teachers">
                        <div className="card text-center">
                            <div className="card-body">
                                <div className="card-title h1">👩‍🏫</div>
                                <h5 className="card-title">Teachers</h5>
                                <p className="card-text display-4">{counts.teachers}</p>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-3 mb-3">
                    <Link to="subjects">
                        <div className="card text-center">
                            <div className="card-body">
                                <div className="card-title h1">📘</div>
                                <h5 className="card-title">Subjects</h5>
                                <p className="card-text display-4">{counts.subjects}</p>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-3 mb-3">
                    <Link to="classes">
                        <div className="card text-center">
                            <div className="card-body">
                                <div className="card-title h1">🏫</div>
                                <h5 className="card-title">Classes</h5>
                                <p className="card-text display-4">{counts.classes}</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row mb-4">
                <div className="col-12">
                    <h3>Quick Actions</h3>
                    <div className="d-flex flex-wrap gap-2">
                        <button className="btn btn-primary">+ Add Student</button>
                        <button className="btn btn-primary">+ Add Teacher</button>
                        <button className="btn btn-primary">+ Add Subject</button>
                        <button className="btn btn-primary">+ Create Class</button>
                        <button className="btn btn-secondary">🔗 Academic Mapping</button>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <h3>Recent Activities</h3>
                    <ul className="list-group">
                        {recentSchedules.length > 0 ? (
                            recentSchedules.map((schedule, index) => {
                                const cls = classes.find(c => c.id === schedule.classId);
                                const teacher = teachers.find(t => t.id === schedule.teacherId);
                                const className = cls ? cls.className : schedule.classId;
                                const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : schedule.teacherId;
                                return (
                                    <li key={index} className="list-group-item">
                                        • Schedule created: {className} - {teacherName} ({new Date(schedule.startTime).toLocaleDateString()})
                                    </li>
                                );
                            })
                        ) : (
                            <li className="list-group-item text-muted">No recent schedules</li>
                        )}

                    </ul>

                </div>

                {/* System Status */}
                <div className="col-md-6">
                    <h3>System Status</h3>
                    <div className="card">
                        <div className="card-body">
                            <p><strong>Server Status:</strong> 🟢 Running</p>
                            <p><strong>Database:</strong> 🟢 Connected</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
