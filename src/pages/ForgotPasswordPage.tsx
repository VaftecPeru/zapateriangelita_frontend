import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await apiClient.post('/forgot-password', { email });
            setStatus('success');
            setMessage(response.data.message || 'Se ha enviado un enlace de recuperación a tu correo.');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Error al procesar la solicitud.');
        }
    };

    return (
        <div className="min-h-screen bg-minimal-beige flex items-start justify-center p-6 py-10 pt-16 md:pt-24">
            <div className="max-w-md w-full bg-white rounded-2xl p-10 relative border border-black">
                <Link to="/login" className="absolute top-8 left-8 p-3 bg-minimal-beige rounded-xl text-black/40 hover:text-black transition-colors border border-black/10">
                    <ArrowLeft size={20} />
                </Link>

                <div className="text-center mb-10 pt-10">
                    <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6">?</div>
                    <h1 className="text-3xl font-black text-black tracking-tighter">Recuperar Contraseña</h1>
                    <p className="text-gray-400 font-medium mt-2">Ingresa tu correo para enviarte un enlace de recuperación</p>
                </div>

                {status === 'success' && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-2xl border border-green-100 font-medium text-center">
                        {message}
                    </div>
                )}

                {status === 'error' && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 italic font-medium text-center">
                        {message}
                    </div>
                )}

                {status !== 'success' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] pl-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all font-bold text-sm"
                                    placeholder="tu@email.com"
                                    disabled={status === 'loading'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg hover:bg-gray-900 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-black/10"
                        >
                            {status === 'loading' ? 'Enviando...' : 'Enviar enlace'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
