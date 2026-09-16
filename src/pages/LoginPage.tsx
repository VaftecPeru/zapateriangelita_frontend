import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import GoogleIdentityButton from '../components/GoogleIdentityButton';
import '../styles/login-home.css';

const Logo = ({ light = false }: { light?: boolean }) => {
    return (
        <a className={`logo ${light ? "logo--light" : ""}`} href="/" aria-label="Zapatería Angelita - inicio">
            <span className="logo__small">Zapatería</span>
            <strong>ANGELITA</strong>
            <span className="logo__tagline">Calzando tus pies desde 1980</span>
        </a>
    );
};

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
            if (user.role === 'admin') {
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
                <div className="login-card" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="animate-pulse">
                        <p className="text-lg font-bold text-gray-400 uppercase tracking-widest">
                            Redirigiendo...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <Link to="/" className="back-button" aria-label="Volver al inicio">
                    <ArrowLeft size={20} />
                </Link>

                <Logo />

                <div className="login-title">
                    <h1>Bienvenido</h1>
                    <p>Ingresa a tu cuenta o regístrate en segundos</p>
                </div>

                {error && (
                    <div className="error-message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                    </div>
                )}

                <section className="mb-6 rounded-2xl border border-black/5 bg-[#fafafa] p-4" aria-labelledby="google-fast-title">
                    <div className="mb-4 flex items-start gap-3">
                        <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#e30613] shadow-sm ring-1 ring-black/5">
                            <Zap size={17} strokeWidth={2.3} />
                        </div>
                        <div>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                <h2 id="google-fast-title" className="text-sm font-black text-[#121212]">
                                    Registro rápido con Google
                                </h2>
                                <span className="rounded-full bg-[#e30613]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#e30613]">
                                    Recomendado
                                </span>
                            </div>
                            <p className="text-xs leading-5 text-gray-500">
                                Si ya tienes cuenta, inicia sesión. Si eres nuevo, crearemos tu cuenta automáticamente con tu correo verificado de Google.
                            </p>
                        </div>
                    </div>

                    <GoogleIdentityButton
                        mode="login"
                        onCredential={handleGoogleCredential}
                        disabled={loading || googleLoading}
                    />

                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-gray-400">
                        <ShieldCheck size={12} />
                        <span>Sin contraseña nueva · acceso protegido por Google</span>
                    </div>
                </section>

                <div className="mb-6 flex items-center gap-3" aria-hidden="true">
                    <span className="h-px flex-1 bg-black/10" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">o continúa con correo</span>
                    <span className="h-px flex-1 bg-black/10" />
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="field-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
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
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || googleLoading}
                        className="btn-submit"
                    >
                        {loading ? 'Entrando...' : 'Iniciar sesión'}
                    </button>

                    <div className="login-links">
                        <Link to="/forgot-password">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </form>

                <div className="login-footer">
                    <p>
                        ¿Prefieres crear tu cuenta manualmente?{' '}
                        <Link to="/register">
                            Regístrate con correo
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
