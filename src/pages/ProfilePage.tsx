import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, MapPin, Package, Heart, ChevronRight, Settings, ExternalLink, Users, ChevronDown, Phone } from 'lucide-react';
import { leadService, Lead, userService } from '../services/crudService';
import { useUbigeo } from '../hooks/useUbigeo';

const ProfilePage = () => {
    const { user, loading, favorites, toggleFavorite } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'purchases' | 'favorites'>('info');

    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const [bookings, setBookings] = useState<Lead[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        birthdate: '',
        gender: '',
        state: '',
        municipality: '',
        city: '',
        phone: '',
    });

    const { states, municipalities, cities, loading: ubigeoLoading } = useUbigeo(formData.state, formData.municipality);

    useEffect(() => {
        if (user) {
            leadService.getMyBookings()
                .then(res => setBookings(res.data))
                .catch(err => console.error("Error fetching bookings:", err));
        }
    }, [user]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-minimal-beige flex items-center justify-center p-6">
                <div className="text-center animate-pulse">
                    <p className="text-lg font-bold text-gray-400 uppercase tracking-widest">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    const handleEdit = () => {
        if (!user) return;
        setFormData({
            name: user.name || '',
            birthdate: (user as any).birthdate || '',
            gender: (user as any).gender || '',
            state: (user as any).state || '',
            municipality: (user as any).municipality || '',
            city: (user as any).city || '',
            phone: (user as any).phone || '',
        });
        setActiveTab('info');
        setIsEditing(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                birthdate: formData.birthdate || null,
                gender: formData.gender || null,
                state: formData.state || null,
                municipality: formData.municipality || null,
                city: formData.city || null,
                phone: formData.phone || null,
            };
            await userService.updateProfile(dataToSubmit);
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-minimal-beige pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">

                {/* Sidebar / User Summary */}
                <aside className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-[#A0A2A3] rounded-3xl p-8 border border-black shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-minimal-olive/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center text-white font-black text-3xl border border-black shadow-2xl mb-6">
                                {getInitials(user.name)}
                            </div>
                            <h2 className="text-2xl font-black text-black tracking-tighter mb-1">{user.name}</h2>
                            <p className="text-gray-400 font-medium text-sm mb-6">{user.email}</p>

                            <div className="w-full grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-gray-50 rounded-2xl p-4 border border-black/5 hover:border-minimal-olive transition-all">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Compras</p>
                                    <p className="text-lg font-black text-black">{bookings.length}</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-black/5 hover:border-minimal-olive transition-all">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Favoritos</p>
                                    <p className="text-lg font-black text-black">{favorites.length}</p>
                                </div>
                            </div>

                            <button onClick={handleEdit} className="w-fit mx-auto px-6 py-2.5 bg-white border border-black rounded-2xl flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all text-xs font-bold shadow-[2px_2px_0px_0px_rgba(107,114,84,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
                                <Settings size={14} /> Editar Perfil
                            </button>
                        </div>
                    </div>

                    <div className="bg-[#A0A2A3] rounded-3xl p-6 border border-black/10 hidden lg:block">
                        <nav className="flex flex-col gap-2">
                            {[
                                { id: 'info', label: 'Mi información', icon: <User size={18} /> },
                                { id: 'purchases', label: 'Mis Compras', icon: <Package size={18} /> },
                                { id: 'favorites', label: 'Favoritos', icon: <Heart size={18} /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id as any); setIsEditing(false); }}
                                    className={`flex items-center justify-between p-4 rounded-xl font-bold text-sm transition-all shadow-sm ${activeTab === tab.id
                                        ? 'bg-minimal-olive text-white shadow-lg shadow-minimal-olive/20'
                                        : 'bg-white/80 text-black/60 hover:bg-white hover:text-black'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {tab.icon}
                                        {tab.label}
                                    </div>
                                    <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content Areas */}
                <main className="w-full lg:w-2/3">
                    {/* Mobile Tabs */}
                    <div className="flex lg:hidden bg-black/[0.03] p-1.5 rounded-[1.8rem] border border-black/5 mb-10 gap-1 overflow-hidden">
                        {[
                            { id: 'info', label: 'Info', icon: <User size={14} /> },
                            { id: 'purchases', label: 'Compras', icon: <Package size={14} /> },
                            { id: 'favorites', label: 'Favs', icon: <Heart size={14} /> }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id as any); setIsEditing(false); }}
                                className={`flex-1 py-3.5 px-2 rounded-[1.3rem] flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === item.id
                                        ? 'bg-minimal-olive text-white shadow-lg shadow-minimal-olive/20'
                                        : 'bg-white text-black/50 hover:bg-white hover:text-black'
                                    }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#A0A2A3] rounded-[2.5rem] p-8 md:p-14 border border-black min-h-[600px] shadow-sm">
                        {activeTab === 'info' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {isEditing ? (
                                    <form onSubmit={handleSave} className="space-y-8">
                                        <div className="bg-white p-8 rounded-3xl border border-black">
                                            <h3 className="text-xl font-black text-black mb-6">Editar Información Personal</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none font-bold text-black" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Fecha de Nacimiento</label>
                                                    <input type="date" value={formData.birthdate} onChange={e => setFormData({ ...formData, birthdate: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none font-bold text-black" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Género</label>
                                                    <div className="relative">
                                                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all appearance-none cursor-pointer">
                                                            <option value="">Seleccionar...</option>
                                                            <option value="Masculino">Masculino</option>
                                                            <option value="Femenino">Femenino</option>
                                                            <option value="Otro">Otro</option>
                                                            <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Teléfono / Celular</label>
                                                    <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-black outline-none font-bold text-black" placeholder="Ej. 999 888 777" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-8 rounded-3xl border border-black">
                                            <h3 className="text-xl font-black text-black mb-6 flex items-center gap-2"><MapPin size={24} /> Editar Ubicación</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
                                                    <div className="relative">
                                                        <select required value={formData.state} disabled={ubigeoLoading} onChange={e => setFormData({ ...formData, state: e.target.value, municipality: '', city: '' })} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all appearance-none cursor-pointer disabled:opacity-50">
                                                            <option value="" disabled hidden>{ubigeoLoading ? 'Cargando...' : 'Seleccionar...'}</option>
                                                            {states.map(state => <option key={state} value={state}>{state}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Municipio</label>
                                                    <div className="relative">
                                                        <select required value={formData.municipality} disabled={!formData.state || ubigeoLoading} onChange={e => setFormData({ ...formData, municipality: e.target.value, city: '' })} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all appearance-none cursor-pointer disabled:opacity-50">
                                                            <option value="" disabled hidden>Seleccionar...</option>
                                                            {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Ciudad</label>
                                                    <div className="relative">
                                                        <select required value={formData.city} disabled={!formData.municipality || ubigeoLoading} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border border-transparent focus:border-minimal-olive outline-none font-bold text-sm transition-all appearance-none cursor-pointer disabled:opacity-50">
                                                            <option value="" disabled hidden>Seleccionar...</option>
                                                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end items-center gap-4">
                                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 font-bold text-gray-500 hover:text-black transition-colors rounded-xl border-2 border-transparent hover:border-gray-200">Cancelar</button>
                                            <button type="submit" className="px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-minimal-olive transition-colors shadow-[4px_4px_0px_0px_rgba(107,114,84,1)] active:translate-x-1 active:translate-y-1 active:shadow-none">Guardar Cambios</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="text-[10px] text-black font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                                                <div className="w-2 h-2 bg-minimal-olive rounded-full" /> Datos Personales
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-white p-4 rounded-2xl border border-black/5 space-y-1 hover:border-minimal-olive transition-all duration-300 shadow-sm">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                        <User size={10} /> Nombre Completo
                                                    </p>
                                                    <p className="text-lg font-black text-black tracking-tight">{user.name}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border border-black/5 space-y-1 hover:border-minimal-olive transition-all duration-300 shadow-sm">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Mail size={10} /> Email
                                                    </p>
                                                    <p className="text-lg font-black text-black tracking-tight">{user.email}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border border-black/5 space-y-1 hover:border-minimal-olive transition-all duration-300 shadow-sm">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Calendar size={10} /> Fecha de Nacimiento
                                                    </p>
                                                    <p className="text-lg font-black text-black tracking-tight">{(user as any).birthdate || 'No especificada'}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border border-black/5 space-y-1 hover:border-minimal-olive transition-all duration-300 shadow-sm">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                        <User size={10} /> Género
                                                    </p>
                                                    <p className="text-lg font-black text-black tracking-tight">{(user as any).gender || 'No especificado'}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-2xl border border-black/5 space-y-1 hover:border-minimal-olive transition-all duration-300 shadow-sm">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Phone size={10} /> Teléfono
                                                    </p>
                                                    <p className="text-lg font-black text-black tracking-tight">{(user as any).phone || 'No especificado'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[10px] text-black font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                                                <div className="w-2 h-2 bg-minimal-olive rounded-full" /> Ubicación
                                            </h3>
                                            <div className="bg-white rounded-3xl p-6 flex flex-col md:flex-row md:items-center gap-6 border border-black/5 shadow-sm">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl shadow-sm flex items-center justify-center border border-black/5 flex-shrink-0">
                                                    <MapPin size={24} className="text-minimal-olive" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-minimal-olive font-black uppercase tracking-[0.2em] mb-1">Residencia actual</p>
                                                    <p className="text-2xl font-black text-black tracking-tighter leading-none mb-1">
                                                        {(user as any).city || 'Ciudad no especificada'}, {(user as any).municipality || 'Municipio no especificado'}
                                                    </p>
                                                    <p className="text-gray-500 font-bold text-sm">{(user as any).state || 'Estado no especificado'}, México</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'purchases' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
                                <h3 className="text-[10px] text-minimal-olive font-black uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-minimal-olive rounded-full" /> Mis Reservas
                                </h3>

                                {bookings.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {bookings.map(booking => (
                                            <div key={booking.id} className="bg-white border border-black/5 rounded-2xl p-4 hover:border-minimal-olive transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-black/5">
                                                        <Package size={20} className="text-minimal-olive" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-black leading-tight mb-1">{booking.property_title || `Propiedad #${booking.item_id}`}</h4>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                            <span className="flex items-center gap-1"><Calendar size={12} /> {booking.check_in} - {booking.check_out}</span>
                                                            <span className="flex items-center gap-1"><Users size={12} /> {booking.guests || 1} Personas</span>
                                                        </div>

                                                        {booking.additional_services && booking.additional_services.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {booking.additional_services.map((s: any, idx: number) => (
                                                                    <span key={idx} className="bg-gray-50 border border-gray-100 text-[9px] font-black text-minimal-olive px-2 py-1 rounded-md uppercase tracking-tighter">
                                                                        + {s.name} (S/ {s.price})
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="bg-minimal-olive border border-black/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Confirmado</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-black/5 shadow-sm text-center">
                                        <div className="w-20 h-20 bg-gray-50 text-black rounded-full flex items-center justify-center mb-6 border border-black/5">
                                            <Package size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-black mb-2 italic tracking-tighter">Sin compras registradas</h3>
                                        <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                                            Tu historial de adquisiciones aparecerá aquí una vez que realices tu primera reserva.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
                                <h3 className="text-[10px] text-minimal-olive font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-minimal-olive rounded-full" /> Guardado en Favoritos
                                </h3>

                                {favorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {favorites.map((fav) => (
                                            <div key={fav.id} className="group bg-white rounded-[1.5rem] p-2.5 border border-black hover:shadow-[6px_6px_0px_0px_rgba(107,114,84,0.15)] transition-all duration-300">
                                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5">
                                                    <img src={fav.img} alt={fav.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite(fav);
                                                        }}
                                                        className="absolute top-4 right-4 p-1.5 transition-transform active:scale-90"
                                                    >
                                                        <Heart size={20} className="fill-red-500 text-red-500 drop-shadow-sm stroke-black stroke-[1.5px]" />
                                                    </button>
                                                </div>
                                                <div className="px-3 pb-3">
                                                    <h4 className="text-xl font-black text-black group-hover:text-black/80 transition-colors leading-[0.9] mb-3">{fav.title}</h4>
                                                    <div className="flex justify-between items-end">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                                <MapPin size={10} className="text-minimal-olive" />
                                                                {fav.location}
                                                            </div>
                                                            <p className="text-lg font-black text-black tracking-tighter">{fav.price}</p>
                                                        </div>
                                                        <button className="p-3 bg-black text-white rounded-xl hover:bg-minimal-olive transition-colors">
                                                            <ExternalLink size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-black/5 shadow-sm text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-8 text-black/20 border border-black/5">
                                            <Heart size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-black mb-3 italic tracking-tighter">Tu lista está vacía</h3>
                                        <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                                            Explora productos y haz clic en el corazón para guardarlos en esta sección.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;