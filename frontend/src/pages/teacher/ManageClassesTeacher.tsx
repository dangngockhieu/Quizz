import { useCallback, useEffect, useState } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';
import { getAllClassesForTeacher } from '../../services/apiServices';
import { useNavigate } from 'react-router-dom';
import './TeacherTheme.scss';
import './ManageClassesTeacher.scss';

interface ClassItem {
  id: number;
  name: string;
  description: string | null;
  teacherCount?: number;
  studentCount?: number;
  quizCount?: number;
}

const ManageClassesTeacher = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);

  const load = useCallback(async (searchArg?: string, pageArg?: number) => {
    try {
      const targetPage = pageArg ?? page;
      const res = await getAllClassesForTeacher(searchArg ?? search, targetPage, pageSize);
      setClasses(res?.data?.data || []);
      setTotal(res?.data?.meta?.total ?? 0);
      setPage(res?.data?.meta?.page ?? targetPage);
    } catch { /* ignore */ }
  }, [search, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => { void load('', 1); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="admin-page admin-classes">
      <div className="page-header">
        <div>
          <h1 className="page-header__title">Quản lý lớp học</h1>
          <p className="page-header__sub">Xem danh sách lớp của bạn và truy cập chi tiết</p>
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
                        <button className="btn btn--primary btn--sm" onClick={() => navigate(`/teacher/classes/${c.id}`)} title="Chi tiết">
                          <FiEye /> Chi tiết
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

    </div>
  );
};

export default ManageClassesTeacher;
