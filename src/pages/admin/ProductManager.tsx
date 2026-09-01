import { useEffect, useState } from 'react';
import { productService, Product, categoryService, subcategoryService, Category, Subcategory } from '../../services/crudService';
import { Plus, Edit, Trash2, Loader2, X, ChevronDown, Image as ImageIcon, Upload, AlertTriangle } from 'lucide-react';

const ProductManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(Array(5).fill(null));
    const [previews, setPreviews] = useState<(string | null)[]>(Array(5).fill(null));
    const [formData, setFormData] = useState<Product>({
        name: '',
        category: '',
        category_id: undefined,
        brand: '',
        price: 0,
        discounted_price: 0,
        stock: 0,
        size: '',
        color: '',
        material: '',
        gender: '',
        img: '',
        images: [],
        description: '',
        rating: 0,
        reviews: 0,
        discount: null,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes, subcategoriesRes] = await Promise.all([
                productService.getAll(),
                categoryService.getAll(),
                subcategoryService.getAll(),
            ]);

            const productsData = Array.isArray(productsRes.data) ? productsRes.data : ((productsRes.data as any).data || []);
            const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : ((categoriesRes.data as any).data || []);
            const subcategoriesData = Array.isArray(subcategoriesRes.data) ? subcategoriesRes.data : ((subcategoriesRes.data as any).data || []);

            setProducts(productsData);
            setCategories(categoriesData);
            setSubcategories(subcategoriesData);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (id: number) => {
        setProductToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            setIsDeleting(true);
            await productService.delete(productToDelete);
            setProducts(products.filter(p => p.id !== productToDelete));
            setIsDeleteModalOpen(false);
            setProductToDelete(null);
        } catch (err) {
            alert('Error al eliminar el producto.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                ...product,
                discounted_price: product.discounted_price ?? 0,
                rating: product.rating ?? 0,
                reviews: product.reviews ?? 0,
                description: product.description ?? '',
                discount: product.discount ?? null,
                category_id: product.category_id,
            });

            const newPreviews = Array(5).fill(null);
            if (product.images && Array.isArray(product.images)) {
                product.images.forEach((img, i) => {
                    if (i < 5) newPreviews[i] = img;
                });
            } else if (product.img) {
                newPreviews[0] = product.img;
            }
            setPreviews(newPreviews);
            setSelectedFiles(Array(5).fill(null));
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: '',
                category_id: undefined,
                brand: '',
                price: 0,
                discounted_price: 0,
                stock: 0,
                size: '',
                color: '',
                material: '',
                gender: '',
                img: '',
                images: [],
                description: '',
                rating: 0,
                reviews: 0,
                discount: null,
            });
            setPreviews(Array(5).fill(null));
            setSelectedFiles(Array(5).fill(null));
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setSelectedFiles(Array(5).fill(null));
        setPreviews(Array(5).fill(null));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 20 * 1024 * 1024) {
                alert("La imagen excede el límite de 20MB.");
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
        setFormData(prev => ({
            ...prev,
            [name]: ['price', 'discounted_price', 'stock', 'rating', 'reviews'].includes(name) ? Number(value) : value
        }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = Number(e.target.value);
        const selectedCategory = categories.find(c => c.id === categoryId);
        setFormData(prev => ({
            ...prev,
            category_id: categoryId,
            category: selectedCategory?.name || '',
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();

            data.append('name', String(formData.name));
            data.append('category', String(formData.category));
            data.append('category_id', String(formData.category_id || ''));
            data.append('brand', String(formData.brand));
            data.append('price', String(formData.price));
            data.append('stock', String(formData.stock));
            data.append('size', String(formData.size || ''));
            data.append('color', String(formData.color || ''));
            data.append('material', String(formData.material || ''));
            data.append('gender', String(formData.gender || ''));
            data.append('rating', String(formData.rating ?? 0));
            data.append('reviews', String(formData.reviews ?? 0));

            if (formData.discounted_price && formData.discounted_price > 0) {
                data.append('discounted_price', String(formData.discounted_price));
            }

            if (formData.discount) {
                data.append('discount', String(formData.discount));
            }

            if (formData.description) {
                data.append('description', String(formData.description));
            }

            const imageSlots: string[] = [];
            previews.forEach((preview, index) => {
                if (selectedFiles[index] instanceof File) {
                    imageSlots.push('__NEW__');
                } else if (preview && typeof preview === 'string' && preview.length > 0) {
                    imageSlots.push(preview);
                } else {
                    imageSlots.push('__EMPTY__');
                }
            });
            data.append('image_slots', JSON.stringify(imageSlots));

            selectedFiles.forEach((file) => {
                if (file instanceof File) {
                    data.append('new_images[]', file);
                }
            });

            if (editingProduct && editingProduct.id) {
                data.append('_method', 'PUT');
                await productService.update(editingProduct.id, data);
            } else {
                await productService.create(data);
            }
            handleCloseModal();
            await loadData();
        } catch (error: any) {
            console.error("Error saving product:", error);
            let message = "Hubo un error al guardar el producto.";
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`);
                message = `Errores:\n${errorMessages.join('\n')}`;
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            alert(message);
        }
    };

    // Obtener subcategorías filtradas por categoría seleccionada
    const filteredSubcategories = subcategories.filter(
        sub => sub.category_id === formData.category_id
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-store-surface rounded-[2rem] border border-gray-200">
                <Loader2 className="animate-spin text-store-red mb-4" size={40} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando productos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-black">Gestión de Productos</h2>
                    <p className="text-gray-400 text-xs font-medium">Administra el catálogo de calzado de Angelita.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-store-red text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-store-redDark transition-all shadow-lg"
                >
                    <Plus size={16} />
                    Nuevo Producto
                </button>
            </div>

            {/* Tabla */}
            <div className="bg-white/40 backdrop-blur-sm rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-store-red/5">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Producto</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Categoría</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Marca</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Stock</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Precio</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">No hay productos registrados.</td>
                                </tr>
                            ) : (
                                products.map((p) => (
                                    <tr key={p.id} className="hover:bg-store-red/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0 shadow-sm">
                                                    <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-black text-sm leading-tight mb-0.5">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{p.color} · {p.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{p.category}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{p.brand}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest w-fit shadow-sm ${p.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {p.stock > 0 ? `${p.stock} unidades` : 'Agotado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-black">
                                            <div className="flex items-center gap-0.5">
                                                {p.discounted_price && Number(p.discounted_price) > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-400 text-[10px] line-through">S/{p.price}</span>
                                                        <span className="text-store-red text-[10px]">S/</span>
                                                        <span>{Number(p.discounted_price).toFixed(2)}</span>
                                                        {p.discount && <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 rounded">{p.discount}</span>}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-store-red text-[10px]">S/</span>{p.price}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    className="bg-store-red text-white p-3 rounded-xl hover:bg-store-redDark transition-all active:scale-95 shadow-md"
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

            {/* Modal de creación/edición */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
                            <div>
                                <h2 className="text-2xl font-black text-black tracking-tight">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                                <p className="text-[10px] text-store-red font-bold uppercase tracking-widest mt-1">Completa los campos para actualizar el catálogo</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Nombre */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre del Producto</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" placeholder="Ej: Botín Mujer Catalina" />
                                </div>

                                {/* Categoría (desde BD) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</label>
                                    <div className="relative">
                                        <select
                                            name="category_id"
                                            value={formData.category_id || ''}
                                            onChange={handleCategoryChange}
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                                        >
                                            <option value="">Seleccionar categoría</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.icon} {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Subcategoría (filtrada por categoría) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subcategoría</label>
                                    <div className="relative">
                                        <select
                                            name="subcategory_id"
                                            value={formData.subcategory_id || ''}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                                            disabled={!formData.category_id}
                                        >
                                            <option value="">Sin subcategoría</option>
                                            {filteredSubcategories.map((sub) => (
                                                <option key={sub.id} value={sub.id}>
                                                    {sub.name} {sub.talla && `(${sub.talla})`}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Marca */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Marca</label>
                                    <div className="relative">
                                        <select name="brand" value={formData.brand} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold appearance-none cursor-pointer">
                                            <option value="" disabled>Seleccionar</option>
                                            <option value="Nike">Nike</option>
                                            <option value="adidas">adidas</option>
                                            <option value="PUMA">PUMA</option>
                                            <option value="SKECHERS">SKECHERS</option>
                                            <option value="CAT">CAT</option>
                                            <option value="flexi">flexi</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Precio */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio (S/)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" step="0.01" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" placeholder="0.00" />
                                </div>

                                {/* Precio con descuento */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio con Descuento</label>
                                    <input type="number" name="discounted_price" value={formData.discounted_price || ''} onChange={handleInputChange} min="0" step="0.01" placeholder="Opcional" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" />
                                </div>

                                {/* Stock */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stock</label>
                                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" placeholder="0" />
                                </div>

                                {/* Talla */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Talla</label>
                                    <input type="text" name="size" value={formData.size} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" placeholder="Ej: 38, M, 7 US" />
                                </div>

                                {/* Color */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Color</label>
                                    <input type="text" name="color" value={formData.color} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" placeholder="Ej: Negro, Rojo, Azul" />
                                </div>

                                {/* Material */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Material</label>
                                    <input type="text" name="material" value={formData.material} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" placeholder="Ej: Cuero, Tela, Sintético" />
                                </div>

                                {/* Etiqueta de descuento */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Etiqueta de Descuento</label>
                                    <input type="text" name="discount" value={formData.discount || ''} onChange={handleInputChange} placeholder="Ej: -20%, Oferta" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" />
                                </div>

                                {/* Calificación */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calificación (1-5)</label>
                                    <input type="number" name="rating" value={formData.rating || ''} onChange={handleInputChange} required min="1" max="5" step="0.1" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" placeholder="4.5" />
                                </div>

                                {/* Reseñas */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Número de Reseñas</label>
                                    <input type="number" name="reviews" value={formData.reviews || ''} onChange={handleInputChange} required min="0" className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" placeholder="0" />
                                </div>

                                {/* Descripción */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
                                    <textarea name="description" value={formData.description || ''} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold resize-y" placeholder="Describe el producto..." />
                                </div>

                                {/* Imágenes */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Imágenes del Producto (Máx 5)</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                        {[0, 1, 2, 3, 4].map((index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group relative transition-all hover:border-store-red/50">
                                                    {previews[index] ? (
                                                        <img src={previews[index] || ''} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300" size={24} />
                                                    )}
                                                    <label className="absolute inset-0 z-10 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                                        <Upload className="text-white" size={18} />
                                                        <input type="file" className="hidden" onChange={(e) => handleFileChange(e, index)} accept="image/png, image/jpeg" />
                                                    </label>
                                                    {previews[index] && (
                                                        <button type="button" onClick={() => { const newPrevs = [...previews]; newPrevs[index] = null; setPreviews(newPrevs); const newFiles = [...selectedFiles]; newFiles[index] = null; setSelectedFiles(newFiles); }} className="absolute top-1 right-1 z-20 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg">
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-tighter">{index === 0 ? 'Principal' : `Imagen ${index + 1}`}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors">Cancelar</button>
                                <button type="submit" className="px-6 py-3 bg-store-red text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-store-redDark transition-colors shadow-lg">
                                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-black mb-2">¿Estás seguro?</h2>
                        <p className="text-gray-400 text-sm font-medium mb-8">Esta acción eliminará el producto de forma permanente. No podrás deshacer este cambio.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all font-bold">Cancelar</button>
                            <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-200 disabled:opacity-50 font-bold">
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;