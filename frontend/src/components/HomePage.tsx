import { Link } from 'react-router-dom'
import '../styles/global.scss'
import './HomePage.scss'
import { useAppSelector } from '../redux/hooks'

const Homepage = () => {
    const isAuthenticated = useAppSelector(state => state.user.isAuthenticated)
    const role = useAppSelector(state => state.user.account?.role)

    const dashboardPath =
        role === 'ADMIN' ? '/admin' :
        role === 'TEACHER' ? '/teacher' :
        '/student'

    return (
        <div className="home">
            <div className="home__topbar">
                <div className="brand">QuizApp</div>
                {isAuthenticated
                    ? <Link className="btn btn-primary btn-small" to={dashboardPath}>Dashboard</Link>
                    : <Link className="btn btn-primary btn-small" to="/login">Đăng nhập</Link>
                }
            </div>
            <header className="home__hero">
                <div className="home__hero-content">
                    <p className="eyebrow">Quiz & LMS Platform</p>
                    <h1>Quản lý lớp học, đề thi, kết quả — tất cả trong một nơi</h1>
                    <p className="subhead">
                        Tạo lớp, giao quiz, theo dõi tiến độ học viên và chấm điểm tức thời. Đăng nhập để bắt đầu trải nghiệm.
                    </p>
                    <div className="home__actions">
                        <a className="btn btn-ghost" href="#features">Tìm hiểu nhanh</a>
                    </div>
                    <div className="home__stats">
                        <div>
                            <span className="stat-number">3</span>
                            <span className="stat-label">Nhóm vai trò: Admin, Teacher, Student</span>
                        </div>
                        <div>
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Truy cập mọi lúc, hỗ trợ quiz theo thời gian</span>
                        </div>
                    </div>
                </div>
                <div className="home__hero-card">
                    <div className="card-chip">Realtime</div>
                    <h3>Bảng điều khiển lớp</h3>
                    <p>Theo dõi tiến độ, lịch quiz và điểm số trong một bảng tổng quan gọn gàng.</p>
                    <ul>
                        <li>Điểm số theo lớp và cá nhân</li>
                        <li>Quản lý quiz và câu hỏi nhanh</li>
                        <li>Nhắc hạn nộp, giới hạn thời gian</li>
                    </ul>
                </div>
            </header>

            <section id="features" className="home__features">
                <div className="feature">
                    <h4>Admin</h4>
                    <p>Quản lý người dùng, phân quyền, lớp học và cấu hình hệ thống.</p>
                </div>
                <div className="feature">
                    <h4>Teacher</h4>
                    <p>Tạo quiz, chỉnh sửa câu hỏi, xem kết quả và theo dõi tiến độ lớp.</p>
                </div>
                <div className="feature">
                    <h4>Student</h4>
                    <p>Làm bài, xem lịch sử và nhận phản hồi điểm số tức thì.</p>
                </div>
            </section>
        </div>
    )
}

export default Homepage