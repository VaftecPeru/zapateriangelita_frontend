import { useEffect, useState } from 'react';
import { productService, Product, categoryService, subcategoryService, brandService, Category, Subcategory, Brand } from '../../services/crudService';
import { getImageUrl } from '../../config/api';
import { Plus, Edit, Trash2, Eye, Loader2, X, ChevronDown, Image as ImageIcon, AlertTriangle } from 'lucide-react';

const ProductManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formError, setFormError] = useState('');
    const [productToView, setProductToView] = useState<Product | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(Array(5).fill(null));
    const [previews, setPreviews] = useState<(string | null)[]>(Array(5).fill(null));
    const [sizeOptions, setSizeOptions] = useState<string[]>(['']);
    const [colorOptions, setColorOptions] = useState<string[]>(['']);
    const [formData, setFormData] = useState<Product>({
        name: '',
        category: '',
        category_id: undefined,
        subcategory_id: undefined,
        brand_id: undefined,
        price: 0,
        discounted_price: 0,
        stock: 0,
        size: '',
        color: '',
        material: '',
        img: '',
        images: [],
        description: '',
        rating: 0,
        reviews: 0,
        discount: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes, subcategoriesRes, brandsRes] = await Promise.all([
                productService.getAll(),
                categoryService.getAll(),
                subcategoryService.getAll(),
                brandService.getAll(),
            ]);

            const productsData = Array.isArray(productsRes.data) ? productsRes.data : ((productsRes.data as any).data || []);
            const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : ((categoriesRes.data as any).data || []);
            const subcategoriesData = Array.isArray(subcategoriesRes.data) ? subcategoriesRes.data : ((subcategoriesRes.data as any).data || []);
            const brandsData = Array.isArray(brandsRes.data) ? brandsRes.data : ((brandsRes.data as any).data || []);

            setProducts(productsData);
            setCategories(categoriesData);
            setSubcategories(subcategoriesData);
            setBrands(brandsData);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files).slice(0, 5);

        const newFiles = [...selectedFiles];
        const newPreviews = [...previews];

        let startIndex = 0;
        for (let i = 0; i < newFiles.length; i++) {
            if (newFiles[i] === null) {
                startIndex = i;
                break;
            }
        }

        if (startIndex >= 5) {
            alert('Ya tienes 5 imágenes seleccionadas. Elimina alguna para agregar más.');
            return;
        }

        fileArray.forEach((file, index) => {
            const slotIndex = startIndex + index;
            if (slotIndex >= 5) return;

            if (file.size > 20 * 1024 * 1024) {
                alert(`La imagen "${file.name}" excede el límite de 20MB.`);
                return;
            }

            newFiles[slotIndex] = file;

            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews[slotIndex] = reader.result as string;
                setPreviews([...newPreviews]);
            };
            reader.readAsDataURL(file);
        });

        setSelectedFiles(newFiles);

        e.target.value = '';
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

    const getCategoryName = (product: Product) => {
        if (typeof product.category === 'string') return product.category || 'Sin categoría';
        if (product.category && typeof product.category === 'object') return product.category.name || 'Sin categoría';
        const found = categories.find(cat => cat.id === product.category_id);
        return found?.name || 'Sin categoría';
    };

    const getBrandName = (product: Product) => {
        if (typeof product.brand === 'string') return product.brand || 'Sin marca';
        if (product.brand && typeof product.brand === 'object') return product.brand.name || 'Sin marca';
        if (product.brand_id) {
            const found = brands.find(brand => brand.id === product.brand_id);
            return found?.name || 'Sin marca';
        }
        return 'Sin marca';
    };

    const handleOpenModal = (product?: Product) => {
        setFormError('');
        if (product) {
            setEditingProduct(product);
            setFormData({
                ...product,
                discounted_price: product.discounted_price ?? 0,
                rating: product.rating ?? 0,
                reviews: product.reviews ?? 0,
                description: product.description ?? '',
                discount: product.discount ?? '',
                category_id: product.category_id,
                subcategory_id: product.subcategory_id,
                brand_id: product.brand_id,
            });
            setSizeOptions(String(product.size || '').split(/[,/|]/).map((value) => value.trim()).filter(Boolean).length
                ? String(product.size || '').split(/[,/|]/).map((value) => value.trim()).filter(Boolean)
                : ['']);
            setColorOptions(String(product.color || '').split(/[,/|]/).map((value) => value.trim()).filter(Boolean).length
                ? String(product.color || '').split(/[,/|]/).map((value) => value.trim()).filter(Boolean)
                : ['']);

            const newPreviews = Array(5).fill(null);
            if (product.images && Array.isArray(product.images)) {
                product.images.forEach((img, i) => {
                    if (i < 5) newPreviews[i] = getImageUrl(img);
                });
            } else if (product.img) {
                newPreviews[0] = getImageUrl(product.img);
            }
            setPreviews(newPreviews);
            setSelectedFiles(Array(5).fill(null));
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: '',
                category_id: undefined,
                subcategory_id: undefined,
                brand_id: undefined,
                price: 0,
                discounted_price: 0,
                stock: 0,
                size: '',
                color: '',
                material: '',
                img: '',
                images: [],
                description: '',
                rating: 0,
                reviews: 0,
                discount: '',
            });
            setSizeOptions(['']);
            setColorOptions(['']);
            setPreviews(Array(5).fill(null));
            setSelectedFiles(Array(5).fill(null));
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormError('');
        setSelectedFiles(Array(5).fill(null));
        setPreviews(Array(5).fill(null));
        setSizeOptions(['']);
        setColorOptions(['']);
    };

    const removeImage = (index: number) => {
        const newPrevs = [...previews];
        newPrevs[index] = null;
        setPreviews(newPrevs);
        const newFiles = [...selectedFiles];
        newFiles[index] = null;
        setSelectedFiles(newFiles);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'price' || name === 'discount') {
            setFormData(prev => {
                const price = name === 'price' ? Number(value) : Number(prev.price);
                const discount = name === 'discount' ? Number(value) : Number(prev.discount);
                const discountedPrice = price > 0 && discount > 0
                    ? Number((price * (1 - Math.min(discount, 100) / 100)).toFixed(2))
                    : 0;

                return {
                    ...prev,
                    [name]: name === 'price' ? price : value,
                    discounted_price: discountedPrice,
                };
            });
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: ['discounted_price', 'stock', 'rating', 'reviews'].includes(name) ? Number(value) : value
        }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const categoryId = Number(e.target.value);
        const selectedCategory = categories.find(c => c.id === categoryId);
        setFormData(prev => ({
            ...prev,
            category_id: categoryId,
            category: selectedCategory?.name || '',
            subcategory_id: undefined,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const sizes = sizeOptions.map((value) => value.trim()).filter(Boolean);
        const colors = colorOptions.map((value) => value.trim()).filter(Boolean);
        const requiredFields: Array<[string, string]> = [
            ['name', formData.name.trim()],
            ['category_id', String(formData.category_id || '')],
            ['price', String(formData.price || '')],
            ['stock', String(formData.stock)],
            ['size', sizes.join(',')],
            ['color', colors.join(',')],
            ['material', formData.material.trim()],
        ];
        const missingField = requiredFields.find(([, value]) => !value);
        if (missingField) {
            setFormError('Completa todos los campos obligatorios antes de guardar el producto.');
            return;
        }
        if (Number(formData.price) <= 0) {
            setFormError('El precio debe ser mayor que 0.');
            return;
        }
        if (Number(formData.rating) < 0 || Number(formData.rating) > 5) {
            setFormError('La calificación debe estar entre 0 y 5.');
            return;
        }
        setFormError('');
        try {
            const data = new FormData();

            data.append('name', String(formData.name));
            data.append('category_id', String(formData.category_id || ''));
            data.append('price', String(formData.price));
            data.append('stock', String(formData.stock));
            data.append('size', sizes.join(','));
            data.append('color', colors.join(','));
            data.append('material', String(formData.material || ''));
            data.append('rating', String(formData.rating ?? 0));
            data.append('reviews', String(formData.reviews ?? 0));

            if (formData.brand_id) {
                data.append('brand_id', String(formData.brand_id));
            }

            if (formData.subcategory_id) {
                data.append('subcategory_id', String(formData.subcategory_id));
            }

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
                const errorMessages = Object.keys(errors).map(key => {
                    const details = Array.isArray(errors[key]) ? errors[key].join(', ') : String(errors[key]);
                    return `${key}: ${details}`;
                });
                message = `Errores:\n${errorMessages.join('\n')}`;
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }
            setFormError(message);
        }
    };

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
                                                    <img src={getImageUrl(p.img)} alt={p.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-black text-sm leading-tight mb-0.5">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{p.color} · {p.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{getCategoryName(p)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{getBrandName(p)}</span>
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
                                                        <span className="text-gray-400 text-[10px] line-through">${Number(p.price || 0).toFixed(2)}</span>
                                                        <span className="text-store-red text-[10px]">$</span>
                                                        <span>{Number(p.discounted_price).toFixed(2)}</span>
                                                        {p.discount && <span className="text-[9px] font-bold text-white bg-red-500 px-1.5 rounded">-{p.discount}%</span>}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-store-red text-[10px]">$</span>{Number(p.price || 0).toFixed(2)}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setProductToView(p)}
                                                    title="Ver detalles completos"
                                                    className="p-3 bg-white text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 hover:text-black transition-all shadow-sm"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(p)}
                                                    title="Editar producto"
                                                    className="bg-store-red text-white p-3 rounded-xl hover:bg-store-redDark transition-all active:scale-95 shadow-md"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => p.id && confirmDelete(p.id)}
                                                    title="Eliminar producto"
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

                        {formError && (
                            <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
                                <p className="whitespace-pre-line">{formError}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre del Producto *</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" 
                                        placeholder="Ej: Botín Mujer Catalina" 
                                    />
                                </div>

                                {/* Categoría */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría *</label>
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
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Subcategoría */}
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
                                        <select
                                            name="brand_id"
                                            value={formData.brand_id ?? ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, brand_id: Number(e.target.value) || undefined }))}
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold appearance-none cursor-pointer"
                                        >
                                            <option value="">Seleccionar marca</option>
                                            {brands.map((brand) => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                    </div>
                                </div>

                                {/* Precio */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio (USD) *</label>
                                    <input 
                                        type="number" 
                                        name="price" 
                                        value={formData.price} 
                                        onChange={handleInputChange} 
                                        required 
                                        min="0" 
                                        step="0.01" 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" 
                                        placeholder="0.00" 
                                    />
                                </div>

                                {/* Descuento */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descuento (%)</label>
                                    <input 
                                        type="number" 
                                        name="discount" 
                                        value={formData.discount || ''} 
                                        onChange={handleInputChange} 
                                        min="0"
                                        max="100"
                                        step="1"
                                        placeholder="Ej: 20" 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" 
                                    />
                                </div>

                                {/* Precio final con descuento */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio final con descuento</label>
                                    <input 
                                        type="number" 
                                        name="discounted_price" 
                                        value={formData.discounted_price || ''} 
                                        readOnly
                                        min="0" 
                                        step="0.01" 
                                        placeholder="Se calcula automáticamente" 
                                        className="w-full px-4 py-3 bg-gray-100 rounded-xl border border-gray-100 text-sm font-semibold text-gray-600" 
                                    />
                                </div>

                                {/* Stock */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stock *</label>
                                    <input 
                                        type="number" 
                                        name="stock" 
                                        value={formData.stock} 
                                        onChange={handleInputChange} 
                                        required 
                                        min="0" 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" 
                                        placeholder="0" 
                                    />
                                </div>

                                {/* Talla */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tallas disponibles *</label>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {sizeOptions.map((size, index) => <div key={`size-${index}`} className="flex w-[74px] items-center gap-1"><input type="text" value={size} onChange={(event) => setSizeOptions((current) => current.map((value, optionIndex) => optionIndex === index ? event.target.value : value))} required={index === 0} className="w-full min-w-0 rounded-lg border border-gray-100 bg-gray-50 px-2 py-2 text-center text-xs font-semibold outline-none transition-all focus:border-store-red focus:ring-2 focus:ring-store-red/20" placeholder="38" />{sizeOptions.length > 1 && <button type="button" onClick={() => setSizeOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))} className="p-0.5 text-gray-400 hover:text-red-600" aria-label="Eliminar talla"><X size={13} /></button>}</div>)}
                                        <button type="button" onClick={() => setSizeOptions((current) => [...current, ''])} className="text-xs font-bold text-store-red hover:underline">+ Agregar otra talla</button>
                                    </div>
                                    <p className="text-[11px] text-gray-400">Cada talla se guarda como un registro individual en product_sizes.</p>
                                </div>

                                {/* Color */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Colores disponibles *</label>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {colorOptions.map((color, index) => <div key={`color-${index}`} className="flex w-[96px] items-center gap-1"><input type="text" value={color} onChange={(event) => setColorOptions((current) => current.map((value, optionIndex) => optionIndex === index ? event.target.value : value))} required={index === 0} className="w-full min-w-0 rounded-lg border border-gray-100 bg-gray-50 px-2 py-2 text-center text-xs font-semibold outline-none transition-all focus:border-store-red focus:ring-2 focus:ring-store-red/20" placeholder="Negro" />{colorOptions.length > 1 && <button type="button" onClick={() => setColorOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))} className="p-0.5 text-gray-400 hover:text-red-600" aria-label="Eliminar color"><X size={13} /></button>}</div>)}
                                        <button type="button" onClick={() => setColorOptions((current) => [...current, ''])} className="text-xs font-bold text-store-red hover:underline">+ Agregar otro color</button>
                                    </div>
                                    <p className="text-[11px] text-gray-400">Cada color se guarda como un registro individual en product_colors.</p>
                                </div>

                                {/* Material */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Material *</label>
                                    <input 
                                        type="text" 
                                        name="material" 
                                        value={formData.material} 
                                        onChange={handleInputChange} 
                                        required 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" 
                                        placeholder="Ej: Cuero, Tela, Sintético" 
                                    />
                                </div>

                                {/* Calificación */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calificación (1-5) *</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            name="rating" 
                                            value={formData.rating || 0} 
                                            onChange={handleInputChange} 
                                            required 
                                            min="0" 
                                            max="5" 
                                            step="0.1" 
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" 
                                            placeholder="4.5" 
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400">Calificación promedio (0-5)</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Número de Reseñas *</label>
                                    <input 
                                        type="number" 
                                        name="reviews" 
                                        value={formData.reviews || 0} 
                                        onChange={handleInputChange} 
                                        required 
                                        min="0" 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold" 
                                        placeholder="0" 
                                    />
                                    <p className="text-[10px] text-gray-400">Cantidad de reseñas</p>
                                </div>

                                {/* Descripción */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
                                    <textarea 
                                        name="description" 
                                        value={formData.description || ''} 
                                        onChange={handleInputChange} 
                                        rows={4} 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-store-red/20 focus:border-store-red outline-none transition-all text-sm font-semibold resize-y" 
                                        placeholder="Describe el producto..." 
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Imágenes del Producto (Máx 5)
                                    </label>

                                    <div className="flex items-center gap-4 mb-4">
                                        <label className="cursor-pointer bg-store-red text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-store-redDark transition-colors shadow-lg">
                                             Seleccionar imágenes (hasta 5)
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleMultipleFiles}
                                                accept="image/png, image/jpeg, image/webp"
                                                multiple
                                            />
                                        </label>
                                        <span className="text-xs text-gray-400">
                                            {selectedFiles.filter(f => f !== null).length} / 5 imágenes seleccionadas
                                        </span>
                                    </div>

                                    {/* Grid de previews */}
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                        {[0, 1, 2, 3, 4].map((index) => (
                                            <div key={index} className="space-y-2">
                                                <div className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group relative transition-all hover:border-store-red/50">
                                                    {previews[index] ? (
                                                        <img src={previews[index] || ''} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300" size={24} />
                                                    )}
                                                    {previews[index] && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
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

            {/* Modal de vista */}
            {productToView && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-store-red">Detalle del producto</p>
                                <h2 className="text-2xl font-black text-black mt-1">{productToView.name}</h2>
                            </div>
                            <button onClick={() => setProductToView(null)} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                            {(productToView.images?.length ? productToView.images : [productToView.img]).filter(Boolean).map((image, index) => (
                                <img key={`${image}-${index}`} src={getImageUrl(image)} alt={`${productToView.name} ${index + 1}`} className="w-full aspect-square object-cover rounded-xl border border-gray-200 bg-gray-50" />
                            ))}
                        </div>

                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nombre</dt><dd className="mt-1 font-bold text-black">{productToView.name || 'Sin información'}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Categoría</dt><dd className="mt-1 font-bold text-black">{getCategoryName(productToView)}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Subcategoría</dt><dd className="mt-1 font-bold text-black">{subcategories.find(sub => sub.id === productToView.subcategory_id)?.name || 'Sin subcategoría'}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Marca</dt><dd className="mt-1 font-bold text-black">{getBrandName(productToView)}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Precio</dt><dd className="mt-1 font-bold text-black">$ {Number(productToView.price || 0).toFixed(2)}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Precio con descuento</dt><dd className="mt-1 font-bold text-black">{productToView.discounted_price ? `$ ${Number(productToView.discounted_price).toFixed(2)}` : 'Sin descuento'}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</dt><dd className="mt-1 font-bold text-black">{productToView.stock} unidades</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Descuento</dt><dd className="mt-1 font-bold text-black">{productToView.discount ? `-${productToView.discount}%` : 'Sin descuento'}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Talla</dt><dd className="mt-1 font-bold text-black">{productToView.size || 'Sin información'}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Color</dt><dd className="mt-1 font-bold text-black">{productToView.color || 'Sin información'}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Material</dt><dd className="mt-1 font-bold text-black">{productToView.material || 'Sin información'}</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Calificación</dt><dd className="mt-1 font-bold text-black">{productToView.rating} / 5</dd></div>
                            <div><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Reseñas</dt><dd className="mt-1 font-bold text-black">{productToView.reviews}</dd></div>
                            <div className="sm:col-span-2"><dt className="text-[10px] font-black uppercase tracking-widest text-gray-400">Descripción</dt><dd className="mt-1 whitespace-pre-line text-gray-700">{productToView.description || 'Sin descripción'}</dd></div>
                        </dl>
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