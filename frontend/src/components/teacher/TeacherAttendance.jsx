import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TeacherAttendance = () => {
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [uniqueClasses, setUniqueClasses] = useState([]);
    const [uniqueSubjects, setUniqueSubjects] = useState([]);
    const [uniqueTimeSlots, setUniqueTimeSlots] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [attendanceLoaded, setAttendanceLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const [savedInfo, setSavedInfo] = useState(null);

    useEffect(() => {
        const fetchTeacher = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('User not logged in');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/teachers/userId/${userId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const teacherData = await response.json();
                    setTeacher(teacherData);
                } else {
                    setError('Failed to fetch teacher details');
                }
            } catch (err) {
                setError('Error fetching teacher details');
            } finally {
                setLoading(false);
            }
        };

        fetchTeacher();
    }, []);

    useEffect(() => {
        if (!teacher) return;

        const fetchData = async () => {
            try {
                const [schedulesRes, classesRes, subjectsRes] = await Promise.all([
                    fetch(`/api/schedules/teacher/${teacher.id}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    }),
                    fetch(`/api/classes/teacher/${teacher.id}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                        },
                    }),
                    fetch('/api/subjects', {
                        method: 'GET',
                    }),
                ]);

                if (schedulesRes.ok) {
                    const schedulesData = await schedulesRes.json();
                    setSchedules(schedulesData);
                } else {
                    setError('Failed to fetch schedules');
                }

                if (classesRes.ok) {
                    const classesData = await classesRes.json();
                    setClasses(classesData);
                } else {
                    setError('Failed to fetch classes');
                }

                if (subjectsRes.ok) {
                    const subjectsData = await subjectsRes.json();
                    setSubjects(subjectsData);
                } else {
                    setError('Failed to fetch subjects');
                }
            } catch (err) {
                setError('Error fetching data');
            }
        };

        fetchData();
    }, [teacher]);

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

    const getCurrentDate = () => {
        const date = new Date();
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const handleLoadAttendance = async () => {
        try {
            const response = await fetch(`/api/students/class/${selectedClass}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const studentsData = await response.json();
                setStudents(studentsData);
                // Initialize attendance state with default 'Present' for all students
                const initialAttendance = {};
                studentsData.forEach(student => {
                    initialAttendance[student.id] = 'Present';
                });
                setAttendance(initialAttendance);
                setAttendanceLoaded(true);
            } else {
                setError('Failed to fetch students');
            }
        } catch (err) {
            setError('Error fetching students');
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSaveAttendance = async () => {
        setSaving(true);
        setError('');

        // Find the scheduleId based on selectedClass, selectedSubject, selectedTimeSlot
        const matchingSchedule = schedules.find(schedule => {
            const startTime = new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endTime = new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const timeSlot = `${startTime}–${endTime}`;
            return schedule.classId === parseInt(selectedClass) &&
                schedule.subjectId === parseInt(selectedSubject) &&
                timeSlot === selectedTimeSlot;
        });

        if (!matchingSchedule) {
            setError('Unable to find matching schedule. Please check your selections.');
            setSaving(false);
            return;
        }

        const scheduleId = matchingSchedule.id;
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

        try {
            // Send attendance for each student
            const promises = students.map(student => {
                const attendanceData = {
                    studentId: student.id,
                    classId: parseInt(selectedClass),
                    date: currentDate,
                    status: attendance[student.id] === 'Present' ? 'PRESENT' : 'ABSENT',
                    scheduleId: scheduleId
                };

                return fetch('/api/attendance/mark', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(attendanceData)
                });
            });

            const responses = await Promise.all(promises);
            const failedResponses = responses.filter(res => !res.ok);

            if (failedResponses.length > 0) {
                setError(`Failed to save attendance for ${failedResponses.length} student(s). Please try again.`);
            } else {
                // Store the saved info for the report link
                setSavedInfo({
                    scheduleId: scheduleId,
                    date: currentDate,
                    classId: selectedClass
                });
                alert('Attendance saved successfully!');
            }
        } catch (err) {
            setError('Error saving attendance. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleViewReport = () => {
        if (savedInfo) {
            navigate(`/teacher/attendance-report?scheduleId=${savedInfo.scheduleId}&date=${savedInfo.date}&classId=${savedInfo.classId}`);
        }
    };

    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    if (error) {
        return <div className="alert alert-danger mt-5">{error}</div>;
    }

    return (
        <div className="container mt-4">
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title text-center mb-4">
                        <i className="bi bi-pencil-square"></i> Take Attendance
                    </h2>

                    {/* Always visible link to Attendance Report */}
                    <div className="mb-3 text-end">
                        <Link to="/teacher/attendance-report" className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-file-earmark-text"></i> View Attendance Report
                        </Link>
                    </div>

                    <hr />
                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Date:</strong> {getCurrentDate()}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Teacher:</strong> {teacher ? `${teacher.firstName} ${teacher.lastName} (${teacher.dept})` : 'N/A'}</p>
                        </div>
                    </div>
                    <hr />
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
                    <div className="row">
                        <div className="col-md-6">
                            <button className="btn btn-primary" disabled={!selectedClass || !selectedSubject || !selectedTimeSlot} onClick={handleLoadAttendance}>
                                Load Attendance
                            </button>
                        </div>
                    </div>
                    {attendanceLoaded && (
                        <div className="mt-4">
                            <h3 className="mb-3">📋 Student Attendance Table</h3>
                            <table className="table table-striped table-bordered">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Roll No</th>
                                        <th>Student Name</th>
                                        <th>Attendance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id}>
                                            <td>{student.rollNo}</td>
                                            <td>{student.firstName} {student.lastName}</td>
                                            <td>
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name={`attendance-${student.id}`}
                                                        id={`present-${student.id}`}
                                                        value="Present"
                                                        checked={attendance[student.id] === 'Present'}
                                                        onChange={() => handleAttendanceChange(student.id, 'Present')}
                                                    />
                                                    <label className="form-check-label" htmlFor={`present-${student.id}`}>
                                                        Present
                                                    </label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name={`attendance-${student.id}`}
                                                        id={`absent-${student.id}`}
                                                        value="Absent"
                                                        checked={attendance[student.id] === 'Absent'}
                                                        onChange={() => handleAttendanceChange(student.id, 'Absent')}
                                                    />
                                                    <label className="form-check-label" htmlFor={`absent-${student.id}`}>
                                                        Absent
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="mt-3 text-center">
                                <button className="btn btn-success" disabled={!attendanceLoaded || saving} onClick={handleSaveAttendance}>
                                    {saving ? 'Saving...' : 'Save Attendance'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendance;
