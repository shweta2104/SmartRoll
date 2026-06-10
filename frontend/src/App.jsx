import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Home from './components/Home';
import Teachers from './components/Teachers';
import Students from './components/Students';
import Subjects from './components/Subject';
import Classes from './components/Classes';
import Schedules from './components/Schedules';
import TeacherSubjectClass from './components/TeacherSubjectClass';
import AdminHome from './components/AdminHome';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import TeacherClasses from './components/teacher/TeacherClasses';
import TeacherStudents from './components/teacher/TeacherStudents';
import TeacherSubjects from './components/teacher/TeacherSubjects';
import TeacherAttendance from './components/teacher/TeacherAttendance';
import TeacherSchedule from './components/teacher/TeacherSchedule';
import TeacherDashboardHome from './components/teacher/TeacherDashboardHome';
import AttendanceReport from './components/teacher/AttendanceReport';
import TeacherRegistration from './components/TeacherRegistration';
import TeacherLogin from './components/TeacherLogin';
import StudentLogin from './components/StudentLogin';
import StudentRegister from './components/StudentRegister';
import StudentEmailLookup from './components/StudentEmailLookup';
import StudentPasswordReset from './components/StudentPasswordReset';
import TeacherEmailLookup from './components/TeacherEmailLookup';
import StudentDashboard from './components/student/StudentDashboard';
import StudentDashboardHome from './components/student/StudentDashboardHome';
import StudentClasses from './components/student/StudentClasses';
import StudentSubjects from './components/student/StudentSubjects';
import StudentAttendance from './components/student/StudentAttendance';
import StudentQrAttendance from './components/student/StudentQrAttendance';
import StudentSchedule from './components/student/StudentSchedule';
import StudentProfile from './components/student/StudentProfile';



import Footer from './components/Footer';
import useAuth, { ROLES } from './hooks/useAuth';
import './App.css';

function App() {
  const { logoutRole, ROLES } = useAuth();


  const handleRoleSwitch = (role) => {
    if (role === 'none') {
      logoutRole(ROLES.ADMIN);
      logoutRole(ROLES.TEACHER);
    }
  };

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-register" element={<StudentRegister />} />
          <Route path="/student/email-lookup" element={<StudentEmailLookup />} />
          <Route path="/student/password-reset" element={<StudentPasswordReset />} />
          <Route path="/teacher/register" element={<TeacherRegistration />} />
          <Route path="/teacher/email-lookup" element={<TeacherEmailLookup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminHome />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="students" element={<Students />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="classes" element={<Classes />} />
            <Route path="schedules" element={<Schedules />} />
            <Route path="teacher-subject-class" element={<TeacherSubjectClass />} />
          </Route>
          <Route path="/teacher" element={<TeacherDashboard />}>
            <Route index element={<TeacherDashboardHome />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="subjects" element={<TeacherSubjects />} />
            <Route path="schedule" element={<TeacherSchedule />} />
            <Route path="attendance-report" element={<AttendanceReport />} />
          </Route>
          <Route path="/student" element={<StudentDashboard />}>
            <Route index element={<StudentDashboardHome />} />
            <Route path="classes" element={<StudentClasses />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="qr-attendance" element={<StudentQrAttendance />} />
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="profile" element={<StudentProfile />} />

          </Route>

          <Route path="/" element={<Home />} />
        </Routes>

        <Footer />
      </Router>
    </div>
  );
}

export default App;

