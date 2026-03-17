import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Calendar, MapPin, Package, Heart, ChevronRight, Settings, ExternalLink } from 'lucide-react';

const ProfilePage = () => {
    const { user, favorites, toggleFavorite } = useAuth();
    const [activeTab, setActiveTab] = useState<'info' | 'purchases' | 'favorites'>('info');

    if (!user) {
        return (
            <div className="min-h-screen bg-minimal-beige flex items-center justify-center p-6">
                <div className="text-center animate-pulse">
                    <p className="text-lg font-bold text-gray-400 uppercase tracking-widest">Cargando perfil...</p>
                </div>
            </div>
        );
    }

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
                    <div className="bg-white rounded-3xl p-8 border border-black shadow-sm relative overflow-hidden group">
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
                                    <p className="text-lg font-black text-black">0</p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4 border border-black/5 hover:border-minimal-olive transition-all">
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Favoritos</p>
                                    <p className="text-lg font-black text-black">{favorites.length}</p>
                                </div>
                            </div>

                            <button className="w-full bg-white border border-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all text-sm font-bold shadow-[4px_4px_0px_0px_rgba(107,114,84,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                                <Settings size={18} /> Editar Perfil
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-black/10 hidden lg:block">
                        <nav className="flex flex-col gap-2">
                            {[
                                { id: 'info', label: 'Mi información', icon: <User size={18} /> },
                                { id: 'purchases', label: 'Mis Compras', icon: <Package size={18} /> },
                                { id: 'favorites', label: 'Favoritos', icon: <Heart size={18} /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center justify-between p-4 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id
                                        ? 'bg-minimal-olive text-white shadow-lg shadow-minimal-olive/20'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-black'
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
                    <div className="flex lg:hidden bg-white/50 p-1 rounded-2xl border border-black/5 mb-8">
                        {['info', 'purchases', 'favorites'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-4 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-minimal-olive text-white shadow-inner' : 'text-gray-400'
                                    }`}
                            >
                                {tab === 'info' ? 'Info' : tab === 'purchases' ? 'Compras' : 'Favs'}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 md:p-14 border border-black min-h-[600px] shadow-sm">
                        {activeTab === 'info' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div>
                                    <h3 className="text-[10px] text-minimal-olive font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                                        <div className="w-2 h-2 bg-minimal-olive rounded-full" /> Datos Personales
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-2 border-l-4 border-minimal-olive/5 pl-8 hover:border-minimal-olive transition-colors duration-500">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                <User size={12} /> Nombre Completo
                                            </p>
                                            <p className="text-xl font-black text-black tracking-tight">{user.name}</p>
                                        </div>
                                        <div className="space-y-2 border-l-4 border-minimal-olive/5 pl-8 hover:border-minimal-olive transition-colors duration-500">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                <Mail size={12} /> Email
                                            </p>
                                            <p className="text-xl font-black text-black tracking-tight">{user.email}</p>
                                        </div>
                                        <div className="space-y-2 border-l-4 border-minimal-olive/5 pl-8 hover:border-minimal-olive transition-colors duration-500">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={12} /> Fecha de Nacimiento
                                            </p>
                                            <p className="text-xl font-black text-black tracking-tight">{(user as any).birthdate || 'No especificada'}</p>
                                        </div>
                                        <div className="space-y-2 border-l-4 border-minimal-olive/5 pl-8 hover:border-minimal-olive transition-colors duration-500">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                <User size={12} /> Género
                                            </p>
                                            <p className="text-xl font-black text-black tracking-tight">{(user as any).gender || 'No especificado'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] text-minimal-olive font-black uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                                        <div className="w-2 h-2 bg-minimal-olive rounded-full" /> Ubicación
                                    </h3>
                                    <div className="bg-minimal-olive/[0.03] rounded-[2rem] p-10 flex flex-col md:flex-row md:items-center gap-8 border border-minimal-olive/5">
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-black/5 flex-shrink-0">
                                            <MapPin size={32} className="text-minimal-olive" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-minimal-olive font-black uppercase tracking-[0.2em] mb-2">Residencia actual</p>
                                            <p className="text-3xl font-black text-black tracking-tighter leading-none mb-2">
                                                {(user as any).district}, {(user as any).province}
                                            </p>
                                            <p className="text-gray-500 font-bold text-lg">{(user as any).department}, Perú</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'purchases' && (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-8 text-gray-200 border border-gray-100">
                                    <Package size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-black mb-3 italic tracking-tighter">Sin compras registradas</h3>
                                <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                                    Tu historial de adquisiciones aparecerá aquí una vez que realices tu primera reserva.
                                </p>
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
                                                    <h4 className="text-xl font-black text-black group-hover:text-minimal-olive transition-colors leading-[0.9] mb-3">{fav.title}</h4>
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
                                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8 text-red-100 border border-red-50">
                                            <Heart size={40} />
                                        </div>
                                        <h3 className="text-2xl font-black text-black mb-3 italic tracking-tighter">Tu lista está vacía</h3>
                                        <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                                            Explora propiedades y haz clic en el corazón para guardarlas en esta sección.
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
