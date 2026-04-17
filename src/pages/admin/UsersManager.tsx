import { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Mail, MapPin, Calendar, User as UserIcon, X, Trash2 } from 'lucide-react';
import { userService, User } from '../../services/crudService';

interface UsersManagerProps {
    initialData?: User[];
}

const UsersManager = ({ initialData }: UsersManagerProps) => {
    const [users, setUsers] = useState<User[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchUsers = async () => {
        if (initialData && users.length > 0) return; // Skip if we have data from props
        setLoading(true);
        setError(null);
        try {
            const res = await userService.getAll();
            const data = (res as any)?.data?.data || (res as any)?.data || res;
            const usersList = Array.isArray(data) ? data : [];
            setUsers(usersList);
            if (usersList.length === 0) {
                console.warn('API responded with 0 users');
            }
        } catch (e: any) {
            console.error('DEBUG: Fetch Users Error:', e);
            if (!initialData) {
                const errorMsg = e.response?.data?.message || e.message || 'Error desconocido';
                setError(`No se pudo cargar la lista de usuarios: ${errorMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            setUsers(initialData);
            setLoading(false);
        } else {
            fetchUsers();
        }
    }, [initialData]);

    const filteredUsers = users.filter(user => {
        const search = searchTerm.toLowerCase();
        return (
            (user.name?.toLowerCase() || '').includes(search) ||
            (user.email?.toLowerCase() || '').includes(search) ||
            (user.district?.toLowerCase() || '').includes(search)
        );
    });

    const handleDelete = async (id: number) => {
        setDeleting(true);
        try {
            await userService.delete(id);
            setUsers(users.filter(u => u.id !== id));
            setConfirmDelete(null);
        } catch (e: any) {
            console.error('Error deleting user:', e);
            alert(e.response?.data?.message || 'Error al eliminar el usuario.');
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-minimal-olive/10 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                        <Users size={26} className="text-minimal-gold" /> Usuarios Registrados
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                        Listado completo de personas que han creado una cuenta en Homad ({users.length} usuarios)
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={fetchUsers}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg flex-1 sm:flex-none"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-minimal-olive/10 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o distrito..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-minimal-olive/20 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-minimal-olive/10">
                    <div className="w-10 h-10 border-4 border-minimal-gold border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 text-red-600 font-bold text-sm shadow-sm">
                    {error}
                </div>
            )}

            {!loading && !error && filteredUsers.length === 0 && (
                <div className="bg-white/40 backdrop-blur-sm border border-minimal-olive/10 rounded-[2rem] p-12 text-center shadow-sm">
                    <Users size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold text-lg">No se encontraron usuarios.</p>
                    <p className="text-gray-300 font-medium text-sm mt-1">
                        {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Aún no hay usuarios registrados en el sistema.'}
                    </p>
                </div>
            )}

            {!loading && filteredUsers.length > 0 && (
                <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] border border-minimal-olive/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-minimal-olive/5 bg-minimal-olive/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Usuario</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Ubicación</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Género</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">F. Nacimiento</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Rol</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-minimal-olive/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-minimal-olive/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white border border-minimal-olive/20 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-black group-hover:text-white transition-all">
                                                    {(user.name || 'U').slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-black text-sm leading-tight">{user.name || 'Usuario sin nombre'}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Mail size={10} className="text-minimal-gold" />
                                                        <span className="text-[10px] text-gray-400 font-bold">{user.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2">
                                                <MapPin size={12} className="text-minimal-gold mt-0.5" />
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-black">{user.district}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{user.province}, {user.department}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                {user.gender === 'male' ? 'Masculino' : user.gender === 'female' ? 'Femenino' : user.gender}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-gray-300" />
                                                <span className="text-xs font-bold text-gray-600">{user.birthdate}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full w-fit ${user.role === 'admin' ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <UserIcon size={10} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setConfirmDelete(user.id)}
                                                className="p-2.5 bg-white text-gray-400 border border-red-50 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                                                title="Eliminar usuario"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-minimal-olive/10 animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black text-black text-center mb-2">¿Eliminar Usuario?</h3>
                        <p className="text-sm text-gray-400 text-center mb-8 font-medium leading-relaxed">
                            Esta acción no se puede deshacer. El usuario perderá acceso a la plataforma permanentemente.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                disabled={deleting}
                                className="px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(confirmDelete)}
                                disabled={deleting}
                                className="px-6 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg flex items-center justify-center disabled:opacity-50"
                            >
                                {deleting ? <RefreshCw size={14} className="animate-spin" /> : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersManager;
