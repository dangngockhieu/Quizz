import { useEffect, useState } from 'react';
import { FiUsers} from 'react-icons/fi';
import { getAllClassesForUser } from '../../services/apiServices';
import '../../styles/pages.scss';
import { useAppSelector } from '../../redux/hooks';

const TeacherDashboard = () => {
  const { account } = useAppSelector((state) => state.user);
  const id = account?.id ? Number(account.id) : 0;
  const [stats, setStats] = useState({ classes: 0 });

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const classRes = await getAllClassesForUser(id);
        setStats({
          classes: classRes?.data?.data?.length || 0,
        });
      } catch { /* ignore */ }
    };
    load();
  }, [id]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Dashboard Giáo viên</h1>
        <p className="page-header__sub">Tổng quan hoạt động</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#e8f5e9' }}>
            <FiUsers size={24} color="#2e7d32" />
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">{stats.classes}</span>
            <span className="stat-card__label">Lớp học</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
