import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

function StudentRegister() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/students/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(data || "Registered successfully");

                setTimeout(() => {
                    navigate('/student-login');
                }, 2000);
            } else {
                const errorText = await response.text();
                setError(errorText || 'Registration failed. Please try again.');
            }

        } catch (error) {
            setError('Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-wrapper">

            {/* LEFT */}
            <div className="register-left">
                <h1>SmartRoll</h1>
                <p>Student Registration</p>
                <span>Create your account using your email</span>
            </div>

            {/* RIGHT */}
            <div className="register-right">

                <div className="register-card">

                    <h2>Register</h2>

                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    <form onSubmit={handleSubmit}>

                        {/* Email */}
                        <div className="input-box">
                            <input
                                type="email"
                                name="email"
                                placeholder=" "
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <label>Email</label>
                        </div>

                        {/* Password */}
                        <div className="input-box">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder=" "
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <label>Password</label>

                            <span
                                className="toggle-eye"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '👁' : '👁'}
                            </span>
                        </div>

                        {/* Confirm Password */}
                        <div className="input-box">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder=" "
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <label>Confirm Password</label>

                            <span
                                className="toggle-eye"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '🙈' : '👁'}
                            </span>
                        </div>

                        <button className="register-btn" disabled={loading}>
                            {loading ? "Registering..." : "Register"}
                        </button>

                        <div className="register-links">
                            <a href="/student/email-lookup">Forgot Email?</a>
                            <span onClick={() => navigate('/student-login')}>
                                Login
                            </span>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default StudentRegister;

