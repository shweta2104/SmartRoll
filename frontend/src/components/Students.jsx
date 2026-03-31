import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Students = () => {
    const [students, setStudents] = useState([]); // All students for counts
    const [classStudents, setClassStudents] = useState([]); // Students for selected class
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedClassName, setSelectedClassName] = useState('');

    const [filteredStudents, setFilteredStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [formData, setFormData] = useState({
        studentId: '',
        // userId: '',
        rollNo: '',
        classId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        sem: '',
        dept: '',
        status: 'ACTIVE',
        createdAt: ''
    });

    const API_BASE = '/api/students';
    const getAuthHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` });

    const fetchClassStudents = async (classId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/students/class/${classId}`, {
                headers: getAuthHeader(),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to fetch students for class');
            const data = await response.json();
            setClassStudents(data);
        } catch (err) {
            console.error('Error fetching students by class:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClassSelect = (cls) => {
        setSelectedClassId(cls.id);
        const className = `${cls.sem ? `Sem ${cls.sem}` : 'Sem'} ${cls.division || cls.dept || 'Div-A'}`;
        setSelectedClassName(className);
        fetchClassStudents(cls.id);
        setSearchTerm('');
        setCurrentPage(1);
    };

    const handleShowAll = () => {
        setSelectedClassId(null);
        setSelectedClassName('');
        setStudents([]);
        setFilteredStudents([]);
        setSearchTerm('');
        setCurrentPage(1);
    };

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    useEffect(() => {
        let filtered = [];
        if (selectedClassId) {
            const targetStudents = classStudents.length > 0 ? classStudents : students.filter(s => parseInt(s.classId) === selectedClassId);
            filtered = targetStudents.filter(student =>
                `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredStudents(filtered);
        setCurrentPage(1);
    }, [classStudents, students, searchTerm, selectedClassId]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchStudents = async () => {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) throw new Error('Failed to fetch students');
            const data = await response.json();
            setStudents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await fetch('/api/classes', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch classes');
            const data = await response.json();
            setClasses(data);
        } catch (err) {
            console.error('Error fetching classes:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const getClassInfo = (classId) => {
        const cls = classes.find(c => c.id === parseInt(classId));
        return { dept: cls ? cls.division : 'N/A', semester: 'N/A' };
    };

    const handleAdd = () => {
        setEditingStudent(null);
        setFormData({
            studentId: '',
            // userId: '',
            rollNo: '',
            classId: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            gender: '',
            sem: '',
            dept: '',
            status: 'ACTIVE',
            createdAt: ''
        });
        setShowModal(true);
    };

    const handleView = (student) => {
        setViewingStudent(student);
        setShowViewModal(true);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            studentId: student.studentId || '',
            // userId: student.userId || '',
            rollNo: student.rollNo || '',
            classId: student.classId || '',
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            email: student.email || '',
            phone: student.phone || '',
            gender: student.gender || '',
            status: student.status || 'ACTIVE'
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: getAuthHeader(), credentials: 'include' });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                if (!response.ok) throw new Error('Failed to delete student');
                fetchStudents();
            } catch (err) {
                alert('Error deleting student: ' + err.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const method = editingStudent ? 'PUT' : 'POST';
            const url = editingStudent ? `${API_BASE}/${editingStudent.id}` : API_BASE;
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
                body: JSON.stringify(formData),
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to save student');
            const savedStudent = await response.json();
            if (editingStudent) {
                setStudents(students.map(s => s.id === editingStudent.id ? savedStudent : s));
            } else {
                setStudents([...students, savedStudent]);
            }
            setShowModal(false);
        } catch (err) {
            alert('Error saving student: ' + err.message);
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
                <h2>{selectedClassName ? `Students - ${selectedClassName}` : 'Manage Students'}</h2>
                <div className="d-flex gap-2">
                    {selectedClassId && (
                        <button className="btn btn-outline-secondary" onClick={handleShowAll}>
                            All Students
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleAdd}>
                        + Add Student
                    </button>
                </div>
            </div>

            {/* Class Selection Cards */}
            <div className="row mb-5">
                <div className="col-12">
                    <h5>Select Class</h5>
                    <div className="row g-3">
                        {classes.map((cls) => (
                            <div key={cls.id} className="col-md-3 col-sm-6">
                                <div
                                    className={`card h-100 ${selectedClassId === cls.id ? 'border-primary shadow' : 'border-secondary'}`}
                                    onClick={() => handleClassSelect(cls)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="card-body d-flex flex-column align-items-center text-center p-4">
                                        <h6 className="mb-3">{`${cls.sem ? `Sem ${cls.sem}` : 'Sem'} ${cls.division || cls.dept || 'Div-A'}`}</h6>
                                        <span className="badge bg-primary mb-2">
                                            {students.filter((s) => s.classId == cls.id).length} Students
                                        </span>
                                        <small className="text-muted">Click to view</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedClassId ? (
                <>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name / roll no"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead className="table-dark">
                                <tr>
                                    <th>Student ID</th>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Dept</th>
                                    <th>Semester</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentStudents.map(student => (
                                    <tr key={student.id}>
                                        <td>{student.studentId}</td>
                                        <td>{student.rollNo}</td>
                                        <td>{student.firstName} {student.lastName}</td>
                                        <td>{student.dept}</td>
                                        <td>{student.sem}</td>
                                        <td>
                                            <span className={`badge ${student.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-info me-2" onClick={() => handleView(student)}>
                                                👁 View
                                            </button>
                                            <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(student)}>
                                                ✏ Edit
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(student.id)}>
                                                🗑 Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <div className="alert alert-info text-center py-5">
                    <h4>Select a class above to view its students</h4>
                    <p className="mb-0">Click on any class card to load students for that semester and division.</p>
                </div>
            )}

            {/* Pagination */}
            {selectedClassId && totalPages > 1 && (
                <nav aria-label="Student pagination">
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

            {/* Modal for View */}
            {showViewModal && viewingStudent && (
                <>
                    <div className="modal-backdrop show" onClick={() => setShowViewModal(false)}></div>
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Student Details</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowViewModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6>Personal Information</h6>
                                            <div className="mb-3">
                                                <label className="form-label">ID</label>
                                                <input type="text" className="form-control" value={viewingStudent.id ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">First Name</label>
                                                <input type="text" className="form-control" value={viewingStudent.firstName ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Last Name</label>
                                                <input type="text" className="form-control" value={viewingStudent.lastName ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-control" value={viewingStudent.email ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Phone</label>
                                                <input type="text" className="form-control" value={viewingStudent.phone ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Gender</label>
                                                <input type="text" className="form-control" value={viewingStudent.gender ?? ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Academic Information</h6>
                                            <div className="mb-3">
                                                <label className="form-label">Student ID</label>
                                                <input type="text" className="form-control" value={viewingStudent.studentId ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Roll No</label>
                                                <input type="text" className="form-control" value={viewingStudent.rollNo ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Class ID</label>
                                                <input type="text" className="form-control" value={viewingStudent.classId ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Semester</label>
                                                <input type="text" className="form-control" value={viewingStudent.sem ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Department</label>
                                                <input type="text" className="form-control" value={viewingStudent.dept ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Status</label>
                                                <input type="text" className="form-control" value={viewingStudent.status ?? ''} readOnly />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Created At</label>
                                                <input type="text" className="form-control" value={viewingStudent.createdAt ?? ''} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal for Add/Edit */}
            {showModal && (
                <>
                    <div className="modal-backdrop show" onClick={() => setShowModal(false)}></div>
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{editingStudent ? 'Edit Student' : 'Add Student'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <h6>Personal Information</h6>
                                                <div className="mb-3">
                                                    <label className="form-label">First Name</label>
                                                    <input type="text" className="form-control" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Last Name</label>
                                                    <input type="text" className="form-control" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Email</label>
                                                    <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Phone</label>
                                                    <input type="text" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Gender</label>
                                                    <div>
                                                        <div className="form-check form-check-inline">
                                                            <input className="form-check-input" type="radio" name="gender" id="male" value="Male" checked={formData.gender === 'Male'} onChange={handleInputChange} />
                                                            <label className="form-check-label" htmlFor="male">Male</label>
                                                        </div>
                                                        <div className="form-check form-check-inline">
                                                            <input className="form-check-input" type="radio" name="gender" id="female" value="Female" checked={formData.gender === 'Female'} onChange={handleInputChange} />
                                                            <label className="form-check-label" htmlFor="female">Female</label>
                                                        </div>
                                                        <div className="form-check form-check-inline">
                                                            <input className="form-check-input" type="radio" name="gender" id="other" value="Other" checked={formData.gender === 'Other'} onChange={handleInputChange} />
                                                            <label className="form-check-label" htmlFor="other">Other</label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <h6>Academic Information</h6>
                                                <div className="mb-3">
                                                    <label className="form-label">Student ID</label>
                                                    <input type="number" className="form-control" name="studentId" value={formData.studentId} onChange={handleInputChange} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Roll No</label>
                                                    <input type="text" className="form-control" name="rollNo" value={formData.rollNo} onChange={handleInputChange} required />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Class</label>
                                                    <select className="form-select" name="classId" value={formData.classId} onChange={handleInputChange} required>
                                                        <option value="">Select Class</option>
                                                        {classes.map(cls => (
                                                            <option key={cls.id} value={cls.id}>{cls.division}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Semester</label>
                                                    <input type="text" className="form-control" name="sem" value={formData.sem} onChange={handleInputChange} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Department</label>
                                                    <input type="text" className="form-control" name="dept" value={formData.dept} onChange={handleInputChange} />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label">Status</label>
                                                    <select className="form-select" name="status" value={formData.status} onChange={handleInputChange}>
                                                        <option value="ACTIVE">Active</option>
                                                        <option value="INACTIVE">Inactive</option>
                                                    </select>
                                                </div>
                                                {/* <div className="mb-3">
                                                    <label className="form-label">Created At</label>
                                                    <input type="text" className="form-control" name="createdAt" value={formData.createdAt} readOnly />
                                                </div> */}
                                            </div>
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

export default Students;
