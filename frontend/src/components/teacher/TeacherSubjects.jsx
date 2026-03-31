import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeacherSubjects = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTeacherSubjects();
    }, []);

    const fetchTeacherSubjects = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!userId) {
                setError('User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            if (!token) {
                setError('Token not found. Please login again.');
                setLoading(false);
                return;
            }

            // Fetch assignments using the user ID directly
            const assignmentsResponse = await fetch(`/api/teacher-subject-class/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!assignmentsResponse.ok) {
                throw new Error(`Failed to fetch assignments: ${assignmentsResponse.statusText}`);
            }
            const data = await assignmentsResponse.json();
            setAssignments(data);
        } catch (err) {
            console.error('Error fetching teacher subjects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div className="container-fluid py-4">
            <h2>My Subjects</h2>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>Subject Name</th>
                            <th>Class</th>
                            <th>Assigned At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.map(assignment => (
                            <tr key={assignment.id}>
                                <td>{assignment.subject.name}</td>
                                <td>{assignment.classEntity.division}</td>
                                <td>{new Date(assignment.assignedAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {assignments.length === 0 && (
                <div className="text-center mt-4">
                    <p>No subjects assigned.</p>
                </div>
            )}
        </div>
    );
};

export default TeacherSubjects;
