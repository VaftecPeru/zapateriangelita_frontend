import { useEffect, useState } from 'react';
import { Eye, MessageCircle, MessageSquare, RefreshCw, ShoppingBag, User, X } from 'lucide-react';
import { analyticsService, orderService, Order } from '../../services/crudService';
import { useAuth } from '../../hooks/useAuth';
import { canInspectOrderVoucher, isOrderPaid } from '../../utils/orderVoucher';
import OrderVoucherModal from './OrderVoucherModal';

const money = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
});

const statusOptions = [
    { value: 'sin_preparar', label: 'Sin preparar' },
    { value: 'preparado', label: 'Preparado' },
    { value: 'enviado', label: 'Enviado' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'finalizado', label: 'Finalizado' },
];

const MessagesManager = () => {
    const { user } = useAuth();
    const canInspectVoucher = canInspectOrderVoucher(user?.role);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [articleOrder, setArticleOrder] = useState<Order | null>(null);
    const [voucherOrder, setVoucherOrder] = useState<Order | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getAll();
            const ordersData = response.data?.data || [];
            setOrders(ordersData.map((order) => order.customer_email
                ? {
                    ...order,
                    user: {
                        id: order.user?.id || 0,
                        name: order.user?.name || order.customer_name || 'Cliente',
                        email: order.customer_email,
                        phone: order.user?.phone,
                    },
                }
                : order));
            setError(null);
        } catch {
            setError('No se pudieron cargar los clientes compradores. Verifica tu sesión.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const updateOrderStatus = async (order: Order, status: string) => {
        setUpdatingOrderId(order.id);
        try {
            const response = await orderService.updateStatus(order.id, status);
            setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: response.data.status } : item));
            setSelectedOrder((current) => current?.id === order.id ? { ...current, status: response.data.status } : current);
            setError(null);
        } catch {
            setError('No se pudo actualizar el estado del pedido.');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const formatDate = (date?: string) => date ? new Date(date).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
    const displayStatus = (status?: string) => status === 'cancelado' ? 'finalizado' : (status || 'sin_preparar');
    const getPhone = (order: Order) => order.shipping_phone || order.user?.phone || '';
    const getCustomerName = (order: Order) => order.customer_name || order.user?.name || 'Cliente';
    const getCustomerEmail = (order: Order) => order.customer_email || order.user?.email || '';
    const getArticleCount = (order: Order) => order.items?.reduce((total, item) => total + Number(item.quantity || 0), 0) || 0;
    const whatsappUrl = (order: Order) => `https://wa.me/${getPhone(order).replace(/[^0-9]/g, '')}`;
    const isPaid = (order: Order) => isOrderPaid(order);
    const paymentLabel = (order: Order) => {
        if (isPaid(order)) return 'Pagado';
        const status = String(order.payment_status || '').toLowerCase();
        if (status === 'processing' || status === 'in_progress' || status === 'charge_pending') return 'Procesando';
        if (status === 'failed' || status === 'cancelled') return 'Fallido';
        return 'Pendiente';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3"><MessageSquare size={26} className="text-store-red" />PEDIDO</h2>
                    <p className="text-xs text-gray-400 font-medium mt-1">Clientes que ya realizaron una compra ({orders.length} pedidos)</p>
                </div>
                <button onClick={fetchOrders} className="flex items-center gap-2 px-6 py-3 bg-store-red text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-store-redDark transition-all shadow-lg"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualizar</button>
            </div>

            {loading && <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-store-red border-t-transparent rounded-full animate-spin" /></div>}
            {error && <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 text-red-600 font-bold text-sm">{error}</div>}
            {!loading && !error && orders.length === 0 && <div className="bg-white/40 border border-gray-200 rounded-[2rem] p-12 text-center"><ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-bold text-lg">Aún no hay clientes compradores.</p><p className="text-gray-300 font-medium text-sm mt-1">El chat estará disponible después de una compra.</p></div>}

            {!loading && orders.length > 0 && (
                <div className="bg-white/40 rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[980px]">
                            <thead><tr className="border-b border-gray-100 bg-store-red/5"><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Pedido</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Cliente</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Estado del pago</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Estado de preparación</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Artículos</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Voucher</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">WhatsApp</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => {
                                    const phone = getPhone(order);
                                    return <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-store-red/[0.02] transition-colors cursor-pointer">
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-black text-black">{order.code}</p>
                                            <p className="mt-1 text-[10px] font-bold text-gray-400">{formatDate(order.created_at)}</p>
                                        </td>

                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-store-red text-white rounded-xl flex items-center justify-center font-black text-[10px]">{getCustomerName(order).slice(0, 1).toUpperCase()}</div><div><p className="font-bold text-black text-xs">{getCustomerName(order)}</p><span className="block text-[10px] text-gray-400">{getCustomerEmail(order) || 'Sin correo registrado'}</span><span className="mt-0.5 block text-[10px] font-bold text-gray-500">{getPhone(order) || 'Sin teléfono'}</span></div></div></td>
                                        <td className="px-6 py-4"><span className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider ${isPaid(order) ? 'bg-green-50 text-green-700' : order.payment_status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}><span className={`w-2 h-2 rounded-full ${isPaid(order) ? 'bg-green-500' : order.payment_status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`} /> {paymentLabel(order)}</span></td>
                                        <td className="px-6 py-4" onClick={(event) => event.stopPropagation()}><select value={displayStatus(order.status)} disabled={updatingOrderId === order.id} onChange={(event) => updateOrderStatus(order, event.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-[10px] font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-store-red/30">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></td>
                                        <td className="px-6 py-4" onClick={(event) => { event.stopPropagation(); setArticleOrder(order); }}><button type="button" className="text-left group"><p className="text-xs font-bold text-black group-hover:text-store-red underline decoration-dotted underline-offset-4">{getArticleCount(order)} {getArticleCount(order) === 1 ? 'artículo' : 'artículos'}</p><span className="text-[10px] text-gray-400">Ver artículos pedidos</span></button></td>
                                        <td className="px-6 py-4" onClick={(event) => event.stopPropagation()}>
                                            <button
                                                type="button"
                                                onClick={() => setVoucherOrder(order)}
                                                disabled={!canInspectVoucher}
                                                title={canInspectVoucher ? (isPaid(order) ? 'Ver voucher y QR' : 'Ver detalle provisional del voucher') : 'Disponible solo para Administrador y Superadmin'}
                                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-700 transition hover:border-store-red hover:text-store-red disabled:cursor-not-allowed disabled:opacity-35"
                                            >
                                                <Eye size={14} /> Ver
                                            </button>
                                        </td>
                                        <td className="px-6 py-4" onClick={(event) => event.stopPropagation()}><a href={phone ? whatsappUrl(order) : '#'} target="_blank" rel="noreferrer" onClick={() => { if (phone) void analyticsService.track('whatsapp_click', undefined, { source: 'admin_orders', order_id: order.id }).catch(() => undefined); }} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-[10px] font-black uppercase tracking-widest ${!phone ? 'pointer-events-none opacity-40' : ''}`}><MessageCircle size={13} /> WhatsApp</a></td>
                                    </tr>;
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedOrder && <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} /><div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"><div className="bg-store-red/5 px-8 py-7 flex justify-between items-center"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center"><User size={24} /></div><div><h3 className="text-xl font-black text-black">PEDIDO de cliente</h3><p className="text-[10px] text-store-red font-bold uppercase tracking-widest">Pedido {selectedOrder.code}</p></div></div><button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full"><X size={18} /></button></div><div className="p-8 space-y-4"><p className="font-bold">{getCustomerName(selectedOrder)}</p><p className="text-sm text-gray-500">{selectedOrder.user?.email || 'Sin correo registrado'}</p><p className="text-sm text-gray-500">Total comprado: {money.format(Number(selectedOrder.total || 0))}</p><p className="text-sm text-gray-500">Compra realizada: {formatDate(selectedOrder.created_at)}</p><label className="block text-xs font-black uppercase tracking-widest text-gray-500">Estado del pedido<select value={displayStatus(selectedOrder.status)} disabled={updatingOrderId === selectedOrder.id} onChange={(event) => updateOrderStatus(selectedOrder, event.target.value)} className="mt-2 w-full px-3 py-3 rounded-xl border border-gray-200 bg-white text-xs font-bold">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div><div className="px-8 py-6 bg-gray-50 flex justify-end"><a href={getPhone(selectedOrder) ? whatsappUrl(selectedOrder) : '#'} target="_blank" rel="noreferrer" onClick={() => { if (getPhone(selectedOrder)) void analyticsService.track('whatsapp_click', undefined, { source: 'admin_order_detail', order_id: selectedOrder.id }).catch(() => undefined); }} className={`px-6 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 ${!getPhone(selectedOrder) ? 'pointer-events-none opacity-50' : ''}`}><MessageCircle size={14} /> Abrir WhatsApp</a></div></div></div>}
            {voucherOrder && <OrderVoucherModal order={voucherOrder} onClose={() => setVoucherOrder(null)} />}
            {articleOrder && <div className="fixed inset-0 z-[3100] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/60" onClick={() => setArticleOrder(null)} /><div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden"><div className="bg-store-red/5 px-8 py-6 flex justify-between items-center"><div><h3 className="text-xl font-black text-black">Artículos pedidos</h3><p className="text-[10px] text-store-red font-bold uppercase tracking-widest mt-1">Pedido {articleOrder.code}</p></div><button onClick={() => setArticleOrder(null)} className="p-2 bg-white rounded-full"><X size={18} /></button></div><div className="p-8 space-y-3">{articleOrder.items?.length ? articleOrder.items.map((item, index) => <div key={`${articleOrder.id}-${index}`} className="border-b border-gray-100 pb-4 last:border-0"><div className="flex items-start justify-between gap-4"><span className="text-sm font-bold text-black">{item.product_name || 'Producto'}</span><span className="shrink-0 rounded-lg bg-gray-100 px-3 py-1 text-xs font-black text-gray-800">x{item.quantity}</span></div><div className="mt-2 flex flex-wrap gap-2 text-[11px] text-gray-800"><span className="rounded-lg bg-gray-100 px-2 py-1">Talla: {item.size || 'No especificada'}</span><span className="rounded-lg bg-gray-100 px-2 py-1">Color: {item.color || 'No especificado'}</span></div>{item.unit_price !== undefined && <p className="mt-2 text-[11px] text-gray-700">Precio unitario: S/ {Number(item.unit_price).toFixed(2)}</p>}</div>) : <p className="text-sm text-gray-700">No hay artículos registrados en este pedido.</p>}</div></div></div>}
        </div>
    );
};

export default MessagesManager;
