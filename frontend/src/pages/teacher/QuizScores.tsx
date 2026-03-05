import { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { getAllClassesForUser, getAllQuizzesForTeacher, getQuizScoresByClass } from '../../services/apiServices';
import { useAppSelector } from '../../redux/hooks';
import '../../styles/pages.scss';

interface ClassItem { id: number; name: string }
interface QuizItem { id: number; title: string }
interface Score {
  user: { id: number; code: string; fullName: string };
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

const QuizScores = () => {
  const { account } = useAppSelector((state) => state.user);
  const userId = account?.id ? Number(account.id) : 0;
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [selectedQuiz, setSelectedQuiz] = useState<number>(0);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, qRes] = await Promise.all([
          userId ? getAllClassesForUser(userId) : Promise.resolve({ data: { data: [] } }),
          getAllQuizzesForTeacher(),
        ]);
        setClasses(cRes?.data?.data || []);
        setQuizzes(qRes?.data?.data || []);

        const classIdParam = Number(searchParams.get('classId') || 0);
        const quizIdParam = Number(searchParams.get('quizId') || 0);
        if (classIdParam) setSelectedClass(classIdParam);
        if (quizIdParam) setSelectedQuiz(quizIdParam);

        if (classIdParam && quizIdParam) {
          setLoading(true);
          const res = await getQuizScoresByClass(quizIdParam, classIdParam);
          setScores(res?.data?.data || []);
          setLoading(false);
        }
      } catch { /* ignore */ }
    };
    load();
  }, [userId, searchParams]);

  const handleSearch = async () => {
    if (!selectedClass || !selectedQuiz) return;
    setLoading(true);
    try {
      const res = await getQuizScoresByClass(selectedQuiz, selectedClass);
      setScores(res?.data?.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const getScoreColor = (score: number, total: number) => {
    const pct = (score / total) * 100;
    if (pct >= 80) return 'score--high';
    if (pct >= 50) return 'score--mid';
    return 'score--low';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-header__title">Tổng hợp điểm</h1>
        <p className="page-header__sub">Xem điểm bài thi theo lớp học</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: 20 }}>
          <div className="form-row">
            <div className="form-group">
              <label>Chọn lớp</label>
              <select value={selectedClass} onChange={e => setSelectedClass(Number(e.target.value))}>
                <option value={0}>-- Chọn lớp --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Chọn bài thi</label>
              <select value={selectedQuiz} onChange={e => setSelectedQuiz(Number(e.target.value))}>
                <option value={0}>-- Chọn bài thi --</option>
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            className="btn btn--primary"
            onClick={handleSearch}
            disabled={!selectedClass || !selectedQuiz || loading}
          >
            <FiSearch /> {loading ? 'Đang tải...' : 'Xem điểm'}
          </button>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="card">
          <div className="card__header">
            <h3 className="card__title">Kết quả ({scores.length} học sinh)</h3>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mã SV</th>
                  <th>Họ tên</th>
                  <th className="text-center">Điểm</th>
                  <th>Thời gian nộp</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s, i) => (
                  <tr key={s.user.id}>
                    <td>{i + 1}</td>
                    <td><strong>{s.user.code}</strong></td>
                    <td>{s.user.fullName}</td>
                    <td className="text-center">
                      <span className={`score ${getScoreColor(s.score, s.totalQuestions)}`}>
                        {s.score}/{s.totalQuestions}
                      </span>
                    </td>
                    <td>{new Date(s.submittedAt).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedClass > 0 && selectedQuiz > 0 && scores.length === 0 && !loading && (
        <div className="empty-state">
          <span className="empty-state__text">Chưa có học sinh nào nộp bài cho lớp và bài thi này</span>
        </div>
      )}
    </div>
  );
};

export default QuizScores;
