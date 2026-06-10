import React, { useEffect, useMemo, useState } from 'react';
import useAuth from '../../hooks/useAuth';

const DEFAULT_LECTURE_TIME = '11:00 AM';
const DEFAULT_CLASS_TIMING = '9:00 AM – 3:00 PM';

const StudentClasses = () => {
    const { getAuthHeaders } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyClasses = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch('/api/students/me/classes', {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!res.ok) {
                    const errText = await res.text().catch(() => '');
                    throw new Error(errText || `Failed to load classes (HTTP ${res.status})`);
                }

                const data = await res.json();
                setClasses(Array.isArray(data) ? data : []);
            } catch (err) {
                const msg = err?.message || 'Failed to load classes';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchMyClasses();
    }, [getAuthHeaders]);

    const viewCards = useMemo(() => {
        if (!Array.isArray(classes)) return [];
        return classes.map((c) => ({
            ...c,
            classKey: c?.classId ?? `${c?.classCode}-${c?.division}-${c?.sem}`,
        }));
    }, [classes]);

    const [pastLecturesLoading, setPastLecturesLoading] = useState(false);
    const [pastLecturesError, setPastLecturesError] = useState('');
    const [pastLectures, setPastLectures] = useState([]);

    useEffect(() => {
        const fetchPastLectures = async () => {
            try {
                setPastLecturesLoading(true);
                setPastLecturesError('');

                const res = await fetch('/api/students/me/past-lectures', {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (!res.ok) {
                    const errText = await res.text().catch(() => '');
                    throw new Error(errText || `Failed to load past lectures (HTTP ${res.status})`);
                }

                const data = await res.json();
                setPastLectures(Array.isArray(data) ? data : []);
            } catch (err) {
                setPastLecturesError(err?.message || 'Failed to load past lectures');
                setPastLectures([]);
            } finally {
                setPastLecturesLoading(false);
            }
        };

        fetchPastLectures();
    }, [getAuthHeaders]);

    return (
        <div className="glass-card">
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">📚 My Classes</h5>
            </div>

            {loading ? (
                <p className="text-muted">Loading...</p>
            ) : error ? (
                <div className="alert alert-danger mt-3">{error}</div>
            ) : classes.length === 0 ? (
                <p className="text-muted">No classes assigned for your semester.</p>
            ) : (
                <div className="row g-3 mt-2">
                    {viewCards.map((c) => (
                        <div key={c.classKey} className="col-12 col-md-6">
                            <div
                                className="card h-100 shadow-sm"
                                style={{
                                    borderRadius: 16,
                                    transition: 'all 0.3s ease-in-out',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)';
                                }}
                            >
                                <div className="card-body">
                                    <div className="d-flex align-items-start justify-content-between">
                                        <div>
                                            <h6 className="card-title mb-2">
                                                <span style={{ fontWeight: 800 }}>📚</span> {c.classCode}
                                            </h6>
                                            <p className="card-text mb-1">
                                                <b>Semester:</b> {c.sem}
                                            </p>
                                        </div>
                                    </div>

                                    <hr style={{ opacity: 0.12 }} className="my-3" />

                                    <div className="mt-3">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <span style={{ fontSize: 16 }}>👨‍🏫</span>
                                            <div>
                                                <div style={{ fontSize: 13, opacity: 0.8 }}>Next Lecture Teacher</div>
                                                <div style={{ fontWeight: 800, fontSize: 15 }}>
                                                    {c.teacherName ?? '—'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <span style={{ fontSize: 16 }}>📖</span>
                                            <div>
                                                <div style={{ fontSize: 13, opacity: 0.8 }}>Subject & Code</div>
                                                <div style={{ fontWeight: 800, fontSize: 15 }}>
                                                    {c.nextLectureSubject
                                                        ? `${c.nextLectureSubject} (${c.nextLectureSubjectCode ?? '—'})`
                                                        : '—'}
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <span style={{ fontSize: 16 }}>⏰</span>
                                            <div>
                                                <div style={{ fontSize: 13, opacity: 0.8 }}>Next Lecture Time</div>
                                                <div style={{ fontWeight: 800, fontSize: 15 }}>
                                                    {c.nextLectureTime ?? '—'}
                                                </div>
                                            </div>
                                        </div>

                                        {c.nextLectureRoom && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                                <span style={{ fontSize: 16 }}>🏛️</span>
                                                <div>
                                                    <div style={{ fontSize: 13, opacity: 0.8 }}>Room</div>
                                                    <div style={{ fontWeight: 800, fontSize: 15 }}>
                                                        {c.nextLectureRoom}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 16 }}>🕒</span>
                                            <div>
                                                <div style={{ fontSize: 13, opacity: 0.8 }}>Class Timing</div>
                                                <div style={{ fontWeight: 800, fontSize: 15 }}>{c.classTiming ?? '—'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* <p className="card-text mb-0 text-muted" style={{ marginTop: 12, fontSize: 12 }}>
                                        <b>Class ID:</b> {c.classId}
                                    </p> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="mb-0" style={{ fontWeight: 900 }}>📚 Past Lectures</h6>
                    {pastLecturesLoading ? (
                        <span className="text-muted" style={{ fontSize: 13 }}>Loading...</span>
                    ) : (
                        <span className="text-muted" style={{ fontSize: 13 }}>Showing {pastLectures.length} rows</span>
                    )}
                </div>

                {pastLecturesError ? (
                    <div className="alert alert-danger mb-0">{pastLecturesError}</div>
                ) : pastLecturesLoading ? (
                    <div className="text-muted">Loading past lectures...</div>
                ) : pastLectures.length === 0 ? (
                    <div className="alert alert-warning mb-0">No past lectures found.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th>Time</th>
                                    <th>Room</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastLectures.map((p, idx) => {
                                    const statusLower = String(p?.status || '').toLowerCase();
                                    const isPresent = statusLower.includes('present');
                                    const isAbsent = statusLower.includes('absent');

                                    const badgeClass = isPresent
                                        ? 'bg-success'
                                        : isAbsent
                                            ? 'bg-danger'
                                            : 'bg-secondary';

                                    return (
                                        <tr key={p?.date + '-' + p?.subjectCode + '-' + p?.startTime + '-' + idx}>
                                            <td>{p?.date || '—'}</td>
                                            <td style={{ fontWeight: 800 }}>
                                                {p?.subjectName || '—'}{p?.subjectCode ? ` (${p.subjectCode})` : ''}
                                            </td>
                                            <td>{p?.teacherName || '—'}</td>
                                            <td>
                                                {p?.startTime || '—'} – {p?.endTime || '—'}
                                            </td>
                                            <td>{p?.room || '—'}</td>
                                            <td>
                                                <span className={`badge ${badgeClass}`}>{p?.status || 'Not Marked'}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentClasses;





