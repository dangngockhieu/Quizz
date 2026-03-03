import { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiShield } from 'react-icons/fi';
import { getAllUsersWithPaginate, createUser, updateUser, updateUserStatus, resetPasswordForAdmin } from '../../services/apiServices';
import { toast } from 'react-toastify';
import './AdminTheme.scss';
import './ManageUsers.scss';

interface User {
  id: number;
  code: string;
  fullName: string;
  role: string;
  status: string;
}

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ fullName: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  const load = async (roleArg?: string, searchArg?: string, pageArg?: number) => {
    try {
      const targetPage = pageArg ?? page;
      const res = await getAllUsersWithPaginate(
        roleArg !== undefined ? roleArg || undefined : roleFilter || undefined,
        searchArg !== undefined ? searchArg || undefined : search || undefined,
        targetPage,
        pageSize,
      );
      setUsers(res?.data?.data || []);
      setTotal(res?.data?.meta?.total ?? 0);
      setPage(res?.data?.meta?.page ?? targetPage);
      setPageSize(res?.data?.meta?.pageSize ?? pageSize);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    // Initial load without filters
    load('', '', 1);
  }, []);

  const openCreate = () => {
    setEditUser(null);
    setForm({ fullName: '', role: 'STUDENT' });
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setForm({ fullName: user.fullName, role: user.role });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }
    setLoading(true);
    try {
      if (editUser) {
        await updateUser(editUser.id, form.fullName, form.role);
        toast.success('Cập nhật thành công');
      } else {
        await createUser(form.fullName, form.role);
        toast.success('Tạo tài khoản thành công');
      }
      setShowModal(false);
      load(undefined, undefined, 1);
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await updateUserStatus(user.id, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      load(undefined, undefined, page);
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleResetPw = async (user: User) => {
    if (!confirm(`Reset mật khẩu của ${user.fullName} về mã code (${user.code})?`)) return;
    try {
      await resetPasswordForAdmin(user.id, user.code);
      toast.success('Reset mật khẩu thành công');
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const roleBadge = (role: string) => {
    const cls = role === 'ADMIN' ? 'badge--admin' : role === 'TEACHER' ? 'badge--teacher' : 'badge--student';
    return <span className={`badge ${cls}`}>{role}</span>;
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="admin-page admin-users">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Quản lý người dùng</h1>
          <p className="page-header__sub">Tạo và quản lý tài khoản giáo viên, sinh viên</p>
        </div>
        <div className="page-header__actions">
          <span className="chip chip--pill">Tổng: {total}</span>
          <span className="chip chip--soft">Đang hiển thị: {users.length}</span>
        </div>
      </div>

      <div className="card admin-users__card">
        <div className="card__header admin-users__header">
          <div className="filter-bar filter-bar--tight">
            <div className="filter-bar__search">
              <FiSearch className="search-icon" />
              <input
                placeholder="Tìm kiếm theo tên hoặc mã..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">Tất cả role</option>
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button className="btn btn--primary" onClick={() => load()}>Xem</button>
            <button
              className="btn btn--outline"
              onClick={() => {
                setSearch('');
                setRoleFilter('');
                load('', '', 1);
              }}
            >
              Xóa
            </button>
          </div>
          <button className="btn btn--primary" onClick={openCreate}>
            <FiPlus /> Thêm mới
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table data-table--elevated">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Họ tên</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="empty-state"><span className="empty-state__text">Không có dữ liệu</span></td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.code}</strong></td>
                    <td>{u.fullName}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge--active' : 'badge--inactive'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="table-actions">
                        <button className="btn btn--outline btn--sm" onClick={() => openEdit(u)} title="Sửa">
                          <FiEdit2 />
                        </button>
                        <button className="btn btn--outline btn--sm" onClick={() => toggleStatus(u)} title="Đổi trạng thái">
                          <FiShield />
                        </button>
                        <button className="btn btn--danger btn--sm" onClick={() => handleResetPw(u)} title="Reset mật khẩu">
                          Reset PW
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="pagination">
            <button
              className="btn btn--outline btn--sm"
              disabled={currentPage === 1}
              onClick={() => load(undefined, undefined, Math.max(1, currentPage - 1))}
            >
              Trước
            </button>
            <span className="pagination__info">Trang {currentPage} / {totalPages}</span>
            <button
              className="btn btn--outline btn--sm"
              disabled={currentPage === totalPages}
              onClick={() => load(undefined, undefined, Math.min(totalPages, currentPage + 1))}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</h3>
              <button className="modal__close" onClick={() => setShowModal(false)}>X</button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  placeholder="Nhập họ tên..."
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>
              {!editUser && (
                <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                  * Mã đăng nhập và mật khẩu mặc định sẽ được tự động tạo.
                </p>
              )}
            </div>
            <div className="modal__footer">
              <button className="btn btn--outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Đang xử lý...' : editUser ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
