import { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Mail, Calendar, User as UserIcon, Trash2, KeyRound, Copy, Check, ShieldCheck, Crown } from 'lucide-react';
import { userService, User } from '../../services/crudService';
import { useAuth } from '../../hooks/useAuth';

interface UsersManagerProps {
    initialData?: User[];
}

const UsersManager = ({ initialData }: UsersManagerProps) => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [resetUser, setResetUser] = useState<User | null>(null);
    const [resetting, setResetting] = useState(false);
    const [sendResetEmail, setSendResetEmail] = useState(false);
    const [temporaryPassword, setTemporaryPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const [roleUser, setRoleUser] = useState<User | null>(null);
    const [changingRole, setChangingRole] = useState(false);

    const canManageRoles = currentUser?.role === 'superadmin';
    const isOperationalAdmin = currentUser?.role === 'admin';

    // Defensa adicional en frontend: un administrador operativo nunca debe
    // visualizar cuentas admin/superadmin ajenas aunque una respuesta antigua
    // o un caché llegara a incluirlas.
    const visibleUsers = users.filter((user) => {
        if (canManageRoles) return true;
        if (!isOperationalAdmin) return user.id === currentUser?.id;
        if (user.id === currentUser?.id) return true;
        return !user.role || user.role === 'user';
    });

    const canSeeRole = (user: User) =>
        canManageRoles || user.id === currentUser?.id;

    const canOperateOnUser = (user: User) => {
        if (canManageRoles) return user.role !== 'superadmin';
        return isOperationalAdmin && user.id !== currentUser?.id;
    };

    const fetchUsers = async () => {
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

    const filteredUsers = visibleUsers.filter(user => {
        const search = searchTerm.toLowerCase();
        return (
            (user.name?.toLowerCase() || '').includes(search) ||
            (user.email?.toLowerCase() || '').includes(search)
        );
    });

    const formatDate = (value?: string) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const openResetPassword = (user: User) => {
        setResetUser(user);
        setTemporaryPassword('');
        setSendResetEmail(false);
        setCopied(false);
    };

    const handleResetPassword = async () => {
        if (!resetUser) return;
        setResetting(true);
        try {
            const response = await userService.resetPassword(resetUser.id, sendResetEmail);
            setTemporaryPassword(response.data.temporary_password || '');
            setUsers((current) => current.map((item) =>
                item.id === resetUser.id ? { ...item, must_change_password: true } : item,
            ));
        } catch (e: any) {
            setError(e.response?.data?.message || 'No se pudo restablecer la contraseña.');
        } finally {
            setResetting(false);
        }
    };

    const copyTemporaryPassword = async () => {
        if (!temporaryPassword) return;
        await navigator.clipboard.writeText(temporaryPassword);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    const handleRoleChange = async () => {
        if (!roleUser || !canManageRoles) return;

        const nextRole: 'user' | 'admin' = roleUser.role === 'admin' ? 'user' : 'admin';
        setChangingRole(true);
        setError(null);

        try {
            const response = await userService.updateRole(roleUser.id, nextRole);
            const updated = response.data.user;
            setUsers((current) => current.map((item) => item.id === updated.id ? { ...item, ...updated } : item));
            setRoleUser(null);
        } catch (e: any) {
            setError(e.response?.data?.message || 'No se pudo actualizar el rol del usuario.');
        } finally {
            setChangingRole(false);
        }
    };

    const roleBadgeClass = (role?: string) => {
        if (role === 'superadmin') return 'bg-store-red text-white';
        if (role === 'admin') return 'bg-black text-white';
        return 'bg-gray-100 text-gray-500';
    };

    const roleLabel = (role?: string) => {
        if (role === 'superadmin') return 'Superadministrador';
        if (role === 'admin') return 'Administrador';
        return 'Usuario';
    };

    const handleDelete = async (id: number) => {
        setDeleting(true);
        setError(null);
        try {
            await userService.delete(id);
            setUsers((current) => current.filter((user) => user.id !== id));
            setConfirmDelete(null);
        } catch (e: any) {
            console.error('Error deleting user:', e);

            // Si el registro desapareció entre la carga de la tabla y la acción,
            // sincronizamos la UI en vez de mostrar el error técnico del backend.
            if (Number(e.response?.status || 0) === 404) {
                setUsers((current) => current.filter((user) => user.id !== id));
                setConfirmDelete(null);
                return;
            }

            setError(e.response?.data?.message || 'No se pudo eliminar el usuario.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                        <Users size={26} className="text-store-red" /> Usuarios Registrados
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                        Usuarios disponibles para tu nivel de acceso ({visibleUsers.length} usuarios)
                    </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={fetchUsers}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-store-red text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-store-redDark transition-all shadow-lg flex-1 sm:flex-none"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        Actualizar
                    </button>
                </div>
            </div>

            {canManageRoles && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                    <Crown size={20} className="mt-0.5 shrink-0" />
                    <div>
                        <p className="font-black">Modo Superadministrador</p>
                        <p className="mt-1 text-xs font-medium text-red-700">
                            Puedes asignar o retirar el rol Administrador. Los cambios revocan las sesiones activas del usuario para aplicar los nuevos permisos inmediatamente.
                        </p>
                    </div>
                </div>
            )}

            {/* Search and Filters */}
            <div className="bg-white/40 backdrop-blur-sm p-4 rounded-3xl border border-gray-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o correo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-gray-200">
                    <div className="w-10 h-10 border-4 border-store-red border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 text-red-600 font-bold text-sm shadow-sm">
                    {error}
                </div>
            )}

            {!loading && !error && filteredUsers.length === 0 && (
                <div className="bg-white/40 backdrop-blur-sm border border-gray-200 rounded-[2rem] p-12 text-center shadow-sm">
                    <Users size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold text-lg">No se encontraron usuarios.</p>
                    <p className="text-gray-300 font-medium text-sm mt-1">
                        {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Aún no hay usuarios registrados en el sistema.'}
                    </p>
                </div>
            )}

            {!loading && filteredUsers.length > 0 && (
                <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-store-red/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Usuario</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Género</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">F. Nacimiento</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Rol</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-store-red/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-store-red group-hover:text-white transition-all">
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
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                                                {user.gender === 'Masculino' ? 'Masculino' :
                                                    user.gender === 'Femenino' ? 'Femenino' :
                                                        user.gender || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-gray-300" />
                                                <span className="text-xs font-bold text-gray-600">
                                                    {formatDate(user.birthdate)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {canSeeRole(user) && user.role ? (
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit ${roleBadgeClass(user.role)}`}>
                                                    {user.role === 'superadmin' ? <Crown size={11} /> : user.role === 'admin' ? <ShieldCheck size={11} /> : <UserIcon size={10} />}
                                                    <span className="text-[9px] font-black uppercase tracking-widest">{roleLabel(user.role)}</span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-gray-50 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-gray-300">
                                                    Rol privado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {canOperateOnUser(user) && (
                                                <div className="flex items-center justify-end gap-2">
                                                    {canManageRoles && user.id !== currentUser?.id && (
                                                        <button
                                                            onClick={() => setRoleUser(user)}
                                                            className={`p-2.5 bg-white border rounded-xl transition-all shadow-sm ${user.role === 'admin' ? 'text-gray-600 border-gray-200 hover:bg-gray-100' : 'text-store-red border-red-100 hover:bg-red-50'}`}
                                                            title={user.role === 'admin' ? 'Quitar rol de administrador' : 'Asignar rol de administrador'}
                                                        >
                                                            <ShieldCheck size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => openResetPassword(user)}
                                                        className="p-2.5 bg-white text-gray-500 border border-gray-200 rounded-xl hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all shadow-sm"
                                                        title="Restablecer contraseña"
                                                    >
                                                        <KeyRound size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmDelete(user.id)}
                                                        className="p-2.5 bg-white text-gray-400 border border-red-50 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                                                        title="Eliminar usuario"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="grid gap-3 p-4 md:hidden">
                        {filteredUsers.map((user) => (
                            <article key={`mobile-${user.id}`} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-black text-black">{user.name}</p>
                                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                                        <p className="mt-2 text-[11px] font-bold text-gray-500">
                                            {formatDate(user.birthdate)}
                                            {canSeeRole(user) && user.role ? ` · ${roleLabel(user.role)}` : ' · Rol privado'}
                                        </p>
                                    </div>
                                    {canOperateOnUser(user) && (
                                        <div className="flex shrink-0 gap-2">
                                            {canManageRoles && user.id !== currentUser?.id && (
                                                <button onClick={() => setRoleUser(user)} className="rounded-xl border border-red-100 p-2.5 text-store-red" aria-label={user.role === 'admin' ? 'Quitar rol administrador' : 'Asignar rol administrador'}><ShieldCheck size={15} /></button>
                                            )}
                                            <button onClick={() => openResetPassword(user)} className="rounded-xl border border-amber-100 p-2.5 text-amber-700" aria-label="Restablecer contraseña"><KeyRound size={15} /></button>
                                            <button onClick={() => setConfirmDelete(user.id)} className="rounded-xl border border-red-100 p-2.5 text-red-500" aria-label="Eliminar usuario"><Trash2 size={15} /></button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {roleUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4200] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-7 w-full max-w-md shadow-2xl">
                        <div className="w-14 h-14 bg-red-50 text-store-red rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <ShieldCheck size={28} />
                        </div>
                        <h3 className="text-xl font-black text-center">
                            {roleUser.role === 'admin' ? 'Quitar rol Administrador' : 'Asignar rol Administrador'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 text-center">
                            Usuario: <strong>{roleUser.name}</strong>
                        </p>
                        <p className="mt-4 rounded-xl bg-gray-50 p-3 text-xs font-medium text-gray-600">
                            {roleUser.role === 'admin'
                                ? 'La cuenta volverá a tener permisos de usuario cliente.'
                                : 'La cuenta tendrá acceso al panel administrativo de la plataforma.'}
                            {' '}Las sesiones activas de esta cuenta se cerrarán para aplicar el cambio de permisos.
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setRoleUser(null)}
                                disabled={changingRole}
                                className="rounded-xl bg-gray-100 px-4 py-3 text-xs font-black uppercase"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRoleChange}
                                disabled={changingRole}
                                className="rounded-xl bg-store-red px-4 py-3 text-xs font-black uppercase text-white disabled:opacity-50"
                            >
                                {changingRole ? 'Guardando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {resetUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-7 w-full max-w-md shadow-2xl">
                        <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-5"><KeyRound size={28} /></div>
                        <h3 className="text-xl font-black text-center">Restablecer contraseña</h3>
                        <p className="mt-2 text-sm text-gray-500 text-center">Usuario: <strong>{resetUser.name}</strong></p>
                        {!temporaryPassword ? (
                            <>
                                <label className="mt-6 flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-semibold">
                                    <input type="checkbox" checked={sendResetEmail} onChange={(event) => setSendResetEmail(event.target.checked)} />
                                    Enviar también la contraseña temporal por correo
                                </label>
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button onClick={() => setResetUser(null)} disabled={resetting} className="rounded-xl bg-gray-100 px-4 py-3 text-xs font-black uppercase">Cancelar</button>
                                    <button onClick={handleResetPassword} disabled={resetting} className="rounded-xl bg-black px-4 py-3 text-xs font-black uppercase text-white">{resetting ? 'Generando...' : 'Confirmar'}</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="mt-5 text-xs text-gray-500">Esta contraseña se muestra una sola vez. El usuario deberá cambiarla al iniciar sesión.</p>
                                <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                    <code className="flex-1 break-all font-black">{temporaryPassword}</code>
                                    <button onClick={copyTemporaryPassword} className="rounded-lg bg-white p-2 text-gray-700" title="Copiar contraseña">
                                        {copied ? <Check size={17} /> : <Copy size={17} />}
                                    </button>
                                </div>
                                <button onClick={() => setResetUser(null)} className="mt-6 w-full rounded-xl bg-store-red px-4 py-3 text-xs font-black uppercase text-white">Cerrar</button>
                            </>
                        )}
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