import Homepage from './components/HomePage'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Admin pages
import AdminDashboard from './pages/admin/DashboardAdmin';
import ManageUsers from './pages/admin/ManageUsers';
import ManageClassesAdmin from './pages/admin/ManageClassesAdmin';
import ClassDetailAdmin from './pages/admin/ClassDetailAdmin';

// Teacher pages
import TeacherDashboard from './pages/teacher/DashboardTeacher';
import ManageQuizzes from './pages/teacher/ManageQuizzes';
import QuizEditor from './pages/teacher/QuizEditor';
import QuizScores from './pages/teacher/QuizScores';
import ManageClassesTeacher from './pages/teacher/ManageClassesTeacher';
import ClassDetailTeacher from './pages/teacher/ClassDetailTeacher';




function App() {

  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />

      {/* Admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/classes" element={<ManageClassesAdmin />} />
          <Route path="/admin/classes/:id" element={<ClassDetailAdmin />} />
        </Route>
      </Route>

      {/* Teacher routes */}
      <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
        <Route element={<AppLayout />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<ManageClassesTeacher />} />
          <Route path="/teacher/classes/:id" element={<ClassDetailTeacher />} />
          <Route path="/teacher/quizzes" element={<ManageQuizzes />} />
          <Route path="/teacher/quizzes/:id" element={<QuizEditor />} />
          <Route path="/teacher/quizzes/:id/edit" element={<QuizEditor />} />
          <Route path="/teacher/scores" element={<QuizScores />} />
        </Route>
      </Route>

      
    </Routes>
  )
}

export default App
