import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Globe, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

type UbigeoData = Record<string, Record<string, string[]>>;

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'register',
  onSuccess 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login: authLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Registration Form State
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

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [ubigeo, setUbigeo] = useState<UbigeoData>({});
  const [ubigeoLoading, setUbigeoLoading] = useState(true);

  useEffect(() => {
    if (mode === 'register') {
      fetch('/data/peru-ubigeo.json')
        .then(res => res.json())
        .then((data: UbigeoData) => {
          setUbigeo(data);
          setUbigeoLoading(false);
        })
        .catch(() => {
          setUbigeoLoading(false);
        });
    }
  }, [mode]);

  if (!isOpen) return null;

  const departments = Object.keys(ubigeo).sort();
  const provinces = formData.department && ubigeo[formData.department]
    ? Object.keys(ubigeo[formData.department]).sort()
    : [];
  const districts = formData.department && formData.province && ubigeo[formData.department]?.[formData.province]
    ? [...ubigeo[formData.department][formData.province]].sort()
    : [];

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(formData);
      const data = response.data;

      authLogin(data.user, data.token);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.errors 
        ? (Object.values(err.response.data.errors)[0] as any)[0] 
        : err.response?.data?.message || err.message || 'Error al procesar la solicitud';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(loginData);
      const data = response.data;

      authLogin(data.user, data.token);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-black animate-in zoom-in-95 duration-300 customize-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-lg">U</div>
          <h2 className="text-3xl font-black text-black tracking-tighter uppercase">
            {mode === 'register' ? 'Únete a Umbral Suites' : 'Bienvenido de nuevo'}
          </h2>
          <p className="text-gray-400 font-medium mt-1">
            {mode === 'register' ? 'Crea tu cuenta premium en pocos pasos' : 'Ingresa a tu cuenta para continuar'}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 text-xs rounded-2xl border border-red-100 font-bold italic">
            {error}
          </div>
        )}

        {mode === 'register' ? (
          <form onSubmit={handleRegisterSubmit} className="space-y-8">
            {/* Personal Section */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full" /> Información Personal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input name="name" required value={formData.name} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:border-black outline-none transition-all font-bold text-xs"
                      placeholder="Ej. Juan Pérez" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input type="email" name="email" required value={formData.email} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:border-black outline-none transition-all font-bold text-xs"
                      placeholder="tu@email.com" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Género</label>
                  <select name="gender" required value={formData.gender} onChange={handleRegisterChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:border-black outline-none transition-all font-bold text-xs appearance-none cursor-pointer">
                    <option value="" disabled hidden>Seleccionar</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Fecha de Nacimiento</label>
                  <input type="date" name="birthdate" required value={formData.birthdate} onChange={handleRegisterChange}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:border-black outline-none transition-all font-bold text-xs" />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full" /> Ubicación
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">País</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                    <select name="country" disabled value={formData.country} className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl font-bold text-xs appearance-none">
                      <option value="Perú">Perú</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Dpto.</label>
                  <select name="department" required value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value, province: '', district: '' })}
                    className="w-full px-3 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none font-bold text-xs appearance-none cursor-pointer focus:border-black transition-all">
                    <option value="" disabled hidden>{ubigeoLoading ? '...' : 'Sel.'}</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Prov.</label>
                  <select name="province" required value={formData.province} disabled={!formData.department} onChange={(e) => setFormData({ ...formData, province: e.target.value, district: '' })}
                    className="w-full px-3 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none font-bold text-xs appearance-none cursor-pointer focus:border-black transition-all disabled:opacity-50">
                    <option value="" disabled hidden>Sel.</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Dist.</label>
                  <select name="district" required value={formData.district} disabled={!formData.province} onChange={handleRegisterChange}
                    className="w-full px-3 py-3.5 bg-gray-50 border border-transparent rounded-xl outline-none font-bold text-xs appearance-none cursor-pointer focus:border-black transition-all disabled:opacity-50">
                    <option value="" disabled hidden>Sel.</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-5">
              <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-black rounded-full" /> Seguridad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input type="password" name="password" required value={formData.password} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:border-black outline-none transition-all font-bold text-xs"
                      placeholder="Mínimo 8 caracteres" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest pl-1">Confirmar</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input type="password" name="password_confirmation" required value={formData.password_confirmation} onChange={handleRegisterChange}
                      className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-xl focus:border-black outline-none transition-all font-bold text-xs"
                      placeholder="Repite contraseña" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-xl shadow-black/10"
            >
              {loading ? 'Procesando...' : 'Finalizar Registro'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="email" name="email" required value={loginData.email} onChange={handleLoginChange}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-black outline-none transition-all font-bold text-sm"
                  placeholder="tu@email.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="password" name="password" required value={loginData.password} onChange={handleLoginChange}
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:border-black outline-none transition-all font-bold text-sm"
                  placeholder="Tu contraseña secreta" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-5 rounded-2xl font-bold hover:bg-black/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-black/10"
            >
              <LogIn size={20} />
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>
        )}

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-gray-400 font-medium text-sm">
            {mode === 'register' ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
            {' '}
            <button 
              onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
              className="text-black font-black hover:underline underline-offset-4 ml-1"
            >
              {mode === 'register' ? 'Inicia sesión aquí' : 'Regístrate aquí'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
