import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AttendanceReport = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // State for when no parameters are provided
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [uniqueClasses, setUniqueClasses] = useState([]);
    const [uniqueSubjects, setUniqueSubjects] = useState([]);
    const [uniqueTimeSlots, setUniqueTimeSlots] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

    // State for attendance data
    const [attendanceData, setAttendanceData] = useState([]);
    const [studentsMap, setStudentsMap] = useState({});
    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState('');
    const [className, setClassName] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [showReport, setShowReport] = useState(false);

    // Get query parameters from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const scheduleId = params.get('scheduleId');
        const dateParam = params.get('date');
        const classId = params.get('classId');

        if (scheduleId && dateParam && classId) {
            fetchAttendanceReport(scheduleId, dateParam, classId);
            setDate(dateParam);
        } else {
            // Load teacher data for selection form
            loadTeacherData();
        }
    }, [location]);

    const loadTeacherData = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setError('User not logged in');
            setLoading(false);
            return;
        }

        try {
            const teacherResponse = await fetch(`/api/teachers/userId/${userId}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (teacherResponse.ok) {
                const teacherData = await teacherResponse.json();
                setTeacher(teacherData);

                // Fetch schedules, classes, subjects
                const [schedulesRes, classesRes, subjectsRes] = await Promise.all([
                    fetch(`/api/schedules/teacher/${teacherData.id}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    }),
                    fetch(`/api/classes/teacher/${teacherData.id}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    }),
                    fetch('/api/subjects', { method: 'GET' }),
                ]);

                if (schedulesRes.ok) {
                    const schedulesData = await schedulesRes.json();
                    setSchedules(schedulesData);
                }

                if (classesRes.ok) {
                    const classesData = await classesRes.json();
                    setClasses(classesData);
                }

                if (subjectsRes.ok) {
                    const subjectsData = await subjectsRes.json();
                    setSubjects(subjectsData);
                }
            }
        } catch (err) {
            setError('Error loading data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!schedules.length || !classes.length || !subjects.length) return;

        const classSet = new Set();
        const subjectSet = new Set();
        const timeSlotSet = new Set();

        schedules.forEach(schedule => {
            classSet.add(schedule.classId);
            subjectSet.add(schedule.subjectId);
            const startTime = new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timeSlotSet.add(`${startTime}–${endTime}`);
        });

        setUniqueClasses(Array.from(classSet).map(id => classes.find(c => c.id === id)).filter(Boolean));
        setUniqueSubjects(Array.from(subjectSet).map(id => subjects.find(s => s.id === id)).filter(Boolean));
        setUniqueTimeSlots(Array.from(timeSlotSet));
    }, [schedules, classes, subjects]);

    const fetchAttendanceReport = async (scheduleId, dateParam, classId) => {
        setDataLoading(true);
        setError('');
        setShowReport(true);

        try {
            // Fetch attendance data
            const response = await fetch(`/api/attendance/report?scheduleId=${scheduleId}&date=${dateParam}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAttendanceData(data);

                // Get students for this class to display names
                const studentsResponse = await fetch(`/api/students/class/${classId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    // Create a map of studentId to student details
                    const map = {};
                    studentsData.forEach(student => {
                        map[student.id] = student;
                    });
                    setStudentsMap(map);
                }

                // Get class details
                const classResponse = await fetch(`/api/classes/${classId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (classResponse.ok) {
                    const classData = await classResponse.json();
                    setClassName(`${classData.classCode} - ${classData.division} (Sem ${classData.sem})`);
                }

                // Get schedule details for time slot and subject
                const scheduleResponse = await fetch(`/api/schedules/${scheduleId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (scheduleResponse.ok) {
                    const scheduleData = await scheduleResponse.json();
                    const startTime = new Date(scheduleData.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endTime = new Date(scheduleData.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    setTimeSlot(`${startTime} - ${endTime}`);

                    // Get subject name
                    const subjectResponse = await fetch(`/api/subjects/${scheduleData.subjectId}`, {
                        method: 'GET',
                    });
                    if (subjectResponse.ok) {
                        const subjectData = await subjectResponse.json();
                        setSubjectName(subjectData.name);
                    }
                }
            } else {
                setError('Failed to fetch attendance report');
            }
        } catch (err) {
            setError('Error fetching attendance report');
        } finally {
            setDataLoading(false);
        }
    };

    const handleViewReport = () => {
        // Find the scheduleId based on selectedClass, selectedSubject, selectedTimeSlot
        const matchingSchedule = schedules.find(schedule => {
            const startTime = new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const timeSlotStr = `${startTime}–${endTime}`;
            return schedule.classId === parseInt(selectedClass) &&
                schedule.subjectId === parseInt(selectedSubject) &&
                timeSlotStr === selectedTimeSlot;
        });

        if (!matchingSchedule) {
            setError('No attendance found for the selected combination. Please check your selections.');
            return;
        }

        const currentDate = new Date().toISOString().split('T')[0];
        navigate(`/teacher/attendance-report?scheduleId=${matchingSchedule.id}&date=${currentDate}&classId=${selectedClass}`);
    };

    const handleBack = () => {
        navigate('/teacher/attendance');
    };

    const handleSelectNewReport = () => {
        setShowReport(false);
        setAttendanceData([]);
        setError('');
        navigate('/teacher/attendance-report');
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    // Show selection form when no parameters provided
    if (!showReport) {
        return (
            <div className="container mt-4">
                <div className="card">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h2 className="card-title">
                                <i className="bi bi-file-earmark-text"></i> Attendance Report
                            </h2>
                            <button className="btn btn-secondary" onClick={handleBack}>
                                Back to Attendance
                            </button>
                        </div>

                        <div className="alert alert-info">
                            <i className="bi bi-info-circle"></i> Select Class, Subject, and Time Slot to view attendance report
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-4">
                                <label htmlFor="classSelect" className="form-label"><strong>Select Class:</strong></label>
                                <select
                                    id="classSelect"
                                    className="form-select"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                >
                                    <option value="">Select Class</option>
                                    {uniqueClasses.map((classObj) => (
                                        <option key={classObj.id} value={classObj.id}>
                                            {classObj.classCode} - {classObj.division} ({classObj.sem})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="subjectSelect" className="form-label"><strong>Select Subject:</strong></label>
                                <select
                                    id="subjectSelect"
                                    className="form-select"
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <option value="">Select Subject</option>
                                    {uniqueSubjects.map((subjectObj) => (
                                        <option key={subjectObj.id} value={subjectObj.id}>
                                            {subjectObj.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="timeSlotSelect" className="form-label"><strong>Select Time Slot:</strong></label>
                                <select
                                    id="timeSlotSelect"
                                    className="form-select"
                                    value={selectedTimeSlot}
                                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                                >
                                    <option value="">Select Time Slot</option>
                                    {uniqueTimeSlots.map((timeSlot) => (
                                        <option key={timeSlot} value={timeSlot}>
                                            {timeSlot}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {error && <div className="alert alert-danger">{error}</div>}

                        <div className="mt-3">
                            <button
                                className="btn btn-primary"
                                disabled={!selectedClass || !selectedSubject || !selectedTimeSlot}
                                onClick={handleViewReport}
                            >
                                <i className="bi bi-search"></i> View Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show attendance report
    if (dataLoading) {
        return <div className="text-center mt-5">Loading report...</div>;
    }

    if (error) {
        return (
            <div className="container mt-4">
                <div className="alert alert-danger">{error}</div>
                <button className="btn btn-primary" onClick={handleSelectNewReport}>Select Different Report</button>
                <button className="btn btn-secondary ms-2" onClick={handleBack}>Back to Attendance</button>
            </div>
        );
    }

    const presentCount = attendanceData.filter(a => a.status === 'PRESENT').length;
    const absentCount = attendanceData.filter(a => a.status === 'ABSENT').length;
    const totalCount = attendanceData.length;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="card-title">
                            <i className="bi bi-file-earmark-text"></i> Attendance Report
                        </h2>
                        <div>
                            <button className="btn btn-outline-primary btn-sm me-2" onClick={handleSelectNewReport}>
                                Select Different Report
                            </button>
                            <button className="btn btn-secondary" onClick={handleBack}>
                                Back to Attendance
                            </button>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-6">
                            <p><strong>Date:</strong> {formatDate(date)}</p>
                            <p><strong>Class:</strong> {className || 'N/A'}</p>
                            <p><strong>Subject:</strong> {subjectName || 'N/A'}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Time Slot:</strong> {timeSlot || 'N/A'}</p>
                            <p><strong>Total Students:</strong> {totalCount}</p>
                        </div>
                    </div>

                    <div className="row mb-4">
                        <div className="col-md-4">
                            <div className="card bg-success text-white">
                                <div className="card-body">
                                    <h5>Present</h5>
                                    <h3>{presentCount}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-danger text-white">
                                <div className="card-body">
                                    <h5>Absent</h5>
                                    <h3>{absentCount}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="card bg-primary text-white">
                                <div className="card-body">
                                    <h5>Attendance %</h5>
                                    <h3>{percentage}%</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h4 className="mb-3">Student Details</h4>
                    {attendanceData.length === 0 ? (
                        <div className="alert alert-warning">No attendance records found for this selection.</div>
                    ) : (
                        <table className="table table-striped table-bordered">
                            <thead className="table-dark">
                                <tr>
                                    <th>Roll No</th>
                                    <th>Student Name</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.map((attendance) => {
                                    const student = studentsMap[attendance.studentId];
                                    return (
                                        <tr key={attendance.attendanceId}>
                                            <td>{student ? student.rollNo : attendance.studentId}</td>
                                            <td>{student ? `${student.firstName} ${student.lastName}` : `Student ${attendance.studentId}`}</td>
                                            <td>
                                                <span className={`badge ${attendance.status === 'PRESENT' ? 'bg-success' : 'bg-danger'}`}>
                                                    {attendance.status === 'PRESENT' ? 'Present' : 'Absent'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttendanceReport;
