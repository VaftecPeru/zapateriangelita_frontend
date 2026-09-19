import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, Package, Heart, ChevronDown, Settings, Phone, Save, LogOut } from 'lucide-react';
import { Order, orderService, userService } from '../services/crudService';
import { onlyLettersAndSpaces, validateProfileFields } from '../utils/profileValidation';
import PhoneField from '../components/PhoneField';

const normalizeBirthdate = (value?: string | null) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!match) return '';

    const [, month, day, rawYear] = match;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Función Logo integrada
const Logo = ({ light = false }: { light?: boolean }) => {
  return (
    <a className={`logo ${light ? "logo--light" : ""}`} href="/" aria-label="Zapatería Angelita - inicio">
      <span className="logo__small">Zapatería</span>
      <strong>ANGELITA</strong>
      <span className="logo__tagline">Calzando tus pies desde 1980</span>
    </a>
  );
};

const ProfilePage = () => {
    const { user, loading, favorites, toggleFavorite, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'info' | 'purchases' | 'favorites'>('info');
    const [bookings, setBookings] = useState<Order[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        birthdate: '',
        gender: '',
        phone: '',
    });

    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user) {
            orderService.getMyOrders()
                .then(res => setBookings(res.data))
                .catch(err => console.error("Error fetching orders:", err));
        }
    }, [user]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-6">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-[#e30613] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.25em]">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    const handleEdit = () => {
        if (!user) return;
        setSaveError(null);
        setFormData({
            name: user.name || '',
            birthdate: normalizeBirthdate((user as any).birthdate),
            gender: (user as any).gender || '',
            phone: (user as any).phone || '',
        });
        setActiveTab('info');
        setIsEditing(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateProfileFields({ name: formData.name, phone: formData.phone });
        if (validationError) {
            setSaveError(validationError);
            return;
        }
        setSaving(true);
        setSaveError(null);
        try {
            const dataToSubmit = {
                ...formData,
                birthdate: formData.birthdate || null,
                gender: formData.gender || null,
                phone: formData.phone || null,
            };
            const response = await userService.updateProfile(dataToSubmit);
            updateUser(response.data);
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setSaveError(error.response?.data?.message || 'No se pudo actualizar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            if (typeof logout === 'function') {
                await logout();
            }
        } catch (error) {
            console.error('Error cerrando sesión:', error);
        } finally {
            navigate('/');
        }
    };

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const tabs = [
        { id: 'info', label: 'Mi información', shortLabel: 'Info', icon: <User size={18} /> },
        { id: 'purchases', label: 'Mis Compras', shortLabel: 'Compras', icon: <Package size={18} /> },
        { id: 'favorites', label: 'Favoritos', shortLabel: 'Favs', icon: <Heart size={18} /> },
    ] as const;

    const formatDate = (date: string) => {
        return normalizeBirthdate(date) || 'No especificada';
    };

    return (
        <div className="min-h-screen bg-[#f7f7f7] pb-20 px-4 md:px-6">
            <header className="mb-10 pt-6 pb-4 border-b border-black/5">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#121212]/60 hover:text-[#121212] transition-colors"
                    >
                        <ArrowLeft size={18} /> Volver
                    </button>
                    
                    <Logo light={false} />
                    
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 text-[#e30613] text-[10px] font-black uppercase tracking-wider hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={14} /> Salir
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10">

                <aside className="w-full lg:w-1/3 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#e30613]/[0.06] rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-[#121212] rounded-[2rem] flex items-center justify-center text-white text-3xl border-2 border-[#e30613] shadow-2xl mb-6 font-serif">
                                {getInitials(user.name)}
                            </div>
                            <h2 className="text-2xl font-black text-[#121212] tracking-tight mb-1">{user.name}</h2>
                            <p className="text-gray-400 font-medium text-sm mb-6">{user.email}</p>

                            <div className="w-full grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-[#f7f7f7] rounded-2xl p-4 border border-black/5">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Compras</p>
                                    <p className="text-lg font-black text-[#121212]">{bookings.length}</p>
                                </div>
                                <div className="bg-[#f7f7f7] rounded-2xl p-4 border border-black/5">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Favoritos</p>
                                    <p className="text-lg font-black text-[#121212]">{favorites.length}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleEdit}
                                className="w-fit mx-auto px-6 py-2.5 bg-[#e30613] text-white rounded-full flex items-center justify-center gap-2 hover:bg-[#bd0711] transition-all text-[11px] font-black uppercase tracking-wider"
                            >
                                <Settings size={14} /> Editar Perfil
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-3 border border-black/5 hidden lg:block">
                        <nav className="flex flex-col gap-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
                                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-[#e30613] text-white'
                                            : 'text-[#121212]/60 hover:bg-[#f7f7f7] hover:text-[#121212]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {tab.icon}
                                        {tab.label}
                                    </div>
                                    {activeTab === tab.id && <span className="w-2 h-2 bg-white rounded-full" />}
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                <main className="w-full lg:w-2/3">
                    <div className="flex lg:hidden bg-white p-1.5 rounded-full border border-black/5 mb-8 gap-1">
                        {tabs.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveTab(item.id); setIsEditing(false); }}
                                className={`flex-1 py-3 px-2 rounded-full flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === item.id
                                        ? 'bg-[#e30613] text-white'
                                        : 'text-[#121212]/50'
                                }`}
                            >
                                {item.icon}
                                <span>{item.shortLabel}</span>
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 md:p-12 border border-black/5 min-h-[600px] shadow-sm">
                        {activeTab === 'info' && (
                            <div className="space-y-10">
                                {isEditing ? (
                                    <form onSubmit={handleSave} className="space-y-8">
                                        {saveError && (
                                            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-[#bd0711]">
                                                {saveError}
                                            </p>
                                        )}
                                        <div className="bg-[#f7f7f7] p-8 rounded-3xl border border-black/5">
                                            <h3 className="text-xl font-black text-[#121212] mb-6 font-serif">
                                                Editar Información Personal
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        maxLength={255}
                                                        onChange={e => setFormData({ ...formData, name: onlyLettersAndSpaces(e.target.value) })}
                                                        className="w-full p-3.5 bg-white rounded-xl border border-black/10 focus:border-[#e30613] outline-none font-bold text-[#121212] transition-colors"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha de Nacimiento</label>
                                                    <input
                                                        type="date"
                                                        value={formData.birthdate}
                                                        onChange={e => setFormData({ ...formData, birthdate: e.target.value })}
                                                        className="w-full p-3.5 bg-white rounded-xl border border-black/10 focus:border-[#e30613] outline-none font-bold text-[#121212] transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Género</label>
                                                    <div className="relative">
                                                        <select
                                                            value={formData.gender}
                                                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                                            className="w-full px-4 py-3.5 bg-white rounded-xl border border-black/10 focus:border-[#e30613] outline-none font-bold text-sm transition-colors appearance-none cursor-pointer text-[#121212]"
                                                        >
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
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono / Celular</label>
                                                    <PhoneField
                                                        value={formData.phone || '+52'}
                                                        onChange={(phone) => setFormData({ ...formData, phone })}
                                                        defaultDialCode="+52"
                                                        selectClassName="profile-phone-prefix"
                                                        inputClassName="profile-phone-number"
                                                        placeholder="55 1234 5678"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-6 py-3 font-bold text-sm text-gray-500 hover:text-[#121212] transition-colors rounded-full border border-black/10 hover:border-black/20"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-8 py-3 bg-[#e30613] text-white font-black text-sm uppercase tracking-wide rounded-full hover:bg-[#bd0711] transition-colors disabled:opacity-60"
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    <Save size={15} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                                                </span>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div>
                                        <h3 className="text-[10px] text-[#e30613] font-black uppercase tracking-[0.35em] mb-8 flex items-center gap-3">
                                            <div className="w-2 h-2 bg-[#e30613] rounded-full" /> Datos Personales
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {[
                                                { icon: <User size={11} />, label: 'Nombre Completo', value: user.name },
                                                { icon: <Mail size={11} />, label: 'Email', value: user.email },
                                                { icon: <Calendar size={11} />, label: 'Fecha de Nacimiento', value: formatDate((user as any).birthdate) },
                                                { icon: <User size={11} />, label: 'Género', value: (user as any).gender || 'No especificado' },
                                                { icon: <Phone size={11} />, label: 'Teléfono', value: (user as any).phone || 'No especificado' },
                                            ].map((field) => (
                                                <div
                                                    key={field.label}
                                                    className="bg-[#f7f7f7] p-4 rounded-2xl border border-black/5 space-y-1.5 hover:border-[#e30613]/30 transition-colors"
                                                >
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-2">
                                                        {field.icon} {field.label}
                                                    </p>
                                                    <p className="text-lg font-black text-[#121212] tracking-tight">{field.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'purchases' && (
                            <div className="space-y-6">
                                <h3 className="text-[10px] text-[#e30613] font-black uppercase tracking-[0.35em] mb-8 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-[#e30613] rounded-full" /> Mis Compras
                                </h3>

                                {bookings.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-3">
                                        {bookings.map(booking => (
                                            <div
                                                key={booking.id}
                                                className="bg-[#f7f7f7] border border-black/5 rounded-2xl p-4 hover:border-[#e30613]/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-black/5 shrink-0">
                                                        <Package size={20} className="text-[#e30613]" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-[#121212] leading-tight mb-1">Pedido {booking.code}</h4>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} /> {booking.created_at ? new Date(booking.created_at).toLocaleDateString('es-PE') : 'Fecha pendiente'}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Package size={12} /> {booking.items?.length || 0} Productos
                                                            </span>
                                                        </div>
                                                        {booking.items && booking.items.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {booking.items.slice(0, 3).map((item, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="bg-white border border-black/5 text-[9px] font-black text-[#121212] px-2.5 py-1 rounded-md uppercase tracking-tighter"
                                                                    >
                                                                        {item.product_name || 'Producto'} x{item.quantity}
                                                                    </span>
                                                                ))}
                                                                {booking.items.length > 3 && (
                                                                    <span className="text-[9px] font-black text-gray-400">+{booking.items.length - 3} más</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest self-start md:self-center ${
                                                    booking.status === 'completed' || booking.status === 'Completado' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'pending' || booking.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-[#e30613] text-white'
                                                }`}>
                                                    {booking.status === 'completed' || booking.status === 'Completado' ? 'Completado' :
                                                     booking.status === 'pending' || booking.status === 'Pendiente' ? 'Pendiente' :
                                                     booking.status || 'Procesando'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 bg-[#f7f7f7] rounded-3xl border border-black/5 text-center">
                                        <div className="w-20 h-20 bg-white text-[#e30613] rounded-full flex items-center justify-center mb-6 border border-black/5">
                                            <Package size={36} />
                                        </div>
                                        <h3 className="text-2xl font-black text-[#121212] mb-2 tracking-tight font-serif">Sin compras registradas</h3>
                                        <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                                            Tu historial de pedidos aparecerá aquí una vez que realices tu primera compra.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'favorites' && (
                            <div className="space-y-8">
                                <h3 className="text-[10px] text-[#e30613] font-black uppercase tracking-[0.35em] mb-8 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-[#e30613] rounded-full" /> Guardado en Favoritos
                                </h3>

                                {favorites.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {favorites.map((fav) => (
                                            <div
                                                key={fav.id}
                                                className="group bg-[#f7f7f7] rounded-[1.5rem] p-2.5 border border-black/5 hover:border-[#e30613]/30 hover:shadow-md transition-all duration-300"
                                            >
                                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
                                                    <img
                                                        src={fav.img}
                                                        alt={fav.title}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        style={{ mixBlendMode: 'multiply', background: '#fff' }}
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleFavorite(fav);
                                                        }}
                                                        className="absolute top-3 right-3 w-9 h-9 grid place-items-center rounded-full bg-white/90 transition-transform active:scale-90"
                                                        aria-label="Quitar de favoritos"
                                                    >
                                                        <Heart size={17} className="fill-[#e30613] text-[#e30613]" />
                                                    </button>
                                                </div>
                                                <div className="px-2 pb-2">
                                                    <h4 className="text-lg font-black text-[#121212] leading-tight mb-2 tracking-tight">{fav.title}</h4>
                                                    <div className="flex justify-between items-end">
                                                        <div className="space-y-1">
                                                            <p className="text-lg font-black text-[#e30613] tracking-tight">{fav.price}</p>
                                                        </div>
                                                        <button className="p-2.5 bg-[#121212] text-white rounded-full hover:bg-[#e30613] transition-colors">
                                                            Ver
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-14 bg-[#f7f7f7] rounded-3xl border border-black/5 text-center">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 text-[#e30613] border border-black/5">
                                            <Heart size={36} />
                                        </div>
                                        <h3 className="text-2xl font-black text-[#121212] mb-2 tracking-tight font-serif">Tu lista está vacía</h3>
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

            {showLogoutConfirm && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-[#121212]/55 backdrop-blur-sm"
                    onClick={() => setShowLogoutConfirm(false)}
                >
                    <div
                        className="w-full max-w-sm bg-white rounded-3xl p-8 text-center shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-50 text-[#e30613] grid place-items-center">
                            <LogOut size={24} />
                        </div>
                        <h3 className="text-xl font-black text-[#121212] mb-2 font-serif">¿Cerrar sesión?</h3>
                        <p className="text-sm text-gray-400 mb-6">Tendrás que iniciar sesión de nuevo para ver tu perfil.</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-6 py-3 rounded-full border border-black/10 font-bold text-sm text-gray-500 hover:text-[#121212] hover:border-black/20 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-3 rounded-full bg-[#e30613] text-white font-black text-sm uppercase tracking-wide hover:bg-[#bd0711] transition-colors"
                            >
                                Sí, salir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;