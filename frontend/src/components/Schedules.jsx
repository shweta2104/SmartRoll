import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function Schedules() {
    const [schedules, setSchedules] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [formData, setFormData] = useState({
        classId: '',
        subjectId: '',
        teacherId: '',
        startTime: '',
        endTime: '',
        room: ''
    });
    const [currentTime, setCurrentTime] = useState(new Date().toISOString().slice(0, 16));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const userRole = localStorage.getItem('userRole') || localStorage.getItem('role') || '';
    const isAdmin = userRole === 'ADMIN';

    useEffect(() => {
        fetchSchedules();
        fetchClasses();
        fetchSubjects();
        fetchTeachers();
    }, []);

    useEffect(() => {
        const updateCurrentTime = () => {
            setCurrentTime(new Date().toISOString().slice(0, 16));
        };
        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchSchedules = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/schedules', {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            });
            setSchedules(response.data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        }
    };

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/classes', {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            });
            setClasses(response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/subjects', {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            });
            setSubjects(response.data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/teachers', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTeachers(response.data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'startTime' || name === 'endTime') {
            const selectedDateTime = new Date(value + ':00');
            const now = new Date();
            if (selectedDateTime < now) {
                setError(`${name === 'startTime' ? 'Start' : 'End'} time must be today or later`);
                return;
            }
            setError('');
        }

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isAdmin) {
            setError('Access denied: only admin can create schedules.');
            return;
        }

        // Validate dates
        const startDateTime = new Date(formData.startTime + ':00');
        const endDateTime = new Date(formData.endTime + ':00');
        const now = new Date();

        if (startDateTime < now) {
            setError('Start time must be now or later');
            return;
        }
        if (endDateTime <= startDateTime) {
            setError('End time must be after start time');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/admin/schedules', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccess('Schedule created successfully!');
            setFormData({
                classId: '',
                subjectId: '',
                teacherId: '',
                startTime: '',
                endTime: '',
                room: ''
            });
            fetchSchedules();
        } catch (error) {
            setError('Error creating schedule: ' + (error.response?.data || error.message));
        }
    };

    return (
        <div className="container mt-4">
            {!isAdmin && (
                <div className="alert alert-warning mb-4">
                    <strong>Access Denied:</strong> Only admin users can create schedules. Please log in as an admin to access this feature.
                </div>
            )}
            <h2>Create Schedule</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            {isAdmin ? (
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="classId" className="form-label">Class</label>
                                <select
                                    className="form-select"
                                    id="classId"
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>{cls.className}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="subjectId" className="form-label">Subject</label>
                                <select
                                    className="form-select"
                                    id="subjectId"
                                    name="subjectId"
                                    value={formData.subjectId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="teacherId" className="form-label">Teacher</label>
                                <select
                                    className="form-select"
                                    id="teacherId"
                                    name="teacherId"
                                    value={formData.teacherId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map(teacher => (
                                        <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="room" className="form-label">Room (Optional)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="room"
                                    name="room"
                                    value={formData.room}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="startTime" className="form-label">Start Time</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    id="startTime"
                                    name="startTime"
                                    value={formData.startTime}
                                    min={currentTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="endTime" className="form-label">End Time</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    id="endTime"
                                    name="endTime"
                                    value={formData.endTime}
                                    min={currentTime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Create Schedule</button>
                </form>
            ) : null}

            <h3>Existing Schedules</h3>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>

                            <th>Class</th>
                            <th>Subject</th>
                            <th>Teacher</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Room</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map(schedule => (
                            <tr key={schedule.id}>

                                <td>{classes.find(cls => cls.id === schedule.classId)?.className || schedule.classId}</td>
                                <td>{subjects.find(sub => sub.id === schedule.subjectId)?.name || schedule.subjectId}</td>
                                <td>{teachers.find(teacher => teacher.id === schedule.teacherId) ? `${teachers.find(teacher => teacher.id === schedule.teacherId).firstName} ${teachers.find(teacher => teacher.id === schedule.teacherId).lastName}` : schedule.teacherId}</td>
                                <td>{new Date(schedule.startTime).toLocaleString()}</td>
                                <td>{new Date(schedule.endTime).toLocaleString()}</td>
                                <td>{schedule.room || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Schedules;
