import { useEffect, useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiEye } from 'react-icons/fi';
import { getAllClasses, createClass, updateClass } from '../../services/apiServices';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './AdminTheme.scss';
import './ManageClassesAdmin.scss';

interface ClassItem {
  id: number;
  name: string;
  description: string | null;
  teacherCount?: number;
  studentCount?: number;
  quizCount?: number;
}

const ManageClassesAdmin = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<ClassItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);

  const load = async (searchArg?: string, pageArg?: number) => {
    try {
      const targetPage = pageArg ?? page;
      const res = await getAllClasses(searchArg ?? search, targetPage, pageSize);
      setClasses(res?.data?.data || []);
      setTotal(res?.data?.meta?.total ?? 0);
      setPage(res?.data?.meta?.page ?? targetPage);
    } catch { /* ignore */ }
  };

  useEffect(() => { load('', 1); }, []);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (c: ClassItem) => {
    setEditItem(c);
    setForm({ name: c.name, description: c.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên lớp');
      return;
    }
    setLoading(true);
    try {
      if (editItem) {
        await updateClass(editItem.id, form.name, form.description);
        toast.success('Cập nhật thành công');
      } else {
        await createClass(form.name, form.description);
        toast.success('Tạo lớp thành công');
      }
      setShowModal(false);
      load(undefined, 1);
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page admin-classes">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Quản lý lớp học</h1>
          <p className="page-header__sub">Tạo lớp học và quản lý thành viên</p>
        </div>
        <div className="page-header__actions">
          <span className="chip chip--pill">Tổng lớp: {total}</span>
          <span className="chip chip--soft">Đang hiển thị: {classes.length}</span>
        </div>
      </div>

      <div className="card admin-classes__card">
        <div className="card__header admin-classes__header">
          <div className="filter-bar filter-bar--tight">
            <div className="filter-bar__search">
              <FiSearch className="search-icon" />
              <input
                placeholder="Tìm kiếm lớp học..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn btn--primary" onClick={() => load(search, 1)}>Xem</button>
            <button className="btn btn--outline" onClick={() => { setSearch(''); load('', 1); }}>Xóa</button>
          </div>
          <button className="btn btn--primary" onClick={openCreate}>
            <FiPlus /> Tạo lớp
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table data-table--elevated">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên lớp</th>
                <th>Mô tả</th>
                <th className="text-center">Giáo viên</th>
                <th className="text-center">Học sinh</th>
                <th className="text-center">Bài thi</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr><td colSpan={7} className="empty-state"><span className="empty-state__text">Chưa có lớp học nào</span></td></tr>
              ) : (
                classes.map((c) => (
                  <tr key={c.id}>
                    <td><strong>#{c.id}</strong></td>
                    <td>{c.name}</td>
                    <td className="admin-classes__desc">
                      {c.description || '—'}
                    </td>
                    <td className="text-center">{c.teacherCount ?? 0}</td>
                    <td className="text-center">{c.studentCount ?? 0}</td>
                    <td className="text-center">{c.quizCount ?? 0}</td>
                    <td className="text-center">
                      <div className="table-actions">
                        <button className="btn btn--primary btn--sm" onClick={() => navigate(`/admin/classes/${c.id}`)} title="Chi tiết">
                          <FiEye /> Chi tiết
                        </button>
                        <button className="btn btn--outline btn--sm" onClick={() => openEdit(c)} title="Sửa">
                          <FiEdit2 />
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
              onClick={() => load(undefined, Math.max(1, currentPage - 1))}
            >
              Trước
            </button>
            <span className="pagination__info">Trang {currentPage} / {totalPages}</span>
            <button
              className="btn btn--outline btn--sm"
              disabled={currentPage === totalPages}
              onClick={() => load(undefined, Math.min(totalPages, currentPage + 1))}
            >
              Sau
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editItem ? 'Cập nhật lớp học' : 'Tạo lớp học mới'}</h3>
              <button className="modal__close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label>Tên lớp</label>
                <input
                  placeholder="Nhập tên lớp..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  placeholder="Nhập mô tả..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Đang xử lý...' : editItem ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClassesAdmin;
