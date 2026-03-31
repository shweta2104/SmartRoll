import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Footer from '../Footer';

const TeacherDashboard = () => {
    return (
        <div className="teacher-dashboard">
            <div className="container-fluid">
                {/* Header */}
                <header className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
                    <div className="container-fluid">
                        <span className="navbar-brand mb-0 h1">SmartRoll</span>
                        <span className="navbar-text mx-auto">Teacher Dashboard</span>
                        <div className="d-flex">
                            <Link to="/login" className="btn btn-outline-primary">
                                <i className="bi bi-box-arrow-right"></i> Logout
                            </Link>
                        </div>
                    </div>
                </header>
                <div className="row">
                    {/* Sidebar Navigation */}
                    <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
                        <div className="position-sticky">
                            <ul className="nav flex-column">
                                <li className="nav-item">
                                    <Link className="nav-link" to="">
                                        <i className="bi bi-house-door"></i> Home
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="classes">
                                        <i className="bi bi-building"></i> Classes
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="attendance">
                                        <i className="bi bi-check-circle"></i> Attendance
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="students">
                                        <i className="bi bi-people"></i> Students
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="subjects">
                                        <i className="bi bi-book"></i> Subjects
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="schedule">
                                        <i className="bi bi-calendar"></i> My Schedule
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Main Content Area */}
                    <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                        <Outlet />
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TeacherDashboard;
