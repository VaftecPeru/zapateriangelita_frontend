import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Download, Edit, Eye, FileSpreadsheet, FileText, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import { Brand, Category, Product, Subcategory, brandService, categoryService, productService, subcategoryService } from '../../../services/crudService';
import { getImageUrl } from '../../../config/api';
import ProductEditorModal from './ProductEditorModal';
import ProductImportModal from './ProductImportModal';
import Pagination from '../../../components/Pagination';
import { usePagination } from '../../../hooks/usePagination';
import './product-editor.css';

const ProductManagerV2 = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [modelPriceOpen, setModelPriceOpen] = useState(false);
  const [modelPriceSaving, setModelPriceSaving] = useState(false);
  const [modelPriceError, setModelPriceError] = useState('');
  const [modelPrice, setModelPrice] = useState({
    brand_id: '', category_id: '', model: '', price: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'low' | 'out'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const priceModels = useMemo(() => Array.from(new Set(
    products
      .filter((p) => String(p.brand_id ?? '') === modelPrice.brand_id
        && String(p.category_id ?? '') === modelPrice.category_id
        && p.auto_publish && Number(p.price) <= 0 && String(p.model ?? '').trim() !== '')
      .map((p) => String(p.model).trim()),
  )).sort(), [products, modelPrice.brand_id, modelPrice.category_id]);

  const saveModelPrice = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(modelPrice.price);
    if (!modelPrice.brand_id || !modelPrice.category_id || !modelPrice.model || !Number.isFinite(amount) || amount <= 0) {
      setModelPriceError('Selecciona marca, categoría y modelo; indica un precio válido mayor que cero.');
      return;
    }
    setModelPriceSaving(true);
    setModelPriceError('');
    try {
      const response = await productService.assignModelPrice({
        brand_id: Number(modelPrice.brand_id),
        category_id: Number(modelPrice.category_id),
        model: modelPrice.model,
        price: amount,
      });
      setModelPriceOpen(false);
      setModelPrice({ brand_id: '', category_id: '', model: '', price: '' });
      await loadData();
      window.alert(
        `Precios asignados a ${response.data.summary.updated} productos. `
        + `${response.data.summary.published} publicados; ${response.data.summary.drafts} siguen en borrador por campos pendientes.`,
      );
    } catch (error: any) {
      setModelPriceError(error?.response?.data?.message || 'No se pudo asignar el precio del modelo.');
    } finally {
      setModelPriceSaving(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, subcategoriesRes, brandsRes] = await Promise.all([
        productService.getAllAdmin(),
        categoryService.getAll(),
        subcategoryService.getAll(),
        brandService.getAll(),
      ]);

      setProducts(Array.isArray(productsRes.data) ? productsRes.data : ((productsRes.data as any)?.data || []));
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : ((categoriesRes.data as any)?.data || []));
      setSubcategories(Array.isArray(subcategoriesRes.data) ? subcategoriesRes.data : ((subcategoriesRes.data as any)?.data || []));
      setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : ((brandsRes.data as any)?.data || []));
    } catch (error) {
      console.error('Error loading products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totalInventory = useMemo(() => products.reduce((sum, product) => sum + Number(product.stock || 0), 0), [products]);
  const productsWithStock = useMemo(() => products.filter((product) => Number(product.stock || 0) > 0).length, [products]);
  const outOfStock = products.length - productsWithStock;

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return products.filter((product) => {
      const brandName = typeof product.brand === 'object' ? product.brand.name : String(product.brand || '');
      const categoryName = typeof product.category === 'object' ? product.category.name : String(product.category || '');
      const searchable = [
        product.product_code,
        product.name,
        product.model,
        brandName,
        categoryName,
      ].map((value) => String(value || '').toLocaleLowerCase());

      if (query && !searchable.some((value) => value.includes(query))) return false;
      if (categoryFilter && String(product.category_id || '') !== categoryFilter) return false;
      if (brandFilter && String(product.brand_id || '') !== brandFilter) return false;

      const stock = Number(product.stock || 0);
      if (stockFilter === 'available' && stock <= 5) return false;
      if (stockFilter === 'low' && (stock < 1 || stock > 5)) return false;
      if (stockFilter === 'out' && stock > 0) return false;

      const isActive = product.is_active !== false;
      if (activeFilter === 'active' && !isActive) return false;
      if (activeFilter === 'inactive' && isActive) return false;

      return true;
    });
  }, [products, search, categoryFilter, brandFilter, stockFilter, activeFilter]);

  const productPagination = usePagination(filteredProducts, 25);

  useEffect(() => {
    productPagination.resetPage();
  }, [search, categoryFilter, brandFilter, stockFilter, activeFilter]);

  const getCategoryName = (product: Product) => {
    if (typeof product.category === 'string') return product.category || 'Sin categoría';
    if (product.category && typeof product.category === 'object') return product.category.name || 'Sin categoría';
    return categories.find((item) => item.id === product.category_id)?.name || 'Sin categoría';
  };

  const getBrandName = (product: Product) => {
    if (typeof product.brand === 'string') return product.brand || 'Sin marca';
    if (product.brand && typeof product.brand === 'object') return product.brand.name || 'Sin marca';
    return brands.find((item) => item.id === product.brand_id)?.name || 'Sin marca';
  };

  const openNew = () => {
    setEditingProduct(null);
    setEditorOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteProduct?.id) return;
    setDeleting(true);
    try {
      await productService.delete(deleteProduct.id);
      setDeleteProduct(null);
      await loadData();
    } catch (error) {
      console.error('Error deleting product', error);
      alert('No se pudo eliminar el producto.');
    } finally {
      setDeleting(false);
    }
  };

  const downloadInventory = async (format: 'excel' | 'pdf') => {
    if (exporting) return;

    setExporting(format);
    try {
      const response = await productService.exportInventory(format, {
        search: search.trim() || undefined,
        category_id: categoryFilter || undefined,
        brand_id: brandFilter || undefined,
        stock_state: stockFilter === 'all' ? undefined : stockFilter,
        active_state: activeFilter === 'all' ? undefined : activeFilter,
      });

      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data]);

      const disposition = String(response.headers?.['content-disposition'] || '');
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
      const fallback = `inventario-zapateria-angelita-${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xls' : 'pdf'}`;
      const filename = filenameMatch?.[1] || fallback;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error exporting inventory to ${format}`, error);
      alert('No se pudo descargar el inventario. Intenta nuevamente.');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-gray-200 bg-store-surface py-20">
        <Loader2 className="mb-4 animate-spin text-store-red" size={40} />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-black">Gestión de Productos</h2>
            <p className="text-xs font-medium text-gray-400">Administra catálogo, variantes e inventario de Zapatería Angelita.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => downloadInventory('excel')}
              disabled={exporting !== null}
              title="Descargar inventario actual en Excel"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting === 'excel' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Excel
            </button>
            <button
              type="button"
              onClick={() => downloadInventory('pdf')}
              disabled={exporting !== null}
              title="Descargar inventario actual en PDF"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exporting === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
              PDF
            </button>
            <button onClick={() => { setModelPriceError(''); setModelPriceOpen(true); }} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-600 shadow-sm transition hover:border-store-red hover:text-store-red">
              Precio por modelo
            </button>
            <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-600 shadow-sm transition hover:border-store-red hover:text-store-red">
              <FileSpreadsheet size={16} /> Importar
            </button>
            <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-store-red px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg transition hover:bg-store-redDark">
              <Plus size={16} /> Nuevo Producto
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InventoryCard label="Stock total" value={totalInventory} helper="Unidades disponibles" />
          <InventoryCard label="Productos con stock" value={productsWithStock} helper={`${products.length} productos registrados`} />
          <InventoryCard label="Agotados" value={outOfStock} helper="Requieren reposición" danger={outOfStock > 0} />
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(260px,1.6fr)_1fr_1fr_1fr_1fr]">
          <label className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código de producto, nombre, modelo o marca"
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 text-sm font-semibold outline-none focus:border-store-red focus:bg-white"
            />
          </label>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold">
            <option value="">Todas las categorías</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)} className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold">
            <option value="">Todas las marcas</option>
            {brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value as typeof stockFilter)} className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold">
            <option value="all">Todo el inventario</option>
            <option value="available">Stock mayor a 5</option>
            <option value="low">Stock bajo (1 a 5)</option>
            <option value="out">Agotados</option>
          </select>
          <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value as typeof activeFilter)} className="h-12 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold">
            <option value="all">Todos los estados</option>
            <option value="active">Visibles en tienda</option>
            <option value="inactive">Ocultos / inactivos</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white/50 shadow-sm backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-store-red/5">
                <th className="w-16 px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-store-red/80">N°</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Producto</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Categoría</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Marca</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Precio</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Visibilidad</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-store-red/80">Acciones</th>
              </tr>
            </thead>
            <tbody key={productPagination.page} className="ui-motion-rows divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center font-medium text-gray-400">No hay productos registrados.</td></tr>
              ) : productPagination.paginatedItems.map((product, index) => (
                <tr key={product.id} className="group transition-colors hover:bg-store-red/[0.02]">
                  <td className="w-16 px-4 py-4 text-center">
                    <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-gray-100 px-2 text-xs font-black text-gray-600">{((productPagination.page - 1) * productPagination.pageSize) + index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {product.img ? <img src={getImageUrl(product.img)} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-gray-300">SIN FOTO</div>}
                      </div>
                      <div>
                        <p className="mb-0.5 text-sm font-black leading-tight text-black">{product.name}</p>
                        <p className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">{product.product_code || 'Sin código'} · {product.color || 'Sin color'} · {product.size || 'Sin talla'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="text-[10px] font-black uppercase text-gray-400">{getCategoryName(product)}</span></td>
                  <td className="px-6 py-4"><span className="text-[10px] font-black uppercase text-gray-400">{getBrandName(product)}</span></td>
                  <td className="px-6 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${Number(product.stock || 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}>{Number(product.stock || 0) > 0 ? `${product.stock} unidades` : 'Agotado'}</span></td>
                  <td className="px-6 py-4 text-sm font-black text-black">
                    {product.discounted_price && Number(product.discounted_price) > 0 ? (
                      <div className="flex items-center gap-2"><span className="text-[10px] text-gray-400 line-through">${Number(product.price || 0).toFixed(2)}</span><span>${Number(product.discounted_price).toFixed(2)}</span></div>
                    ) : `$${Number(product.price || 0).toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${product.is_active === false ? 'bg-gray-200 text-gray-600' : 'bg-emerald-50 text-emerald-700'}`}>
                      {product.is_active === false ? 'Inactivo' : 'Visible'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewProduct(product)} title="Ver producto" className="rounded-xl border border-gray-200 bg-white p-3 text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-black"><Eye size={14} /></button>
                      <button onClick={() => openEdit(product)} title="Editar producto" className="rounded-xl bg-store-red p-3 text-white shadow-md transition hover:bg-store-redDark"><Edit size={14} /></button>
                      <button onClick={() => setDeleteProduct(product)} title="Eliminar producto" className="rounded-xl border border-red-50 bg-white p-3 text-gray-400 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={productPagination.page}
          pageSize={productPagination.pageSize}
          totalItems={productPagination.totalItems}
          onPageChange={productPagination.setPage}
          onPageSizeChange={productPagination.setPageSize}
        />
      </div>

      <ProductEditorModal open={editorOpen} product={editingProduct} products={products} categories={categories} subcategories={subcategories} brands={brands} onClose={() => setEditorOpen(false)} onSaved={loadData} />
      <ProductImportModal open={importOpen} onClose={() => setImportOpen(false)} onImported={loadData} />

      {modelPriceOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Asignar precio por modelo">
          <form onSubmit={saveModelPrice} className="w-full max-w-xl space-y-4 rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">Precio MXN por modelo</h3>
                <p className="mt-1 text-sm text-gray-500">Aplica el mismo precio a todos los colores del modelo que aún están a 0. Nunca reemplaza precios ya confirmados.</p>
              </div>
              <button type="button" aria-label="Cerrar" onClick={() => setModelPriceOpen(false)} disabled={modelPriceSaving}><X size={21} /></button>
            </div>
            <label className="block text-xs font-bold">Marca
              <select required value={modelPrice.brand_id}
                onChange={(e) => setModelPrice((v) => ({ ...v, brand_id: e.target.value, model: '' }))}
                className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm">
                <option value="">Seleccionar marca</option>
                {brands.filter((brand) => brand.id).map((brand) =>
                  <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold">Categoría
              <select required value={modelPrice.category_id}
                onChange={(e) => setModelPrice((v) => ({ ...v, category_id: e.target.value, model: '' }))}
                className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm">
                <option value="">Seleccionar categoría</option>
                {categories.filter((category) => category.id).map((category) =>
                  <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold">Modelo con precio pendiente
              <select required value={modelPrice.model}
                onChange={(e) => setModelPrice((v) => ({ ...v, model: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm">
                <option value="">Seleccionar modelo</option>
                {priceModels.map((model) => <option key={model} value={model}>{model}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold">Precio común (MXN)
              <input required type="number" min="0.01" step="0.01" value={modelPrice.price}
                onChange={(e) => setModelPrice((v) => ({ ...v, price: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" placeholder="0.00" />
            </label>
            <p className="text-xs text-gray-500">Los productos sin fotografías comerciales o con stock pendiente permanecerán ocultos después de guardar el precio.</p>
            {modelPriceError && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{modelPriceError}</p>}
            <button type="submit" disabled={modelPriceSaving || !priceModels.length}
              className="w-full rounded-xl bg-store-red px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
              {modelPriceSaving ? 'Guardando precio…' : 'Aplicar a colores pendientes'}
            </button>
          </form>
        </div>
      }

      {viewProduct && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-gray-200 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-start justify-between border-b border-gray-100 pb-4">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-store-red">Detalle del producto</p><h2 className="mt-1 text-2xl font-black text-black">{viewProduct.name}</h2></div>
              <button onClick={() => setViewProduct(null)} className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-red-50 hover:text-red-500"><X size={20} /></button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Detail label="Código" value={viewProduct.product_code || 'Sin código'} />
              <Detail label="Categoría" value={getCategoryName(viewProduct)} />
              <Detail label="Marca" value={getBrandName(viewProduct)} />
              <Detail label="Stock total" value={`${Number(viewProduct.stock || 0)} unidades`} />
              <Detail label="Colores" value={viewProduct.color || 'Sin información'} />
              <Detail label="Tallas" value={viewProduct.size || 'Sin información'} />
              <Detail
                label="Inventario por talla"
                value={
                  viewProduct.sizes?.length
                    ? viewProduct.sizes
                        .slice()
                        .sort((a, b) => String(a.size).localeCompare(String(b.size), undefined, { numeric: true }))
                        .map((item) => `${item.size}: ${Number(item.stock || 0)}`)
                        .join(' · ')
                    : 'Sin desglose'
                }
              />
              <Detail label="Material" value={viewProduct.material || 'Sin información'} />
              <Detail label="Precio" value={`$${Number(viewProduct.price || 0).toFixed(2)}`} />
              <Detail label="Visibilidad" value={viewProduct.is_active === false ? 'Inactivo / oculto en tienda' : 'Visible en tienda'} />
              <div className="sm:col-span-2"><Detail label="Descripción" value={viewProduct.description || 'Sin descripción'} /></div>
            </div>
          </div>
        </div>
      )}

      {deleteProduct && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-[2.5rem] border border-white/20 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500"><AlertTriangle size={40} /></div>
            <h2 className="mb-2 text-2xl font-black text-black">¿Eliminar producto?</h2>
            <p className="mb-8 text-sm font-medium text-gray-400">Se eliminará <strong>{deleteProduct.name}</strong> de forma permanente.</p>
            <div className="flex gap-3"><button onClick={() => setDeleteProduct(null)} disabled={deleting} className="flex-1 rounded-2xl bg-gray-100 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-200">Cancelar</button><button onClick={handleDelete} disabled={deleting} className="flex-1 rounded-2xl bg-red-500 py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 hover:bg-red-600 disabled:opacity-50">{deleting ? 'Eliminando...' : 'Eliminar'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryCard = ({ label, value, helper, danger = false }: { label: string; value: number; helper: string; danger?: boolean }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    <div className="mt-1 flex items-end gap-2"><span className={`text-2xl font-black ${danger ? 'text-red-500' : 'text-black'}`}>{value.toLocaleString()}</span><span className="pb-1 text-[10px] font-semibold text-gray-400">{helper}</span></div>
  </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => <div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p><p className="mt-1 font-bold text-black">{value}</p></div>;

export default ProductManagerV2;
