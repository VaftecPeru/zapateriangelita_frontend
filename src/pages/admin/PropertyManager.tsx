import { useEffect, useState } from 'react';
import { propertyService, Property } from '../../services/crudService';
import { Plus, Edit, Trash2, MapPin, Loader2, X, ChevronDown, Image as ImageIcon, Upload } from 'lucide-react';

const PropertyManager = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState<Property>({
        title: '',
        type: '',
        location: '',
        price: 0,
        beds: 1,
        baths: 1,
        area: '',
        status: '',
        img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
    });

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            setLoading(true);
            const response = await propertyService.getAll();
            setProperties(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading properties:', err);
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta propiedad?')) return;
        try {
            await propertyService.delete(id);
            setProperties(properties.filter(p => p.id !== id));
        } catch (err) {
            alert('Error al eliminar la propiedad.');
        }
    };

    const handleOpenModal = (property?: Property) => {
        if (property) {
            setEditingProperty(property);
            setFormData(property);
        } else {
            setEditingProperty(null);
            setFormData({
                title: '',
                type: '',
                location: '',
                price: 0,
                beds: 1,
                baths: 1,
                area: '',
                status: '',
                img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProperty(null);
        setSelectedFile(null);
        setPreview(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'beds' || name === 'baths' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== 'img' && value !== null && value !== undefined) {
                    data.append(key, value.toString());
                }
            });

            if (selectedFile) {
                data.append('img', selectedFile);
            } else if (!editingProperty) {
                alert("Por favor selecciona una imagen");
                return;
            }

            if (editingProperty && editingProperty.id) {
                await propertyService.update(editingProperty.id, data);
            } else {
                await propertyService.create(data);
            }
            handleCloseModal();
            loadProperties();
        } catch (error) {
            console.error("Error saving property:", error);
            alert("Hubo un error al guardar la propiedad.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100">
                <Loader2 className="animate-spin text-minimal-olive mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando propiedades...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-black">Gestión de Propiedades</h2>
                    <p className="text-gray-400 text-xs font-medium">Administra tus propiedades destacadas del catálogo.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg hover:shadow-minimal-olive/20"
                >
                    <Plus size={16} />
                    Nueva Propiedad
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Propiedad</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Tipo / Estado</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Ubicación</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Precio</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {properties.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">No hay propiedades registradas.</td>
                                </tr>
                            ) : (
                                properties.map((p) => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                                    <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-black text-sm">{p.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{p.area}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-gray-500 uppercase">{p.type}</span>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${p.status === 'Disponible' ? 'bg-minimal-olive/10 text-minimal-olive' : 'bg-gray-100 text-gray-400'}`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
                                                <MapPin size={12} className="text-minimal-olive" />
                                                {p.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-black">
                                            ${p.price}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-minimal-olive/10 hover:text-minimal-olive transition-all"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => p.id && handleDelete(p.id)}
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
                            <h2 className="text-2xl font-black text-black tracking-tight">{editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
                            <button onClick={handleCloseModal} className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Título</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo</label>
                                    <div className="relative">
                                        <select 
                                            name="type" 
                                            value={formData.type} 
                                            onChange={handleInputChange} 
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Elegir</option>
                                            <option value="Habitaciones">Habitaciones</option>
                                            <option value="Departamento">Departamentos</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Área (ej. 120 m2)</label>
                                    <input type="text" name="area" value={formData.area} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Habitaciones</label>
                                    <input type="number" name="beds" value={formData.beds} onChange={handleInputChange} required min="0" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Baños</label>
                                    <input type="number" name="baths" value={formData.baths} onChange={handleInputChange} required min="0" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estado</label>
                                    <div className="relative">
                                        <select 
                                            name="status" 
                                            value={formData.status} 
                                            onChange={handleInputChange} 
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Elegir</option>
                                            <option value="Disponible">Disponible</option>
                                            <option value="Ocupado">Ocupado</option>
                                            <option value="Mantenimiento">Mantenimiento</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Imagen de la Propiedad</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group relative">
                                                {preview || (editingProperty?.img) ? (
                                                    <img src={preview || formData.img} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="text-gray-300" size={32} />
                                                )}
                                                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                    <Upload className="text-white" size={20} />
                                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                                </label>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-black mb-1">
                                                    {selectedFile ? selectedFile.name : 'Sube una imagen representativa'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                                                    Recomendamos imágenes de alta calidad (JPG, PNG) con un tamaño mínimo de 800x600px.
                                                </p>
                                                <label className="mt-3 inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors text-gray-600">
                                                    Seleccionar Archivo
                                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" className="px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-colors shadow-lg">
                                    {editingProperty ? 'Guardar Cambios' : 'Crear Propiedad'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PropertyManager;
