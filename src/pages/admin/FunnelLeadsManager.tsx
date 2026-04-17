import { useState, useEffect } from 'react';
import { Target, Phone, X, RefreshCw, User, MessageCircle, Info, Trash2 } from 'lucide-react';
import { leadService, Lead } from '../../services/crudService';

interface FunnelLeadsManagerProps {
    initialData?: Lead[];
}

const FunnelLeadsManager = ({ initialData }: FunnelLeadsManagerProps) => {
    const [leads, setLeads] = useState<Lead[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

    const fetchLeads = async (force = false) => {
        if (!force && initialData && leads.length > 0) return; // Skip only for initial mount if data exists
        setLoading(true);
        try {
            const res = await leadService.getAll();
            // Extracción robusta que soporta respuesta directa o envuelta (.data o .data.data)
            const data = (res as any)?.data?.data || (res as any)?.data || res;
            
            // Un filtro más inclusivo para no perder registros por campos nulos secundarios
            const validLeads = Array.isArray(data) 
                ? data.filter(l => l.type === 'service' || (!l.type && l.property_title?.includes('Funnel'))) 
                : [];
            setLeads(validLeads);
        } catch (e) {
            if (!initialData) {
                setError('No se pudo cargar los listados. Verifica tu sesión.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initialData) {
            const validLeads = initialData.filter(l => l.type === 'service' || (!l.type && l.property_title?.includes('Funnel')));
            setLeads(validLeads);
            setLoading(false);
        } else {
            fetchLeads();
        }
    }, [initialData]);

    const handleDelete = async (id: number) => {
        try {
            await leadService.delete(id);
            setLeads(leads.filter(l => l.id !== id));
            setConfirmDelete(null);
            if (selectedLead?.id === id) setSelectedLead(null);
        } catch (err) {
            alert('Error al eliminar el registro.');
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

    // Helper para extraer datos de los servicios adicionales
    const getAdditionalServiceMapping = (services: any[]) => {
        const result: Record<string, string> = { zona: 'No especificada', presupuesto: 'No especificado' };
        if (!services || !Array.isArray(services)) return result;
        
        let lastKey = '';
        services.forEach(s => {
            if (s.name === 'Zona' || s.name === 'Presupuesto' || s.name === 'Timeline' || s.name === 'Espacio') {
                lastKey = s.name.toLowerCase();
            } else if (lastKey && s.price === 0) {
                result[lastKey] = s.name;
                lastKey = '';
            }
        });
        return result;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-minimal-olive/10 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-3">
                        <Target size={26} className="text-minimal-gold" /> Interesados Reserva
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                        Prospectos captados a través del embudo de la portada ({leads.length} encontrados)
                    </p>
                </div>
                <button
                    onClick={() => fetchLeads(true)}
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
                    <Target size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold text-lg">No hay interesados aún.</p>
                    <p className="text-gray-300 font-medium text-sm mt-1">Aparecerán aquí cuando un usuario complete el formulario principal.</p>
                </div>
            )}

            {!loading && leads.length > 0 && (
                <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] border border-minimal-olive/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-minimal-olive/5 bg-minimal-olive/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Prospecto</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Datos de Contacto</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Ubicación Solicitada</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Presupuesto</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Fecha Creación</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-minimal-olive/5">
                                {leads.map((lead) => {
                                    const details = getAdditionalServiceMapping(lead.additional_services || []);
                                    return (
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
                                                    <div className={`w-8 h-8 ${!lead.is_read ? 'bg-[#708238] text-white' : 'bg-white text-[#708238]'} border border-[#708238]/20 rounded-xl flex items-center justify-center font-black text-[10px] shadow-sm transition-colors`}>
                                                        {(lead.first_name?.[0] ?? '?').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-black text-xs leading-tight ${!lead.is_read ? 'font-black' : ''}`}>
                                                            {lead.first_name} {lead.last_name !== '(Funnel)' ? lead.last_name : ''}
                                                        </p>
                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">ID: #{lead.id}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <span className="font-bold text-gray-600 flex items-center gap-1"><Phone size={10} className="text-minimal-gold"/> {lead.phone ?? '—'}</span>
                                                    {lead.email && <span className="font-bold text-gray-400">{lead.email}</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-[10px] font-black uppercase tracking-widest text-black bg-gray-50/50 px-3 py-1.5 rounded-full w-fit">
                                                    {details.zona}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-black">{details.presupuesto}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                    {formatDate(lead.created_at)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => lead.id && setConfirmDelete(lead.id)}
                                                    className="p-2.5 bg-white text-gray-400 border border-red-50 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                                                    title="Eliminar interesado"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        {selectedLead && (
            <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedLead(null)} />
                <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-minimal-olive/10">
                    <div className="bg-minimal-olive/5 px-8 py-8 flex justify-between items-center border-b border-minimal-olive/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-black leading-tight">Interesado Principal</h3>
                                <p className="text-[10px] text-minimal-gold font-bold uppercase tracking-widest mt-1">ID Prospecto: #{selectedLead.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => selectedLead.id && setConfirmDelete(selectedLead.id)}
                                className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all border border-red-100"
                            >
                                <X size={20} />
                            </button>
                            <button onClick={() => setSelectedLead(null)} className="p-2 bg-white/50 hover:bg-gray-100 text-gray-500 rounded-full transition-all border border-minimal-olive/5">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nombre Completo</label>
                                <p className="text-sm font-bold text-black">{selectedLead.first_name} {selectedLead.last_name !== '(Funnel)' ? selectedLead.last_name : ''}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contacto Directo</label>
                                <p className="text-sm font-bold text-black flex items-center gap-2">
                                    <Phone size={12} className="text-green-500" />
                                    {selectedLead.phone ?? '—'}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold">{selectedLead.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Info size={16} className="text-minimal-gold" />
                                <h4 className="font-black text-sm uppercase tracking-widest">Preferencias de Alquiler</h4>
                            </div>
                            <div className="grid gap-3">
                                {selectedLead.additional_services && Array.isArray(selectedLead.additional_services) && 
                                    getAdditionalServiceMapping(selectedLead.additional_services) && Object.entries(getAdditionalServiceMapping(selectedLead.additional_services)).map(([key, value], i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                                        <span className="font-black text-gray-400 capitalize">{key}</span>
                                        <span className="font-bold text-black text-right">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                        <button 
                            onClick={() => setSelectedLead(null)}
                            className="px-6 py-3 bg-white border border-gray-200 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all shadow-sm"
                        >
                            Cerrar
                        </button>
                        <a 
                            href={`https://wa.me/${selectedLead.phone?.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg flex items-center gap-2"
                        >
                            <MessageCircle size={14} /> Escribir a Cliente
                        </a>
                    </div>
                </div>
            </div>
        )}

      
        {confirmDelete && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[4000] flex items-center justify-center p-4">
                <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-minimal-olive/10">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-black text-black text-center mb-2">¿Eliminar Interesado?</h3>
                    <p className="text-sm text-gray-400 text-center mb-8 font-medium">Este prospecto se borrará de tu CRM.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setConfirmDelete(null)}
                            className="px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold text-xs uppercase"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={() => handleDelete(confirmDelete)}
                            className="px-6 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase hover:bg-red-600"
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

export default FunnelLeadsManager;
