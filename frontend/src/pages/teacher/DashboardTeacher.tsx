import { useEffect, useState } from 'react';
import { FiUsers} from 'react-icons/fi';
import { numberClassForUser } from '../../services/apiServices';
import '../../styles/pages.scss';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState<number>( 0 );

  useEffect(() => {
    const load = async () => {
      try {
        const classRes = await numberClassForUser();
        setClasses(classRes?.data?.data || 0 );
      } catch (error) {
        console.error('Error fetching class count:', error);
      }
    };
    load();
  }, []);

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
            <span className="stat-card__value">{classes}</span>
            <span className="stat-card__label">Lớp học</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
