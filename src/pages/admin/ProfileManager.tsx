import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/crudService';
// import { User, Mail, Calendar, MapPin, Settings, Save, X, Loader2, CheckCircle } from 'lucide-react';
import { User, Mail, Calendar, MapPin, Settings, Save, Loader2, CheckCircle } from 'lucide-react';

const ProfileManager = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        birthdate: '',
        gender: '',
        department: '',
        province: '',
        district: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                birthdate: (user as any).birthdate || '',
                gender: (user as any).gender || '',
                department: (user as any).department || '',
                province: (user as any).province || '',
                district: (user as any).district || ''
            });
        }
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataToSubmit = {
                ...formData,
                birthdate: formData.birthdate || null,
                gender: formData.gender || null,
                department: formData.department || null,
                province: formData.province || null,
                district: formData.district || null
            };
            await userService.updateProfile(dataToSubmit);
            setSuccess(true);
            setIsEditing(false);
            setTimeout(() => setSuccess(false), 3000);
            // Refresh local auth state if possible, or just let the reload happen
            // For now, a reload is the simplest way to sync everything
            window.location.reload(); 
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error al actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-minimal-olive/10 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-black">Mi Perfil de Administrador</h2>
                    <p className="text-gray-400 text-xs font-medium">Gestiona tu información personal y de contacto.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg"
                    >
                        <Settings size={16} />
                        Editar Datos
                    </button>
                )}
            </div>

            {success && (
                <div className="bg-green-50 border border-green-100 text-green-600 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={20} />
                    <p className="text-sm font-bold">¡Perfil actualizado correctamente!</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Card */}
                <div className="bg-black rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl h-fit">
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl border border-white/20 shadow-2xl mb-6">
                            {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <h3 className="text-2xl font-black tracking-tighter mb-1">{user.name}</h3>
                        <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mb-8">{user.role === 'admin' ? 'Administrador Homad' : 'Usuario'}</p>
                        
                        <div className="w-full space-y-4 pt-6 border-t border-white/10">
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-2 bg-white/5 rounded-xl">
                                    <Mail size={16} className="text-minimal-gold" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-white/30 font-black uppercase tracking-widest leading-none mb-1">E-mail</p>
                                    <p className="text-xs font-bold text-white/80 truncate w-32 md:w-auto">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-left">
                                <div className="p-2 bg-white/5 rounded-xl">
                                    <MapPin size={16} className="text-minimal-gold" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-white/30 font-black uppercase tracking-widest leading-none mb-1">Ubicación</p>
                                    <p className="text-xs font-bold text-white/80">{(user as any).district || 'No definida'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-minimal-gold/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-minimal-gold/20 transition-colors" />
                </div>

                {/* Form / Details Card */}
                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-sm rounded-[2.5rem] border border-minimal-olive/10 shadow-sm overflow-hidden p-8 md:p-12">
                        {isEditing ? (
                            <form onSubmit={handleSave} className="space-y-10">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-minimal-gold rounded-full" /> Personal
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre Completo</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha de Nacimiento</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                                <input 
                                                    type="date" 
                                                    value={formData.birthdate} 
                                                    max={new Date().toISOString().split('T')[0]}
                                                    min="1900-01-01"
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        const year = new Date(val).getFullYear();
                                                        if (year > new Date().getFullYear() || year < 1900) return;
                                                        setFormData({...formData, birthdate: val});
                                                    }} 
                                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all" 
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Género</label>
                                            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all appearance-none">
                                                <option value="">Seleccionar...</option>
                                                <option value="Masculino">Masculino</option>
                                                <option value="Femenino">Femenino</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-minimal-gold rounded-full" /> Ubicación
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Departamento</label>
                                            <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all" placeholder="Ej. Lima" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Provincia</label>
                                            <input type="text" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all" placeholder="Ej. Lima" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Distrito</label>
                                            <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all" placeholder="Ej. Miraflores" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditing(false)} 
                                        className="px-6 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-10">
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Información de Cuenta</h4>
                                        <div className="space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-minimal-gold">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Nombre</p>
                                                    <p className="text-sm font-bold text-black">{user.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-minimal-gold">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Nacimiento</p>
                                                    <p className="text-sm font-bold text-black">{(user as any).birthdate || 'No especificada'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div>
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Ubicación Residencial</h4>
                                        <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex items-center gap-5">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-minimal-olive shadow-sm border border-gray-50">
                                                <MapPin size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-minimal-gold font-black uppercase tracking-widest mb-1">Sector Actual</p>
                                                <p className="text-lg font-black text-black leading-none mb-1">
                                                    {(user as any).district || 'N/A'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                    {(user as any).province}, {(user as any).department}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileManager;
