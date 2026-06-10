import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setTabItem } from '../hooks/useAuth';
import '../css/Login.css';

const AdminLogin = () => {
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
            const response = await axios.post('/api/admin/login', { username: email, password });
            if (response.status === 200) {
                console.log('Admin login success. Response:', response.data);
                console.log('Storing role:', response.data.role);
                // Store admin role-specific with prefix
                setTabItem('admin-token', response.data.token);
                setTabItem('admin-userId', response.data.userId);
                setTabItem('admin-role', response.data.role);
                setTabItem('admin-userRole', response.data.role);
                setTabItem('admin-userEmail', response.data.email || email);
                // Set active role
                setTabItem('activeRole', 'ADMIN');
                setTabItem('token', response.data.token);
                setTabItem('userId', response.data.userId);
                navigate('/admin');
            } else {
                setError('Invalid username or password');
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
        <div className="login-container d-flex justify-content-center align-items-center vh-100">

            <div className="login-card shadow-lg p-4" style={{ width: "380px" }}>

                {/* Header */}
                <div className="text-center mb-4">
                    <h2 className="fw-bold">Admin Login</h2>
                    <p className="text-muted small">Access your admin dashboard</p>
                </div>

                <form onSubmit={handleSubmit}>

                    {/* Email */}
                    <div className="form-group mb-3">
                        <label className="form-label">Email</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                📧
                            </span>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="form-group mb-3">
                        <label className="form-label">Password</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                🔒
                            </span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-control"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-light"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? '👁' : '👁'}
                            </button>
                        </div>
                    </div>

                    {/* Button */}
                    <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {/* Forgot */}
                    <div className="text-end mt-2">
                        <a href="#" className="small text-decoration-none">Forgot Password?</a>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="alert alert-danger mt-3 text-center">
                            {error}
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
