import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';

const StudentSubjects = () => {
    const { getAuthHeaders } = useAuth();

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMySubjects = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch('/api/students/me/subjects', {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!res.ok) {
                    const errText = await res.text().catch(() => '');
                    throw new Error(errText || `Failed to load subjects (HTTP ${res.status})`);
                }

                const data = await res.json();
                setSubjects(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err?.message || 'Failed to load subjects');
            } finally {
                setLoading(false);
            }
        };

        fetchMySubjects();
    }, [getAuthHeaders]);

    return (
        <div className="glass-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">📖 My Subjects</h5>
            </div>

            {loading ? (
                <p className="text-muted">Loading...</p>
            ) : error ? (
                <div className="alert alert-danger mt-3">{error}</div>
            ) : subjects.length === 0 ? (
                <p className="text-muted">No subjects assigned for your class.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Subject Name</th>
                                <th>Code</th>
                                <th>Teacher</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subjects.map((s) => (
                                <tr key={s.subjectId ?? `${s.subjectCode}-${s.subjectName}`}>
                                    <td style={{ fontWeight: 700 }}>{s.subjectName ?? '—'}</td>
                                    <td>{s.subjectCode ?? '—'}</td>
                                    <td>{s.teacherName ?? '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentSubjects;


