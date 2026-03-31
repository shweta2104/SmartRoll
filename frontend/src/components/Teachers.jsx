import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Teachers = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: '',
        dept: '',
        status: 'ACTIVE'
    });
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    const userRole = localStorage.getItem('userRole') || localStorage.getItem('role') || '';
    const isAdmin = userRole === 'ADMIN';
    const API_BASE = isAdmin ? '/api/admin/teachers' : '/api/teachers';

    const getAuthHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

    useEffect(() => {
        if (isAdmin) {
            fetchTeachers();
        }
    }, [isAdmin]);

    useEffect(() => {
        const teacherArray = Array.isArray(teachers) ? teachers : [];
        setFilteredTeachers(
            teacherArray.filter(teacher =>
                `${teacher.firstName || ''} ${teacher.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (teacher.email || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
        setCurrentPage(1);
    }, [teachers, searchTerm]);

    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchTeachers = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_BASE, {
                headers: getAuthHeader(),
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch teachers: ${response.status}`);
            }
            const data = await response.json();
            const teacherData = Array.isArray(data) ? data : [];
            console.log('Fetched teachers:', teacherData);
            setTeachers(teacherData);
        } catch (err) {
            console.error('Error fetching teachers:', err);
            setError(err.message);
            setTeachers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        if (!isAdmin) {
            alert('Access denied: only admin can add teachers.');
            return;
        }
        setEditingTeacher(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            dept: '',
            phone: '',
            status: 'ACTIVE'
        });
        setShowModal(true);
    };

    const handleSelectTeacher = (teacherId, checked) => {
        setSelectedTeachers(prev =>
            checked ? [...prev, teacherId] : prev.filter(id => id !== teacherId)
        );
    };

    const handleSendEmail = async () => {
        if (!isAdmin) {
            alert('Access denied: only admin can send bulk email.');
            return;
        }
        if (selectedTeachers.length === 0) {
            alert('Please select teachers first');
            return;
        }
        try {
            const response = await fetch('/api/admin/teachers/bulk-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    teacherIds: selectedTeachers,
                    subject: emailSubject || 'Announcement from SmartRoll Admin',
                    body: emailBody || 'Please check your schedule and announcements.'
                }),
                credentials: 'include'
            });
            if (response.ok) {
                alert('Emails sent successfully!');
                setEmailSubject('');
                setEmailBody('');
                setSelectedTeachers([]);
                setShowEmailModal(false);
            } else {
                alert('Failed to send emails');
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleEdit = (teacher) => {
        if (!isAdmin) {
            alert('Access denied: only admin can edit teachers.');
            return;
        }
        setEditingTeacher(teacher);
        setFormData({
            firstName: teacher.firstName || '',
            lastName: teacher.lastName || '',
            email: teacher.email || '',
            phone: teacher.phone || '',
            gender: teacher.gender || '',
            dept: teacher.dept || '',
            status: teacher.status || 'ACTIVE'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!isAdmin) {
            alert('Access denied: only admin can delete teachers.');
            return;
        }
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                const token = localStorage.getItem('token');
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                };
                const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers, credentials: 'include' });
                if (!response.ok) throw new Error('Failed to delete teacher');
                setTeachers(teachers.filter(t => t.id !== id));
            } catch (err) {
                alert('Error deleting teacher: ' + err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            };
            const method = editingTeacher ? 'PUT' : 'POST';
            const url = editingTeacher ? `${API_BASE}/${editingTeacher.id}` : API_BASE;
            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to save teacher');
            const savedTeacher = await response.json();
            if (editingTeacher) {
                setTeachers(teachers.map(t => t.id === editingTeacher.id ? savedTeacher : t));
            } else {
                setTeachers([...teachers, savedTeacher]);
            }
            setShowModal(false);
        } catch (err) {
            alert('Error saving teacher: ' + err.message);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    if (!isAdmin) {
        return (
            <div className="container-fluid py-4">
                <div className="alert alert-warning">
                    Access denied: admin privileges are required to manage teachers.
                    Please log in as an admin user.
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Teachers</h2>
                <div className="d-flex gap-2">
                    <button className="btn btn-primary" onClick={handleAdd}>
                        + Add Teacher
                    </button>
                    <button className="btn btn-success" onClick={() => setShowEmailModal(true)} disabled={selectedTeachers.length === 0}>
                        📧 Send Email ({selectedTeachers.length})
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th><input type="checkbox" onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedTeachers(filteredTeachers.map(t => t.id));
                                } else {
                                    setSelectedTeachers([]);
                                }
                            }} /></th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTeachers.map(teacher => (
                            <tr key={teacher.id}>
                                <td>
                                    <input type="checkbox"
                                        checked={selectedTeachers.includes(teacher.id)}
                                        onChange={(e) => handleSelectTeacher(teacher.id, e.target.checked)} />
                                </td>
                                <td>{teacher.firstName} {teacher.lastName}</td>
                                <td>{teacher.email}</td>
                                <td>
                                    <span className={`badge ${teacher.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                        {teacher.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(teacher)}>
                                        ✏ Edit
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(teacher.id)}>
                                        🗑 Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* ... rest unchanged ... */}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav>
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                Previous
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(page)}>
                                    {page}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* Add/Edit Teacher Modal */}
            {showModal && (
                <>
                    <div className="modal-backdrop show" onClick={() => setShowModal(false)}></div>
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editingTeacher ? 'Edit Teacher' : 'Add Teacher'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">First Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Last Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Phone</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Gender</label>
                                                <div className="d-flex gap-3 mt-2">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="gender"
                                                            id="genderMale"
                                                            value="MALE"
                                                            checked={formData.gender === 'MALE'}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="genderMale">
                                                            Male
                                                        </label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="gender"
                                                            id="genderFemale"
                                                            value="FEMALE"
                                                            checked={formData.gender === 'FEMALE'}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="genderFemale">
                                                            Female
                                                        </label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="gender"
                                                            id="genderOther"
                                                            value="OTHER"
                                                            checked={formData.gender === 'OTHER'}
                                                            onChange={handleInputChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="genderOther">
                                                            Other
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Department</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="dept"
                                                    value={formData.dept}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="col-12 mb-3">
                                                <label className="form-label">Status</label>
                                                <select
                                                    className="form-select"
                                                    name="status"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                >
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="INACTIVE">Inactive</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            {editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Bulk Email Modal */}
            {showEmailModal && (
                <>
                    <div className="modal-backdrop show" onClick={() => setShowEmailModal(false)}></div>
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Send Bulk Email to {selectedTeachers.length} Teacher(s)</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowEmailModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Subject</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={emailSubject}
                                            onChange={(e) => setEmailSubject(e.target.value)}
                                            placeholder="Announcement from SmartRoll Admin"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Message</label>
                                        <textarea
                                            className="form-control"
                                            rows="5"
                                            value={emailBody}
                                            onChange={(e) => setEmailBody(e.target.value)}
                                            placeholder="Please check your schedule and announcements."
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={handleSendEmail}>
                                        Send Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Teachers;