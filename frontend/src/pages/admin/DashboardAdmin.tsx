import { useEffect, useState } from 'react';
import { FiUsers, FiBookOpen, FiActivity } from 'react-icons/fi';
import { getAllUsers, getAllClasses} from '../../services/apiServices';
import './AdminTheme.scss';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, classes: 0});

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, cRes] = await Promise.all([
          getAllUsers(),
          getAllClasses()
        ]);
        setStats({
          users: uRes?.data?.data?.length || 0,
          classes: cRes?.data?.data?.length || 0,
        });
      } catch { /* ignore */ }
    };
    load();
  }, []);

  return (
    <div className="admin-page admin-dashboard">
      <section className="admin-hero">
        <div className="admin-hero__content">
          <p className="admin-hero__eyebrow">Admin Panel</p>
          <h1 className="admin-hero__title">Dashboard</h1>
          <p className="admin-hero__sub">Tổng quan nhanh về người dùng, lớp học và bài thi</p>
          <div className="admin-hero__chips">
            <span className="chip"><FiActivity /> Số liệu realtime từ hệ thống</span>
            <span className="chip chip--soft">Cập nhật mỗi lần tải trang</span>
          </div>
        </div>
      </section>

      <div className="stats-grid dashboard-stats">
        <div className="stat-card stat-card--glow stat-card--users">
          <div className="stat-card__icon stat-card__icon--blue"><FiUsers /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.users}</span>
            <span className="stat-card__label">Người dùng</span>
            <small className="stat-card__hint">Tất cả tài khoản đã tạo</small>
          </div>
        </div>
        <div className="stat-card stat-card--glow stat-card--classes">
          <div className="stat-card__icon stat-card__icon--green"><FiBookOpen /></div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.classes}</span>
            <span className="stat-card__label">Lớp học</span>
            <small className="stat-card__hint">Số lớp hiện có</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
