import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../../css/TeacherDashboard.css';
import Footer from '../Footer';

const TeacherDashboard = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname.includes(path) ? "nav-link active" : "nav-link";
    };

    return (
        <div className="teacher-dashboard">

            {/* HEADER */}
            <header className="teacher-header">
                <div className="header-left">
                    <h4 className="logo">SmartRoll</h4>
                </div>

                <div className="header-center">
                    <h5>Teacher Dashboard</h5>
                </div>

                <div className="header-right">
                    <Link to="/teacher-login" className="logout-btn">
                        <i className="bi bi-box-arrow-right"></i> Logout
                    </Link>
                </div>
            </header>

            <div className="dashboard-body">

                {/* SIDEBAR */}
                <nav className="sidebar">
                    <Link className={isActive('/teacher')} to="">🏠 Dashboard</Link>
                    <Link className={isActive('classes')} to="classes">🏫 Classes</Link>
                    <Link className={isActive('attendance')} to="attendance">✅ Attendance</Link>
                    <Link className={isActive('students')} to="students">👨‍🎓 Students</Link>
                    <Link className={isActive('subjects')} to="subjects">📚 Subjects</Link>
                    <Link className={isActive('schedule')} to="schedule">📅 Schedule</Link>
                </nav>

                {/* MAIN */}
                <main className="main-content">
                    <Outlet />
                </main>

            </div>

            <Footer />
        </div>
    );
};

export default TeacherDashboard;