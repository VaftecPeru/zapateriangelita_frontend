import React, { useEffect, useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/register-home.css';

const Logo = () => (
    <a className="logo" href="/" aria-label="Zapatería Angelita - inicio">
        <span className="logo__small">Zapatería</span>
        <strong>ANGELITA</strong>
        <span className="logo__tagline">Calzando tus pies desde 1980</span>
    </a>
);

const REGISTRATION_LOADING_MS = 30_000;

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', password_confirmation: '',
        gender: '', birthdate: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isSuccess) return;

        const redirectTimer = window.setTimeout(() => navigate('/home', { replace: true }), 1800);
        return () => window.clearTimeout(redirectTimer);
    }, [isSuccess, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        const birthDateObj = new Date(formData.birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) age--;

        if (age < 18) {
            setError('Debes ser mayor de edad (+18) para registrarte.');
            return;
        }

        setLoading(true);
        const loadingStartedAt = Date.now();
        try {
            const { data } = await authService.register(formData);
            const remainingLoadingTime = REGISTRATION_LOADING_MS - (Date.now() - loadingStartedAt);
            if (remainingLoadingTime > 0) {
                await new Promise((resolve) => window.setTimeout(resolve, remainingLoadingTime));
            }
            authLogin(data.user, data.token);
            setIsSuccess(true);
        } catch (err: any) {
            const errorMsg = err.response?.data?.errors
                ? (Object.values(err.response.data.errors)[0] as any)[0]
                : err.response?.data?.message || err.message || 'Error al procesar la solicitud';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (isSuccess) {
        return (
            <div className="register-page">
                <div className="register-card" style={{ maxWidth: '600px' }}>
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ width: '80px', height: '80px', background: '#e8f5e9', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto 20px' }}>
                            <Mail size={40} color="#2e7d32" />
                        </div>
                        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '28px', marginBottom: '12px' }}>
                            ¡Registro Exitoso!
                        </h2>
                        <p style={{ color: '#6e6e6e', lineHeight: '1.8', marginBottom: '24px' }}>
                            Tu cuenta ha sido creada correctamente. <strong>Te hemos enviado un correo electrónico</strong> con tus credenciales de acceso.
                            <br /><br />
                            Revisa tu <strong>bandeja de entrada</strong> o la carpeta de <strong>SPAM</strong>.
                        </p>
                        <button onClick={() => navigate('/home', { replace: true })} className="btn-submit" style={{ maxWidth: '400px', margin: '0 auto' }}>
                            Ir a la tienda
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-page">
            <div className="register-card">
                <Link to="/login" className="back-button" aria-label="Volver al login">
                    <ArrowLeft size={20} />
                </Link>

                <Logo />

                <div className="register-header">
                    <h1>Únete a Angelita</h1>
                    <p>Crea tu cuenta en pocos pasos</p>
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

                <form onSubmit={handleSubmit} className="register-form">
                    {/* Personal */}
                    <div className="form-section">
                        <div className="form-section-title"><span className="dot" /> Información Personal</div>
                        <div className="fields-grid">
                            <div className="field-group">
                                <label htmlFor="name">Nombre Completo</label>
                                <div className="input-wrapper">
                                    <User className="input-icon" size={18} />
                                    <input id="name" type="text" name="name" required autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Nombre Completo" />
                                </div>
                            </div>
                            <div className="field-group">
                                <label htmlFor="email">Email</label>
                                <div className="input-wrapper">
                                    <Mail className="input-icon" size={18} />
                                    <input id="email" type="email" name="email" required autoComplete="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" />
                                </div>
                            </div>
                            <div className="field-group">
                                <label htmlFor="phone">Teléfono</label>
                                <div className="input-wrapper">
                                    <Phone className="input-icon" size={18} />
                                    <input id="phone" type="tel" name="phone" required minLength={7} autoComplete="tel" value={formData.phone} onChange={handleChange} placeholder="Ej. 999 999 999" />
                                </div>
                            </div>
                            <div className="field-group">
                                <label htmlFor="gender">Género</label>
                                <select id="gender" name="gender" required autoComplete="sex" value={formData.gender} onChange={handleChange}>
                                    <option value="" disabled hidden>Seleccionar</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div className="field-group">
                                <label htmlFor="birthdate">Fecha de Nacimiento</label>
                                <input id="birthdate" type="date" name="birthdate" required autoComplete="bday" value={formData.birthdate} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Seguridad */}
                    <div className="form-section">
                        <div className="form-section-title"><span className="dot" /> Seguridad</div>
                        <div className="fields-grid">
                            <div className="field-group">
                                <label htmlFor="password">Contraseña</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input id="password" type="password" name="password" required autoComplete="new-password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
                                </div>
                            </div>
                            <div className="field-group">
                                <label htmlFor="password_confirmation">Confirmar</label>
                                <div className="input-wrapper">
                                    <Lock className="input-icon" size={18} />
                                    <input id="password_confirmation" type="password" name="password_confirmation" required autoComplete="new-password" value={formData.password_confirmation} onChange={handleChange} placeholder="Repite tu contraseña" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-submit" aria-busy={loading}>
                        {loading ? (
                            <span className="register-loading-label">
                                <Loader2 className="register-loading-spinner" size={19} aria-hidden="true" />
                                Creando cuenta...
                            </span>
                        ) : 'Finalizar Registro'}
                    </button>
                </form>

                <div className="register-footer">
                    <p>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;