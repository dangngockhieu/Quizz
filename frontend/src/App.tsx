import Homepage from './components/HomePage'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageClasses from './pages/admin/ManageClasses';
import ClassDetailPage from './pages/admin/ClassDetail';

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
          <Route path="/admin/classes" element={<ManageClasses />} />
          <Route path="/admin/classes/:id" element={<ClassDetailPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
