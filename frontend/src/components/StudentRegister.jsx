import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';  // Reuse login/register styling

const StudentRegister = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rollNo: ''  // Student specific field
    });
    const [error, setError] = useState('');
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
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('/api/students/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                setSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => navigate('/student-login'), 2000);
            } else {
                const errorData = await response.text();
                setError(errorData || 'Registration failed');
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container fade-in page-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Student Registration</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rollNo" className="form-label">Roll Number</label>
                        <input
                            type="text"
                            className="form-control"
                            id="rollNo"
                            name="rollNo"
                            placeholder="Enter roll number"
                            value={formData.rollNo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Registering...
                            </>
                        ) : (
                            'Register'
                        )}
                    </button>
                    {error && <div className="error-message shake">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}
                </form>
                <div className="text-center mt-3">
                    <button className="btn btn-link" onClick={() => navigate('/student-login')}>Already registered? Login</button>
                </div>
            </div>
        </div>
    );
};

export default StudentRegister;

