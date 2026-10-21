import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Mail, Phone, RefreshCw, Search, UserRound, Users } from 'lucide-react';
import { userService, type User } from '../../services/crudService';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

const isCustomer = (user: User) => !user.role || String(user.role).toLowerCase() === 'user';

const formatDate = (value?: string) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const CustomerManager = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAll();
      const payload = response.data as User[] | { data?: User[] };
      const records = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
      setCustomers(records.filter(isCustomer));
    } catch (exception: any) {
      setError(exception?.response?.data?.message || 'No se pudo cargar la lista de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadCustomers(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...customers]
      .filter((customer) => [customer.name, customer.email, customer.phone].some(
        (value) => String(value || '').toLocaleLowerCase().includes(query),
      ))
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  }, [customers, search]);

  const pagination = usePagination(filtered, 25);
  useEffect(() => { pagination.resetPage(); }, [search]);

  return (
    <section className="space-y-5" aria-label="Lista de clientes">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-store-red">Gestión comercial</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-black">Lista de Clientes</h2>
          <p className="mt-1 text-xs font-medium text-gray-500">Cuentas de clientes registradas en Zapatería Angelita.</p>
        </div>
        <button type="button" onClick={() => void loadCustomers()} disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-700 transition hover:border-store-red hover:text-store-red disabled:opacity-50">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualizar lista
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><Users size={20} className="text-store-red" /><p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-400">Clientes registrados</p><p className="text-3xl font-black">{customers.length}</p></div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><Mail size={20} className="text-store-red" /><p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-400">Con correo</p><p className="text-3xl font-black">{customers.filter(customer => Boolean(customer.email)).length}</p></div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><Phone size={20} className="text-store-red" /><p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-400">Con teléfono</p><p className="text-3xl font-black">{customers.filter(customer => Boolean(customer.phone)).length}</p></div>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <label className="relative block max-w-md"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={event => setSearch(event.target.value)}
              aria-label="Buscar clientes" placeholder="Buscar cliente por nombre, correo o teléfono..."
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-store-red" />
          </label>
        </div>
        {error && <div role="alert" className="mx-5 mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error} <button type="button" className="ml-3 underline" onClick={() => void loadCustomers()}>Reintentar</button></div>}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-store-red/5 text-[10px] font-black uppercase tracking-widest text-store-red">
              <tr><th className="px-6 py-4">Cliente</th><th className="px-6 py-4">Correo electrónico</th><th className="px-6 py-4">Teléfono</th><th className="px-6 py-4">Registro</th><th className="px-6 py-4">Tipo</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? <tr><td colSpan={5} className="p-12 text-center text-sm text-gray-500">Cargando clientes...</td></tr>
                : filtered.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-sm text-gray-500">No se encontraron clientes.</td></tr>
                : pagination.paginatedItems.map(customer => (
                  <tr key={customer.id} className="hover:bg-red-50/30">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-store-red"><UserRound size={18}/></span><div><p className="text-sm font-black text-gray-900">{customer.name || 'Sin nombre'}</p><p className="text-[10px] text-gray-400">ID #{customer.id}</p></div></div></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.email ? <a className="hover:text-store-red hover:underline" href={`mailto:${customer.email}`}>{customer.email}</a> : '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || '—'}</td>
                    <td className="px-6 py-4 text-xs text-gray-600"><span className="inline-flex items-center gap-2"><CalendarDays size={14} className="text-gray-400"/>{formatDate(customer.created_at)}</span></td>
                    <td className="px-6 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">Cliente</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Pagination page={pagination.page} pageSize={pagination.pageSize} totalItems={pagination.totalItems} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize} />
      </div>
    </section>
  );
};

export default CustomerManager;
