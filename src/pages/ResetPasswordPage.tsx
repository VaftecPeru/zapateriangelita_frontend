import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirmation: '',
        token: ''
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        if (token && email) {
            setFormData(prev => ({ ...prev, token, email }));
        } else {
            setStatus('error');
            setMessage('Enlace inválido o expirado.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.password !== formData.password_confirmation) {
            setStatus('error');
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            const response = await apiClient.post('/reset-password', formData);
            setStatus('success');
            setMessage(response.data.message || 'Tu contraseña ha sido actualizada correctamente.');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Error al restablecer la contraseña. Verifique que el enlace aún sea válido.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-minimal-beige flex items-start justify-center p-6 py-10 pt-16 md:pt-24">
            <div className="max-w-md w-full bg-white rounded-2xl p-10 relative border border-black">
                
                <div className="text-center mb-10 pt-2">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">🔒</div>
                    <h1 className="text-3xl font-black text-black tracking-tighter">Nueva Contraseña</h1>
                    <p className="text-gray-400 font-medium mt-2">Ingresa tu nueva contraseña para acceder</p>
                </div>

                {status === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-2xl border border-green-100 font-medium text-center">
                        {message}<br/>Redirigiendo al login...
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 italic font-medium text-center">
                        {message}
                    </div>
                )}

                {status !== 'success' && formData.token && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pl-1">Nueva Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm"
                                    placeholder="••••••"
                                    minLength={6}
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

                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pl-1">Confirmar Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm"
                                    placeholder="••••••"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-black"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-gray-900 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-black/10"
                        >
                            {status === 'loading' ? 'Guardando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
