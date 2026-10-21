import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, RefreshCw, Search, ShoppingBag, Wallet } from 'lucide-react';
import { orderService, type Order } from '../../services/crudService';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

type Props = { mode: 'sales' | 'reports' };
const money = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
const amount = (value: number | string | undefined) => Number(value || 0) || 0;
const isPaid = (order: Order) => {
  const payment = String(order.payment_status || '').toLowerCase();
  const status = String(order.status || '').toLowerCase();
  return ['paid', 'completed', 'succeeded', 'success', 'pagado'].includes(payment)
    || (payment === '' && ['paid', 'completed', 'delivered', 'entregado'].includes(status));
};
const dateLabel = (value?: string) => value && !Number.isNaN(new Date(value).getTime())
  ? new Date(value).toLocaleDateString('es-MX') : '—';

const csvCell = (value: unknown) => {
  const raw = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
};

const CommerceManager = ({ mode }: Props) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await orderService.getAll();
      const data = response.data as unknown as Order[] | { data?: Order[] };
      setOrders(Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []));
    } catch (exception: any) {
      setError(exception?.response?.data?.message || 'No se pudieron cargar las ventas.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void loadOrders(); }, []);

  const paid = useMemo(() => orders.filter(isPaid), [orders]);
  const total = useMemo(() => paid.reduce((sum, order) => sum + amount(order.total), 0), [paid]);
  const filtered = useMemo(() => orders.filter(order => {
    if (filter === 'paid' && !isPaid(order)) return false;
    if (filter === 'pending' && isPaid(order)) return false;
    const term = search.toLocaleLowerCase().trim();
    return !term || [order.code, order.customer_name, order.customer_email, order.payment_status, order.status]
      .some(value => String(value || '').toLocaleLowerCase().includes(term));
  }).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))), [orders, search, filter]);

  const pagination = usePagination(filtered, 25);
  useEffect(() => { pagination.resetPage(); }, [search, filter]);

  const exportCsv = () => {
    const rows: unknown[][] = [
      ['Pedido', 'Fecha', 'Cliente', 'Correo', 'Estado', 'Estado de pago', 'Total MXN'],
      ...filtered.map(order => [order.code, dateLabel(order.created_at), order.customer_name || order.user?.name || '',
        order.customer_email || order.user?.email || '', order.status, order.payment_status || '', amount(order.total)]),
    ];
    const blob = new Blob(['\uFEFF', rows.map(row => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Angelita_${mode === 'reports' ? 'Reporte_Ventas' : 'Ventas'}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5" aria-label={mode === 'sales' ? 'Ventas' : 'Reportes de ventas'}>
      <div className="flex flex-col gap-4 rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-store-red">Gestión comercial</p>
          <h2 className="mt-1 text-2xl font-black text-black">{mode === 'reports' ? 'Reportes de ventas' : 'Ventas y pedidos'}</h2>
          <p className="mt-1 text-xs text-gray-500">Datos obtenidos de los pedidos de la tienda. Los ingresos incluyen únicamente pagos confirmados.</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void loadOrders()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-black uppercase text-gray-700 hover:border-store-red disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Actualizar
          </button>
          <button type="button" onClick={exportCsv} disabled={loading || Boolean(error)} className="inline-flex items-center gap-2 rounded-xl bg-store-red px-4 py-3 text-xs font-black uppercase text-white hover:bg-store-redDark disabled:opacity-50">
            <Download size={16}/> Exportar CSV
          </button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><ShoppingBag size={21} className="text-store-red"/><p className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Pedidos registrados</p><p className="text-3xl font-black">{orders.length}</p></div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><BarChart3 size={21} className="text-store-red"/><p className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Pagos confirmados</p><p className="text-3xl font-black">{paid.length}</p></div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><Wallet size={21} className="text-store-red"/><p className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Ventas pagadas (MXN)</p><p className="text-2xl font-black">{money(total)}</p></div>
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row">
          <label className="relative block max-w-lg flex-1"><Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input aria-label="Buscar ventas" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pedido, cliente o estado"
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm outline-none focus:border-store-red" /></label>
          <select aria-label="Estado del pago" value={filter} onChange={event => setFilter(event.target.value as typeof filter)}
            className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-700">
            <option value="all">Todos los pagos</option><option value="paid">Pagados</option><option value="pending">No confirmados</option>
          </select>
        </div>
        {error && <p role="alert" className="mx-5 mt-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left">
          <thead className="bg-store-red/5 text-[10px] font-black uppercase tracking-widest text-store-red"><tr><th className="px-5 py-4">Pedido</th><th className="px-5 py-4">Cliente</th><th className="px-5 py-4">Fecha</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4">Pago</th><th className="px-5 py-4 text-right">Total</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={6} className="p-12 text-center text-gray-500">Cargando ventas...</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-gray-500">No se encontraron pedidos.</td></tr>
              : pagination.paginatedItems.map(order => <tr key={order.id} className="text-xs text-gray-700 hover:bg-red-50/30">
                <td className="px-5 py-4 font-black text-black">{order.code || '#' + order.id}</td>
                <td className="px-5 py-4"><div className="font-bold">{order.customer_name || order.user?.name || 'Sin nombre'}</div><div className="text-[10px] text-gray-400">{order.customer_email || order.user?.email || ''}</div></td>
                <td className="px-5 py-4">{dateLabel(order.created_at)}</td><td className="px-5 py-4">{order.status}</td>
                <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${isPaid(order) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{isPaid(order) ? 'Confirmado' : 'Pendiente'}</span></td>
                <td className="px-5 py-4 text-right font-black">{money(amount(order.total))}</td>
              </tr>)}
          </tbody>
        </table></div>
        <Pagination page={pagination.page} pageSize={pagination.pageSize} totalItems={pagination.totalItems} onPageChange={pagination.setPage} onPageSizeChange={pagination.setPageSize}/>
      </div>
    </section>
  );
};

export default CommerceManager;
