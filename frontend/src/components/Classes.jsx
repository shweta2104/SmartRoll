import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        classCode: '',
        division: '',
        sem: '',
        status: 'ACTIVE'
    });


    const API_BASE = '/api/classes';

    const token = localStorage.getItem('token');
    const AUTH_HEADER = token ? { 'Authorization': `Bearer ${token}` } : {};

    useEffect(() => {
        fetchClasses();
    }, []);


    useEffect(() => {
        setFilteredClasses(
            classes.filter(cls =>
                (cls.classCode && cls.classCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (cls.division && cls.division.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (cls.sem && cls.sem.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        );
        setCurrentPage(1); // Reset to first page when search changes
    }, [classes, searchTerm]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentClasses = filteredClasses.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchClasses = async () => {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) throw new Error('Failed to fetch classes');
            const data = await response.json();
            setClasses(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {

        setEditingClass(null);
        setFormData({
            classCode: '',
            division: '',
            sem: '',
            status: 'ACTIVE'
        });
        setShowModal(true);
    };


    const handleEdit = (cls) => {
        setEditingClass(cls);
        setFormData({
            id: cls.id || '',
            classCode: cls.classCode || '',
            division: cls.division || '',
            sem: cls.sem || '',
            status: cls.status || 'ACTIVE'
        });
        setShowModal(true);
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                const response = await fetch(`${API_BASE}/${id}`, {
                    method: 'DELETE',
                    headers: AUTH_HEADER,
                    credentials: 'include'
                });
                if (!response.ok) throw new Error('Failed to delete class');
                setClasses(classes.filter(c => c.id !== id));
            } catch (err) {
                alert('Error deleting class: ' + err.message);
            }
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingClass ? 'PUT' : 'POST';
            const url = editingClass ? `${API_BASE}/${editingClass.id}` : API_BASE;
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', ...AUTH_HEADER },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to save class');
            const savedClass = await response.json();
            if (editingClass) {
                setClasses(classes.map(c => c.id === editingClass.id ? savedClass : c));
            } else {
                setClasses([...classes, savedClass]);
            }
            setShowModal(false);
        } catch (err) {
            alert('Error saving class: ' + err.message);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Manage Classes</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    + Add Class
                </button>
            </div>

            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-bordered">
                    <thead className="table-dark">
                        <tr>
                            <th>Class Code</th>
                            <th>Division</th>
                            <th>Semester</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>

                    </thead>
                    <tbody>
                        {currentClasses.map(cls => (
                            <tr key={cls.id}>
                                <td>{cls.classCode}</td>
                                <td>{cls.division}</td>
                                <td>{cls.sem}</td>
                                <td>
                                    <span className={`badge ${cls.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                        {cls.status}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(cls)}>
                                        ✏ Edit
                                    </button>
                                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cls.id)}>
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
                                    <h5 className="modal-title">{editingClass ? 'Edit Class' : 'Add Class'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Class Code</label>
                                            <input type="text" className="form-control" name="classCode" value={formData.classCode} onChange={handleInputChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Division</label>
                                            <select className="form-select" name="division" value={formData.division} onChange={handleInputChange} required>
                                                <option value="">Select Division</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Semester</label>
                                            <input type="text" className="form-control" name="sem" value={formData.sem} onChange={handleInputChange} />
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

export default Classes;
