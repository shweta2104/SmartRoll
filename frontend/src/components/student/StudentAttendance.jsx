import React, { useEffect, useMemo, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import '../../css/StudentAttendance.css';

const StudentAttendance = () => {

    const { getAuthHeaders } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [summary, setSummary] = useState({
        overallAttendancePercentage: 0,
        presentClasses: 0,
        absentClasses: 0,
        todayStatus: 'UNKNOWN',
    });

    const [rows, setRows] = useState([]);

    const [teacherQr, setTeacherQr] = useState(null); // { tokenValue, scheduleId, classId, date, expiresAt, subjectName, classCode, teacherName, startTime, endTime }
    const [qrLoading, setQrLoading] = useState(false);
    const [qrError, setQrError] = useState('');

    const fetchSummary = async () => {

        const endpointsToTry = [
            '/api/attendance/student/summary',
        ];


        let lastErr;

        for (const url of endpointsToTry) {
            try {
                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                console.log(`Attendance API response from ${url}:`, res.status, res.statusText);

                if (res.ok) {
                    const data = await res.json();
                    console.log('Attendance data:', data);

                    // Normalize response shape (handle a few common variants)
                    const overallAttendancePercentage =
                        data?.overallAttendancePercentage ??
                        data?.overallAttendancePercent ??
                        data?.overallPercentage ??
                        0;

                    const presentClasses =
                        data?.presentClasses ??
                        data?.presentCount ??
                        data?.present ??
                        0;

                    const absentClasses =
                        data?.absentClasses ??
                        data?.absentCount ??
                        data?.absent ??
                        0;

                    const todayStatusRaw = data?.todayStatus ?? data?.todaysStatus ?? data?.today?.status;

                    let todayStatus = 'UNKNOWN';
                    if (typeof todayStatusRaw === 'string') {
                        const s = todayStatusRaw.toUpperCase();
                        if (s.includes('PRESENT')) todayStatus = 'PRESENT';
                        else if (s.includes('ABSENT')) todayStatus = 'ABSENT';
                        else todayStatus = todayStatusRaw;
                    }

                    setSummary({
                        overallAttendancePercentage: Number(overallAttendancePercentage) || 0,
                        presentClasses: Number(presentClasses) || 0,
                        absentClasses: Number(absentClasses) || 0,
                        todayStatus,
                    });

                    return;
                }

                // If not ok, keep trying other endpoints.
                const errorText = await res.text();
                console.error(`Error from ${url}:`, errorText);
                lastErr = new Error(`Failed to fetch summary from ${url} (HTTP ${res.status}): ${errorText}`);
            } catch (e) {
                console.error(`Exception fetching ${url}:`, e);
                lastErr = e;
            }
        }

        throw lastErr || new Error('Failed to fetch attendance summary');
    };

    useEffect(() => {
        let mounted = true;

        const run = async () => {
            try {
                setLoading(true);
                setError('');
                await fetchSummary();

                // Fetch teacher's current QR token for dashboard
                try {
                    setQrLoading(true);
                    setQrError('');
                    const resQr = await fetch('/api/attendance/qr/student/current', {
                        method: 'GET',
                        headers: {
                            ...getAuthHeaders(),
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    });

                    if (resQr.ok) {
                        const data = await resQr.json();
                        if (data && data.tokenValue) {
                            setTeacherQr(data);
                        } else {
                            setTeacherQr(null);
                        }
                    } else {
                        // token not available is non-fatal
                        const t = await resQr.text().catch(() => '');
                        console.warn('Failed to fetch current QR:', resQr.status, t);
                        setTeacherQr(null);
                    }
                } catch (e) {
                    console.warn('Exception fetching current QR:', e);
                    setTeacherQr(null);
                } finally {
                    if (mounted) setQrLoading(false);
                }


                // Fetch recent detailed rows (Date, Subject, Status)
                const resRows = await fetch('/api/attendance/student/rows', {
                    method: 'GET',
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (resRows.ok) {
                    const data = await resRows.json();
                    setRows(Array.isArray(data) ? data : []);
                } else {
                    // Non-fatal: still show summary cards
                    const t = await resRows.text().catch(() => '');
                    console.error('Failed to fetch attendance rows:', resRows.status, t);
                    setRows([]);
                }
            } catch (e) {

                if (!mounted) return;
                setError(e?.message || 'Failed to load attendance summary');
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        };

        run();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const todayStatusView = useMemo(() => {
        if (summary.todayStatus === 'PRESENT') return { label: 'Present ✅', cls: 'stat-present' };
        if (summary.todayStatus === 'ABSENT') return { label: 'Absent ❌', cls: 'stat-absent' };
        return { label: '—', cls: 'stat-neutral' };
    }, [summary.todayStatus]);

    const overallPercentage = Math.round(summary.overallAttendancePercentage || 0);

    return (
        <div className="student-attendance">
            <div className="attendance-header">
                <div>
                    <h4 className="page-title">Attendance Summary</h4>
                    <div className="student-subtitle">Top view for your classes overall and today status</div>
                </div>
            </div>

            {loading ? (
                <div className="loading-card card shadow-sm">
                    <div className="text-muted">Loading attendance summary...</div>
                </div>
            ) : error ? (
                <div className="error-card card shadow-sm">
                    <div className="alert alert-danger mb-0">
                        <b>Could not load summary.</b> {error}
                    </div>
                </div>
            ) : (
                <>


                    {/* TOP SUMMARY CARDS */}
                    <div className="attendance-summary">

                        <div className="stat-card card shadow-sm">
                            <div className="stat-label">Overall Attendance</div>
                            <div className={`stat-value stat-neutral`}>{overallPercentage}%</div>
                        </div>

                        <div className="stat-card card shadow-sm">
                            <div className="stat-label">Present Classes</div>
                            <div className="stat-value stat-present">{summary.presentClasses}</div>
                        </div>

                        <div className="stat-card card shadow-sm">
                            <div className="stat-label">Absent Classes</div>
                            <div className="stat-value stat-absent">{summary.absentClasses}</div>
                        </div>
                    </div>

                    {/* TODAY STATUS CARD */}
                    <div className="mt-3">
                        <div className="card shadow-sm" style={{ borderRadius: 16 }}>
                            <div className="attendance-table-header" style={{ borderBottom: 'none' }}>
                                <div>
                                    <div className="stat-label" style={{ marginBottom: 4 }}>Todays Status</div>
                                    <div className={`stat-value ${todayStatusView.cls}`} style={{ fontSize: 26 }}>
                                        {todayStatusView.label}
                                    </div>
                                </div>
                                <div className="text-muted" style={{ fontSize: 13 }}>
                                    (Auto-fetched for current student)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SUBJECT-WISE ATTENDANCE BLOCKCHAIN */}
                    <div className="mt-3">
                        <div className="card shadow-sm blockchain-card" style={{ borderRadius: 16 }}>
                            <div className="attendance-rows-header blockchain-header" style={{ borderBottom: '1px solid rgba(78, 115, 223, 0.12)' }}>
                                <div>
                                    <div className="stat-label" style={{ marginBottom: 2 }}>Subject-wise Attendance Blockchain</div>
                                    <div className="text-muted" style={{ fontSize: 13 }}>
                                        Attendance % across your subjects
                                    </div>
                                </div>
                                <div className="text-muted" style={{ fontSize: 13 }}>
                                    Verified preview
                                </div>
                            </div>

                            <div className="blockchain-list">
                                {(() => {
                                    if (!rows || rows.length === 0) {
                                        return (
                                            <div className="p-2">
                                                <div className="alert alert-warning mb-0">No attendance data to compute subject-wise percentages.</div>
                                            </div>
                                        );
                                    }

                                    // Build subject -> {present,total} from the recent rows already fetched.
                                    const subjectMap = {};
                                    for (const r of rows) {
                                        const subject = r?.subject || '';
                                        const statusRaw = r?.status || '';
                                        if (!subject) continue;

                                        if (!subjectMap[subject]) subjectMap[subject] = { present: 0, total: 0 };
                                        subjectMap[subject].total += 1;

                                        const isPresent = String(statusRaw).toLowerCase().includes('present');
                                        if (isPresent) subjectMap[subject].present += 1;
                                    }

                                    const computed = Object.entries(subjectMap).map(([subject, v]) => {
                                        const pct = v.total > 0 ? Math.round((v.present / v.total) * 100) : 0;
                                        return { subject, pct };
                                    });

                                    const list = computed.slice(0, 4);

                                    return list.map((item, idx) => (
                                        <div className="blockchain-row" key={`${item.subject}-${idx}`}>
                                            <div className="blockchain-row-top">
                                                <span className="blockchain-subject">{item.subject}</span>
                                                <span className="blockchain-percent">{item.pct}%</span>
                                            </div>
                                            <div className="progress blockchain-progress" role="progressbar" aria-valuenow={item.pct} aria-valuemin={0} aria-valuemax={100}>
                                                <div className="progress-bar blockchain-progress-bar" style={{ width: `${item.pct}%` }} />
                                            </div>
                                        </div>
                                    ));
                                })()}

                            </div>
                        </div>
                    </div>

                    {/* DATE | SUBJECT | STATUS TABLE */}
                    <div className="mt-4">
                        <div className="card shadow-sm" style={{ borderRadius: 16 }}>
                            <div className="attendance-rows-header">
                                <div>
                                    <div className="stat-label" style={{ marginBottom: 2 }}>Recent Attendance</div>
                                    <div className="text-muted" style={{ fontSize: 13 }}>
                                        Date, Subject and your attendance status
                                    </div>
                                </div>
                                <div className="attendance-rows-count text-muted" style={{ fontSize: 13 }}>
                                    Last {rows?.length ?? 0}
                                </div>
                            </div>


                            {rows.length === 0 ? (
                                <div className="p-3">
                                    <div className="alert alert-warning mb-0">
                                        No attendance records found.
                                    </div>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="attendance-rows-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Subject</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((r, idx) => {
                                                const isPresent = String(r?.status || '').toLowerCase().includes('present');
                                                return (
                                                    <tr key={idx}>
                                                        <td>{r?.date || ''}</td>
                                                        <td>{r?.subject || ''}</td>
                                                        <td>
                                                            <span className={`badge ${isPresent ? 'bg-success' : 'bg-danger'}`}>
                                                                {r?.status || ''}
                                                            </span>
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

                </>
            )}
        </div>
    );
};

export default StudentAttendance;

