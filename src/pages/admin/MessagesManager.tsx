import { useState, useEffect } from 'react';
import { MessageSquare, Phone, Users, Home, RefreshCw, X, Calendar, User, MessageCircle } from 'lucide-react';
import { leadService, Lead } from '../../services/crudService';

const MessagesManager = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await leadService.getAll();
            const data = (res.data as any)?.data ?? res.data;
            const validLeads = Array.isArray(data) ? data.filter(l => l.first_name || l.phone) : [];
            setLeads(validLeads);
        } catch (e) {
            setError('No se pudo cargar los mensajes. Verifica tu sesión.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeads(); }, []);

    const handleDelete = async (id: number) => {
        try {
            await leadService.delete(id);
            setLeads(leads.filter(l => l.id !== id));
            setConfirmDelete(null);
            if (selectedLead?.id === id) setSelectedLead(null);
        } catch (err) {
            alert('Error al eliminar el mensaje.');
        }
    };

    const handleMarkAsRead = async (lead: Lead) => {
        if (lead.id && !lead.is_read) {
            try {
                await leadService.update(lead.id, { is_read: true });
                setLeads(leads.map(l => l.id === lead.id ? { ...l, is_read: true } : l));
            } catch (err) {
                console.error('Error marking as read:', err);
            }
        }
    };

    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-minimal-olive/10 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                        <MessageSquare size={26} className="text-minimal-gold" /> Mensajes
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                        Solicitudes de interés enviadas por los usuarios ({leads.length} en total)
                    </p>
                </div>
                <button
                    onClick={fetchLeads}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg"
                >
                    <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    Actualizar
                </button>
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

            {!loading && !error && leads.length === 0 && (
                <div className="bg-white/40 backdrop-blur-sm border border-minimal-olive/10 rounded-[2rem] p-12 text-center shadow-sm">
                    <MessageSquare size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold text-lg">Aún no hay mensajes.</p>
                    <p className="text-gray-300 font-medium text-sm mt-1">Aparecerán aquí cuando un usuario complete el formulario de interés.</p>
                </div>
            )}

            {!loading && leads.length > 0 && (
                <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] border border-minimal-olive/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-minimal-olive/5 bg-minimal-olive/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Solicitante</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Propiedad</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Estadía</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Huéspedes</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Contacto</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-minimal-olive/5">
                                {leads.map((lead) => (
                                    <tr 
                                        key={lead.id} 
                                        onClick={() => {
                                            setSelectedLead(lead);
                                            handleMarkAsRead(lead);
                                        }}
                                        className={`hover:bg-minimal-olive/[0.02] transition-colors group cursor-pointer ${!lead.is_read ? 'bg-minimal-gold/[0.03]' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 ${!lead.is_read ? 'bg-minimal-gold text-white' : 'bg-white text-minimal-gold'} border border-minimal-gold/20 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm transition-colors`}>
                                                    {(lead.first_name?.[0] ?? '?').toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-black text-xs leading-tight ${!lead.is_read ? 'font-black' : ''}`}>
                                                        {lead.first_name} {lead.last_name}
                                                    </p>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">ID: #{lead.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-black bg-white/50 px-2 py-1 rounded-lg border border-minimal-olive/5 w-fit shadow-sm">
                                                <Home size={12} className="text-minimal-gold" />
                                                <span className="truncate max-w-[150px]">{lead.property_title ?? `Propiedad #${lead.item_id}`}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[10px] font-bold text-black">{formatDate(lead.check_in)}</span>
                                                <span className="text-[10px] text-gray-400">hasta {formatDate(lead.check_out)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-black">
                                            <div className="flex items-center gap-1.5 bg-gray-50/50 px-3 py-1 rounded-full w-fit">
                                                <Users size={12} className="text-gray-400" />
                                                {lead.guests ?? 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                <Phone size={12} className="text-minimal-gold" />
                                                {lead.phone ?? '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                {formatDate(lead.created_at)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => lead.id && setConfirmDelete(lead.id)}
                                                className="p-3 bg-white text-gray-400 border border-red-50 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                                            >
                                                <X size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        {/* Modal de Detalle de Mensaje */}
        {selectedLead && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
                <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-minimal-olive/10">
                    {/* Header Modal */}
                    <div className="bg-minimal-olive/5 px-8 py-8 flex justify-between items-center border-b border-minimal-olive/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-black leading-tight">Solicitud de Reserva</h3>
                                <p className="text-[10px] text-minimal-gold font-bold uppercase tracking-widest mt-1">ID: #{selectedLead.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => selectedLead.id && setConfirmDelete(selectedLead.id)}
                                className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-100"
                                title="Eliminar mensaje"
                            >
                                <X size={20} />
                            </button>
                            <button onClick={() => setSelectedLead(null)} className="p-2 bg-white/50 hover:bg-gray-100 text-gray-500 rounded-full transition-all border border-minimal-olive/5">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Content Modal */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</label>
                                <p className="text-sm font-bold text-black">{selectedLead.first_name} {selectedLead.last_name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Teléfono/WhatsApp</label>
                                <p className="text-sm font-bold text-black flex items-center gap-2">
                                    <MessageCircle size={14} className="text-green-500" />
                                    {selectedLead.phone ?? '—'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Propiedad de Interés</label>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-minimal-gold shadow-sm border border-gray-100">
                                    <Home size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-black">{selectedLead.property_title ?? `ID Propiedad: #${selectedLead.item_id}`}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">Solicitud enviada el {formatDate(selectedLead.created_at)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border border-gray-100 rounded-2xl">
                                <Calendar className="text-minimal-gold mb-2" size={16} />
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Check-in</label>
                                <p className="text-xs font-bold text-black">{formatDate(selectedLead.check_in)}</p>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-2xl">
                                <Calendar className="text-minimal-gold mb-2" size={16} />
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Check-out</label>
                                <p className="text-xs font-bold text-black">{formatDate(selectedLead.check_out)}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black text-white rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Users size={18} className="text-minimal-gold" />
                                <span className="text-xs font-bold">Cantidad de Huéspedes</span>
                            </div>
                            <span className="text-lg font-black">{selectedLead.guests ?? 1}</span>
                        </div>
                    </div>

                    {/* Footer Modal */}
                    <div className="px-8 py-6 bg-gray-50 flex justify-end gap-3">
                        <button 
                            onClick={() => setSelectedLead(null)}
                            className="px-6 py-3 bg-white border border-gray-200 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-sm active:scale-95"
                        >
                            Cerrar Ventana
                        </button>
                        <a 
                            href={`https://wa.me/${selectedLead.phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            <MessageCircle size={14} /> Responder
                        </a>
                    </div>
                </div>
            </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-minimal-olive/10 animate-in fade-in zoom-in duration-200">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <X size={32} />
                    </div>
                    <h3 className="text-xl font-black text-black text-center mb-2">¿Eliminar Mensaje?</h3>
                    <p className="text-sm text-gray-400 text-center mb-8 font-medium">Esta solicitud de reserva se borrará permanentemente de tu base de datos.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setConfirmDelete(null)}
                            className="px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={() => handleDelete(confirmDelete)}
                            className="px-6 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default MessagesManager;
