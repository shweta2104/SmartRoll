import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import '../../css/StudentProfile.css';

const StudentProfile = () => {
    const { getAuthHeaders } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError('');

                const res = await fetch('/api/students/me', {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!res.ok) {
                    const errText = await res.text().catch(() => '');
                    throw new Error(errText || `Failed to load profile (HTTP ${res.status})`);
                }

                const data = await res.json();
                setProfile(data);
            } catch (e) {
                setError(e?.message || 'Failed to load profile');
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [getAuthHeaders]);

    return (
        <div className="student-profile-page">
            <div className="student-profile-header">
                <div>
                    <h4 className="page-title">Student Profile</h4>
                    <div className="student-subtitle">View your details</div>
                </div>
            </div>

            {loading ? (
                <div className="loading-card card shadow-sm">
                    <div className="text-muted">Loading profile...</div>
                </div>
            ) : error ? (
                <div className="error-card card shadow-sm">
                    <div className="alert alert-danger mb-0">
                        <b>Could not load profile.</b> {error}
                    </div>
                </div>
            ) : profile ? (
                <div className="profile-card card shadow-sm">
                    <div className="profile-top">
                        <div className="avatar">{(profile.fullName || profile.email || 'S').slice(0, 1).toUpperCase()}</div>
                        <div>
                            <div className="profile-name">{profile.fullName || '—'}</div>
                            <div className="profile-email">{profile.email || '—'}</div>
                        </div>
                    </div>

                    <hr className="profile-divider" />

                    <div className="profile-grid">
                        <div className="profile-item">
                            <div className="profile-label">Student ID</div>
                            <div className="profile-value">{profile.studentId ?? '—'}</div>
                        </div>
                        <div className="profile-item">
                            <div className="profile-label">Contact Number</div>
                            <div className="profile-value">{profile.contactNumber || '—'}</div>
                        </div>
                        <div className="profile-item">
                            <div className="profile-label">Sem</div>
                            <div className="profile-value">{profile.sem || '—'}</div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="alert alert-warning">No profile data found.</div>
            )}
        </div>
    );
};

export default StudentProfile;

