import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

const TeacherLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/teachers/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });
            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('userId', user.userId);
                localStorage.setItem('userRole', user.role);
                localStorage.setItem('role', user.role);
                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('token', user.token);
                navigate('/teacher');
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

            {/* Left Side (Info Panel) */}
            <div className="login-left">
                <h1>SmartRoll</h1>
                <p>Smart Attendance Management System</p>
                <span>Track attendance efficiently & securely</span>
            </div>

            {/* Right Side (Login Card) */}
            <div className="login-right">

                <div className="login-card">
                    <h2>Teacher Login</h2>

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
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

                        {/* Password */}
                        <div className="input-box">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder=" "
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label>Password</label>

                            <span
                                className="toggle-eye"
                                onClick={togglePasswordVisibility}
                            >
                                👁
                            </span>
                        </div>

                        {/* Button */}
                        <button className="login-btn" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        {/* Links */}
                        <div className="login-links">
                            <a href="#">Forgot Password?</a>
                            <a href="/teacher/email-lookup">Find Email</a>
                        </div>

                        <p className="register-text">
                            Don't have an account?
                            <span onClick={() => navigate('/teacher/register')}>
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

export default TeacherLogin;
