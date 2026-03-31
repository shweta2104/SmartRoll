import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import TeacherEmailLookup from './components/TeacherEmailLookup';
// import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import './App.css'

function App() {
  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/student-register" element={<StudentRegister />} />
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
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
