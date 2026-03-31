import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css'; // Reuse login styles

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
                setError('Teacher not found. Please check your Teacher ID and name, or contact admin.');
            }
        } catch (err) {
            setError('Lookup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyEmail = () => {
        navigator.clipboard.writeText(email);
        alert('Email copied to clipboard!');
    };

    return (
        <div className="login-container fade-in page-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Find Your Email ID</h2>
                    <p className="text-muted">Enter your name (provided by admin)</p>
                </div>
                <form onSubmit={handleLookup}>
                    <div className="form-group">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            placeholder="Enter first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            placeholder="Enter last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Looking up...
                            </>
                        ) : (
                            'Find Email'
                        )}
                    </button>
                    {error && <div className="error-message shake">{error}</div>}
                    {success && email && (
                        <div className="alert alert-success mt-3">
                            <strong>Your email:</strong> {email}
                            <button type="button" className="btn btn-outline-light btn-sm ms-2" onClick={copyEmail}>
                                Copy
                            </button>
                            <div className="mt-2">
                                <small>
                                    Use this email to <a href="/teacher-login" onClick={(e) => { e.preventDefault(); navigate('/teacher-login'); }}>login</a> or{' '}
                                    <a href="/teacher/register" onClick={(e) => { e.preventDefault(); navigate('/teacher/register'); }}>register</a>.
                                </small>
                            </div>
                        </div>
                    )}
                </form>
                <div className="text-center mt-4">
                    <button className="btn btn-link" onClick={() => navigate('/teacher-login')}>
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherEmailLookup;

