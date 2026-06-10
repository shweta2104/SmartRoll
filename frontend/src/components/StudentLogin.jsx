import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setTabItem } from '../hooks/useAuth';
import '../css/Login.css';

const StudentLogin = () => {
    const [pendingQrToken, setPendingQrToken] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem('pendingQrToken');
        if (token) {
            setPendingQrToken(token);
        }
    }, []);

    const qrAfterLoginRedirect = () => {
        if (pendingQrToken) {
            sessionStorage.removeItem('pendingQrToken');
            sessionStorage.removeItem('pendingQrSource');
            navigate(`/student/qr-attendance?token=${encodeURIComponent(pendingQrToken)}`);
            return true;
        }
        return false;
    };

    const [studentProfile, setStudentProfile] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const closeModalAndGoToDashboard = () => {
        setShowProfileModal(false);
        navigate('/student');
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/students/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const user = await response.json();
                setTabItem('student-userId', user.userId);
                setTabItem('student-userRole', user.role);
                setTabItem('student-userEmail', user.email);
                setTabItem('student-token', user.token);
                setTabItem('userId', user.userId);
                setTabItem('token', user.token);
                setTabItem('activeRole', 'STUDENT');


                // Fetch current student profile and show modal before navigating
                const profileRes = await fetch('/api/students/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    setStudentProfile(profile);
                    // If login originated from QR scan, redirect after login immediately.
                    if (!qrAfterLoginRedirect()) {
                        setShowProfileModal(true);
                    }
                } else {
                    // If profile fetch fails, still navigate (or redirect to QR)
                    if (!qrAfterLoginRedirect()) {
                        navigate('/student');
                    }
                }
            } else {
                setError('Invalid email or password');
            }
        } catch (error) {
            setError('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-wrapper">
            <div className="login-left">
                <h1>SmartRoll</h1>
                <p>Smart Attendance Management System</p>
                <span>Track attendance efficiently & securely</span>
            </div>

            <div className="login-right">
                <div className="login-card">
                    <h2>Student Login</h2>

                    {showProfileModal && studentProfile && (
                        <div className="modal-backdrop show" onClick={() => setShowProfileModal(false)} />
                    )}

                    {showProfileModal && studentProfile && (
                        <div className="modal show d-block" tabIndex="-1" role="dialog">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Welcome {studentProfile.fullName}</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowProfileModal(false)}
                                        />
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-2">
                                            <strong>Student ID:</strong> {studentProfile.studentId}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Full Name:</strong> {studentProfile.fullName}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Email:</strong> {studentProfile.email}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Contact Number:</strong> {studentProfile.contactNumber}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-primary" onClick={closeModalAndGoToDashboard}>
                                            Continue to Dashboard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>
                        <div className="input-box">
                            <input
                                type="email"
                                placeholder=" "
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <label>Email</label>
                        </div>

                        <div className="input-box">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder=" "
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label>Password</label>

                            <span className="toggle-eye" onClick={togglePasswordVisibility}>
                                👁
                            </span>
                        </div>

                        <button className="login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        <div className="login-links">
                            <a href="#">Forgot Password?</a>
                            <a href="/student/email-lookup">Find Email</a>
                        </div>

                        <p className="register-text">
                            Don't have an account?
                            <span onClick={() => navigate('/student-register')}>
                                Register
                            </span>
                        </p>

                        {error && <div className="error-msg">{error}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;


