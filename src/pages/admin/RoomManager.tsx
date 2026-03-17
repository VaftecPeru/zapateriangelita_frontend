import { useEffect, useState } from 'react';
import { roomService, Room, propertyService, Property } from '../../services/crudService';
import { Plus, Edit, Trash2, Loader2, BedDouble, Tag, X } from 'lucide-react';

const RoomManager = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [formData, setFormData] = useState<Room>({
        property_id: 0,
        room_number: '',
        type: 'Simple',
        price: 0,
        status: 'Disponible',
        description: '',
    });

    useEffect(() => {
        loadRooms();
        loadProperties();
    }, []);

    const loadRooms = async () => {
        try {
            setLoading(true);
            const response = await roomService.getAll();
            setRooms(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading rooms:', err);
            setLoading(false);
        }
    };

    const loadProperties = async () => {
        try {
            const response = await propertyService.getAll();
            setProperties(response.data);
        } catch (err) {
            console.error('Error loading properties for select:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta habitación?')) return;
        try {
            await roomService.delete(id);
            setRooms(rooms.filter(r => r.id !== id));
        } catch (err) {
            alert('Error al eliminar la habitación.');
        }
    };

    const handleOpenModal = (room?: Room) => {
        if (room) {
            setEditingRoom(room);
            setFormData(room);
        } else {
            setEditingRoom(null);
            setFormData({
                property_id: properties.length > 0 && properties[0].id ? properties[0].id : 0,
                room_number: '',
                type: 'Simple',
                price: 0,
                status: 'Disponible',
                description: '',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'property_id' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingRoom && editingRoom.id) {
                await roomService.update(editingRoom.id, formData);
            } else {
                await roomService.create(formData);
            }
            handleCloseModal();
            loadRooms();
        } catch (error) {
            console.error("Error saving room:", error);
            alert("Hubo un error al guardar la habitación.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                <Loader2 className="animate-spin text-minimal-olive mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando habitaciones...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-black">Gestión de Habitaciones</h2>
                    <p className="text-gray-400 text-xs font-medium">Administra las unidades individuales de tus propiedades.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg hover:shadow-minimal-olive/20"
                >
                    <Plus size={16} />
                    Nueva Habitación
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Número / Tipo</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Estado</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Precio</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Propiedad</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {rooms.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">No hay habitaciones registradas.</td>
                                </tr>
                            ) : (
                                rooms.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg text-minimal-olive group-hover:bg-minimal-olive group-hover:text-white transition-all">
                                                    <BedDouble size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-black text-sm">Hab. {r.room_number}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{r.type}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${r.status === 'Disponible' ? 'bg-minimal-olive/10 text-minimal-olive' : 'bg-gray-100 text-gray-400'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-black">
                                            ${r.price}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
                                                <Tag size={12} className="text-minimal-olive" />
                                                ID: {r.property_id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(r)}
                                                    className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-minimal-olive/10 hover:text-minimal-olive transition-all"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => r.id && handleDelete(r.id)}
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
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-black tracking-tight">{editingRoom ? 'Editar Habitación' : 'Nueva Habitación'}</h2>
                            <button onClick={handleCloseModal} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Propiedad</label>
                                    <select name="property_id" value={formData.property_id} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold appearance-none">
                                        <option value={0} disabled>Seleccionar propiedad...</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Número de Habitación</label>
                                    <input type="text" name="room_number" value={formData.room_number} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold appearance-none">
                                        <option value="Simple">Simple</option>
                                        <option value="Doble">Doble</option>
                                        <option value="Suite">Suite</option>
                                        <option value="Familiar">Familiar</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold appearance-none">
                                        <option value="Disponible">Disponible</option>
                                        <option value="Ocupado">Ocupado</option>
                                        <option value="Mantenimiento">Mantenimiento</option>
                                    </select>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
                                    <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold resize-none" />
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-colors shadow-lg">
                                    {editingRoom ? 'Guardar Cambios' : 'Crear Habitación'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManager;
