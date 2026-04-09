import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';


const LoginPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await apiClient.post('/login', formData);
            const data = response.data;

            authLogin(data.user, data.token);

            // Redirect based on role
            if (data.user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            // ✅ Mejor manejo de errores
            const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || err.message || 'Error al iniciar sesión';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-minimal-beige flex items-start justify-center p-6 py-10 pt-16 md:pt-24">
            <div className="max-w-md w-full bg-white rounded-2xl p-10 relative border border-black">
                <Link to="/" className="absolute top-8 left-8 p-3 bg-minimal-beige rounded-xl text-black/40 hover:text-black transition-colors border border-black/10">
                    <ArrowLeft size={20} />
                </Link>

                <div className="text-center mb-10 pt-10">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">U</div>
                    <h1 className="text-3xl font-black text-black tracking-tighter">Bienvenido</h1>
                    <p className="text-gray-400 font-medium mt-2">Ingresa tus credenciales para continuar</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 italic font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pl-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm"
                                placeholder="tu@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pl-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-gray-900 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-black/10"
                    >
                        {loading ? 'Entrando...' : 'Iniciar sesión'}
                    </button>

                    <div className="text-center pt-2">
                         <Link to="/forgot-password" className="text-gray-400 font-bold text-sm hover:text-black transition-colors">
                               ¿Olvidaste tu contraseña?
                         </Link>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-400 font-medium text-sm">
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register" className="text-black font-black hover:underline underline-offset-4">
                            Regístrate gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
