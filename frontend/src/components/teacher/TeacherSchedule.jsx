import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function TeacherSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTeacher = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('User not logged in');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/api/teachers/userId/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setTeacher(response.data);
                fetchSchedules(response.data.id);
            } catch (err) {
                setError('Error fetching teacher details');
                setLoading(false);
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

        fetchTeacher();
        fetchClasses();
        fetchSubjects();
    }, []);

    const fetchSchedules = async (teacherId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/schedules/teacher/${teacherId}`, {
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            });
            setSchedules(response.data);
        } catch (error) {
            console.error('Error fetching schedules:', error);
        } finally {
            setLoading(false);
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
            <h2>My Schedule</h2>
            {teacher && (
                <p><strong>Teacher:</strong> {teacher.firstName} {teacher.lastName} ({teacher.dept})</p>
            )}
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Class</th>
                            <th>Subject</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Room</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map(schedule => (
                            <tr key={schedule.id}>
                                <td>{schedule.id}</td>
                                <td>{classes.find(cls => cls.id === schedule.classId)?.className || schedule.classId}</td>
                                <td>{subjects.find(sub => sub.id === schedule.subjectId)?.name || schedule.subjectId}</td>
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

export default TeacherSchedule;
