import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeacherClasses = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get teacher ID from localStorage
    const teacherId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`/api/teacher-subject-class/user/${teacherId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setAssignments(response.data);
            } catch (err) {
                setError('Failed to fetch assigned classes');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [teacherId]);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Assigned Classes</h2>
            {loading ? (
                <div className="text-center mt-5">Loading...</div>
            ) : error ? (
                <div className="alert alert-danger text-center mt-5">{error}</div>
            ) : assignments.length === 0 ? (
                <p>No classes assigned.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>Class Name</th>
                                <th>Sem</th>
                                <th>Subject Name</th>
                                <th>Teacher Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.map((assignment) => (
                                <tr key={assignment.id}>
                                    <td>{assignment.classEntity?.division || 'N/A'}</td>
                                    <td>{assignment.classEntity?.sem || 'N/A'}</td>
                                    <td>{assignment.subject?.name || 'N/A'}</td>
                                    <td>{assignment.teacher?.firstName} {assignment.teacher?.lastName}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TeacherClasses;
