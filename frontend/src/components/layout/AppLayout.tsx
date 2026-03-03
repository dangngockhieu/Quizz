import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { doLogout } from '../../redux/userSlice';
import { useState } from 'react';
import {
  FiMenu, FiX, FiHome, FiUsers, FiBookOpen,
  FiFileText, FiBarChart2, FiLogOut, FiEdit3, FiClipboard
} from 'react-icons/fi';
import './Layout.scss';

interface MenuItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const roleMenus: Record<string, MenuItem[]> = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: <FiHome /> },
    { to: '/admin/users', label: 'Quản lý Users', icon: <FiUsers /> },
    { to: '/admin/classes', label: 'Quản lý Lớp học', icon: <FiBookOpen /> },
  ],
  TEACHER: [
    { to: '/teacher', label: 'Dashboard', icon: <FiHome /> },
    { to: '/teacher/quizzes', label: 'Quản lý Quiz', icon: <FiFileText /> },
    { to: '/teacher/scores', label: 'Tổng hợp điểm', icon: <FiBarChart2 /> },
  ],
  STUDENT: [
    { to: '/student', label: 'Dashboard', icon: <FiHome /> },
    { to: '/student/quizzes', label: 'Làm bài thi', icon: <FiEdit3 /> },
    { to: '/student/history', label: 'Lịch sử làm bài', icon: <FiClipboard /> },
  ],
};

const roleTitles: Record<string, string> = {
  ADMIN: 'Admin Panel',
  TEACHER: 'Teacher Panel',
  STUDENT: 'Student Panel',
};

const AppLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { account } = useAppSelector((state) => state.user);
  const role = (account?.role as string) || 'STUDENT';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menus = roleMenus[role] || [];
  const title = roleTitles[role] || 'LMS';

  const handleLogout = () => {
    dispatch(doLogout());
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__header">
          <h2 className="sidebar__title">{title}</h2>
          <button className="sidebar__close" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>

        <nav className="sidebar__nav">
          {menus.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/admin` || item.to === `/teacher` || item.to === `/student`}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span className="sidebar__link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__avatar">
              {(account?.fullName as string)?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar__user-info">
              <span className="sidebar__user-name">{account?.fullName as string}</span>
              <span className="sidebar__user-role">{role}</span>
            </div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout}>
            <FiLogOut />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content">
        <header className="topbar">
          <button className="topbar__toggle" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          <div className="topbar__right">
            <span className="topbar__greeting">Xin chào, <strong>{account?.fullName as string}</strong></span>
          </div>
        </header>

        <main className="main-content__body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
