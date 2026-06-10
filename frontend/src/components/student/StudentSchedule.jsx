import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/StudentSchedule.css';

const StudentSchedule = () => {
    const navigate = useNavigate();


    const todayClasses = '—';
    const nextLecture = {
        title: '—',
        time: '—',
    };

    return (
        <div className="student-schedule-page">
            <h4 className="schedule-title">📅 Schedule</h4>

            <div className="schedule-separator" />

            <div className="schedule-mini-tiles">
                <div className="schedule-mini-tile" aria-label="Classes Today">
                    <div className="schedule-mini-tile-inner">
                        <div className="schedule-mini-label">Classes Today</div>
                        <div className="schedule-mini-value">{todayClasses}</div>
                    </div>
                </div>

                <div className="schedule-mini-tile schedule-mini-tile-clickable" aria-label="Past Classes" role="button" tabIndex={0}
                    onClick={() => navigate('/student/classes')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/student/classes'); }}>
                    <div className="schedule-mini-tile-inner">
                        <div className="schedule-mini-label">Past Classes</div>
                        <div className="schedule-mini-value" style={{ fontSize: 18, marginTop: 8 }}>
                            <div style={{ fontWeight: 900, lineHeight: 1.2 }}>View</div>
                            <div style={{ fontWeight: 800, opacity: 0.75, fontSize: 14, marginTop: 4 }}>
                                History & details
                            </div>
                        </div>
                    </div>
                </div>

                <div className="schedule-mini-tile" aria-label="Next Lecture">
                    <div className="schedule-mini-tile-inner">
                        <div className="schedule-mini-label">Next Lecture</div>
                        <div className="schedule-mini-value" style={{ fontSize: 18, marginTop: 8 }}>
                            <div style={{ fontWeight: 900, lineHeight: 1.2 }}>{nextLecture.title}</div>
                            <div style={{ fontWeight: 800, opacity: 0.75, fontSize: 14, marginTop: 4 }}>
                                {nextLecture.time}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="schedule-separator" />

            <div className="schedule-section-card" style={{ marginBottom: 14 }}>
                <div className="schedule-section-heading">Today's Schedule</div>
                <p className="schedule-section-subtext">
                    {`(UI mock) Your classes for today will appear here.`}
                </p>
            </div>

            <div className="schedule-separator" />

            <div className="schedule-section-card">
                <div className="schedule-section-heading">Weekly Timetable</div>
                <p className="schedule-section-subtext">
                    {`(UI mock) Your weekly schedule will appear here.`}
                </p>
            </div>
        </div>
    );
};

export default StudentSchedule;

