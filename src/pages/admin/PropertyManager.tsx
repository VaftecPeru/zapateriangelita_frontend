import { useEffect, useState } from 'react';
import { propertyService, Property } from '../../services/crudService';
import { Plus, Edit, Trash2, MapPin, Loader2, X, ChevronDown, Image as ImageIcon, Upload, AlertTriangle } from 'lucide-react';

const PropertyManager = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(Array(5).fill(null));
    const [previews, setPreviews] = useState<(string | null)[]>(Array(5).fill(null));
    const [formData, setFormData] = useState<Property>({
        title: '',
        type: '',
        location: '',
        price: 0,
        discounted_price: 0,
        beds: 1,
        baths: 1,
        area: '',
        status: '',
        img: '',
        images: [],
        amenities: '',
        description: '',
        rating: 0,
        reviews: 0,
    });


    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const propRes = await propertyService.getAll();
            const data = Array.isArray(propRes.data) ? propRes.data : ((propRes.data as any).data || []);
            setProperties(data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading data:', err);
            setLoading(false);
        }
    };

    const confirmDelete = (id: number) => {
        setPropertyToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!propertyToDelete) return;
        try {
            setIsDeleting(true);
            await propertyService.delete(propertyToDelete);
            setProperties(properties.filter(p => p.id !== propertyToDelete));
            setIsDeleteModalOpen(false);
            setPropertyToDelete(null);
        } catch (err) {
            alert('Error al eliminar la propiedad.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenModal = (property?: Property) => {
        if (property) {
            setEditingProperty(property);
            setFormData({
                ...property,
                discounted_price: property.discounted_price ?? 0,
                rating: property.rating ?? 0,
                reviews: property.reviews ?? 0,
                description: property.description ?? '',
            });
           
            const newPreviews = Array(5).fill(null);
            if (property.images && Array.isArray(property.images)) {
                property.images.forEach((img, i) => {
                    if (i < 5) newPreviews[i] = img;
                });
            } else if (property.img) {
                newPreviews[0] = property.img;
            }
            setPreviews(newPreviews);
            setSelectedFiles(Array(5).fill(null));
        } else {
            setEditingProperty(null);
            setFormData({
                title: '',
                type: '',
                location: '',
                price: 0,
                discounted_price: 0,
                beds: 1,
                baths: 1,
                area: '',
                status: '',
                img: '',
                images: [],
                amenities: '',
                description: '',
                rating: 0,
                reviews: 0,
            });
            setPreviews(Array(5).fill(null));
            setSelectedFiles(Array(5).fill(null));
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProperty(null);
        setSelectedFiles(Array(5).fill(null));
        setPreviews(Array(5).fill(null));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            
            if (file.size > 20 * 1024 * 1024) {
                alert("La imagen excede el límite de 20MB. Por favor sube una imagen más pequeña.");
                return;
            }
            
            const newFiles = [...selectedFiles];
            newFiles[index] = file;
            setSelectedFiles(newFiles);

            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviews = [...previews];
                newPreviews[index] = reader.result as string;
                setPreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => { 
            return {
                ...prev, 
                [name]: ['price', 'discounted_price', 'beds', 'baths', 'rating', 'reviews'].includes(name) ? Number(value) : value 
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            
            data.append('title', String(formData.title));
            data.append('type', String(formData.type));
            data.append('location', String(formData.location));
            data.append('price', String(formData.price));
            data.append('beds', String(formData.beds));
            data.append('baths', String(formData.baths));
            data.append('area', String(formData.area));
            data.append('status', String(formData.status));
            data.append('rating', String(formData.rating ?? 0));
            data.append('reviews', String(formData.reviews ?? 0));
            
            if (formData.discounted_price && formData.discounted_price > 0) {
                data.append('discounted_price', String(formData.discounted_price));
            }
            
            if (formData.amenities) {
                data.append('amenities', String(formData.amenities));
            }
        
            if (formData.description) {
                data.append('description', String(formData.description));
            }

            // Generar metadata de casillas para sincronizar orden y reemplazos
            const imageSlots: string[] = [];
            previews.forEach((preview, index) => {
                if (selectedFiles[index] instanceof File) {
                    imageSlots.push('__NEW__');
                } else if (preview && typeof preview === 'string' && preview.length > 0) {
                    imageSlots.push(preview); // URL existente
                } else {
                    imageSlots.push('__EMPTY__');
                }
            });
            
            console.log("=== IMAGE SLOTS DEBUG ===");
            console.log("Previews:", previews);
            console.log("SelectedFiles:", selectedFiles.map(f => f ? f.name : null));
            console.log("ImageSlots:", imageSlots);
            
            data.append('image_slots', JSON.stringify(imageSlots));

            // Agregar archivos nuevos en orden
            selectedFiles.forEach((file, index) => {
                if (file instanceof File) {
                    data.append('new_images[]', file);
                    console.log(`Appending new_images[]: ${file.name} (from slot ${index})`);
                }
            });

            if (editingProperty && editingProperty.id) {
                data.append('_method', 'PUT');
                await propertyService.update(editingProperty.id, data);
            } else {
                await propertyService.create(data);
            }
            handleCloseModal();
            await loadData(); // Recargar datos frescos del servidor
        } catch (error: any) {
            console.error("Error saving property:", error);
            let message = "Hubo un error al guardar la propiedad.";
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`);
                message = `Errores de validación:\n${errorMessages.join('\n')}`;
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.response?.data?.error) {
                message = error.response.data.error;
            }
            
            if (error.response?.data) {
                console.log("Error Details:", error.response.data);
            }
            
            alert(message);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-minimal-beige/30 rounded-[2rem] border border-minimal-olive/10">
                <Loader2 className="animate-spin text-minimal-gold mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando propiedades...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-minimal-olive/10 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-black">Gestión de Propiedades</h2>
                    <p className="text-gray-400 text-xs font-medium">Administra tus propiedades destacadas del catálogo.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg"
                >
                    <Plus size={16} />
                    Nueva Propiedad
                </button>
            </div>

            <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] border border-minimal-olive/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-minimal-olive/5 bg-minimal-olive/5">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Propiedad</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Tipo / Estado</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Ubicación</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Comodidades</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Precio</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-minimal-olive/60">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-minimal-olive/5">
                            {properties.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">No hay propiedades registradas.</td>
                                </tr>
                            ) : (
                                properties.map((p) => (
                                    <tr key={p.id} className="hover:bg-minimal-olive/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-minimal-olive/10 flex-shrink-0 shadow-sm">
                                                    <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-black text-sm leading-tight mb-0.5">{p.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{p.area}</p>
                                                </div>
                                            </div>
                                        </td>
                                         <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black text-gray-400 uppercase">
                                                    {p.type}
                                                </span>
                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit shadow-sm ${p.status === 'Disponible' ? 'bg-minimal-olive text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-xs font-bold">
                                                <MapPin size={12} className="text-minimal-gold" />
                                                {p.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                {p.amenities ? p.amenities.split(',').slice(0, 3).map((a, i) => (
                                                    <span key={i} className="text-[9px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-md border border-gray-100 font-bold uppercase">
                                                        {a.trim()}
                                                    </span>
                                                )) : <span className="text-[9px] text-gray-300">Sin Comodidades</span>}
                                                {p.amenities && p.amenities.split(',').length > 3 && (
                                                    <span className="text-[9px] text-minimal-gold font-bold">+{p.amenities.split(',').length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-black">
                                            <div className="flex items-center gap-0.5">
                                                {p.discounted_price && Number(p.discounted_price) > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 text-[10px] line-through">S/{p.price}</span>
                                                        <span className="text-minimal-gold text-[10px]">S/</span>
                                                        <span>{Number(p.discounted_price).toFixed(2)}</span>
                                                        <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 rounded">-{(((p.price - Number(p.discounted_price)) / p.price) * 100).toFixed(0)}%</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-minimal-gold text-[10px]">S/</span>{p.price}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    className="bg-black text-white p-3 rounded-xl hover:bg-minimal-olive transition-all active:scale-95 shadow-md"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                 <button
                                                    onClick={() => p.id && confirmDelete(p.id)}
                                                    className="p-3 bg-white text-gray-400 border border-red-50 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
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

          
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-minimal-olive/10">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                            <div>
                                <h2 className="text-2xl font-black text-black tracking-tight">{editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}</h2>
                                <p className="text-[10px] text-minimal-gold font-bold uppercase tracking-widest mt-1">Completa los campos para actualizar el catálogo</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
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
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo de Propiedad</label>
                                    <div className="relative">
                                        <select 
                                            name="type" 
                                            value={formData.type} 
                                            onChange={handleInputChange} 
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Elegir Tipo</option>
                                            <option value="Departamento">Departamento</option>
                                            <option value="Habitación">Habitación</option>
                                            <option value="Estudio">Estudio</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación</label>
                                    <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio Base</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio con Descuento (Opcional)</label>
                                    <input type="number" name="discounted_price" value={formData.discounted_price || ''} onChange={handleInputChange} min="0" step="0.01" placeholder="Dejar vacío si no hay descuento" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                    {formData.discounted_price && formData.discounted_price > 0 && formData.discounted_price < formData.price && (
                                        <div className="flex items-center justify-between text-[11px] font-bold bg-red-50 px-3 py-2 rounded">
                                            <span className="text-red-700">Descuento: {(((formData.price - formData.discounted_price) / formData.price) * 100).toFixed(0)}%</span>
                                            <span className="text-green-700">Ahorro: S/. {(formData.price - formData.discounted_price).toFixed(2)}</span>
                                        </div>
                                    )}
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
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Puntaje (1.0 - 5.0)</label>
                                    <input type="number" name="rating" value={formData.rating || ''} onChange={handleInputChange} required min="1" max="5" step="0.1" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reseñas (Cant.)</label>
                                    <input type="number" name="reviews" value={formData.reviews || ''} onChange={handleInputChange} required min="0" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
                                    <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={5} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold resize-y" placeholder="Describe la propiedad..."></textarea>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Comodidades (separadas por comas)</label>
                                    <input type="text" name="amenities" value={formData.amenities || ''} onChange={handleInputChange} placeholder="Ej: Wi-Fi, Piscina, Estacionamiento" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-minimal-olive/20 focus:border-minimal-olive outline-none transition-all text-sm font-semibold" />
                                    <p className="text-[9px] text-gray-400 font-medium mt-1 ml-1 lowercase">
                                        Palabras mágicas para iconos: wifi, tv, piscina, gym, cocina, aire, café, seguridad, terraza, mascotas, oficina, ascensor, muebles.
                                    </p>
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Imágenes de la Propiedad (Máx 5) <span className="text-minimal-olive ml-2 normal-case font-normal text-[10px]">*Solo formatos .png y .jpg</span>
                                    </label>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                        {[0, 1, 2, 3, 4].map((index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group relative transition-all hover:border-minimal-olive/50">
                                                    {previews[index] ? (
                                                        <img src={previews[index] || ''} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300" size={24} />
                                                    )}
                                                    <label className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                        <Upload className="text-white" size={18} />
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            onChange={(e) => handleFileChange(e, index)} 
                                                            accept="image/png, image/jpeg" 
                                                        />
                                                    </label>
                                                    
                                                    {previews[index] && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const newPrevs = [...previews];
                                                                newPrevs[index] = null;
                                                                setPreviews(newPrevs);
                                                                const newFiles = [...selectedFiles];
                                                                newFiles[index] = null;
                                                                setSelectedFiles(newFiles);
                                                            }}
                                                            className="absolute top-1 right-1 z-20 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-tighter">
                                                    {index === 0 ? 'Principal' : `Imagen ${index + 1}`}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed mt-2 text-center md:text-left">
                                        Recomendamos imágenes de alta calidad (JPG, PNG). El tamaño máximo por imagen es de 20MB. La primera imagen será la portada principal.
                                    </p>
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
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-black mb-2">¿Estás seguro?</h2>
                        <p className="text-gray-400 text-sm font-medium mb-8">
                            Esta acción eliminará la propiedad de forma permanente. No podrás deshacer este cambio.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all font-bold"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-200 disabled:opacity-50 font-bold"
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

export default PropertyManager;
