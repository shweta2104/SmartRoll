import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/Home.css';
import Footer from './Footer';

const Home = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div className="home-container page-wrapper">
            {/* Header */}
            <header className="header bg-white shadow-sm border-bottom sticky-top">
                <div className="container d-flex justify-content-between align-items-center py-3">
                    <div className="d-flex align-items-center">
                        <h4 className="mb-0 fw-bold text-primary">SmartRoll</h4>
                    </div>
                    <div className="d-flex gap-2">
                        <div className="d-flex gap-3 justify-content-center flex-wrap">
                            <Link to="/teacher-login" className="btn btn-primary btn-lg px-4">
                                👨‍🏫 Teacher Login
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Welcome Section */}
            <section className="welcome-section py-5 bg-light border-bottom">
                <div className="container text-center">
                    <h1 className="display-4 fw-bold text-primary mb-3 animate-slide-up">Welcome to Smart Attendance Management System</h1>
                    <p className="lead text-muted mb-0 animate-slide-up delay-1">Transforming attendance tracking with modern technology</p>
                </div>
            </section>

            {/* Hero Section */}
            <div className={`hero-section d-flex flex-column justify-content-center align-items-center vh-75 text-center ${isVisible ? 'fade-in' : ''}`}>
                <h3 className="display-7 fw-bold text-primary mb-1 animate-slide-up">Smart Attendance Management System</h3>
                <p className="lead text-muted mb-4 animate-slide-up delay-1">
                    A web-based system to manage and monitor academic attendance efficiently.
                </p>
                <Link to="/teacher-login" className="btn btn-primary btn-lg px-5 py-3 animate-slide-up delay-2 hover-lift">
                    Get Started
                </Link>
            </div>

            {/* How It Works Section */}
            <div className="how-it-works-section py-5 bg-white">
                <div className="container">
                    <h2 className="text-center mb-5">How It Works</h2>
                    <div className="row g-4 justify-content-center">
                        <div className="col-lg-4 col-md-6">
                            <div className="card h-100 border-0 shadow-sm hover-lift text-center p-4">
                                <div className="card-body d-flex flex-column align-items-center">
                                    <div className="step-icon mb-3">
                                        <i className="fas fa-sign-in-alt text-primary" style={{ fontSize: '2.5rem' }}></i>
                                    </div>
                                    <h5 className="card-title mb-3">Login</h5>
                                    <p className="card-text text-muted flex-grow-1">Securely log in to access your personalized dashboard.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="card h-100 border-0 shadow-sm hover-lift text-center p-4">
                                <div className="card-body d-flex flex-column align-items-center">
                                    <div className="step-icon mb-3">
                                        <i className="fas fa-tachometer-alt text-success" style={{ fontSize: '2.5rem' }}></i>
                                    </div>
                                    <h5 className="card-title mb-3">Role-based Dashboard</h5>
                                    <p className="card-text text-muted flex-grow-1">Navigate through a customized interface based on your role.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                            <div className="card h-100 border-0 shadow-sm hover-lift text-center p-4">
                                <div className="card-body d-flex flex-column align-items-center">
                                    <div className="step-icon mb-3">
                                        <i className="fas fa-calendar-check text-info" style={{ fontSize: '2.5rem' }}></i>
                                    </div>
                                    <h5 className="card-title mb-3">Attendance Management</h5>
                                    <p className="card-text text-muted flex-grow-1">Easily manage and track attendance records.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="cta-section py-5 bg-primary text-white">
                <div className="container text-center">
                    <h3 className="mb-3">Ready to streamline your attendance management?</h3>
                    <p className="mb-4">Join thousands of educational institutions using our system.</p>
                    <Link to="/teacher-login" className="btn btn-light btn-lg px-5 py-3">
                        Start Login
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Home;
