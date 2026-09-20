import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import GoogleIdentityButton from '../components/GoogleIdentityButton';
import '../styles/login-home.css';
import brandLogo from '../assets/brand/logo-angelita-horizontal.png';

const Logo = ({ light = false }: { light?: boolean }) => (
    <a className={`logo ${light ? 'logo--light' : ''}`} href="/" aria-label="Zapatería Angelita - inicio">
        <img className="brand-logo__image" src={brandLogo} alt="Zapatería Angelita" />
    </a>
);

const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { login: authLogin, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isAuthenticated && user) {
            if (['admin', 'superadmin'].includes(String(user.role || ''))) {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate((location.state as { from?: string } | null)?.from || '/home', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate, location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { data } = await authService.login(formData);
            authLogin(data.user, data.token);
        } catch (err: any) {
            const msg = err.response?.data?.message
                || err.response?.data?.errors?.email?.[0]
                || err.message
                || 'Error al iniciar sesión';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleCredential = async (credential: string) => {
        setError(null);
        setGoogleLoading(true);

        try {
            const { data } = await authService.googleLogin(credential);
            if (!data?.user || !data?.token) {
                throw new Error('Google no devolvió una sesión válida.');
            }
            authLogin(data.user, data.token);
        } catch (err: any) {
            const msg = err.response?.data?.message
                || err.message
                || 'No fue posible continuar con Google.';
            setError(msg);
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (isAuthenticated) {
        return (
            <div className="login-page">
                <div className="login-card login-card--loading">
                    <p>Redirigiendo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-orb login-orb--one" aria-hidden="true" />
            <div className="login-orb login-orb--two" aria-hidden="true" />

            <main className="login-card" aria-labelledby="login-title">
                <Link to="/" className="back-button" aria-label="Volver al inicio">
                    <ArrowLeft size={19} />
                </Link>

                <Logo />

                <header className="login-title">
                    <span className="login-eyebrow">Área de clientes</span>
                    <h1 id="login-title">Bienvenido</h1>
                    <p>Accede a tus compras, pedidos y beneficios.</p>
                </header>

                {error && (
                    <div className="error-message" role="alert">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="field-group">
                        <label htmlFor="email">Correo electrónico</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={19} />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <div className="field-label-row">
                            <label htmlFor="password">Contraseña</label>
                            <Link to="/forgot-password">¿La olvidaste?</Link>
                        </div>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={19} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="toggle-password"
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="btn-submit"
                    >
                        {loading ? 'Ingresando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <div className="login-divider" aria-hidden="true">
                    <span />
                    <strong>o continúa con</strong>
                    <span />
                </div>

                <section className="google-access" aria-label="Registro rápido con Google">
                    <div className="google-access__heading">
                        <div>
                            <strong>Registro rápido con Google</strong>
                            <p>Ingresa o crea tu cuenta sin salir de esta pantalla.</p>
                        </div>
                        <span>Rápido</span>
                    </div>

                    <GoogleIdentityButton
                        mode="login"
                        onCredential={handleGoogleCredential}
                        disabled={loading || googleLoading}
                    />

                    <div className="google-access__trust">
                        <ShieldCheck size={13} />
                        <span>Tu identidad es validada directamente por Google.</span>
                    </div>
                </section>

                <div className="login-footer">
                    <p>
                        ¿Nuevo en Angelita?{' '}
                        <Link to="/register">Crea tu cuenta en segundos.</Link>
                    </p>
                </div>
            </main>
        </div>
    );
};

export default LoginPage;
