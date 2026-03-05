import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiTrash2, FiSave, FiCheck } from 'react-icons/fi';
import { getQuizDetail, syncQuizQuestions } from '../../services/apiServices'; 
import { v7 as uuidv7 } from 'uuid';
import { toast } from 'react-toastify';
import '../../styles/pages.scss';
import './QuizEditor.scss';

export type QuizTypeResult = 'AVERAGE' | 'BEST' | 'LATEST';

export interface QuizData {
    title: string;
    description?: string;
    timeStart: Date;
    timeEnd: Date;
    timeLimit: number;
    typeResult: QuizTypeResult;
    countAttempt: number;
}

// --- ĐỊNH NGHĨA INTERFACES ---
export type QuestionType = 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE';

export interface CreateOptionData {
    id: string;
    content: string;
    isCorrect: boolean;
}

export interface CreateQuestionWithOptionsData {
    id: string;
    content: string;
    type: QuestionType;
    options: CreateOptionData[];
}

const QuizEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<CreateQuestionWithOptionsData[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getQuizDetail(Number(id));
        const data = res?.data?.data;
        if (data) {
          setQuiz(data);
          // Đảm bảo dữ liệu tải về nếu thiếu ID thì tự sinh (trường hợp data cũ)
          const loadedQuestions = (data.questions || []).map((q: CreateQuestionWithOptionsData) => ({
            id: q.id || uuidv7(),
            content: q.content || '',
            type: q.type || 'SINGLE_CHOICE',
            options: (q.options || []).map((o: CreateOptionData) => ({
              id: o.id || uuidv7(),
              content: o.content || '',
              isCorrect: o.isCorrect || false,
            }))
          }));
          setQuestions(loadedQuestions);
        }
      } catch { /* ignore */ }
    };
    load();
  }, [id]);

  // --- CÁC HÀM XỬ LÝ THÊM/SỬA/XÓA TRÊN FRONTEND ---

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: uuidv7(), // Sinh ID ngay lúc tạo
        content: '',
        type: 'SINGLE_CHOICE',
        options: [
          { id: uuidv7(), content: '', isCorrect: true },
          { id: uuidv7(), content: '', isCorrect: false },
          { id: uuidv7(), content: '', isCorrect: false },
          { id: uuidv7(), content: '', isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (qi: number) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    setQuestions(questions.filter((_, i) => i !== qi));
  };

  const updateQuestion = (
    qi: number,
    field: 'content' | 'type',
    value: string | QuestionType,
  ) => {
    const arr = [...questions];
    arr[qi] = { ...arr[qi], [field]: value };
    setQuestions(arr);
  };

  const updateOption = (qi: number, oi: number, content: string) => {
    const arr = [...questions];
    const opts = [...arr[qi].options];
    opts[oi] = { ...opts[oi], content };
    arr[qi] = { ...arr[qi], options: opts };
    setQuestions(arr);
  };

  const setCorrectOption = (qi: number, oi: number) => {
    const arr = [...questions];
    // Nếu là SINGLE_CHOICE thì chỉ 1 đáp án đúng, MULTIPLE_CHOICE thì có thể nhiều
    const isSingleChoice = arr[qi].type === 'SINGLE_CHOICE';
    
    const opts = arr[qi].options.map((o, i) => {
      if (i === oi) return { ...o, isCorrect: !o.isCorrect }; // Toggle trạng thái
      return isSingleChoice ? { ...o, isCorrect: false } : o;
    });
    
    arr[qi] = { ...arr[qi], options: opts };
    setQuestions(arr);
  };

  const addOption = (qi: number) => {
    const arr = [...questions];
    arr[qi] = {
      ...arr[qi],
      options: [...arr[qi].options, { id: uuidv7(), content: '', isCorrect: false }],
    };
    setQuestions(arr);
  };

  const removeOption = (qi: number, oi: number) => {
    const arr = [...questions];
    const opts = arr[qi].options.filter((_, i) => i !== oi);
    // Nếu xóa mất đáp án đúng duy nhất, tự auto set đáp án đầu tiên làm đúng
    if (!opts.some(o => o.isCorrect) && opts.length > 0) opts[0].isCorrect = true;
    arr[qi] = { ...arr[qi], options: opts };
    setQuestions(arr);
  };

  // --- GỬI API LƯU DỮ LIỆU ---

  const handleSave = async () => {
    // Validate cơ bản
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.content.trim()) return toast.error(`Câu ${i + 1}: chưa nhập nội dung`);
      if (q.options.length < 2) return toast.error(`Câu ${i + 1}: cần ít nhất 2 đáp án`);
      if (!q.options.some(o => o.isCorrect)) return toast.error(`Câu ${i + 1}: chưa chọn đáp án đúng`);
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].content.trim()) return toast.error(`Câu ${i + 1}, đáp án ${j + 1}: chưa nhập nội dung`);
      }
    }

    setSaving(true);
    try {
      // Gửi nguyên mảng questions xuống Backend. 
      // Payload giờ đã là CreateQuestionWithOptionsData[] chuẩn chỉnh 100%
      await syncQuizQuestions(Number(id), questions);
      toast.success('Lưu bài thi thành công!');
    } catch {
      toast.error('Có lỗi xảy ra khi lưu dữ liệu');
    } finally {
      setSaving(false);
    }
  };

  if (!quiz) return <div className="empty-state"><span className="empty-state__text">Đang tải...</span></div>;

  return (
    <div className="quiz-editor">
      <div className="page-header">
        <button className="btn btn--outline btn--sm" onClick={() => navigate('/teacher/quizzes')} style={{ marginBottom: 12 }}>
          <FiArrowLeft /> Quay lại
        </button>
        <h1 className="page-header__title">{quiz.title}</h1>
        <p className="page-header__sub">{quiz.description || 'Soạn câu hỏi cho bài thi'}</p>
      </div>

      <div className="quiz-editor__toolbar">
        <button className="btn btn--primary" onClick={addQuestion}>
          <FiPlus /> Thêm câu hỏi
        </button>
        <button className="btn btn--success" onClick={handleSave} disabled={saving}>
          <FiSave /> {saving ? 'Đang lưu...' : 'Lưu tất cả'}
        </button>
      </div>

      {questions.length === 0 && (
        <div className="empty-state">
          <span className="empty-state__text">Chưa có câu hỏi. Bấm "Thêm câu hỏi" để bắt đầu.</span>
        </div>
      )}

      {questions.map((q, qi) => (
        <div className="card quiz-editor__card" key={q.id}>
          <div className="card__header quiz-editor__card-header">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <h3 className="card__title">Câu {qi + 1}</h3>
              <select 
                value={q.type} 
                onChange={e => updateQuestion(qi, 'type', e.target.value as QuestionType)}
                className="quiz-editor__type-select"
              >
                <option value="SINGLE_CHOICE">Một đáp án đúng</option>
                <option value="MULTIPLE_CHOICE">Nhiều đáp án đúng</option>
              </select>
            </div>
            <button className="btn btn--danger btn--sm" onClick={() => removeQuestion(qi)}>
              <FiTrash2 /> Xóa
            </button>
          </div>
          
          <div style={{ padding: '0 20px 20px' }}>
            <div className="form-group">
              <label>Nội dung câu hỏi *</label>
              <textarea
                value={q.content}
                onChange={e => updateQuestion(qi, 'content', e.target.value)}
                placeholder="Nhập nội dung câu hỏi..."
                rows={2}
              />
            </div>

            <label className="quiz-editor__options-label">Đáp án:</label>
            {q.options.map((opt, oi) => (
              <div key={opt.id} className="quiz-editor__option-row">
                <button
                  className={`btn btn--sm ${opt.isCorrect ? 'btn--success' : 'btn--outline'}`}
                  onClick={() => setCorrectOption(qi, oi)}
                  title={opt.isCorrect ? 'Bỏ chọn' : 'Đặt làm đáp án đúng'}
                  style={{ minWidth: 36 }}
                >
                  <FiCheck />
                </button>
                <input
                  value={opt.content}
                  onChange={e => updateOption(qi, oi, e.target.value)}
                  placeholder={`Đáp án ${String.fromCharCode(65 + oi)}`}
                />
                {q.options.length > 2 && (
                  <button className="btn btn--danger btn--sm" onClick={() => removeOption(qi, oi)}>
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
            
            {q.options.length < 6 && ( // Giới hạn tối đa 6 đáp án
              <button className="btn btn--outline btn--sm" onClick={() => addOption(qi)} style={{ marginTop: 4 }}>
                <FiPlus /> Thêm đáp án
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuizEditor;