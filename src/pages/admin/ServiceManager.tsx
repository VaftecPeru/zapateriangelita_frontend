import { useEffect, useState } from 'react';
import { additionalServiceService, AdditionalService } from '../../services/crudService';
import { useAuth } from '../../hooks/useAuth';
import { Plus, Edit, Trash2, Loader2, Sparkles, X, AlertTriangle, Star, Percent, XCircle } from 'lucide-react';

const ServiceManager = () => {
    const { user: currentUser } = useAuth();
    const [services, setServices] = useState<AdditionalService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const [editingService, setEditingService] = useState<AdditionalService | null>(null);
    const [formData, setFormData] = useState<AdditionalService>({
        name: '',
        description: '',
        price: 0,
        tag: '',
        code: null,
        is_active: true
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await additionalServiceService.getAll();
            const data = Array.isArray(response.data) ? response.data : ((response.data as any).data || []);
            setServices(data);
        } catch (err: any) {
            console.error('Error loading services:', err);
            setFeedback({
                type: 'error',
                text: err?.response?.data?.message || 'No se pudieron cargar los servicios.',
            });
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: number) => {
        setServiceToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!serviceToDelete) return;
        try {
            setIsDeleting(true);
            await additionalServiceService.delete(serviceToDelete);
            setServices(services.filter(s => s.id !== serviceToDelete));
            setIsDeleteModalOpen(false);
            setServiceToDelete(null);
        } catch (err) {
            alert('Error al eliminar el servicio.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenModal = (service?: AdditionalService) => {
        if (service) {
            setEditingService(service);
            setFormData({
                name: service.name,
                description: service.description || '',
                price: service.price,
                tag: service.tag || '',
                code: service.code || null,
                is_active: service.is_active !== false
            });
        } else {
            setEditingService(null);
            setFormData({ name: '', description: '', price: 0, tag: '', code: null, is_active: true });
        }
        setIsModalOpen(true);
    };

    const deliveryService = services.find((service) => service.code === 'delivery') || null;
    const regularServices = services.filter((service) => service.code !== 'delivery');
    const canManageDelivery = ['admin', 'superadmin'].includes(String(currentUser?.role || ''));

    const handleOpenDeliveryModal = () => {
        if (deliveryService) {
            handleOpenModal(deliveryService);
            return;
        }

        setEditingService(null);
        setFormData({
            name: 'Costo de delivery',
            description: 'Costo de entrega aplicado automáticamente al total de la compra.',
            price: 0,
            tag: 'Delivery',
            code: 'delivery',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
    };

    const handleTagSelect = (tag: string) => {
        setFormData(prev => ({ ...prev, tag: prev.tag === tag ? '' : tag }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        const price = Number(formData.price);
        if (!Number.isFinite(price) || price < 0) {
            setFeedback({ type: 'error', text: 'Ingresa un costo válido mayor o igual a 0.' });
            return;
        }

        try {
            setSaving(true);

            if (formData.code === 'delivery') {
                const response = await additionalServiceService.updateDelivery({
                    price,
                    is_active: formData.is_active !== false,
                    description: formData.description || null,
                });

                setFeedback({
                    type: 'success',
                    text: response.data?.message || 'Costo de delivery actualizado correctamente.',
                });
            } else if (editingService && editingService.id) {
                await additionalServiceService.update(editingService.id, { ...formData, price });
                setFeedback({ type: 'success', text: 'Servicio actualizado correctamente.' });
            } else {
                await additionalServiceService.create({ ...formData, price });
                setFeedback({ type: 'success', text: 'Servicio creado correctamente.' });
            }

            handleCloseModal();
            await loadServices();
        } catch (error: any) {
            console.error("Error saving service:", error);
            setFeedback({
                type: 'error',
                text: error?.response?.data?.message || 'No se pudo guardar el servicio.',
            });
        } finally {
            setSaving(false);
        }
    };

    const getTagStyles = (tag: string) => {
        switch (tag.toLowerCase()) {
            case 'popular': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'no disponible': return 'bg-red-100 text-red-700 border-red-200';
            case 'nuevo': return 'bg-green-100 text-green-700 border-green-200';
            case 'oferta': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTagIcon = (tag: string, size = 10) => {
        switch (tag.toLowerCase()) {
            case 'popular': return <Star size={size} />;
            case 'nuevo': return <Sparkles size={size} />;
            case 'oferta': return <Percent size={size} />;
            case 'no disponible': return <XCircle size={size} />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                <Loader2 className="animate-spin text-store-red mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando servicios...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                <div>
                    <h2 className="text-xl font-black text-black">Gestión de Servicios</h2>
                    <p className="text-gray-400 text-xs font-medium">Administra los servicios adicionales que ofreces.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-store-red text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-store-redDark transition-all shadow-lg hover:shadow-store-red/20 active:scale-95"
                >
                    <Plus size={16} />
                    Nuevo Servicio
                </button>
            </div>

            <div className="rounded-[2rem] border border-store-red/15 bg-red-50/40 p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-store-red">Checkout</p>
                        <h3 className="mt-1 text-lg font-black text-black">Costo de delivery</h3>
                        <p className="mt-1 text-xs font-medium text-gray-500">
                            Se suma automáticamente al total del cliente antes de ingresar a Openpay.
                        </p>
                        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            Gestión habilitada para Administrador y Superadministrador
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white px-5 py-3 text-right shadow-sm">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                {deliveryService?.is_active === false ? 'Desactivado' : 'Costo vigente'}
                            </p>
                            <p className="text-xl font-black text-black">
                                ${Number(deliveryService?.price || 0).toFixed(2)} MXN
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleOpenDeliveryModal}
                            disabled={!canManageDelivery}
                            className="rounded-xl bg-store-red px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-store-redDark disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {deliveryService ? 'Editar delivery' : 'Configurar delivery'}
                        </button>
                    </div>
                </div>
            </div>

            {feedback && (
                <div className={`rounded-2xl border px-5 py-4 text-sm font-bold ${
                    feedback.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-red-200 bg-red-50 text-red-700'
                }`}>
                    {feedback.text}
                </div>
            )}

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden text-black font-medium">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Servicio</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Etiqueta</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Descripción</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Precio</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-black font-medium">
                            {regularServices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium italic">No hay servicios registrados.</td>
                                </tr>
                            ) : (
                                regularServices.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-gray-50 rounded-xl text-store-red group-hover:bg-store-red group-hover:text-white transition-all shadow-sm">
                                                    <Sparkles size={18} />
                                                </div>
                                                <p className="font-black text-black text-sm">{s.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {s.tag ? (
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border flex items-center gap-1.5 w-fit ${getTagStyles(s.tag)}`}>
                                                    {getTagIcon(s.tag)}
                                                    {s.tag}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 font-medium italic">Sin etiqueta</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-400 max-w-xs truncate">
                                            {s.description || 'Sin descripción'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm font-black text-black">
                                                ${Number(s.price || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(s)}
                                                    className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all active:scale-90"
                                                    title="Editar"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => s.id && confirmDelete(s.id)}
                                                    className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

           
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-black tracking-tight">
                                    {formData.code === 'delivery' ? 'Configurar costo de delivery' : editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                                </h2>
                                <p className="text-gray-400 text-xs font-medium mt-1">
                                    {formData.code === 'delivery'
                                        ? 'Este costo se aplicará automáticamente al checkout.'
                                        : 'Completa los detalles del servicio adicional.'}
                                </p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors active:scale-90">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nombre del Servicio</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        required
                                        readOnly={formData.code === 'delivery'}
                                        placeholder="Ej. Servicio adicional"
                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-store-red/10 focus:border-store-red outline-none transition-all text-sm font-bold placeholder:text-gray-300" 
                                    />
                                </div>
                                
                                {formData.code !== 'delivery' && (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Etiqueta de Servicio</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'Popular', icon: <Star size={12} />, color: 'hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200 active:bg-yellow-100', active: 'bg-yellow-500 text-white border-yellow-500' },
                                            { id: 'Nuevo', icon: <Sparkles size={12} />, color: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200 active:bg-green-100', active: 'bg-green-500 text-white border-green-500' },
                                            { id: 'Oferta', icon: <Percent size={12} />, color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 active:bg-blue-100', active: 'bg-blue-500 text-white border-blue-500' },
                                            { id: 'No Disponible', icon: <XCircle size={12} />, color: 'hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:bg-red-100', active: 'bg-red-500 text-white border-red-500' }
                                        ].map((tag) => (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => handleTagSelect(tag.id)}
                                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    formData.tag === tag.id 
                                                    ? tag.active 
                                                    : `bg-gray-50 text-gray-400 border-gray-100 ${tag.color}`
                                                }`}
                                            >
                                                {tag.icon}
                                                {tag.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                )}

                                {formData.code === 'delivery' && (
                                    <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                                        <span>
                                            <span className="block text-xs font-black text-black">Aplicar delivery en compras</span>
                                            <span className="mt-1 block text-[10px] font-medium text-gray-400">Si lo desactivas, el checkout cobrará $0.00 de delivery.</span>
                                        </span>
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active !== false}
                                            onChange={(event) => setFormData((current) => ({ ...current, is_active: event.target.checked }))}
                                            className="h-5 w-5 accent-store-red"
                                        />
                                    </label>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        {formData.code === 'delivery' ? 'Costo de delivery (MXN)' : 'Precio (MXN)'}
                                    </label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        value={formData.price} 
                                        onChange={handleInputChange} 
                                        required 
                                        min="0" 
                                        step="0.01" 
                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-store-red/10 focus:border-store-red outline-none transition-all text-sm font-bold" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description || ''} 
                                        onChange={handleInputChange} 
                                        rows={4} 
                                        placeholder="Describe brevemente el servicio..."
                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-store-red/10 focus:border-store-red outline-none transition-all text-sm font-bold resize-none placeholder:text-gray-300" 
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex gap-3 border-t border-gray-50">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal} 
                                    className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-[2] py-4 bg-store-red text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-store-redDark transition-all shadow-xl shadow-black/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {saving
                                        ? 'Guardando...'
                                        : formData.code === 'delivery'
                                            ? 'Guardar costo de delivery'
                                            : editingService
                                                ? 'Actualizar Servicio'
                                                : 'Crear Servicio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación de Eliminación */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-black mb-2">¿Estás seguro?</h2>
                        <p className="text-gray-400 text-sm font-medium mb-8">
                            Esta acción eliminará el servicio de forma permanente. No podrás deshacer este cambio.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-200 disabled:opacity-50"
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManager;
