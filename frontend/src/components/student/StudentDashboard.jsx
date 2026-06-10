import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import '../../css/StudentDashboard.css';

const StudentDashboard = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname.includes(path) ? 'nav-link active' : 'nav-link';
    };

    return (
        <div className="student-dashboard">
            {/* HEADER */}
            <header className="student-header">
                <div className="header-left">
                    <h4 className="logo">SmartRoll</h4>
                </div>

                <div className="header-center">
                    <h5>Student Dashboard</h5>
                </div>

                <div className="header-right">
                    <Link to="/student-login" className="logout-btn">
                        <i className="bi bi-box-arrow-right"></i> Logout
                    </Link>
                </div>
            </header>

            <div className="dashboard-body">
                {/* SIDEBAR */}
                <nav className="sidebar">
                    <Link className={isActive('/student')} to="/student">
                        🏠 Dashboard
                    </Link>
                    <Link className={isActive('/student/classes')} to="/student/classes">
                        📚 Classes
                    </Link>
                    <Link className={isActive('/student/subjects')} to="/student/subjects">
                        📖 Subjects
                    </Link>
                    <Link className={isActive('/student/attendance')} to="/student/attendance">
                        ✅ Attendance
                    </Link>

                    <Link className={isActive('/student/schedule')} to="/student/schedule">
                        🗓️ Schedule
                    </Link>
                    <Link className={isActive('/student/profile')} to="/student/profile">
                        👤 Profile
                    </Link>
                </nav>

                {/* MAIN */}
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentDashboard;

