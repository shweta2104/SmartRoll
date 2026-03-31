import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeacherSubjectClass = () => {
    const [assignments, setAssignments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [formData, setFormData] = useState({
        teacherId: '',
        subjectId: '',
        classId: ''
    });

    const token = localStorage.getItem('token');
    const AUTH_HEADER = token ? { 'Authorization': `Bearer ${token}` } : {};

    const API_BASE = '/api';

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setFilteredAssignments(
            assignments.filter(assignment =>
                `${assignment.teacher.firstName} ${assignment.teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assignment.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assignment.classEntity.division.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [assignments, searchTerm]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const [assignmentsRes, teachersRes, subjectsRes, classesRes] = await Promise.all([
                fetch(`${API_BASE}/teacher-subject-class`, { headers }),
                fetch(`${API_BASE}/teachers`, { headers }),
                fetch(`${API_BASE}/subjects`, { headers }),
                fetch(`${API_BASE}/classes`, { headers })
            ]);

            if (!assignmentsRes.ok || !teachersRes.ok || !subjectsRes.ok || !classesRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const assignmentsData = await assignmentsRes.json();
            const teachersData = await teachersRes.json();
            const subjectsData = await subjectsRes.json();
            const classesData = await classesRes.json();

            setAssignments(assignmentsData);
            setTeachers(teachersData);
            setSubjects(subjectsData);
            setClasses(classesData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingAssignment(null);
        setFormData({
            teacherId: '',
            subjectId: '',
            classId: ''
        });
        setShowModal(true);
    };

    const handleEdit = (assignment) => {
        setEditingAssignment(assignment);
        setFormData({
            teacherId: assignment.teacher.id,
            subjectId: assignment.subject.id,
            classId: assignment.classEntity.id
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            try {
                const response = await fetch(`${API_BASE}/teacher-subject-class/${id}`, {
                    method: 'DELETE',
                    headers: AUTH_HEADER,
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to delete assignment');
                setAssignments(assignments.filter(a => a.id !== id));
            } catch (err) {
                alert('Error deleting assignment: ' + err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingAssignment ? 'PUT' : 'POST';
            const url = editingAssignment
                ? `${API_BASE}/teacher-subject-class/${editingAssignment.id}`
                : `${API_BASE}/teacher-subject-class`;

            const payload = {
                teacher: { id: parseInt(formData.teacherId) },
                subject: { id: parseInt(formData.subjectId) },
                classEntity: { id: parseInt(formData.classId) }
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save assignment: ${errorText}`);
            }

            const savedAssignment = await response.json();
            if (editingAssignment) {
                setAssignments(assignments.map(a => a.id === editingAssignment.id ? savedAssignment : a));
            } else {
                setAssignments([...assignments, savedAssignment]);
            }
            setShowModal(false);
        } catch (err) {
            alert('Error saving assignment: ' + err.message);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Academic Mapping
                </h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    + Add Academic Mapping

                </button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search Academic Mapping..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>

                            <th>Teacher</th>
                            <th>Subject</th>
                            <th>Class</th>
                            <th>Assigned At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignments.map(assignment => (
                            <tr key={assignment.id}>

                                <td>{assignment.teacher?.firstName} {assignment.teacher?.lastName}</td>
                                <td>{assignment.subject?.name}</td>
                                <td>{assignment.classEntity?.classCode} {assignment.classEntity?.division}</td>
                                <td>{assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString() : new Date().toLocaleDateString()}</td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(assignment)}>
                                        ✏ Edit
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(assignment.id)}>
                                        🗑 Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit */}
            {showModal && (
                <>
                    <div className="modal-backdrop show" onClick={() => setShowModal(false)}></div>
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editingAssignment ? 'Edit Assignment' : 'Add Assignment'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Teacher</label>
                                            <select className="form-select" name="teacherId" value={formData.teacherId} onChange={handleInputChange} required>
                                                <option value="">Select Teacher</option>
                                                {teachers.map(teacher => (
                                                    <option key={teacher.id} value={teacher.id}>
                                                        {teacher.firstName} {teacher.lastName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Subject</label>
                                            <select className="form-select" name="subjectId" value={formData.subjectId} onChange={handleInputChange} required>
                                                <option value="">Select Subject</option>
                                                {subjects.map(subject => (
                                                    <option key={subject.id} value={subject.id}>
                                                        {subject.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Class</label>
                                            <select className="form-select" name="classId" value={formData.classId} onChange={handleInputChange} required>
                                                <option value="">Select Class</option>
                                                {classes.map(cls => (
                                                    <option key={cls.id} value={cls.id}>
                                                        {cls.classCode} {cls.division}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary">Save</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TeacherSubjectClass;
