import { useEffect, useState } from 'react';
import { additionalServiceService, AdditionalService } from '../../services/crudService';
import { Plus, Edit, Trash2, Loader2, Sparkles, X } from 'lucide-react';

const ServiceManager = () => {
    const [services, setServices] = useState<AdditionalService[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<AdditionalService | null>(null);
    const [formData, setFormData] = useState<AdditionalService>({
        name: '',
        description: '',
        price: 0,
    });

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await additionalServiceService.getAll();
            setServices(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading services:', err);
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;
        try {
            await additionalServiceService.delete(id);
            setServices(services.filter(s => s.id !== id));
        } catch (err) {
            alert('Error al eliminar el servicio.');
        }
    };

    const handleOpenModal = (service?: AdditionalService) => {
        if (service) {
            setEditingService(service);
            setFormData(service);
        } else {
            setEditingService(null);
            setFormData({ name: '', description: '', price: 0 });
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingService && editingService.id) {
                await additionalServiceService.update(editingService.id, formData);
            } else {
                await additionalServiceService.create(formData);
            }
            handleCloseModal();
            loadServices();
        } catch (error) {
            console.error("Error saving service:", error);
            alert("Hubo un error al guardar el servicio.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                <Loader2 className="animate-spin text-minimal-olive mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando servicios...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-black">Gestión de Servicios</h2>
                    <p className="text-gray-400 text-xs font-medium">Administra los servicios adicionales que ofreces.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg hover:shadow-minimal-olive/20"
                >
                    <Plus size={16} />
                    Nuevo Servicio
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Servicio</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Descripción</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Precio</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">No hay servicios registrados.</td>
                                </tr>
                            ) : (
                                services.map((s) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg text-minimal-olive group-hover:bg-minimal-olive group-hover:text-white transition-all">
                                                    <Sparkles size={18} />
                                                </div>
                                                <p className="font-black text-black text-sm">{s.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-gray-400 max-w-xs truncate">
                                            {s.description || 'Sin descripción'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm font-black text-black">
                                                S/{s.price}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(s)}
                                                    className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-minimal-olive/10 hover:text-minimal-olive transition-all"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => s.id && handleDelete(s.id)}
                                                    className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={14} />
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

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-black tracking-tight">{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                            <button onClick={handleCloseModal} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre del Servicio</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
                                    <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold resize-none" />
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-colors shadow-lg">
                                    {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManager;
