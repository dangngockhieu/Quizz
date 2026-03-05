import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiSearch, FiClock, FiLink } from 'react-icons/fi';
import { getAllQuizzesForTeacher, createQuiz, updateQuiz, getAllClassesForUser, addQuizToClass } from '../../services/apiServices';
import { toast } from 'react-toastify';
import '../../styles/pages.scss';
import { useAppSelector } from '../../redux/hooks';

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  timeLimit: number;
  timeStart: string;
  timeEnd: string;
  typeResult?: string;
  countAttempt?: number;
  createdAt: string;
}

const ManageQuizzes = () => {
  const navigate = useNavigate();
  const { account } = useAppSelector((state) => state.user);
  const userId = account?.id ? Number(account.id) : 0;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    timeStart: '',
    timeEnd: '',
    typeResult: 'AVERAGE',
    countAttempt: 1,
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const reload = () => setRefreshKey(k => k + 1);

  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [targetQuiz, setTargetQuiz] = useState<Quiz | null>(null);
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllQuizzesForTeacher()
      .then(res => { if (!cancelled) setQuizzes(res?.data?.data ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getAllClassesForUser(userId)
      .then(res => { if (!cancelled) setClasses(res?.data?.data ?? []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userId]);

  const filtered = quizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', timeLimit: 30, timeStart: '', timeEnd: '', typeResult: 'AVERAGE', countAttempt: 1 });
    setShowModal(true);
  };

  const openEdit = (q: Quiz) => {
    setEditing(q);
    setForm({
      title: q.title,
      description: q.description || '',
      timeLimit: q.timeLimit,
      timeStart: q.timeStart ? q.timeStart.slice(0, 16) : '',
      timeEnd: q.timeEnd ? q.timeEnd.slice(0, 16) : '',
      typeResult: q.typeResult || 'AVERAGE',
      countAttempt: q.countAttempt || 1,
    });
    setShowModal(true);
  };

  const openAssign = (quiz: Quiz) => {
    setTargetQuiz(quiz);
    setSelectedClass(0);
    setShowAssign(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Nhập tiêu đề'); return; }
    if (!form.timeStart || !form.timeEnd) { toast.error('Nhập thời gian'); return; }
    try {
      const desc = form.description.trim();
      const body = {
        title: form.title.trim(),
        description: desc ? desc : undefined,
        timeLimit: Number(form.timeLimit),
        timeStart: new Date(form.timeStart).toISOString(),
        timeEnd: new Date(form.timeEnd).toISOString(),
        typeResult: form.typeResult,
        countAttempt: Number(form.countAttempt) || 1,
      };
      if (editing) {
        await updateQuiz(editing.id, body);
        toast.success('Cập nhật thành công');
      } else {
        await createQuiz(body);
        toast.success('Tạo thành công');
      }
      setShowModal(false);
      reload();
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleAssign = async () => {
    if (!targetQuiz) return;
    if (!selectedClass) { toast.error('Chọn lớp trước khi gán'); return; }
    setAssignLoading(true);
    try {
      await addQuizToClass(selectedClass, targetQuiz.id);
      toast.success('Gán bài thi cho lớp thành công');
      setShowAssign(false);
    } catch {
      toast.error('Gán bài thi thất bại');
    } finally {
      setAssignLoading(false);
    }
  };

  const getStatus = (q: Quiz) => {
    const now = new Date();
    const start = new Date(q.timeStart);
    const end = new Date(q.timeEnd);
    if (now < start) return <span className="badge badge--inactive">Chưa bắt đầu</span>;
    if (now > end) return <span className="badge badge--admin">Đã kết thúc</span>;
    return <span className="badge badge--active">Đang diễn ra</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Quản lý bài thi</h1>
        <p className="page-header__sub">Tạo mới và chỉnh sửa các bài thi trắc nghiệm</p>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="filter-bar">
            <div className="filter-bar__search">
              <FiSearch />
              <input placeholder="Tìm bài thi..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <button className="btn btn--primary btn--sm" onClick={openCreate}>
            <FiPlus /> Tạo bài thi
          </button>
        </div>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Thời lượng</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Trạng thái</th>
                <th className="text-center">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-state"><span className="empty-state__text">Không có bài thi</span></td></tr>
              ) : (
                filtered.map((q, index) => (
                  <tr key={q.id}>
                    <td><strong>#{index + 1}</strong></td>
                    <td>{q.title}</td>
                    <td><FiClock /> {q.timeLimit} phút</td>
                    <td>{new Date(q.timeStart).toLocaleString('vi-VN')}</td>
                    <td>{new Date(q.timeEnd).toLocaleString('vi-VN')}</td>
                    <td>{getStatus(q)}</td>
                    <td className="text-center">
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button className="btn btn--outline btn--sm" onClick={() => openEdit(q)}>
                          <FiEdit2 /> Sửa
                        </button>
                        <button className="btn btn--primary btn--sm" onClick={() => navigate(`/teacher/quizzes/${q.id}/edit`)}>
                          Câu hỏi
                        </button>
                        <button className="btn btn--outline btn--sm" onClick={() => openAssign(q)}>
                          <FiLink /> Gán lớp
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>{editing ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}</h3>
              <button className="modal__close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Nhập tiêu đề bài thi" />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Mô tả bài thi (tùy chọn)" rows={3} />
              </div>
              <div className="form-group">
                <label>Thời lượng (phút) *</label>
                <input type="number" min={1} value={form.timeLimit} onChange={e => setForm({ ...form, timeLimit: Number(e.target.value) })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Kiểu tính điểm *</label>
                  <select value={form.typeResult} onChange={e => setForm({ ...form, typeResult: e.target.value })}>
                    <option value="AVERAGE">AVERAGE</option>
                    <option value="BEST">BEST</option>
                    <option value="LATEST">LATEST</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Số lượt làm *</label>
                  <input type="number" min={1} value={form.countAttempt} onChange={e => setForm({ ...form, countAttempt: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bắt đầu *</label>
                  <input type="datetime-local" value={form.timeStart} onChange={e => setForm({ ...form, timeStart: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Kết thúc *</label>
                  <input type="datetime-local" value={form.timeEnd} onChange={e => setForm({ ...form, timeEnd: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn btn--outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleSave}>{editing ? 'Cập nhật' : 'Tạo mới'}</button>
            </div>
          </div>
        </div>
      )}

      {showAssign && (
        <div className="modal-overlay" onClick={() => setShowAssign(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <h3>Gán bài thi cho lớp</h3>
              <button className="modal__close" onClick={() => setShowAssign(false)}>&times;</button>
            </div>
            <div className="modal__body">
              <div className="form-group">
                <label>Lớp</label>
                <select value={selectedClass} onChange={e => setSelectedClass(Number(e.target.value))}>
                  <option value={0}>-- Chọn lớp --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {targetQuiz && (
                <p style={{ marginTop: 8 }}>
                  Đang gán: <strong>{targetQuiz.title}</strong>
                </p>
              )}
            </div>
            <div className="modal__footer">
              <button className="btn btn--outline" onClick={() => setShowAssign(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleAssign} disabled={assignLoading}>
                {assignLoading ? 'Đang gán...' : 'Gán vào lớp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageQuizzes;
