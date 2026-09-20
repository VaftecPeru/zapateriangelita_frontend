import React, { useEffect, useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import '../styles/register-home.css';
import brandLogo from '../assets/brand/logo-angelita-horizontal.png';
import { onlyLettersAndSpaces } from '../utils/profileValidation';
import PhoneField from '../components/PhoneField';

const Logo = () => (
    <a className="logo" href="/" aria-label="Zapatería Angelita - inicio">
        <img className="brand-logo__image" src={brandLogo} alt="Zapatería Angelita" />
    </a>
);

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '+52', password: '', password_confirmation: '',
        gender: '', birthdate: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [errorCode, setErrorCode] = useState<string | null>(null);
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
        setErrorCode(null);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor, ingresa un correo electrónico válido.');
            return;
        }
        if (!/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u.test(formData.name.trim())) {
            setError('Ingresa un nombre válido usando solo letras, espacios, apóstrofes o guiones.');
            return;
        }
        if (!/^\+[0-9]{8,20}$/.test(formData.phone)) {
            setError('Ingresa un teléfono internacional válido.');
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
        try {
            const { data } = await authService.register(formData);
            authLogin(data.user, data.token);
            setIsSuccess(true);
        } catch (err: any) {
            const code = err.response?.data?.error_code || null;
            const errorMsg = err.response?.data?.errors
                ? (Object.values(err.response.data.errors)[0] as any)[0]
                : err.response?.data?.message || err.message || 'Error al procesar la solicitud';

            setErrorCode(code);
            setError(
                code === 'EMAIL_ALREADY_REGISTERED'
                    ? 'Este correo electrónico ya está registrado.'
                    : errorMsg,
            );

            if (code === 'EMAIL_ALREADY_REGISTERED') {
                window.requestAnimationFrame(() => document.getElementById('email')?.focus());
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.name === 'name'
            ? onlyLettersAndSpaces(e.target.value)
            : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        if (e.target.name === 'email' && errorCode === 'EMAIL_ALREADY_REGISTERED') {
            setError(null);
            setErrorCode(null);
        }
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
                    <div className="error-message" role="alert" aria-live="assertive">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>
                            {errorCode === 'EMAIL_ALREADY_REGISTERED' ? (
                                <>
                                    <strong>Correo ya registrado.</strong>{' '}
                                    Esta dirección ya tiene una cuenta.{' '}
                                    <Link to="/login">Inicia sesión</Link> o usa la opción de recuperar contraseña.
                                </>
                            ) : error}
                        </div>
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
                                    <input id="name" type="text" name="name" required maxLength={255} autoComplete="name" value={formData.name} onChange={handleChange} placeholder="Nombre Completo" />
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
                                <PhoneField
                                    id="phone"
                                    required
                                    value={formData.phone}
                                    onChange={(phone) => setFormData((current) => ({ ...current, phone }))}
                                    defaultDialCode="+52"
                                    className="international-phone"
                                    selectClassName="international-phone__prefix"
                                    inputClassName="international-phone__number"
                                    placeholder="55 1234 5678"
                                />
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