import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/Home.css';

const StudentDashboardHome = () => {
    return (
        <div className="home-container">
            {/* Hero Section (same design as Home.jsx) */}
            <section className="hero-section">
                <div className="container text-center hero-content">
                    <h1 className="hero-title">Smart Attendance System</h1>
                    <p className="hero-subtitle">Smart, fast & secure attendance tracking</p>

                    <Link to="/student/classes" className="btn btn-warning btn-lg mt-4 hero-btn">
                        View My Classes
                    </Link>
                </div>

                {/* Decorative shapes */}
                <div className="circle c1"></div>
                <div className="circle c2"></div>
            </section>

            {/* Instructions */}
            <section className="instruction-section">
                <div className="container">
                    <h2 className="section-title">Student Instructions</h2>

                    <div className="row mt-5">
                        <div className="col-md-6">
                            <div className="instruction-card hover-card">
                                <h5>📧 Email Access</h5>
                                <p>Your email is used for login.</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="instruction-card hover-card">
                                <h5>✅ Attendance</h5>
                                <p>Check your daily attendance status.</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="instruction-card hover-card">
                                <h5>📚 Classes</h5>
                                <p>View your enrolled classes.</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="instruction-card hover-card">
                                <h5>🗓️ Schedule</h5>
                                <p>See your timetable and upcoming sessions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section text-center">
                <div className="container">
                    <h3>Ready to track your attendance?</h3>
                    <Link to="/student/attendance" className="btn btn-light btn-lg mt-3 btn-hover">
                        Go to Attendance 🚀
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default StudentDashboardHome;

