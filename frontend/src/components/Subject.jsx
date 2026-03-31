import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Subjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Calculate pagination
    const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentSubjects = filteredSubjects.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const [showModal, setShowModal] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        code: '',
        name: '',
        description: '',
        status: 'ACTIVE'
    });

    const token = localStorage.getItem('token');
    const AUTH_HEADER = token ? { 'Authorization': `Bearer ${token}` } : {};

    const API_BASE = '/api/subjects';

    useEffect(() => {
        if (!token) return;
        fetchSubjects();
    }, [token]);

    useEffect(() => {
        setFilteredSubjects(
            subjects.filter(subject =>
                (subject.code && subject.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
                subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
    }, [subjects, searchTerm]);

    const fetchSubjects = async () => {
        try {
            const response = await fetch(API_BASE, { headers: AUTH_HEADER, credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch subjects');
            const data = await response.json();
            setSubjects(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingSubject(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            status: 'ACTIVE'
        });
        setShowModal(true);
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setFormData({
            id: subject.id || '',
            code: subject.code || '',
            name: subject.name || '',
            description: subject.description || '',
            status: subject.status || 'ACTIVE'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this subject?')) {
            try {
                const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: AUTH_HEADER, credentials: 'include' });
                if (!response.ok) throw new Error('Failed to delete subject');
                setSubjects(subjects.filter(s => s.id !== id));
            } catch (err) {
                alert('Error deleting subject: ' + err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingSubject ? 'PUT' : 'POST';
            const url = editingSubject ? `${API_BASE}/${editingSubject.id}` : API_BASE;
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to save subject');
            const savedSubject = await response.json();
            if (editingSubject) {
                setSubjects(subjects.map(s => s.id === editingSubject.id ? savedSubject : s));
            } else {
                setSubjects([...subjects, savedSubject]);
            }
            setShowModal(false);
        } catch (err) {
            alert('Error saving subject: ' + err.message);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (!token) return <div className="alert alert-warning text-center mt-5">Please <a href="/admin/login">login as admin</a> first.</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;


    return (
        <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Subjects</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    + Add Subject
                </button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentSubjects.map(subject => (
                            <tr key={subject.id}>
                                <td>{subject.code}</td>
                                <td>{subject.name}</td>
                                <td>{subject.description}</td>
                                <td>
                                    <span className={`badge ${subject.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                        {subject.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(subject)}>
                                        ✏ Edit
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(subject.id)}>
                                        🗑 Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav aria-label="Subject pagination">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                Previous
                            </button>
                        </li>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
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

            {/* Modal for Add/Edit */}
            {showModal && (
                <>
                    <div className="modal-backdrop show" onClick={() => setShowModal(false)}></div>
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editingSubject ? 'Edit Subject' : 'Add Subject'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Code</label>
                                            <input type="text" className="form-control" name="code" value={formData.code} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Name</label>
                                            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Status</label>
                                            <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
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

export default Subjects;
