import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, Image as ImageIcon, Plus, Settings2, Trash2, X } from 'lucide-react';
import {
  Brand,
  Category,
  Product,
  Subcategory,
  brandService,
  categoryService,
  productService,
} from '../../../services/crudService';
import { getImageUrl } from '../../../config/api';
import { ProductVariantDraft } from './types';

type Props = {
  open: boolean;
  product: Product | null;
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

type EditorForm = {
  product_code: string;
  name: string;
  category_id?: number;
  subcategory_id?: number;
  brand_id?: number;
  price: number;
  discount: string;
  stock: number;
  status: 'normal' | 'oferta' | 'nuevo';
  material: string;
  description: string;
};

type CatalogKind = 'category' | 'brand';

const emptyForm = (): EditorForm => ({
  product_code: '',
  name: '',
  category_id: undefined,
  subcategory_id: undefined,
  brand_id: undefined,
  price: 0,
  discount: '',
  stock: 0,
  status: 'normal',
  material: '',
  description: '',
});

const emptyVariant = (): ProductVariantDraft => ({
  color: '',
  sizes: [''],
  files: [],
  previews: [],
  existingImages: [],
});

const parseList = (value?: string) =>
  String(value || '')
    .split(/[,|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const parseColors = (value?: string) =>
  String(value || '')
    .split(/[,/|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const ProductEditorModal = ({
  open,
  product,
  categories,
  subcategories,
  brands,
  onClose,
  onSaved,
}: Props) => {
  const [form, setForm] = useState<EditorForm>(emptyForm());
  const [variants, setVariants] = useState<ProductVariantDraft[]>([emptyVariant()]);
  const [generalFiles, setGeneralFiles] = useState<(File | null)[]>(Array(5).fill(null));
  const [generalPreviews, setGeneralPreviews] = useState<(string | null)[]>(Array(5).fill(null));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [catalogManager, setCatalogManager] = useState<CatalogKind | null>(null);
  const [catalogName, setCatalogName] = useState('');
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    if (!open) return;

    setError('');
    setSaving(false);
    setCatalogManager(null);
    setCatalogName('');
    setCatalogError('');

    if (!product) {
      setForm(emptyForm());
      setVariants([emptyVariant()]);
      setGeneralFiles(Array(5).fill(null));
      setGeneralPreviews(Array(5).fill(null));
      return;
    }

    setForm({
      product_code: product.product_code || '',
      name: product.name || '',
      category_id: product.category_id,
      subcategory_id: product.subcategory_id,
      brand_id: product.brand_id,
      price: Number(product.price || 0),
      discount: product.discount || '',
      stock: Number(product.stock || 0),
      status: product.status || 'normal',
      material: product.material || '',
      description: product.description || '',
    });

    const colors = parseColors(product.color);
    const globalSizes = parseList(product.size);
    const productVariants = colors.length
      ? colors.map((color) => ({
          color,
          sizes: product.color_sizes?.[color]?.length
            ? product.color_sizes[color]
            : globalSizes.length
              ? globalSizes
              : [''],
          files: [],
          previews: [],
          existingImages: (product.color_images?.[color] || []).map((image) => getImageUrl(image)),
        }))
      : [emptyVariant()];

    setVariants(productVariants);

    const previews = Array(5).fill(null) as (string | null)[];
    const images = product.images?.length ? product.images : product.img ? [product.img] : [];
    images.slice(0, 5).forEach((image, index) => {
      previews[index] = getImageUrl(image);
    });
    setGeneralPreviews(previews);
    setGeneralFiles(Array(5).fill(null));
  }, [open, product]);

  const filteredSubcategories = useMemo(
    () => subcategories.filter((item) => item.category_id === form.category_id),
    [subcategories, form.category_id],
  );

  const discountedPrice =
    form.price > 0 && Number(form.discount) > 0
      ? Number((form.price * (1 - Math.min(Number(form.discount), 100) / 100)).toFixed(2))
      : 0;

  const setVariant = (index: number, patch: Partial<ProductVariantDraft>) => {
    setVariants((current) =>
      current.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    );
  };

  const addVariant = () => setVariants((current) => [...current, emptyVariant()]);

  const removeVariant = (index: number) => {
    setVariants((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== index),
    );
  };

  const updateSize = (variantIndex: number, sizeIndex: number, value: string) => {
    const sizes = [...variants[variantIndex].sizes];
    sizes[sizeIndex] = value;
    setVariant(variantIndex, { sizes });
  };

  const addSize = (variantIndex: number) => {
    setVariant(variantIndex, { sizes: [...variants[variantIndex].sizes, ''] });
  };

  const removeSize = (variantIndex: number, sizeIndex: number) => {
    const sizes = variants[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
    setVariant(variantIndex, { sizes: sizes.length ? sizes : [''] });
  };

  const handleVariantImages = (variantIndex: number, filesList: FileList | null) => {
    const files = Array.from(filesList || []).slice(0, 5);
    const previews = files.map((file) => URL.createObjectURL(file));
    setVariant(variantIndex, { files, previews });
  };

  const handleGeneralFiles = (filesList: FileList | null) => {
    const files = Array.from(filesList || []).slice(0, 5);
    const nextFiles = [...generalFiles];
    const nextPreviews = [...generalPreviews];
    let cursor = nextFiles.findIndex((file, index) => !file && !nextPreviews[index]);

    if (cursor < 0) cursor = 5;

    files.forEach((file) => {
      if (cursor >= 5) return;
      nextFiles[cursor] = file;
      nextPreviews[cursor] = URL.createObjectURL(file);
      cursor += 1;
    });

    setGeneralFiles(nextFiles);
    setGeneralPreviews(nextPreviews);
  };

  const removeGeneralImage = (index: number) => {
    const files = [...generalFiles];
    const previews = [...generalPreviews];
    files[index] = null;
    previews[index] = null;
    setGeneralFiles(files);
    setGeneralPreviews(previews);
  };

  const openCatalogManager = (kind: CatalogKind) => {
    setCatalogManager(kind);
    setCatalogName('');
    setCatalogError('');
  };

  const closeCatalogManager = () => {
    if (catalogBusy) return;
    setCatalogManager(null);
    setCatalogName('');
    setCatalogError('');
  };

  const createCatalogItem = async () => {
    const name = catalogName.trim();
    if (!catalogManager || !name) {
      setCatalogError('Ingresa un nombre antes de agregar.');
      return;
    }

    setCatalogBusy(true);
    setCatalogError('');

    try {
      if (catalogManager === 'category') {
        const response = await categoryService.create({ name, is_active: true });
        const created = response.data as Category;
        setForm((current) => ({
          ...current,
          category_id: created.id,
          subcategory_id: undefined,
        }));
      } else {
        const response = await brandService.create({ name, is_active: true });
        const created = response.data as Brand;
        setForm((current) => ({ ...current, brand_id: created.id }));
      }

      setCatalogName('');
      await onSaved();
    } catch (err: any) {
      const responseErrors = err?.response?.data?.errors;
      const responseMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (responseErrors
          ? Object.values(responseErrors)
              .flat()
              .map(String)
              .join(' ')
          : '');
      setCatalogError(responseMessage || 'No se pudo agregar el registro.');
    } finally {
      setCatalogBusy(false);
    }
  };

  const deleteCatalogItem = async (id: number | undefined, name: string) => {
    if (!catalogManager || !id) return;

    const entityLabel = catalogManager === 'category' ? 'categoría' : 'marca';
    if (!window.confirm(`¿Eliminar la ${entityLabel} "${name}"?`)) return;

    setCatalogBusy(true);
    setCatalogError('');

    try {
      if (catalogManager === 'category') {
        await categoryService.delete(id);
        setForm((current) =>
          current.category_id === id
            ? { ...current, category_id: undefined, subcategory_id: undefined }
            : current,
        );
      } else {
        await brandService.delete(id);
        setForm((current) =>
          current.brand_id === id ? { ...current, brand_id: undefined } : current,
        );
      }

      await onSaved();
    } catch (err: any) {
      setCatalogError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          `No se pudo eliminar la ${entityLabel}.`,
      );
    } finally {
      setCatalogBusy(false);
    }
  };

  const validate = () => {
    if (!form.name.trim()) return 'Ingresa el nombre del producto.';
    if (!form.category_id) return 'Selecciona una categoría.';
    if (!(Number(form.price) > 0)) return 'El precio debe ser mayor que 0.';
    if (Number(form.stock) < 0) return 'El stock no puede ser negativo.';
    if (!form.material.trim()) return 'Ingresa el material del producto.';

    const cleaned = variants
      .map((variant) => ({
        color: variant.color.trim(),
        sizes: variant.sizes.map((size) => size.trim()).filter(Boolean),
      }))
      .filter((variant) => variant.color || variant.sizes.length);

    if (!cleaned.length || cleaned.some((variant) => !variant.color)) {
      return 'Cada variante debe tener un color.';
    }

    if (cleaned.some((variant) => !variant.sizes.length)) {
      return 'Cada color debe tener al menos una talla.';
    }

    const colors = cleaned.map((variant) => variant.color.toLocaleLowerCase());
    if (new Set(colors).size !== colors.length) {
      return 'No puedes registrar el mismo color dos veces.';
    }

    return '';
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validate();

    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const activeVariants = variants.filter((variant) => variant.color.trim());
      const colors = activeVariants.map((variant) => variant.color.trim());
      const uniqueSizes = Array.from(
        new Set(
          activeVariants.flatMap((variant) =>
            variant.sizes.map((size) => size.trim()).filter(Boolean),
          ),
        ),
      );

      const colorSizes = activeVariants.reduce<Record<string, string[]>>((acc, variant) => {
        acc[variant.color.trim()] = Array.from(
          new Set(variant.sizes.map((size) => size.trim()).filter(Boolean)),
        );
        return acc;
      }, {});

      const data = new FormData();
      data.append('name', form.name.trim());
      if (form.product_code.trim()) data.append('product_code', form.product_code.trim());
      data.append('category_id', String(form.category_id));
      if (form.subcategory_id) data.append('subcategory_id', String(form.subcategory_id));
      if (form.brand_id) data.append('brand_id', String(form.brand_id));
      data.append('price', String(form.price));
      data.append('stock', String(Math.trunc(Number(form.stock))));
      data.append('size', uniqueSizes.join(','));
      data.append('color', colors.join(','));
      data.append('material', form.material.trim());
      data.append('rating', String(product?.rating ?? 0));
      data.append('reviews', String(product?.reviews ?? 0));
      data.append('discount', form.discount ? String(form.discount) : '');
      data.append('status', form.status);
      data.append('description', form.description || '');
      data.append('color_sizes', JSON.stringify(colorSizes));

      activeVariants.forEach((variant, index) => {
        variant.files
          .slice(0, 5)
          .forEach((file) => data.append(`color_images[${index}][]`, file));
      });

      const imageSlots = generalPreviews.map((preview, index) => {
        if (generalFiles[index] instanceof File) return '__NEW__';
        if (preview) return preview;
        return '__EMPTY__';
      });

      data.append('image_slots', JSON.stringify(imageSlots));
      generalFiles.forEach((file) => {
        if (file instanceof File) data.append('new_images[]', file);
      });

      if (product?.id) await productService.update(product.id, data);
      else await productService.create(data);

      await onSaved();
      onClose();
    } catch (err: any) {
      console.error('Error saving product', err);
      const responseErrors = err?.response?.data?.errors;

      if (responseErrors) {
        setError(
          Object.entries(responseErrors)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`,
            )
            .join('\n'),
        );
      } else {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'No se pudo guardar el producto.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const managedItems = catalogManager === 'category' ? categories : brands;
  const managerTitle = catalogManager === 'category' ? 'Gestionar categorías' : 'Gestionar marcas';
  const managerLabel = catalogManager === 'category' ? 'Nueva categoría' : 'Nueva marca';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm sm:p-5">
      <div className="max-h-[95vh] w-full max-w-6xl overflow-y-auto rounded-[2.4rem] border border-gray-200 bg-white p-5 shadow-2xl sm:p-8 lg:p-10">
        <div className="mb-7 grid grid-cols-[1fr_auto] items-start gap-4 border-b border-gray-100 pb-5 sm:grid-cols-[1fr_180px_auto]">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-black">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-store-red">
              Catálogo e inventario · Zapatería Angelita
            </p>
          </div>

          <div className="hidden space-y-1 sm:block">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Código de producto
            </label>
            <input
              value={form.product_code}
              onChange={(e) => setForm({ ...form, product_code: e.target.value })}
              className="w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-store-red focus:ring-2 focus:ring-store-red/20"
              placeholder="ZAP-001"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-red-50 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p className="whitespace-pre-line">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-7">
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div className="border-b border-gray-100 pb-2 md:col-span-2 xl:col-span-4">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-store-red">
                Información del catálogo
              </p>
            </div>

            <div className="space-y-2 md:col-span-2 xl:col-span-4">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Nombre del producto *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-store-red focus:ring-2 focus:ring-store-red/20"
                placeholder="Ej: Botín Mujer Catalina"
              />
            </div>

            <div className="space-y-2 xl:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Categoría *
                </label>
                <button
                  type="button"
                  onClick={() => openCatalogManager('category')}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-store-red hover:underline"
                >
                  <Settings2 size={12} /> Gestionar
                </button>
              </div>
              <div className="relative">
                <select
                  value={form.category_id || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      category_id: Number(e.target.value) || undefined,
                      subcategory_id: undefined,
                    })
                  }
                  className="w-full appearance-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-store-red focus:ring-2 focus:ring-store-red/20"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Subcategoría
              </label>
              <div className="relative">
                <select
                  value={form.subcategory_id || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      subcategory_id: Number(e.target.value) || undefined,
                    })
                  }
                  disabled={!form.category_id}
                  className="w-full appearance-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none disabled:opacity-50"
                >
                  <option value="">Sin subcategoría</option>
                  {filteredSubcategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Marca
                </label>
                <button
                  type="button"
                  onClick={() => openCatalogManager('brand')}
                  className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-store-red hover:underline"
                >
                  <Settings2 size={12} /> Gestionar
                </button>
              </div>
              <div className="relative">
                <select
                  value={form.brand_id || ''}
                  onChange={(e) =>
                    setForm({ ...form, brand_id: Number(e.target.value) || undefined })
                  }
                  className="w-full appearance-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none"
                >
                  <option value="">Seleccionar marca</option>
                  {brands.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
            <div className="border-b border-gray-100 pb-2 md:col-span-2 xl:col-span-5">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-store-red">
                Precio e inventario
              </p>
            </div>

            <Field label="Precio (USD) *">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="field-input"
              />
            </Field>

            <Field label="Descuento (%)">
              <input
                type="number"
                min="0"
                max="100"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="field-input"
                placeholder="0"
              />
            </Field>

            <Field label="Precio final">
              <input
                value={discountedPrice ? discountedPrice.toFixed(2) : ''}
                readOnly
                className="field-input bg-gray-100 text-gray-500"
                placeholder="Automático"
              />
            </Field>

            <Field label="Stock total *">
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Math.max(0, Number(e.target.value)) })
                }
                className="field-input"
              />
            </Field>

            <Field label="Estado *">
              <div className="relative">
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as EditorForm['status'] })
                  }
                  className="field-input appearance-none"
                >
                  <option value="normal">Normal</option>
                  <option value="oferta">Oferta</option>
                  <option value="nuevo">Nuevo</option>
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </Field>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs text-blue-800 md:col-span-2 xl:col-span-5">
              <strong>Stock maestro:</strong> esta cantidad representa las unidades totales
              disponibles del artículo y es la referencia para inventario, dashboard y portada.
              Las tallas y colores describen las variantes sin duplicar este total.
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-2">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-store-red">
                  Variantes del producto
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Cada color agrupa sus imágenes y tallas.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-2 rounded-xl border border-store-red/20 bg-red-50 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-store-red hover:bg-store-red hover:text-white"
              >
                <Plus size={15} /> Agregar color
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={`variant-${index}`}
                  className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 sm:p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Variante {index + 1}
                      </p>
                      <p className="text-sm font-black text-black">
                        {variant.color || 'Nuevo color'}
                      </p>
                    </div>

                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Color *
                      </label>
                      <input
                        value={variant.color}
                        onChange={(e) => setVariant(index, { color: e.target.value })}
                        className="field-input bg-white"
                        placeholder="Ej: Negro"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Tallas disponibles *
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        {variant.sizes.map((size, sizeIndex) => (
                          <div
                            key={`size-${index}-${sizeIndex}`}
                            className="flex items-center gap-1"
                          >
                            <input
                              value={size}
                              onChange={(e) =>
                                updateSize(index, sizeIndex, e.target.value)
                              }
                              className="w-20 rounded-lg border border-gray-200 bg-white px-2 py-2 text-center text-xs font-semibold outline-none focus:border-store-red"
                              placeholder="38"
                            />
                            {variant.sizes.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSize(index, sizeIndex)}
                                className="p-1 text-gray-400 hover:text-red-500"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addSize(index)}
                          className="text-xs font-black text-store-red hover:underline"
                        >
                          + Agregar talla
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-gray-100 pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Imágenes de este color
                      </label>
                      <span className="text-[10px] text-gray-400">Máximo 5</span>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-store-red ring-1 ring-gray-200 hover:ring-store-red/40">
                      <ImageIcon size={15} /> Elegir imágenes
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="hidden"
                        onChange={(e) => handleVariantImages(index, e.target.files)}
                      />
                    </label>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(variant.previews.length
                        ? variant.previews
                        : variant.existingImages
                      )
                        .slice(0, 5)
                        .map((preview, imageIndex) => (
                          <img
                            key={`${preview}-${imageIndex}`}
                            src={preview}
                            alt={`${variant.color || 'Color'} ${imageIndex + 1}`}
                            className="h-16 w-16 rounded-xl border border-gray-200 bg-white object-cover"
                          />
                        ))}
                    </div>

                    {variant.existingImages.length > 0 &&
                      variant.previews.length > 0 && (
                        <p className="mt-2 text-[10px] text-amber-600">
                          Las nuevas imágenes reemplazarán el conjunto actual de este color.
                        </p>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="border-b border-gray-100 pb-2 md:col-span-2">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-store-red">
                Ficha técnica
              </p>
            </div>

            <Field label="Material *">
              <input
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="field-input"
                placeholder="Cuero, tela, sintético"
              />
            </Field>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Descripción
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="field-input resize-y"
                placeholder="Describe el producto..."
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="border-b border-gray-100 pb-2">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-store-red">
                Imagen principal y galería general
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Opcional. Úsala para portada o fotografías que no dependan de un color.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-store-red px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-store-redDark">
              <ImageIcon size={16} /> Seleccionar imágenes
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleGeneralFiles(e.target.files)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="space-y-1.5">
                  <div className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                    {generalPreviews[index] ? (
                      <img
                        src={generalPreviews[index] || ''}
                        alt={`Imagen ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-gray-300" />
                    )}

                    {generalPreviews[index] && (
                      <button
                        type="button"
                        onClick={() => removeGeneralImage(index)}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow group-hover:opacity-100"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-center text-[10px] font-bold uppercase text-gray-400">
                    {index === 0 ? 'Principal' : `Imagen ${index + 1}`}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl bg-gray-100 px-6 py-3 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-store-red px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-store-redDark disabled:opacity-50"
            >
              {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>

      {catalogManager && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-gray-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-store-red">
                  Catálogo
                </p>
                <h3 className="mt-1 text-xl font-black text-black">{managerTitle}</h3>
                <p className="mt-1 text-xs text-gray-400">
                  Agrega nuevos registros o elimina los que ya no utilices.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCatalogManager}
                disabled={catalogBusy}
                className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {catalogError && (
              <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{catalogError}</span>
              </div>
            )}

            <div className="mb-5 flex gap-2">
              <input
                value={catalogName}
                onChange={(e) => setCatalogName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void createCatalogItem();
                  }
                }}
                placeholder={managerLabel}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-store-red focus:ring-2 focus:ring-store-red/20"
              />
              <button
                type="button"
                onClick={() => void createCatalogItem()}
                disabled={catalogBusy || !catalogName.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-store-red px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-store-redDark disabled:opacity-50"
              >
                <Plus size={15} /> Agregar
              </button>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {managedItems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 px-4 py-7 text-center text-xs font-semibold text-gray-400">
                  No hay registros.
                </div>
              ) : (
                managedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <span className="min-w-0 truncate text-sm font-bold text-gray-700">
                      {item.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => void deleteCatalogItem(item.id, item.name)}
                      disabled={catalogBusy}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="mt-4 text-[10px] leading-relaxed text-gray-400">
              Por seguridad, el sistema no permitirá eliminar una categoría o marca que tenga
              productos asociados. Una categoría con subcategorías tampoco se puede eliminar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="text-xs font-bold uppercase tracking-widest text-gray-400">
      {label}
    </label>
    {children}
  </div>
);

export default ProductEditorModal;
