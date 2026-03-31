import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/AdminDashboard.css';
import Footer from './Footer';

function AdminDashboard() {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname.includes(path) ? "nav-link active" : "nav-link";
    };

    return (
        <div className="admin-dashboard">

            {/* HEADER */}
            {/* HEADER */}
            <header className="admin-header">

                {/* LEFT: Logo */}
                <h4 className="logo-text">SmartRoll</h4>

                {/* CENTER: Title */}
                <div className="dashboard-title">
                    Admin Dashboard
                </div>

                {/* RIGHT: Logout */}
                <Link to="/admin-login" className="logout-btn">
                    Logout
                </Link>

            </header>
            <div className="dashboard-body">

                {/* SIDEBAR */}
                <nav className="sidebar">
                    <h6 className="menu-title">MENU</h6>

                    <Link className={isActive('/admin')} to="">
                        🏠 Dashboard
                    </Link>

                    <Link className={isActive('teachers')} to="teachers">
                        👨‍🏫 Teachers
                    </Link>

                    <Link className={isActive('students')} to="students">
                        👨‍🎓 Students
                    </Link>

                    <Link className={isActive('subjects')} to="subjects">
                        📚 Subjects
                    </Link>

                    <Link className={isActive('classes')} to="classes">
                        🏫 Classes
                    </Link>

                    <Link className={isActive('schedules')} to="schedules">
                        📅 Schedule
                    </Link>

                    <Link className={isActive('teacher-subject-class')} to="teacher-subject-class">
                        🔗 Mapping
                    </Link>
                </nav>

                {/* MAIN */}
                <main className="main-content">
                    <Outlet />
                </main>

            </div>

            <Footer />
        </div>
    );
}

export default AdminDashboard;