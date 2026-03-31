import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Home.css';
import Footer from './Footer';

const Home = () => {

    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(true);
    }, []);

    return (
        <div className="home-container">

            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light glass-nav sticky-top">
                <div className="container">
                    <h4 className="fw-bold text-primary m-0">SmartRoll</h4>

                    <Link to="/teacher-login" className="btn btn-primary btn-hover">
                        👨‍🏫 Teacher Login
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container text-center hero-content">

                    <h1 className="hero-title">
                        Smart Attendance System
                    </h1>

                    <p className="hero-subtitle">
                        Smart, fast & secure attendance tracking
                    </p>

                    <Link to="/teacher-login" className="btn btn-warning btn-lg mt-4 hero-btn">
                        Get Started
                    </Link>

                </div>

                {/* Decorative shapes */}
                <div className="circle c1"></div>
                <div className="circle c2"></div>
            </section>
            {/* Instructions */}
            <section className="instruction-section">
                <div className="container">
                    <h2 className="section-title">Instructions</h2>

                    <div className="row mt-5">

                        <div className="col-md-6">
                            <div className="instruction-card hover-card">
                                <h5>📧 Email Access</h5>
                                <p>Email ID will be provided by Admin.</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="instruction-card hover-card">
                                <h5>🔐 Login</h5>
                                <p>Use your email to login into system.</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="instruction-card hover-card">
                                <h5>🧑‍💻 Create Password</h5>
                                <p>Set your own password at first login.</p>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="instruction-card hover-card">
                                <h5>📊 Dashboard</h5>
                                <p>Manage attendance from your dashboard.</p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section text-center">
                <div className="container">
                    <h3>Ready to simplify attendance?</h3>
                    <Link to="/teacher-login" className="btn btn-light btn-lg mt-3 btn-hover">
                        Start Now 🚀
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;