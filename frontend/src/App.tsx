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

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import QuizList from './pages/student/QuizList';
import TakeQuiz from './pages/student/TakeQuiz';
import ClassList from './pages/student/ClassList';
import ClassDetail from './pages/student/ClassDetail';
import QuizHistoryModalPage from './pages/student/QuizHistoryModalPage';


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

      {/* Student routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<AppLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/classes" element={<ClassList />} />
          <Route path="/student/classes/:id" element={<ClassDetail />} />
          <Route path="/student/quizzes" element={<QuizList />} />
          <Route path="/student/quizzes/:id" element={<TakeQuiz />} />
          <Route path="/student/quizzes/:id/history" element={<QuizHistoryModalPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
