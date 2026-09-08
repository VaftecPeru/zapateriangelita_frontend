import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, ChevronDown, Mail, MapPin, Phone, Save, Settings, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useUbigeo } from '../../hooks/useUbigeo';
import { userService } from '../../services/crudService';

const normalizeBirthdate = (value?: string | null) => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!match) return '';
    const [, month, day, rawYear] = match;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const ProfileManager = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({ name: '', birthdate: '', gender: '', state: '', municipality: '', city: '', phone: '' });
    const { states, municipalities, cities, loading: ubigeoLoading } = useUbigeo(formData.state, formData.municipality);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                birthdate: normalizeBirthdate((user as any).birthdate),
                gender: (user as any).gender || '',
                state: (user as any).state || '',
                municipality: (user as any).municipality || '',
                city: (user as any).city || '',
                phone: (user as any).phone || '',
            });
        }
    }, [user]);

    if (!user) return null;

    const initials = user.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
    const updateField = (field: keyof typeof formData, value: string) => setFormData(current => ({ ...current, [field]: value }));

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        try {
            const response = await userService.updateProfile({
                ...formData,
                birthdate: formData.birthdate || null,
                gender: formData.gender || null,
                state: formData.state || null,
                municipality: formData.municipality || null,
                city: formData.city || null,
                phone: formData.phone || null,
            });
            updateUser(response.data);
            setIsEditing(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            alert('Error al actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { icon: <User size={11} />, label: 'Nombre Completo', value: user.name },
        { icon: <Mail size={11} />, label: 'Email', value: user.email },
        { icon: <Calendar size={11} />, label: 'Fecha de Nacimiento', value: normalizeBirthdate((user as any).birthdate) || 'No especificada' },
        { icon: <User size={11} />, label: 'Género', value: (user as any).gender || 'No especificado' },
        { icon: <Phone size={11} />, label: 'Teléfono', value: (user as any).phone || 'No especificado' },
    ];

    return (
        <div className="space-y-6">
            {success && (
                <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-4 text-green-600">
                    <CheckCircle size={20} />
                    <p className="text-sm font-bold">¡Perfil actualizado correctamente!</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                <aside className="flex w-full flex-col gap-6">
                    <div className="group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-8 shadow-sm">
                        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-[#e30613]/[0.06] transition-transform duration-700 group-hover:scale-150" />
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border-2 border-[#e30613] bg-[#121212] text-3xl font-serif text-white shadow-2xl">{initials}</div>
                            <h2 className="mb-1 text-2xl font-black tracking-tight text-[#121212]">{user.name}</h2>
                            <p className="mb-6 text-sm font-medium text-gray-400">{user.email}</p>
                            <div className="w-full border-t border-black/5 pt-5 text-left"><p className="mb-1 text-[9px] font-black uppercase tracking-widest text-gray-400">Rol</p><p className="text-sm font-bold text-[#121212]">Administrador Zapatería ANGELITA</p></div>
                            {!isEditing && <button onClick={() => setIsEditing(true)} className="mt-6 flex w-fit items-center justify-center gap-2 rounded-full bg-[#e30613] px-6 py-2.5 text-[11px] font-black uppercase tracking-wider text-white transition-all hover:bg-[#bd0711]"><Settings size={14} /> Editar Perfil</button>}
                        </div>
                    </div>
                </aside>

                <main className="lg:col-span-2">
                    <div className="min-h-[600px] rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm md:p-12">
                        {isEditing ? (
                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="rounded-3xl border border-black/5 bg-[#f7f7f7] p-8">
                                    <h3 className="mb-6 font-serif text-xl font-black text-[#121212]">Editar Información Personal</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <label className="space-y-2 md:col-span-2"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre Completo</span><input type="text" value={formData.name} onChange={event => updateField('name', event.target.value)} className="w-full rounded-xl border border-black/10 bg-white p-3.5 font-bold text-[#121212] outline-none transition-colors focus:border-[#e30613]" required /></label>
                                        <label className="space-y-2"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fecha de Nacimiento</span><input type="date" value={formData.birthdate} onChange={event => updateField('birthdate', event.target.value)} className="w-full rounded-xl border border-black/10 bg-white p-3.5 font-bold text-[#121212] outline-none transition-colors focus:border-[#e30613]" /></label>
                                        <label className="space-y-2"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Género</span><select value={formData.gender} onChange={event => updateField('gender', event.target.value)} className="w-full appearance-none rounded-xl border border-black/10 bg-white px-4 py-3.5 font-bold text-[#121212] outline-none focus:border-[#e30613]"><option value="">Seleccionar...</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option><option value="Prefiero no decirlo">Prefiero no decirlo</option></select></label>
                                        <label className="space-y-2 md:col-span-2"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Teléfono / Celular</span><input type="tel" value={formData.phone} onChange={event => updateField('phone', event.target.value)} className="w-full rounded-xl border border-black/10 bg-white p-3.5 font-bold text-[#121212] outline-none transition-colors focus:border-[#e30613]" placeholder="Ej. 999 888 777" /></label>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-black/5 bg-[#f7f7f7] p-8">
                                    <h3 className="mb-6 font-serif text-xl font-black text-[#121212]">Ubicación Residencial</h3>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                        <label className="space-y-2"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</span><span className="relative block"><select required value={formData.state} disabled={ubigeoLoading} onChange={event => setFormData(current => ({ ...current, state: event.target.value, municipality: '', city: '' }))} className="w-full appearance-none rounded-xl border border-black/10 bg-white px-4 py-3.5 font-bold text-[#121212] outline-none focus:border-[#e30613] disabled:opacity-50"><option value="">Seleccionar...</option>{states.map(option => <option key={option} value={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} /></span></label>
                                        <label className="space-y-2"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Municipio</span><span className="relative block"><select required value={formData.municipality} disabled={!formData.state || ubigeoLoading} onChange={event => setFormData(current => ({ ...current, municipality: event.target.value, city: '' }))} className="w-full appearance-none rounded-xl border border-black/10 bg-white px-4 py-3.5 font-bold text-[#121212] outline-none focus:border-[#e30613] disabled:opacity-50"><option value="">Seleccionar...</option>{municipalities.map(option => <option key={option} value={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} /></span></label>
                                        <label className="space-y-2"><span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ciudad</span><span className="relative block"><select required value={formData.city} disabled={!formData.municipality || ubigeoLoading} onChange={event => updateField('city', event.target.value)} className="w-full appearance-none rounded-xl border border-black/10 bg-white px-4 py-3.5 font-bold text-[#121212] outline-none focus:border-[#e30613] disabled:opacity-50"><option value="">Seleccionar...</option>{cities.map(option => <option key={option} value={option}>{option}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} /></span></label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3"><button type="button" onClick={() => setIsEditing(false)} className="rounded-full border border-black/10 px-6 py-3 text-sm font-bold text-gray-500 transition-colors hover:border-black/20 hover:text-[#121212]">Cancelar</button><button type="submit" disabled={loading} className="rounded-full bg-[#e30613] px-8 py-3 text-sm font-black uppercase tracking-wide text-white transition-colors hover:bg-[#bd0711] disabled:opacity-60"><span className="inline-flex items-center gap-2"><Save size={15} /> {loading ? 'Guardando...' : 'Guardar Cambios'}</span></button></div>
                            </form>
                        ) : (
                            <div>
                                <h3 className="mb-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#e30613]"><span className="h-2 w-2 rounded-full bg-[#e30613]" /> Datos Personales</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{fields.map(field => <div key={field.label} className="space-y-1.5 rounded-2xl border border-black/5 bg-[#f7f7f7] p-4 transition-colors hover:border-[#e30613]/30"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400">{field.icon} {field.label}</p><p className="text-lg font-black tracking-tight text-[#121212]">{field.value}</p></div>)}</div>
                                <div className="mt-8 rounded-3xl border border-black/5 bg-[#f7f7f7] p-6"><div className="flex items-center gap-5"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-black/5 bg-white text-[#e30613]"><MapPin size={24} /></div><div><p className="mb-1 text-[9px] font-black uppercase tracking-widest text-[#e30613]">Ubicación Residencial</p><p className="mb-1 text-lg font-black leading-none text-[#121212]">{(user as any).city || 'No definida'}</p><p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">{(user as any).municipality || 'Sin municipio'}, {(user as any).state || 'Sin estado'}</p></div></div></div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfileManager;
