import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
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
    const { login: authLogin, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // ✅ Redirigir si ya está autenticado (según rol)
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/home', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { data } = await authService.login(formData);
            authLogin(data.user, data.token);
            // La redirección la maneja el useEffect
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Si ya está autenticado, mostrar loader mientras redirige
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
                    <p>Ingresa tus credenciales para continuar</p>
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
                        disabled={loading}
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
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register">
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;