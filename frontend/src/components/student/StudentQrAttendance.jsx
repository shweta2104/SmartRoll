import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const StudentQrAttendance = () => {
    const { getAuthHeaders, isAuthenticated } = useAuth();
    const location = useLocation();

    const [tokenValue, setTokenValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    const canSubmit = useMemo(() => tokenValue.trim().length > 0, [tokenValue]);


    const refreshMyAttendance = async () => {
        // Refreshing ensures the student sees updated rows/summary immediately
        // after marking attendance.
        try {
            await Promise.all([
                fetch('/api/attendance/student/summary', {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }),
                fetch('/api/attendance/student/rows', {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                }),
            ]);
        } catch (e) {
            // Non-fatal; we still force a reload below.
            console.warn('Failed to refresh attendance after marking:', e);
        }
    };

    const verifyToken = async (value) => {

        if (!value || !value.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch('/api/attendance/qr/student/verify', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tokenValue: value }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.success) {
                setError(data?.message || `Failed to mark attendance (HTTP ${res.status})`);
                return;
            }

            setResult(data);
            // Ensure the rest of the attendance UI (summary/rows) updates.
            await refreshMyAttendance();
            window.location.reload();

        } catch (err) {
            setError(err?.message || 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Auto-trigger when landing from QR URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token && token !== tokenValue) {
            setTokenValue(token);

            // If not logged in, redirect to login first.
            if (!isAuthenticated) {
                sessionStorage.setItem('pendingQrToken', token);
                sessionStorage.setItem('pendingQrSource', 'student-qr-attendance');
                window.location.href = '/student-login?qr=1';
                return;
            }

            // Clear pending token since we are proceeding to verify now
            sessionStorage.removeItem('pendingQrToken');
            sessionStorage.removeItem('pendingQrSource');

            // Logged in: just keep tokenValue pre-filled.
            // Attendance will be marked ONLY when the user clicks "Mark Attendance".
            sessionStorage.removeItem('pendingQrToken');
            sessionStorage.removeItem('pendingQrSource');
            return;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search, isAuthenticated]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await verifyToken(tokenValue);
    };

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-body">
                    <h3 className="card-title mb-3">QR Attendance</h3>

                    <div className="alert alert-info">
                        Paste/enter the token from your teacher’s QR code.
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="qrToken" className="form-label"><strong>QR Token</strong></label>
                            <input
                                id="qrToken"
                                className="form-control"
                                value={tokenValue}
                                onChange={(e) => setTokenValue(e.target.value)}
                                placeholder="Enter token value"
                            />
                        </div>

                        {error && <div className="alert alert-danger">{error}</div>}
                        {result?.success && (
                            <div className="alert alert-success">
                                {result.message || 'Attendance marked successfully'}

                                <div className="mt-3">
                                    <div><strong>Subject:</strong> {result.subjectName || '—'}</div>
                                    <div><strong>Teacher:</strong> {result.teacherName || '—'}</div>
                                    <div><strong>Class Time:</strong> {result.classTime || '—'}</div>
                                </div>
                            </div>
                        )}


                        <button className="btn btn-primary" disabled={!canSubmit || loading}>
                            {loading ? 'Marking...' : 'Mark Attendance'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentQrAttendance;

