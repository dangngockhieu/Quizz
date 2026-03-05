import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiFileText } from 'react-icons/fi';
import {
  getClassDetail, getAllUsers, addUserToClass, removeUserFromClass,
} from '../../services/apiServices';
import { toast } from 'react-toastify';
import './AdminTheme.scss';
import './ClassDetailAdmin.scss';

interface User { id: number; code: string; fullName: string; role: string; status: string }
interface Quiz { id: number; title: string; timeStart: string; timeEnd: string }
interface ClassDetail {
  id: number;
  name: string;
  description: string | null;
  users: { userID: number; classID: number; user: User }[];
  classQuizzes: { classID: number; quizID: number; quiz: Quiz }[];
}

const ClassDetailAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassDetail | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUserID, setSelectedUserID] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const reload = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    let cancelled = false;
    getClassDetail(Number(id))
      .then(res => { if (!cancelled) setClassData(res?.data?.data ?? null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [id, refreshKey]);

  const openAddUser = async () => {
    try {
      const res = await getAllUsers();
      setAllUsers(res?.data?.data || []);
    } catch { /* ignore */ }
    setSelectedUserID(0);
    setShowAddUser(true);
  };

  const handleAddUser = async () => {
    if (!selectedUserID) { toast.error('Chọn người dùng'); return; }
    try {
      await addUserToClass(Number(id), selectedUserID);
      toast.success('Thêm thành công');
      setShowAddUser(false);
      reload();
    } catch {
      toast.error('Có lỗi xảy ra (người dùng có thể đã ở trong lớp)');
    }
  };

  const handleRemoveUser = async (userID: number, name: string) => {
    if (!confirm(`Xóa ${name} khỏi lớp?`)) return;
    try {
      await removeUserFromClass(Number(id), userID);
      toast.success('Đã xóa');
      reload();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  // Available users (not yet in class)
  const existingUserIDs = new Set((classData?.users ?? []).map(u => u.userID));
  const availableUsers = allUsers.filter(u => !existingUserIDs.has(u.id));

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
        <button className="btn btn--outline btn--sm page-header__back" onClick={() => navigate('/admin/classes')}>
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
          <button className="btn btn--primary btn--sm" onClick={openAddUser}>
            <FiPlus /> Thêm thành viên
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Họ tên</th>
                <th>Role</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {usersList.length === 0 ? (
                <tr><td colSpan={4} className="empty-state"><span className="empty-state__text">Chưa có thành viên</span></td></tr>
              ) : (
                usersList.map((uc) => (
                  <tr key={uc.userID}>
                    <td><strong>{uc.user.code}</strong></td>
                    <td>{uc.user.fullName}</td>
                    <td>{roleBadge(uc.user.role)}</td>
                    <td className="text-center">
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => handleRemoveUser(uc.userID, uc.user.fullName)}
                      >
                        <FiTrash2 /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card card--float" style={{ marginTop: 16 }}>
        <div className="card__header">
          <h3 className="card__title"><FiFileText />&nbsp;Bài thi</h3>
        </div>
        <div className="card__body">
          <p style={{ margin: 0, color: '#475569' }}>Tổng số bài thi gắn với lớp: <strong>{quizzesList.length}</strong></p>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 13 }}>Admin chỉ xem được số lượng, không xem chi tiết hoặc chỉnh sửa.</p>
        </div>
      </div>

      {/* Add user modal */}
      {showAddUser && (
        <div className="modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Thêm thành viên vào lớp</h3>
              <button className="modal__close" onClick={() => setShowAddUser(false)}>&times;</button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label>Chọn người dùng</label>
                <select
                  value={selectedUserID}
                  onChange={(e) => setSelectedUserID(Number(e.target.value))}
                >
                  <option value={0}>-- Chọn --</option>
                  {availableUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.code} - {u.fullName} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--outline" onClick={() => setShowAddUser(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleAddUser}>Thêm</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClassDetailAdmin;
