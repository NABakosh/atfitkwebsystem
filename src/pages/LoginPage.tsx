import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Заполните все поля');
            return;
        }
        setLoading(true);
        setError('');
        const ok = await login(username, password);
        if (ok) {
            navigate('/dashboard');
        } else {
            setError('Неверный логин или пароль');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">А</div>
                    <div className="login-college-name">
                        Алматинский технологическо-финансовый<br />и инновационно-технический колледж
                    </div>
                    <h1 className="login-title">Вход в систему</h1>
                    <p className="login-subtitle">
                        Журнал внутриколледжного и профилактического учёта
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="form-error">
                            <AlertCircle size={15} />
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label required">Логин</label>
                        <div style={{ position: 'relative' }}>
                            <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 36 }}
                                type="text"
                                placeholder="Введите логин"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label required">Пароль</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                className="form-input"
                                style={{ paddingLeft: 36, paddingRight: 40 }}
                                type={showPass ? 'text' : 'password'}
                                placeholder="Введите пароль"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(v => !v)}
                                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                            >
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти в систему'}
                    </button>
                </form>


            </div>
        </div>
    );
}
