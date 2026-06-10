import React, { useMemo, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const TeacherAttendanceQr = ({
    selectedClass,
    selectedSubject,
    selectedTimeSlot,
    schedules,
    onTokenGenerated,
    tokenLoading,
    setTokenLoading,
    error,
    setError,
    generateDate,
    teacherId,
    token,
}) => {
    const [qrValue, setQrValue] = useState('');

    const disabled = useMemo(() => {
        return !selectedClass || !selectedSubject || !selectedTimeSlot;
    }, [selectedClass, selectedSubject, selectedTimeSlot]);

    const handleGenerate = async () => {
        try {
            setError('');
            setTokenLoading(true);

            // Find scheduleId matching selections (same approach as manual mode)
            const matchingSchedule = schedules.find((schedule) => {
                const startTime = new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const endTime = new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const timeSlot = `${startTime}–${endTime}`;
                return (
                    schedule.classId === parseInt(selectedClass) &&
                    schedule.subjectId === parseInt(selectedSubject) &&
                    timeSlot === selectedTimeSlot
                );
            });

            if (!matchingSchedule) {
                setError('Unable to find matching schedule for these selections.');
                return;
            }

            const currentDate = generateDate();

            const res = await fetch('/api/attendance/qr/teacher/generate', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    scheduleId: matchingSchedule.id,
                    classId: parseInt(selectedClass),
                    date: currentDate,
                    expiresInMinutes: 5,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || !data?.tokenValue) {
                setError(data?.message || `Failed to generate QR (HTTP ${res.status})`);
                return;
            }

            setQrValue(data.tokenValue);
            onTokenGenerated?.(data);


        } catch (e) {
            setError(e?.message || 'QR generation failed');
        } finally {
            setTokenLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <h4 className="mb-3">QR Code Attendance</h4>

            <div className="row g-3 align-items-end">
                <div className="col-md-8">
                    <div className="alert alert-secondary mb-0">
                        Students will scan the QR (token) to mark attendance.
                    </div>
                </div>

                <div className="col-md-4 text-end">
                    <button className="btn btn-primary w-100" disabled={disabled || tokenLoading} onClick={handleGenerate}>
                        {tokenLoading ? 'Generating...' : 'Generate QR'}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}

            {qrValue && (
                <div className="mt-3">
                    <div className="mb-2 text-muted">QR will open Student QR Attendance:</div>

                    <div className="d-flex justify-content-center p-3 rounded bg-light">
                        <QRCodeCanvas
                            value={(() => {
                                const token = qrValue;

                                // Use a LAN/public URL configured via Vite env var.
                                // Example: VITE_PUBLIC_APP_URL=http://192.168.1.10:5173
                                // Fallback to current origin for local testing.
                                // Force the QR to open the app via LAN/IP (so it doesn't fallback to localhost on student devices)
                                const baseUrl = 'http://192.168.29.27:5173';

                                return `${baseUrl}/student/qr-attendance?token=${encodeURIComponent(token)}`;
                            })()}
                            size={220}
                            level="M"
                            includeMargin={true}
                        />
                    </div>

                    <div className="mt-3 p-2 rounded bg-white" style={{ wordBreak: 'break-all' }}>
                        <div><strong>Token:</strong> {qrValue}</div>
                        <div className="text-muted small">Scanned URL will contain this token.</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherAttendanceQr;

