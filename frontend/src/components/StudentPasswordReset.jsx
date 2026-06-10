import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentPasswordReset = () => {
    const navigate = useNavigate();

    return (
        <div className="container" style={{ padding: '40px 0' }}>
            <div className="alert alert-info">
                <h4>Forgot Password?</h4>
                <p>
                    Password reset is not implemented yet in the backend.
                    Use <b>Find Email</b> to get your student email and then contact admin/support.
                </p>
                <div className="d-flex gap-2 mt-3">
                    <button className="btn btn-primary" onClick={() => navigate('/student/email-lookup')}>
                        Find Email
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/student-login')}>
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentPasswordReset;

