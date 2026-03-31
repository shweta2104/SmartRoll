import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const TeacherStudents = () => {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedClassName, setSelectedClassName] = useState('');
    const [currentStudents, setCurrentStudents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await fetch('/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                navigate('/login');
                return;
            }
            fetchTeacherClasses();
        } catch (err) {
            console.error('Authentication check failed:', err);
            navigate('/login');
        }
    };

    const fetchTeacherClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            const teacherResponse = await fetch(`/api/teachers/userId/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!teacherResponse.ok) {
                throw new Error(`Failed to fetch teacher info: ${teacherResponse.statusText}`);
            }
            const teacher = await teacherResponse.json();
            console.log('Fetched teacher:', teacher);

            const classesResponse = await fetch(`/api/classes/teacher/${teacher.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!classesResponse.ok) {
                throw new Error(`Failed to fetch classes: ${classesResponse.statusText}`);
            }
            const data = await classesResponse.json();
            console.log('Fetched classes for teacher:', data);
            setClasses(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching teacher classes:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchClassStudents = async (classId) => {
        try {
            console.log(`Fetching students for selected class ${classId}`);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/students/class/${classId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                const studentsData = await response.json();
                const studentsWithClass = studentsData.map(student => ({
                    ...student,
                    className: classes.find(c => c.id === classId)?.division
                }));
                console.log(`Loaded ${studentsWithClass.length} students for class ${classId}`);
                setCurrentStudents(studentsWithClass);
            } else {
                setCurrentStudents([]);
            }
        } catch (err) {
            console.error('Error fetching class students:', err);
            setCurrentStudents([]);
            setError(err.message);
        }
    };

    if (loading) return <div className="text-center mt-5"><div>Loading your classes...</div></div>;
    if (error) return <div className="alert alert-danger m-4">Error: {error}</div>;

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Classes & Students</h2>
            </div>

            {/* Class Selection Cards */}
            <div className="row mb-5 g-4">
                {classes.length === 0 ? (
                    <div className="col-12">
                        <div className="alert alert-info text-center">
                            <h5>No classes assigned yet.</h5>
                            <p>Contact admin to assign classes/subjects.</p>
                        </div>
                    </div>
                ) : (
                    classes.map((cls) => (
                        <div key={cls.id} className="col-md-3 col-sm-6">
                            <div
                                className={`card h-100 ${selectedClassId === cls.id ? 'border-primary shadow-lg' : 'border-secondary shadow-sm'}`}
                                onClick={() => {
                                    const className = `${cls.sem ? `Sem ${cls.sem}` : ''} ${cls.division}`;
                                    setSelectedClassId(cls.id);
                                    setSelectedClassName(className);
                                    fetchClassStudents(cls.id);
                                }}
                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div className="card-body d-flex flex-column align-items-center text-center p-4">
                                    <i className="fas fa-users mb-3 text-primary" style={{ fontSize: '2.5rem' }}></i>

                                    <h6>{cls.sem ? `Sem ${cls.sem}` : ''}-{cls.division}</h6>
                                    {/* <h6 className="mb-2"></h6> */}
                                    <span className="badge bg-primary fs-6 px-3 py-2">
                                        View Students
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Selected Class Students */}
            {selectedClassId && (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <button
                                className="btn btn-outline-secondary me-3"
                                onClick={() => {
                                    setSelectedClassId(null);
                                    setSelectedClassName('');
                                    setCurrentStudents([]);
                                }}
                            >
                                ← Back to All Classes
                            </button>
                            <h4 className="d-inline ms-2 mb-0 text-primary">{selectedClassName} Students ({currentStudents.length})</h4>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped table-hover">
                            <thead className="table-dark">
                                <tr>

                                    <th>Photo</th>
                                    <th>Roll No</th>
                                    <th>Name</th>
                                    <th>Sem</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-5 text-muted">
                                            <i className="fas fa-users fa-3x mb-3 d-block"></i>
                                            No students in this class
                                        </td>
                                    </tr>
                                ) : (
                                    currentStudents.map((student) => (
                                        <tr key={student.id}>
                                            {/* <td><small className="badge bg-light text-dark">#{student.id}</small></td> */}
                                            <td>
                                                <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                    {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                                                </div>
                                            </td>
                                            <td><strong>{student.rollNo}</strong></td>
                                            <td>
                                                <div>
                                                    <strong>{student.firstName} {student.lastName}</strong>
                                                    {/* <br />
                                                    <small className="text-muted">{student.className}</small> */}
                                                </div>
                                            </td>
                                            <td>{student.sem}-{student.className}</td>
                                            <td className="text-truncate" title={student.email}>{student.email}</td>
                                            <td>{student.phone || 'N/A'}</td>
                                            <td>
                                                <span className={`badge fs-6 px-3 py-1 ${student.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {classes.length === 0 && !loading && (
                <div className="row">
                    <div className="col-12 text-center py-5">
                        <i className="fas fa-chalkboard fa-4x text-muted mb-4"></i>
                        <h4 className="text-muted mb-3">No Classes Assigned</h4>
                        <p className="text-muted lead">Contact your administrator to assign classes and subjects.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStudents;

