import { useEffect, useState } from 'react';
import { CheckCircle2, ShoppingBag, UserRound, ReceiptText, ArrowRight } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import brandLogo from '../assets/brand/logo-angelita-horizontal.png';

const WelcomeDashboardPage = () => {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    const [registrationMethod] = useState(() =>
        (location.state as { registrationMethod?: string } | null)?.registrationMethod
        || sessionStorage.getItem('angelita_new_account')
        || 'password'
    );

    useEffect(() => {
        sessionStorage.removeItem('angelita_new_account');
    }, []);

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (['admin', 'superadmin'].includes(String(user.role || ''))) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const firstName = String(user.name || 'Cliente').trim().split(/\s+/)[0] || 'Cliente';

    return (
        <div className="min-h-screen bg-[#f6f0e8] px-4 py-8 sm:py-12">
            <div className="mx-auto max-w-5xl">
                <section className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-xl shadow-black/5">
                    <div className="border-b border-gray-100 px-6 py-5 sm:px-9">
                        <img src={brandLogo} alt="Zapatería Angelita" className="h-auto w-48 max-w-full" />
                    </div>

                    <div className="grid gap-8 px-6 py-8 sm:px-9 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
                        <div>
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <CheckCircle2 size={30} />
                            </div>

                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#e30613]">
                                Registro completado
                            </p>
                            <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-black sm:text-5xl">
                                ¡Bienvenido, {firstName}!
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
                                Tu cuenta de Zapatería Angelita ya está lista.
                                {registrationMethod === 'google'
                                    ? ' Ingresaste de forma segura con tu cuenta de Google.'
                                    : ' Ya puedes administrar tu perfil y tus compras.'}
                            </p>

                            <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cuenta registrada</p>
                                <p className="mt-1 break-all text-sm font-bold text-black">{user.email}</p>
                                {registrationMethod === 'google' && (
                                    <p className="mt-2 text-xs font-medium text-gray-500">
                                        No necesitas crear otra contraseña para ingresar con Google.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-red-100 bg-red-50/50 p-5 sm:p-6">
                            <p className="text-xs font-black uppercase tracking-widest text-[#e30613]">Tu panel de cliente</p>
                            <div className="mt-4 grid gap-3">
                                <Link to="/profile" className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-black text-black shadow-sm transition hover:-translate-y-0.5">
                                    <span className="flex items-center gap-3"><UserRound size={18} className="text-[#e30613]" /> Mi perfil</span>
                                    <ArrowRight size={17} />
                                </Link>
                                <Link to="/profile/purchases" className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 text-sm font-black text-black shadow-sm transition hover:-translate-y-0.5">
                                    <span className="flex items-center gap-3"><ReceiptText size={18} className="text-[#e30613]" /> Mis compras</span>
                                    <ArrowRight size={17} />
                                </Link>
                                <Link to="/home" className="flex items-center justify-between rounded-2xl bg-black px-4 py-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5">
                                    <span className="flex items-center gap-3"><ShoppingBag size={18} /> Ir a la tienda</span>
                                    <ArrowRight size={17} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default WelcomeDashboardPage;

