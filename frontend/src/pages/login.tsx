import { useState } from 'react';
import './login.scss';
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { login } from '../services/apiServices';
import { toast } from "react-toastify";
import { FaRegUser } from "react-icons/fa";
import { FiLock } from "react-icons/fi";
import { useAppDispatch } from '../redux/hooks';
import { setAccount } from '../redux/userSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [code, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!code || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await login(code, password);

      if (!res?.data?.success) {
        toast.error(res?.data?.message || "Đăng nhập thất bại.");
        return;
      }

      const access = res?.data?.data?.accessToken;
      const user = res?.data?.data?.user;

      if (access || user) {
        dispatch(
          setAccount({
            ...(user ?? {}),
            accessToken: access,
          })
        );
      }

      toast.success("Đăng nhập thành công!");

      setEmail('');
      setPassword('');
      if (user?.role === 'ADMIN') {
        navigate('/admin');
        return;
      }
      if (user?.role === 'TEACHER') {
        navigate('/teacher');
        return;
      }
      if (user?.role === 'STUDENT') {
        navigate('/student');
        return;
      }
      navigate('/');
    } catch {
      toast.error("Đã có lỗi xảy ra khi đăng nhập");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        {/* Left decorative panel */}
        <aside className="login-card__info" aria-hidden="true">
          <div className="bubbles">
            <div className="bubble bubble--1" />
            <div className="bubble bubble--2" />
            <div className="bubble bubble--3" />
          </div>
          <div className="info-content">
            <h2 className="welcome-title">Welcome Back</h2>
            <h3 className="headline">QuizApp</h3>
            <p className="description">
              Khám phá và trải nghiệm App quản lý và làm bài trắc nghiệm hiện đại.
            </p>
          </div>
        </aside>

        {/* Right form panel */}
        <main className="login-card__form" aria-label="Login form">
          <header className="form-header">
            <h2>Đăng nhập</h2>
            <p className="muted">Đăng nhập để trải nghiệm mua sắm tốt nhất</p>
          </header>

          <form onSubmit={handleLogin} className="form">
            <label className="field">
              <span className="field__label">Mã số định danh</span>
              <div className="field__input">
                <FaRegUser className="field__icon" />
                <input
                  id="login-code"
                  type="text"
                  autoComplete="username"
                  placeholder="Nhập mã số định danh"
                  value={code}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="field">
              <span className="field__label">Mật khẩu</span>
              <div className="field__input">
                <FiLock className="field__icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <BsEyeSlash className="eye" /> : <BsEye className="eye" />}
                </button>
              </div>
            </label>

            <button type="submit" className="submit" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Login;
