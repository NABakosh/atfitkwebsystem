import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BookOpen, Plus, Home } from 'lucide-react';

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar-brand">
                <div className="navbar-logo">А</div>
                <div className="navbar-title">
                    <span className="navbar-title-main">АТФИТК</span>
                    <span className="navbar-title-sub">Журнал учета студентов</span>
                </div>
            </Link>

            <div className="nav-links">
                <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                    <Home size={15} />
                    Журнал
                </Link>
                <Link to="/students/new" className={`nav-link ${location.pathname.includes('/students/new') ? 'active' : ''}`}>
                    <Plus size={15} />
                    Добавить
                </Link>
            </div>

            <div className="navbar-actions">
                <div className="navbar-user">
                    <BookOpen size={14} />
                    <span>{user?.displayName || 'Пользователь'}</span>
                    <span className="navbar-role-badge">
                        {user?.role === 'director' ? 'Директор' : 'Психолог'}
                    </span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                    <LogOut size={14} />
                    Выход
                </button>
            </div>
        </nav>
    );
}
