import { useEffect, useState } from 'react';
import { MessageSquare, Phone, RefreshCw, X, User, MessageCircle, ShoppingBag } from 'lucide-react';
import { orderService, Order } from '../../services/crudService';

const MessagesManager = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getAll();
            setOrders(response.data?.data || []);
            setError(null);
        } catch {
            setError('No se pudieron cargar los clientes compradores. Verifica tu sesión.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const getPhone = (order: Order) => order.shipping_phone || order.user?.phone || '';
    const getCustomerName = (order: Order) => order.customer_name || order.user?.name || 'Cliente';
    const whatsappUrl = (order: Order) => `https://wa.me/${getPhone(order).replace(/[^0-9]/g, '')}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3"><MessageSquare size={26} className="text-store-red" /> CHAT</h2>
                    <p className="text-xs text-gray-400 font-medium mt-1">Clientes que ya realizaron una compra ({orders.length} pedidos)</p>
                </div>
                <button onClick={fetchOrders} className="flex items-center gap-2 px-6 py-3 bg-store-red text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-store-redDark transition-all shadow-lg"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualizar</button>
            </div>

            {loading && <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-store-red border-t-transparent rounded-full animate-spin" /></div>}
            {error && <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6 text-red-600 font-bold text-sm">{error}</div>}
            {!loading && !error && orders.length === 0 && <div className="bg-white/40 border border-gray-200 rounded-[2rem] p-12 text-center"><ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-bold text-lg">Aún no hay clientes compradores.</p><p className="text-gray-300 font-medium text-sm mt-1">El chat estará disponible después de una compra.</p></div>}

            {!loading && orders.length > 0 && <div className="bg-white/40 rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left border-collapse min-w-[760px]"><thead><tr className="border-b border-gray-100 bg-store-red/5"><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Cliente</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Pedido</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Compra</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Estado</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">WhatsApp</th></tr></thead><tbody className="divide-y divide-gray-100">{orders.map((order) => { const phone = getPhone(order); return <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-store-red/[0.02] transition-colors cursor-pointer"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-store-red text-white rounded-xl flex items-center justify-center font-black text-[10px]">{getCustomerName(order).slice(0, 1).toUpperCase()}</div><div><p className="font-bold text-black text-xs">{getCustomerName(order)}</p><span className="text-[10px] text-gray-400">{order.user?.email || 'Cliente registrado'}</span></div></div></td><td className="px-6 py-4 text-xs font-black text-black">{order.code}</td><td className="px-6 py-4"><p className="text-xs font-bold text-black">{order.items?.map((item) => `${item.product_name || 'Producto'} x${item.quantity}`).join(', ') || 'Pedido registrado'}</p><span className="text-[10px] text-gray-400">{formatDate(order.created_at)} · S/ {Number(order.total).toFixed(2)}</span></td><td className="px-6 py-4"><span className="px-3 py-1 rounded-full bg-gray-100 text-[10px] font-black uppercase">{order.status}</span></td><td className="px-6 py-4"><a onClick={(event) => event.stopPropagation()} href={phone ? whatsappUrl(order) : '#'} target="_blank" rel="noreferrer" className={`flex items-center gap-2 text-xs font-bold ${phone ? 'text-green-600' : 'text-gray-300 pointer-events-none'}`}><Phone size={13} /> {phone || 'Sin teléfono'}</a></td></tr>; })}</tbody></table></div></div>}

            {selectedOrder && <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/60" onClick={() => setSelectedOrder(null)} /><div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden"><div className="bg-store-red/5 px-8 py-7 flex justify-between items-center"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center"><User size={24} /></div><div><h3 className="text-xl font-black text-black">CHAT de cliente</h3><p className="text-[10px] text-store-red font-bold uppercase tracking-widest">Pedido {selectedOrder.code}</p></div></div><button onClick={() => setSelectedOrder(null)} className="p-2 bg-white rounded-full"><X size={18} /></button></div><div className="p-8 space-y-4"><p className="font-bold">{getCustomerName(selectedOrder)}</p><p className="text-sm text-gray-500">{selectedOrder.user?.email || 'Sin correo registrado'}</p><p className="text-sm text-gray-500">Total comprado: S/ {Number(selectedOrder.total).toFixed(2)}</p><p className="text-sm text-gray-500">Compra realizada: {formatDate(selectedOrder.created_at)}</p></div><div className="px-8 py-6 bg-gray-50 flex justify-end"><a href={getPhone(selectedOrder) ? whatsappUrl(selectedOrder) : '#'} target="_blank" rel="noreferrer" className={`px-6 py-3 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 ${!getPhone(selectedOrder) ? 'pointer-events-none opacity-50' : ''}`}><MessageCircle size={14} /> Abrir WhatsApp</a></div></div></div>}
        </div>
    );
};

export default MessagesManager;
