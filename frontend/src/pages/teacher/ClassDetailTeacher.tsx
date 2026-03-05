import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFileText, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { getClassDetail } from '../../services/apiServices';
import './TeacherTheme.scss';
import './ClassDetailTeacher.scss';

interface User { id: number; code: string; fullName: string; role: string; status: string }
interface Quiz { id: number; title: string; timeStart: string; timeEnd: string }
interface QuizStats { attemptCount: number; isClosed: boolean }
interface ClassDetail {
  id: number;
  name: string;
  description: string | null;
  users: { userID: number; classID: number; user: User }[];
  classQuizzes: { classID: number; quizID: number; quiz: Quiz; stats?: QuizStats }[];
}

const ClassDetailTeacher = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [showUsers, setShowUsers] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getClassDetail(Number(id))
      .then(res => { if (!cancelled) setClassData(res?.data?.data ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id ]);

  if (!classData) return <div className="empty-state"><span className="empty-state__text">Đang tải...</span></div>;

  const usersList = classData.users ?? [];
  const quizzesList = classData.classQuizzes ?? [];

  const roleBadge = (role: string) => {
    const cls = role === 'ADMIN' ? 'badge--admin' : role === 'TEACHER' ? 'badge--teacher' : 'badge--student';
    return <span className={`badge ${cls}`}>{role}</span>;
  };

  return (
    <div className="admin-page admin-class-detail">
      <div className="page-header page-header--stacked">
        <button className="btn btn--outline btn--sm page-header__back" onClick={() => navigate('/teacher/classes')}>
          <FiArrowLeft /> Quay lại
        </button>
        <h1 className="page-header__title">{classData.name}</h1>
        <p className="page-header__sub">{classData.description || 'Không có mô tả'}</p>
        <div className="page-header__actions">
          <span className="chip chip--pill">Thành viên: {usersList.length}</span>
          <span className="chip chip--soft">Bài thi: {quizzesList.length}</span>
        </div>
      </div>

      <div className="card card--float">
        <div className="card__header">
          <h3 className="card__title">Danh sách thành viên</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => setShowUsers((v) => !v)}
              title={showUsers ? 'Ẩn danh sách' : 'Hiện danh sách'}
            >
              {showUsers ? <FiChevronUp /> : <FiChevronDown />} {showUsers ? 'Ẩn' : 'Hiện'}
            </button>
          </div>
        </div>
        {showUsers && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Họ tên</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr><td colSpan={3} className="empty-state"><span className="empty-state__text">Chưa có thành viên</span></td></tr>
                ) : (
                  usersList.map((uc) => (
                    <tr key={uc.userID}>
                      <td><strong>{uc.user.code}</strong></td>
                      <td>{uc.user.fullName}</td>
                      <td>{roleBadge(uc.user.role)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card card--float" style={{ marginTop: 16 }}>
        <div className="card__header">
          <h3 className="card__title"><FiFileText />&nbsp;Bài thi</h3>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Thời gian</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-center">Lượt nộp</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {quizzesList.length === 0 ? (
                <tr><td colSpan={5} className="empty-state"><span className="empty-state__text">Chưa có bài thi trong lớp</span></td></tr>
              ) : (
                quizzesList.map((q) => {
                  const closed = q.stats?.isClosed;
                  const attemptCount = q.stats?.attemptCount ?? 0;
                  return (
                    <tr key={q.quizID}>
                      <td><strong>{q.quiz.title}</strong></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span>Bắt đầu: {new Date(q.quiz.timeStart).toLocaleString('vi-VN')}</span>
                          <span>Kết thúc: {new Date(q.quiz.timeEnd).toLocaleString('vi-VN')}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${closed ? 'badge--danger' : 'badge--success'}`}>
                          {closed ? 'Đã đóng' : 'Đang mở'}
                        </span>
                      </td>
                      <td className="text-center">
                        <strong>{attemptCount}</strong>
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn--outline btn--sm"
                          onClick={() => navigate(`/teacher/scores?classId=${id}&quizId=${q.quizID}`)}
                        >
                          Xem điểm
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ClassDetailTeacher;
