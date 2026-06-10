import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import '../css/EmailLookup.css';

const TeacherEmailLookup = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();

    const handleLookup = async (e) => {
        e.preventDefault();

        if (!firstName.trim() || !lastName.trim()) {
            setError('Please fill all fields');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const params = new URLSearchParams({
                firstName: firstName.trim(),
                lastName: lastName.trim()
            });

            const response = await fetch(`/api/teachers/public/teacher?${params}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setEmail(data.email);
                setSuccess(true);
            } else {
                setError('Teacher not found. Please check your name.');
            }

        } catch (err) {
            setError('Lookup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyEmail = () => {
        navigator.clipboard.writeText(email);
        alert('Email copied!');
    };

    return (
        <div className="page-wrapper">
            <div className="login-container fade-in">
                <div className="login-card">

                    {/* HEADER */}
                    <div className="login-header">
                        <h2>Find Your Email ID</h2>
                        <p className="text-muted">Enter your name (provided by admin)</p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleLookup}>

                        {/* FIRST NAME */}
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter first name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>

                        {/* LAST NAME */}
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Enter last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>

                        {/* BUTTON */}
                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? "Looking up..." : "Find Email"}
                        </button>

                        {/* ERROR */}
                        {error && <div className="error-message">{error}</div>}

                        {/* SUCCESS */}
                        {success && email && (
                            <div className="alert alert-success mt-3 text-center">
                                <strong>Your email:</strong> {email}
                                <br />
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm mt-2"
                                    onClick={copyEmail}
                                >
                                    Copy Email
                                </button>

                                <div className="mt-2">
                                    <small>
                                        <span onClick={() => navigate('/teacher-login')} style={{ cursor: 'pointer', color: '#6c8cff' }}>
                                            Login
                                        </span>
                                        {' '}or{' '}
                                        <span onClick={() => navigate('/teacher/register')} style={{ cursor: 'pointer', color: '#6c8cff' }}>
                                            Register
                                        </span>
                                    </small>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* BACK BUTTON */}
                    <div className="text-center mt-4">
                        <button className="btn btn-link" onClick={() => navigate('/teacher-login')}>
                            Back to Login
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TeacherEmailLookup;