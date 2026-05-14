import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useUbigeo } from '../hooks/useUbigeo';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        gender: '',
        birthdate: '',
        country: 'Perú',
        department: '',
        province: '',
        district: ''
    });

    const { departments, provinces, districts, loading: ubigeoLoading } = useUbigeo(formData.department, formData.province);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [registeredData, setRegisteredData] = useState<any>(null);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor, ingresa un correo electrónico válido (ej: usuario@dominio.com).');
            return;
        }

        const birthDateObj = new Date(formData.birthdate);
        const today = new Date();
        const birthYear = birthDateObj.getFullYear();


        if (birthYear < 1920 || birthYear > today.getFullYear()) {
            setError('Por favor, ingresa una fecha de nacimiento válida.');
            return;
        }

        let age = today.getFullYear() - birthYear;
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }

        if (age < 18) {
            setError('Debes ser mayor de edad (+18) para registrarte.');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.register(formData);
            const data = response.data;

            setRegisteredData(data);
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
            <div className="min-h-screen bg-minimal-beige flex items-start justify-center p-6 py-10 pt-16 md:pt-20">
                <div className="max-w-xl w-full bg-white rounded-2xl p-10 md:p-16 relative border border-black text-center">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100">
                        <Mail size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-black mb-4 tracking-tighter">¡Registro Exitoso!</h2>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                        Tu cuenta ha sido creada correctamente. <strong>Te hemos enviado un correo electrónico</strong> con tus credenciales de acceso.<br /><br />
                        Por favor, revisa tu <span className="text-black font-bold">bandeja de entrada</span> o la carpeta de <span className="text-black font-bold">SPAM / Correo no deseado</span>.
                    </p>
                    <button
                        onClick={() => {
                            authLogin(registeredData.user, registeredData.token);
                            navigate('/');
                        }}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 transition-all active:scale-[0.98]"
                    >
                        Ingresar a Umbral Suites
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-minimal-beige flex items-start justify-center p-6 py-10 pt-16 md:pt-20">
            <div className="max-w-4xl w-full bg-white rounded-2xl p-10 md:p-16 relative border border-black">
                <Link to="/login" className="absolute top-8 left-8 p-3 bg-minimal-beige rounded-xl text-black/40 hover:text-black transition-colors border border-black/10">
                    <ArrowLeft size={20} />
                </Link>

                <div className="text-center mb-12">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">U</div>
                    <h1 className="text-4xl font-black text-black tracking-tighter">Únete a Umbral Suites</h1>
                    <p className="text-gray-400 font-medium mt-2 text-lg">Crea tu cuenta premium en pocos pasos</p>
                </div>

                {error && (
                    <div className="mb-10 p-5 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 italic font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                  
                    <div className="space-y-5">
                        <h2 className="text-xs font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-black rounded-full" /> Personal
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input type="text" name="name" required value={formData.name} onChange={handleChange}
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm"
                                        placeholder="Ej. Juan Pérez" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm"
                                        placeholder="tu@email.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Género</label>
                                <select name="gender" required value={formData.gender} onChange={handleChange}
                                    className="umbralsuites-select w-full bg-gray-50 border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm">
                                    <option value="" disabled hidden>Género</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Fecha de Nacimiento</label>
                                <input type="date" name="birthdate" required value={formData.birthdate} onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm" />
                            </div>
                        </div>
                    </div>

                
                    <div className="space-y-5">
                        <h2 className="text-xs font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-black rounded-full" /> Ubicación
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                         
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">País</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
                                    <select name="country" required value={formData.country} onChange={handleChange}
                                        className="w-full pl-10 pr-8 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm appearance-none cursor-pointer">
                                        <option value="Perú">Perú</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                          
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Departamento</label>
                                <select name="department" required value={formData.department} disabled={ubigeoLoading}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value, province: '', district: '' })}
                                    className="umbralsuites-select w-full bg-gray-50 border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm disabled:opacity-50">
                                    <option value="" disabled hidden>{ubigeoLoading ? 'Cargando...' : 'Seleccionar'}</option>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                          
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Provincia</label>
                                <select name="province" required value={formData.province} disabled={!formData.department || ubigeoLoading}
                                    onChange={(e) => setFormData({ ...formData, province: e.target.value, district: '' })}
                                    className="umbralsuites-select w-full bg-gray-50 border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm disabled:opacity-50">
                                    <option value="" disabled hidden>Seleccionar</option>
                                    {provinces.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                                </select>
                            </div>
                         
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Distrito</label>
                                <select name="district" required value={formData.district} disabled={!formData.province || ubigeoLoading}
                                    onChange={handleChange}
                                    className="umbralsuites-select w-full bg-gray-50 border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm disabled:opacity-50">
                                    <option value="" disabled hidden>Seleccionar</option>
                                    {districts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                  
                    <div className="space-y-5">
                        <h2 className="text-xs font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-black rounded-full" /> Seguridad
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input type="password" name="password" required value={formData.password} onChange={handleChange}
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm"
                                        placeholder="Mínimo 6 caracteres" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Confirmar Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                    <input type="password" name="password_confirmation" required value={formData.password_confirmation} onChange={handleChange}
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm"
                                        placeholder="Repite tu contraseña" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Creando cuenta...' : 'Finalizar Registro'}
                        </button>
                    </div>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 font-medium">
                        ¿Ya tienes una cuenta?{' '}
                        <Link to="/login" className="text-black font-black hover:underline underline-offset-4">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div >
        </div >
    );
};

export default RegisterPage;
