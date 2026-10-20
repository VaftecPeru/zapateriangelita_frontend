import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, BarChart3, Bell, Check, ChevronDown, Eye, FileText, Image as ImageIcon, LayoutDashboard, Package, PenLine, Plus, Save, Search, Settings, ShoppingBag, Tag, Trash2, Upload, UserRound, Users, X } from 'lucide-react';
import {
  Brand,
  Category,
  Product,
  Subcategory,
  brandService,
  categoryService,
  subcategoryService,
  productService,
} from '../../../services/crudService';
import { getImageUrl } from '../../../config/api';
import { ProductVariantDraft } from './types';
import angelitaLogo from '../../../assets/brand/logo-angelita-horizontal.png';

type Props = {
  open: boolean;
  product: Product | null;
  products: Product[];
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

type EditorForm = {
  product_code: string;
  name: string;
  model: string;
  gender: '' | 'mujer' | 'hombre' | 'ninos' | 'unisex';
  barcode: string;
  collection_name: string;
  seo_title: string;
  seo_description: string;
  brand_name: string;
  category_name: string;
  subcategory_name: string;
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

type CatalogKind = 'category' | 'subcategory' | 'brand';

const emptyForm = (): EditorForm => ({
  product_code: '',
  name: '',
  model: '',
  gender: '',
  barcode: '',
  collection_name: '',
  seo_title: '',
  seo_description: '',
  brand_name: '',
  category_name: '',
  subcategory_name: '',
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
  articleModel: '',
  skus: [''],
  sizes: [''],
  stocks: [0],
  files: [],
  previews: [],
  existingImages: [],
});

const colorHex = (name: string) => {
  const palette: Record<string,string> = {
    negro:'#22242a',beige:'#edb5a5',rosa:'#ff80a5',rojo:'#dd1523',
    blanco:'#ffffff',azul:'#3469b2',gris:'#92979e',cafe:'#7e563c',
    marron:'#845e42',celeste:'#7cb9e8',verde:'#49916b',
  };
  return palette[name.trim().toLocaleLowerCase()] || '#e8eaf0';
};

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
  products,
  categories,
  subcategories,
  brands,
  onClose,
  onSaved,
}: Props) => {
  const [form, setForm] = useState<EditorForm>(emptyForm());
  const [variants, setVariants] = useState<ProductVariantDraft[]>([emptyVariant()]);
  const [simpleProduct, setSimpleProduct] = useState(false);
  const [generalFiles, setGeneralFiles] = useState<(File | null)[]>(Array(5).fill(null));
  const [generalPreviews, setGeneralPreviews] = useState<(string | null)[]>(Array(5).fill(null));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [skuEditor, setSkuEditor] = useState<number | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [variantTab, setVariantTab] = useState<'color' | 'talla' | 'material' | 'coleccion'>('color');
  const saveIntent = useRef<'save' | 'draft' | 'publish'>('save');
  const savingRef = useRef(false);

  const [catalogManager, setCatalogManager] = useState<CatalogKind | null>(null);
  const [catalogName, setCatalogName] = useState('');
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    if (!open) return;

    setError('');
    setSaving(false);
    setPreviewOpen(false);
    setSkuEditor(null);
    setMainImageIndex(0);
    saveIntent.current = 'save';
    savingRef.current = false;
    setCatalogManager(null);
    setCatalogName('');
    setCatalogError('');

    if (!product) {
      setForm(emptyForm());
      setSimpleProduct(false);
      setVariants([emptyVariant()]);
      setGeneralFiles(Array(5).fill(null));
      setGeneralPreviews(Array(5).fill(null));
      return;
    }

    setForm({
      product_code: product.product_code || '',
      name: product.name || '',
      model: product.model || '',
      gender: product.gender || '',
      barcode: product.barcode || '',
      collection_name: product.collection_name || '',
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      brand_name: typeof product.brand === 'object' ? product.brand.name : String(product.brand || ''),
      category_name:
        (typeof product.category === 'object' ? product.category.name : String(product.category || '')) ||
        categories.find((item) => item.id === product.category_id)?.name ||
        '',
      subcategory_name:
        subcategories.find((item) => item.id === product.subcategory_id)?.name || '',
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
    setSimpleProduct(colors.length === 0 && !product.variant_stocks?.length);
    const globalSizes = parseList(product.size);
    const legacyGallery = product.images?.length
      ? product.images
      : product.img
        ? [product.img]
        : [];
    const hasExplicitVariantStocks = Boolean(product.variant_stocks?.length);
    const productVariants = colors.length
      ? colors.map((color, colorIndex) => {
          const colorGallery = product.color_images?.[color] || [];
          const gallery = colorGallery.length
            ? colorGallery
            : colorIndex === 0
              ? legacyGallery
              : [];

          const sizesForColor = product.color_sizes?.[color]?.length
            ? product.color_sizes[color]
            : globalSizes.length ? globalSizes : [''];
          const stocksForColor = product.variant_stocks?.filter(
            (item) => item.color.toLocaleLowerCase() === color.toLocaleLowerCase(),
          ) ?? [];
          return {
            color,
            articleModel: stocksForColor.find((item) => item.article_model)?.article_model || '',
            skus: sizesForColor.map((size) =>
              stocksForColor.find((item) => item.size === size)?.sku || '',
            ),
            sizes: product.color_sizes?.[color]?.length
              ? product.color_sizes[color]
              : globalSizes.length
                ? globalSizes
                : [''],
            stocks: (product.color_sizes?.[color]?.length
              ? product.color_sizes[color]
              : globalSizes.length
                ? globalSizes
                : ['']
            ).map((size) => {
              const exact = product.variant_stocks?.find(
                (item) => item.color.toLocaleLowerCase() === color.toLocaleLowerCase() && item.size === size,
              );
              if (hasExplicitVariantStocks) {
                return Number(exact?.stock ?? 0);
              }

              // Productos creados antes del stock por color solo conocen stock por talla.
              // Conservamos el total heredado en la primera variante para evitar duplicarlo.
              const legacy = product.sizes?.find((item) => item.size === size);
              return colorIndex === 0 ? Number(legacy?.stock ?? 0) : 0;
            }),
            files: [],
            previews: [],
            existingImages: gallery.slice(0, 5).map((image) => getImageUrl(image)),
          };
        })
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

  const modelSuggestions = useMemo(
    () => Array.from(new Set(products.map((item) => item.model?.trim()).filter(Boolean) as string[])).sort(),
    [products],
  );

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

  const updateSku = (variantIndex: number, sizeIndex: number, value: string) => {
    const skus = [...variants[variantIndex].skus];
    skus[sizeIndex] = value;
    setVariant(variantIndex, { skus });
  };

  const updateStock = (variantIndex: number, sizeIndex: number, value: number) => {
    const stocks = [...variants[variantIndex].stocks];
    stocks[sizeIndex] = Math.max(0, Math.trunc(value || 0));
    setVariant(variantIndex, { stocks });
  };

  const addSize = (variantIndex: number) => {
    setVariant(variantIndex, {
      sizes: [...variants[variantIndex].sizes, ''],
      skus: [...variants[variantIndex].skus, ''],
      stocks: [...variants[variantIndex].stocks, 0],
    });
  };

  const removeSize = (variantIndex: number, sizeIndex: number) => {
    const sizes = variants[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
    const stocks = variants[variantIndex].stocks.filter((_, i) => i !== sizeIndex);
    const skus = variants[variantIndex].skus.filter((_, i) => i !== sizeIndex);
    setVariant(variantIndex, {
      skus: skus.length ? skus : [''],
      sizes: sizes.length ? sizes : [''],
      stocks: stocks.length ? stocks : [0],
    });
  };

  const handleVariantImages = (variantIndex: number, filesList: FileList | null) => {
    const files = Array.from(filesList || []).slice(0, 5);
    const previews = files.map((file) => URL.createObjectURL(file));
    setVariant(variantIndex, { files, previews });

    // La primera variante gobierna también la portada general del producto.
    // Esto mantiene compatibilidad con las vistas que aún consumen products.img/images.
    if (variantIndex === 0) {
      const nextFiles: (File | null)[] = Array(5).fill(null);
      const nextPreviews: (string | null)[] = Array(5).fill(null);
      files.forEach((file, imageIndex) => {
        nextFiles[imageIndex] = file;
        nextPreviews[imageIndex] = previews[imageIndex];
      });
      setGeneralFiles(nextFiles);
      setGeneralPreviews(nextPreviews);
    }
  };

  const handleGeneralImages = (filesList: FileList | null) => {
    const files = Array.from(filesList || []).slice(0, 5);
    if (!files.length) return;
    const previews = files.map(file => URL.createObjectURL(file));
    const nextFiles: (File | null)[] = Array(5).fill(null);
    const nextPreviews: (string | null)[] = Array(5).fill(null);
    files.forEach((file, i) => { nextFiles[i] = file; nextPreviews[i] = previews[i]; });
    setGeneralFiles(nextFiles);
    setGeneralPreviews(nextPreviews);
    setMainImageIndex(0);
    if (!simpleProduct && variants.length) {
      setVariant(0, { files, previews });
    }
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
          category_name: created.name,
          subcategory_id: undefined,
          subcategory_name: '',
        }));
      } else if (catalogManager === 'subcategory') {
        if (!form.category_id) {
          setCatalogError('Selecciona primero una categoría.');
          setCatalogBusy(false);
          return;
        }

        const response = await subcategoryService.create({
          category_id: form.category_id,
          name,
          is_active: true,
        });
        const created = response.data as Subcategory;
        setForm((current) => ({
          ...current,
          subcategory_id: created.id,
          subcategory_name: created.name,
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

    const entityLabel =
      catalogManager === 'category'
        ? 'categoría'
        : catalogManager === 'subcategory'
          ? 'subcategoría'
          : 'marca';
    if (!window.confirm(`¿Eliminar la ${entityLabel} "${name}"?`)) return;

    setCatalogBusy(true);
    setCatalogError('');

    try {
      if (catalogManager === 'category') {
        await categoryService.delete(id);
        setForm((current) =>
          current.category_id === id
            ? {
                ...current,
                category_id: undefined,
                category_name: '',
                subcategory_id: undefined,
                subcategory_name: '',
              }
            : current,
        );
      } else if (catalogManager === 'subcategory') {
        await subcategoryService.delete(id);
        setForm((current) =>
          current.subcategory_id === id
            ? { ...current, subcategory_id: undefined, subcategory_name: '' }
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
    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) return 'El precio debe ser cero (borrador) o mayor.';
    if (Number(form.stock) < 0) return 'El stock no puede ser negativo.';
    if (simpleProduct) return '';


    const cleaned = variants
      .map((variant) => ({
        color: variant.color.trim(),
        sizes: variant.sizes.map((size) => size.trim()).filter(Boolean),
      }))
      .filter((variant) => variant.color || variant.sizes.length);

    if (!cleaned.length || cleaned.some((variant) => !variant.color)) {
      return 'Cada variante debe tener un color.';
    }

    if (variants.some((variant) => variant.color.trim() && !variant.articleModel.trim())) {
      return 'Cada color debe tener su propio modelo del artículo.';
    }

    if (variants.some((variant) => variant.articleModel.trim().length > 120)) {
      return 'El modelo por color no debe superar 120 caracteres.';
    }

    for (const variant of variants) {
      if (!variant.color.trim()) continue;
      const sizes = variant.sizes.map((value) => value.trim());
      if (sizes.some((value) => !value)) {
        return 'Completa todas las tallas del color ' + variant.color + '.';
      }
      if (new Set(sizes.map((size) => size.toLocaleLowerCase())).size !== sizes.length) {
        return 'No se puede repetir una talla del mismo color.';
      }
      if (variant.skus.some((sku) => sku.trim().length > 120)) {
        return 'El SKU no puede superar 120 caracteres.';
      }
      if (variant.stocks.some((stock) => !Number.isSafeInteger(stock) || stock < 0)) {
        return 'Cada talla debe tener un stock entero no negativo.';
      }
    }

    const skus = variants.flatMap((variant) => variant.skus.map((sku) => sku.trim().toLowerCase()).filter(Boolean));
    if (new Set(skus).size !== skus.length) {
      return 'Cada combinación de color y talla requiere un SKU diferente.';
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
    if (savingRef.current) return;
    const intent = saveIntent.current;
    saveIntent.current = 'save';
    const validation = validate();
    if (intent === 'publish' && (
      Number(form.price) <= 0 || !form.product_code.trim() || !form.model.trim()
      || !form.brand_id && !form.brand_name.trim()
      || !form.category_id || displayedStock <= 0
      || (!simpleProduct && variants.some(variant => !variant.color.trim() || !variant.sizes.every(size => size.trim())))
    )) {
      setError('Para publicar, se requiere código general, modelo, marca, categoría, precio y stock verificable.');
      return;
    }
    if (form.barcode.trim().length > 120 || form.collection_name.trim().length > 120 || form.seo_title.trim().length > 255 || form.seo_description.trim().length > 500) {
      setError('Comprueba la longitud de código de barras, colección y metadatos SEO.');
      return;
    }

    if (validation) {
      setError(validation);
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError('');

    try {
      const activeVariants = simpleProduct ? [] : variants.filter((variant) => variant.color.trim());
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

      let brandId = form.brand_id;
      const typedBrand = form.brand_name.trim();
      if (typedBrand) {
        const existingBrand = brands.find(
          (item) => item.name.trim().toLocaleLowerCase() === typedBrand.toLocaleLowerCase(),
        );
        if (existingBrand?.id) {
          brandId = existingBrand.id;
        } else {
          const created = await brandService.create({ name: typedBrand, is_active: true });
          brandId = created.data.id;
        }
      }

      const variantStocks = activeVariants.flatMap((variant) =>
        variant.sizes
          .map((size, sizeIndex) => ({
            color: variant.color.trim(),
            size: size.trim(),
            stock: Math.max(0, Math.trunc(Number(variant.stocks[sizeIndex] || 0))),
            article_model: variant.articleModel.trim(),
            sku: (variant.skus[sizeIndex] || '').trim() || null,
          }))
          .filter((item) => item.size),
      );
      const totalVariantStock = variantStocks.reduce((total, item) => total + item.stock, 0);

      const data = new FormData();
      data.append('name', form.name.trim());
      if (form.model.trim()) data.append('model', form.model.trim());
      if (form.product_code.trim()) data.append('product_code', form.product_code.trim());
      data.append('category_id', String(form.category_id));
      if (form.subcategory_id) data.append('subcategory_id', String(form.subcategory_id));
      if (brandId) data.append('brand_id', String(brandId));
      data.append('price', String(form.price));
      data.append('stock', String(simpleProduct ? Math.max(0, Math.trunc(form.stock)) : totalVariantStock));
      data.append('size', uniqueSizes.join(','));
      data.append('color', colors.join(','));
      data.append('material', form.material.trim());
      data.append('rating', String(product?.rating ?? 0));
      data.append('reviews', String(product?.reviews ?? 0));
      data.append('discount', form.discount ? String(form.discount) : '');
      data.append('status', form.status);
      data.append('product_type', simpleProduct ? 'simple' : 'variable');
      if (intent === 'draft') data.append('is_active', '0');
      if (intent === 'publish') data.append('is_active', '1');
      data.append('gender', form.gender);
      data.append('barcode', form.barcode.trim());
      data.append('collection_name', form.collection_name.trim());
      data.append('seo_title', form.seo_title.trim());
      data.append('seo_description', form.seo_description.trim());
      data.append('description', form.description || '');
      data.append('color_sizes', JSON.stringify(colorSizes));
      data.append('variant_stocks', JSON.stringify(variantStocks));

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
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (!open) return null;

  const managedItems =
    catalogManager === 'category'
      ? categories
      : catalogManager === 'subcategory'
        ? filteredSubcategories
        : brands;
  const managerTitle =
    catalogManager === 'category'
      ? 'Gestionar categorías'
      : catalogManager === 'subcategory'
        ? 'Gestionar subcategorías'
        : 'Gestionar marcas';
  const managerLabel =
    catalogManager === 'category'
      ? 'Nueva categoría'
      : catalogManager === 'subcategory'
        ? 'Nueva subcategoría'
        : 'Nueva marca';

  const displayedStock = simpleProduct
    ? Math.max(0, Math.trunc(Number(form.stock) || 0))
    : variants.reduce((total, v) => total + v.stocks.reduce((sum, qty) => sum + Number(qty || 0), 0), 0);
  const displayedStatus = !product?.is_active ? 'Borrador' : displayedStock === 0 ? 'Agotado' : 'Activo';
  return (
    <div className="product-editor-workspace fixed inset-0 z-[110] flex overflow-hidden bg-[#f7f8fa] text-[#171923]">
      <aside className="hidden w-[226px] shrink-0 flex-col border-r border-[#e7e9ee] bg-white lg:flex">
        <div className="flex h-[66px] items-center border-b border-gray-100 px-7">
          <img src={angelitaLogo} alt="Zapatería Angelita" className="max-h-[47px] w-[160px] object-contain object-left" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 text-[13px]">
          {[
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: ShoppingBag, label: 'Pedidos' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} type="button" onClick={onClose} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[#52576a] transition hover:bg-red-50 hover:text-store-red">
              <Icon size={18} strokeWidth={1.8} /> {label}
            </button>
          ))}
          <div className="flex items-center gap-3 rounded-xl bg-[#ffeaec] px-4 py-3 font-bold text-store-red"><Package size={18} fill="currentColor" strokeWidth={1.8} /> Productos</div>
          <div className="space-y-0.5 pb-2 pl-12 text-[12px]">
            <button type="button" onClick={onClose} className="block py-2 text-gray-600 hover:text-store-red">Todos los productos</button>
            <p className="relative py-2 font-bold text-store-red before:absolute before:-left-3 before:top-[15px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-store-red">Agregar producto</p>
            <button type="button" onClick={() => openCatalogManager('category')} className="block py-2 text-gray-600 hover:text-store-red">Categorías</button>
            <button type="button" onClick={() => openCatalogManager('brand')} className="block py-2 text-gray-600 hover:text-store-red">Marcas</button>
            <button type="button" onClick={onClose} className="block py-2 text-gray-600 hover:text-store-red">Inventario</button>
          </div>
          {[
            { icon: Users, label: 'Clientes' }, { icon: Tag, label: 'Promociones' },
            { icon: FileText, label: 'Contenido' }, { icon: BarChart3, label: 'Reportes' },
            { icon: Settings, label: 'Configuración' },
          ].map(({icon: Icon,label}) => (
            <button type="button" key={label} onClick={onClose} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[#52576a] transition hover:bg-red-50 hover:text-store-red">
              <Icon size={18} strokeWidth={1.8}/> {label}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-100 px-5 py-4 text-[10px] font-semibold tracking-[.13em] text-gray-400">PANEL ADMINISTRATIVO</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="flex h-[63px] shrink-0 items-center justify-between gap-5 border-b border-[#e6e8ed] bg-white px-5 xl:px-8">
          <div className="relative mx-auto hidden w-full max-w-[850px] md:block">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9097a5]"/>
            <input readOnly aria-label="Buscar productos, pedidos, clientes" title="Utiliza el buscador del catálogo para buscar productos"
              placeholder="Buscar productos, pedidos, clientes..." className="h-10 w-full rounded-lg border border-[#e2e6ed] bg-[#f8f9fb] pl-11 pr-4 text-[12px] text-gray-500 outline-none"/>
          </div>
          <div className="ml-auto flex items-center gap-5">
            <span className="relative text-gray-600" title="Notificaciones"><Bell size={20}/><span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-store-red text-[9px] font-bold text-white">3</span></span>
            <div className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a0afbe] text-white"><UserRound size={20}/></span><div className="hidden leading-tight sm:block"><p className="text-xs font-bold">Admin</p><p className="text-[10px] text-gray-500">Administrador</p></div></div>
          </div>
        </header>

        <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto">
          <form id="angelita-product-editor-form" onSubmit={handleSubmit} className="mx-auto w-full min-w-0 max-w-[1380px] px-4 pb-12 pt-3 xl:px-6">
            <div className="mb-4 flex min-w-0 flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <button type="button" onClick={onClose} aria-label="Volver al catálogo de productos" className="rounded-xl border border-[#dce1e8] bg-white p-2.5 text-gray-600 transition hover:text-store-red"><ArrowLeft size={20}/></button>
                <div><h1 className="text-[24px] font-bold tracking-tight text-[#11141b]">{product ? 'Editar producto' : 'Agregar producto'}</h1>
                  <p className="text-[12px] text-[#7b8191]">Completa la información del producto. Cada artículo tendrá su propio modelo.</p></div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setPreviewOpen(true)} className="flex items-center gap-2 rounded-lg border border-[#dce0e7] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#374151] shadow-sm hover:border-store-red"><Eye size={16}/> Vista previa</button>
                <button type="submit" disabled={saving}
                  title="Guardar como borrador sin publicación automática"
                  onClick={() => {saveIntent.current='draft';}}
                  className="flex items-center gap-2 rounded-lg border border-[#dce0e7] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#374151] shadow-sm hover:border-store-red disabled:cursor-not-allowed disabled:opacity-50">
                  <Save size={15}/> Guardar borrador</button>
                <button type="submit" disabled={saving} onClick={() => {saveIntent.current='publish';}}
                  className="flex items-center gap-2 rounded-lg bg-store-red px-5 py-2.5 text-[12px] font-bold text-white shadow-sm transition hover:bg-store-redDark disabled:opacity-50">
                  <Upload size={15}/> {saving ? 'Guardando...' : 'Publicar producto'}</button>
              </div>
            </div>
            {error && <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"><AlertTriangle size={18}/><p className="whitespace-pre-wrap">{error}</p></div>}
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
              <main className="min-w-0 space-y-4">
                <section className="rounded-xl border border-[#e6e8ed] bg-white p-4 shadow-sm">
                  <h2 className="mb-4 border-l-[3px] border-store-red pl-3 text-[15px] font-bold">Información principal</h2>
                  <div className="grid gap-5 md:grid-cols-[268px_minmax(0,1fr)]">
                    <div className="min-w-0">
                      <div className="relative flex h-[159px] items-center justify-center overflow-hidden rounded-lg border border-[#e8ebf1] bg-[#f8f9fb]">
                        {generalPreviews[mainImageIndex] ? <img src={generalPreviews[mainImageIndex]!} alt="Imagen principal del producto" className="h-full w-full object-contain"/> : <div className="flex flex-col items-center gap-2 text-center text-xs text-gray-400"><ImageIcon size={37} strokeWidth={1.2}/> Imagen del producto</div>}
                        <label title="Subir fotografías del producto" className="absolute right-2 top-2 cursor-pointer rounded-lg border border-gray-200 bg-white p-2 shadow-sm hover:text-store-red"><PenLine size={15}/><input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e=>handleGeneralImages(e.target.files)}/></label>
                      </div>
                      <div className="mt-2 grid grid-cols-5 gap-1.5">
                        {[0,1,2,3].map((i)=><button key={i} type="button" onClick={()=>setMainImageIndex(i)}
                          className={'flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-[#f7f8fa] '+(mainImageIndex===i?'border-store-red':'border-gray-200')}>
                          {generalPreviews[i] ? <img src={generalPreviews[i]!} alt={'Fotografía '+(i+1)} className="h-full w-full object-cover"/> : <ImageIcon size={16} className="text-gray-300"/>}
                        </button>)}
                        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-gray-300 text-store-red hover:bg-red-50"><Plus size={18}/><span className="text-[9px]">Agregar</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e=>handleGeneralImages(e.target.files)}/></label>
                      </div>

                    </div>
                    <div className="grid min-w-0 grid-cols-1 content-start gap-3 sm:grid-cols-2">
                      <label className="space-y-1"><span className="text-xs font-semibold">Modelo general</span><input aria-label="Modelo general" maxLength={120} value={form.model} onChange={e=>setForm({...form,model:e.target.value})} placeholder="Ej.: A-2001" list="angelita-model-suggestions" className="angelita-reference-input"/><datalist id="angelita-model-suggestions">{modelSuggestions.map(m=><option key={m} value={m}/>)}</datalist></label>
                      <label className="space-y-1"><span className="text-xs font-semibold">Nombre del producto <em className="not-italic text-store-red">*</em></span><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nombre visible en la tienda" className="angelita-reference-input"/></label>
                      <div className="space-y-1"><div className="flex items-center justify-between"><span className="text-xs font-semibold">Categoría <em className="not-italic text-store-red">*</em></span><button type="button" onClick={()=>openCatalogManager('category')} className="text-[10px] font-semibold text-store-red hover:underline">Gestionar</button></div><CatalogSearchSelect value={form.category_name} options={categories} placeholder="Selecciona una categoría" onChange={(id,name)=>setForm(f=>({...f,category_id:id,category_name:name,subcategory_id:undefined,subcategory_name:''}))}/></div>
                      <div className="space-y-1"><div className="flex items-center justify-between"><span className="text-xs font-semibold">Marca</span><button type="button" onClick={()=>openCatalogManager('brand')} className="text-[10px] font-semibold text-store-red hover:underline">Gestionar</button></div><input list="angelita-brand-options" value={form.brand_name} onChange={e=>{const name=e.target.value; const b=brands.find(x=>x.name.toLowerCase()===name.trim().toLowerCase());setForm({...form,brand_name:name,brand_id:b?.id});}} placeholder="Selecciona una marca" className="angelita-reference-input"/><datalist id="angelita-brand-options">{brands.map(b=><option key={b.id} value={b.name}/>)}</datalist></div>
                      <fieldset className="space-y-1 sm:col-span-2"><legend className="text-xs font-semibold">Género</legend><div className="grid grid-cols-4 gap-2">
                      {([{value:'mujer',label:'Mujer'},{value:'hombre',label:'Hombre'},{value:'ninos',label:'Niños'},{value:'unisex',label:'Unisex'}] as const).map(g=>
                        <label key={g.value} className={'flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-[11px] '+(form.gender===g.value?'border-store-red bg-red-50 font-bold text-store-red':'border-gray-200 bg-[#fbfbfc] text-gray-600')}>
                          <input type="radio" name="product_gender" value={g.value} checked={form.gender===g.value} onChange={()=>setForm({...form,gender:g.value})} className="accent-red-600"/>{g.label}
                        </label>)}
                      </div></fieldset>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-[#e6e8ed] bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h2 className="border-l-[3px] border-store-red pl-3 text-[15px] font-bold">Variantes del producto</h2>
                      <p className="mt-1.5 pl-3 text-[11px] text-gray-500">Cada color tiene un modelo editable, imágenes y existencias por talla.</p></div>
                    <button type="button" onClick={addVariant} disabled={simpleProduct}
                      className="inline-flex items-center gap-2 rounded-lg border border-store-red px-3 py-2 text-[11px] font-bold text-store-red transition hover:bg-red-50 disabled:opacity-40"><Plus size={15}/> Agregar variante</button>
                  </div>
                  <div className="my-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100">
                    <div className="flex gap-1.5">
                      {[{id:'color', label:'Color'},{id:'talla',label:'Talla'},{id:'material',label:'Material'},{id:'coleccion',label:'Colección'}].map(tab=>
                        <button type="button" key={tab.id} onClick={()=>setVariantTab(tab.id as typeof variantTab)}
                          className={'border-b-2 px-3 py-2.5 text-[11px] font-bold '+(variantTab===tab.id?'border-store-red bg-[#fff1f2] text-store-red':'border-transparent text-gray-500 hover:text-store-red')}>
                          {tab.label}
                        </button>)}

                    </div>
                    <label className="flex items-center gap-2 text-[11px] text-gray-500"><input type="checkbox" checked={simpleProduct} onChange={e=>{if(e.target.checked && product?.variant_stocks?.length && !window.confirm('Convertir en producto simple eliminará el desglose de variantes al guardar. ¿Continuar?')) return;setSimpleProduct(e.target.checked);}} className="accent-red-600"/> Sin variaciones</label>
                  </div>
                  {variantTab==='coleccion' && <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3"><label className="text-xs font-semibold">Nombre de colección (opcional)<input aria-label="Colección del producto" value={form.collection_name} maxLength={120} onChange={e=>setForm({...form,collection_name:e.target.value})} placeholder="Ej.: Colección Otoño" className="angelita-reference-input mt-1"/></label><p className="mt-1 text-[10px] text-gray-500">Nombre libre guardado por producto. El catálogo de colecciones se implementará por separado.</p></div>}
                  {variantTab==='material' && <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 p-3"><label className="text-xs font-semibold">Material principal<input value={form.material} onChange={e=>setForm({...form,material:e.target.value})} placeholder="Cuero, tela, sintético..." className="angelita-reference-input mt-1"/></label></div>}
                  {simpleProduct ? <div className="grid gap-3 rounded-lg bg-[#f8f9fb] p-4 sm:grid-cols-[1fr_180px]">
                    <div><h3 className="text-sm font-bold">Producto simple</h3><p className="mt-1 text-xs text-gray-500">Sin colores ni tallas: inventario único de artículo.</p></div>
                    <label className="text-xs font-semibold">Stock disponible<input aria-label="Stock del producto simple" type="number" min="0" step="1" value={form.stock} onChange={e=>setForm({...form,stock:Math.max(0,Math.trunc(Number(e.target.value)||0))})} className="angelita-reference-input mt-1"/></label>
                  </div> :
                  <div className="overflow-x-auto rounded-xl border border-[#e9ecf1]">
                    <table className="w-full min-w-[790px] table-fixed border-collapse text-left">
                      <thead className="bg-[#fff3f4] text-[10px] font-bold uppercase tracking-[.025em] text-[#667085]">
                        <tr>
                          <th className="w-[102px] px-3 py-3">Color</th><th className="w-[246px] px-2 py-3">Tallas / cantidades</th>
                          <th className="w-[150px] px-2 py-3">Modelo por color</th><th className="w-[115px] px-2 py-3">Precio</th>
                          <th className="w-[81px] px-2 py-3">Stock</th><th className="w-[95px] px-2 py-3">Imágenes</th><th className="w-[45px] px-1 py-3">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variants.map((variant, index) => {
                          const photos=variant.previews.length ? variant.previews : variant.existingImages;
                          const sum=variant.stocks.reduce((acc,qty)=>acc+Number(qty||0),0);
                          return (
                            <Fragment key={'variant-row-'+index}>
                              <tr className="align-middle">
                                <td className="px-2 py-3">
                                  <div className="flex items-center gap-1.5"><span className="h-4 w-4 shrink-0 rounded-full border border-gray-200" style={{backgroundColor: colorHex(variant.color)}}/><input aria-label={'Color variante '+(index+1)} value={variant.color} onChange={e=>setVariant(index,{color:e.target.value})} placeholder="Color" className="min-w-0 w-full border-0 bg-transparent text-[11px] font-semibold outline-none focus:underline"/></div>
                                </td>
                                <td className="px-2 py-3">
                                  <div className="grid grid-cols-5 gap-1">
                                    {variant.sizes.map((size,j)=><div key={j} className="space-y-1">
                                      <input aria-label={'Talla '+(index+1)+'-'+(j+1)} value={size} onChange={e=>updateSize(index,j,e.target.value)} placeholder="Talla" className="w-full rounded-md border border-[#e4e8ef] bg-[#fbfcfd] px-1 py-1 text-center text-[10px] outline-none focus:border-store-red"/>
                                      <input aria-label={'Stock talla '+(size||j+1)} type="number" min="0" step="1" value={variant.stocks[j]??0} onChange={e=>updateStock(index,j,Number(e.target.value))} className="w-full rounded-md border border-[#e4e8ef] bg-white px-1 py-1 text-center text-[10px] outline-none focus:border-store-red"/>
                                    </div>)}
                                  </div>
                                  <div className="mt-1.5 flex items-center gap-3 text-[10px]">
                                    <button type="button" onClick={()=>addSize(index)} className="font-semibold text-store-red hover:underline">+ Talla</button>
                                    <button type="button" onClick={()=>setSkuEditor(skuEditor===index?null:index)} className="font-semibold text-[#64748b] underline decoration-dotted underline-offset-2">SKU por talla</button>
                                  </div>
                                </td>
                                <td className="px-2 py-3">
                                  <input maxLength={120} aria-label={'Modelo para color '+(variant.color || index+1)} value={variant.articleModel} onChange={e=>setVariant(index,{articleModel:e.target.value})} placeholder="Ej.: 2001-N" className="w-full rounded-lg border border-[#e0e5ec] bg-white px-2 py-2 text-[11px] outline-none focus:border-store-red"/>
                                  <p className="mt-1 text-[9px] text-gray-400">Editable</p>
                                </td>
                                <td className="px-2 py-3"><div className="rounded-lg border border-gray-200 bg-[#f8f9fa] px-2 py-2 text-[11px] font-semibold">MXN {Number(form.price||0).toFixed(2)}</div><p className="mt-1 text-[9px] text-gray-400">Precio general</p></td>
                                <td className="px-2 py-3"><output className="block rounded-lg border border-gray-100 bg-[#f5f6f8] p-2 text-center text-[12px] font-bold">{sum}</output></td>
                                <td className="px-2 py-3">
                                  <div className="flex items-center gap-1">
                                    <div className="flex h-10 w-11 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">{photos[0] ? <img src={photos[0]} alt={'Foto '+variant.color} className="h-full w-full object-cover"/>:<ImageIcon size={17} className="text-gray-300"/>}</div>
                                    <label className="flex h-9 w-8 cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-500 hover:text-store-red" title={'Agregar imágenes del color '+variant.color}><Plus size={17}/><input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e=>handleVariantImages(index,e.target.files)}/></label>
                                  </div>
                                </td>
                                <td className="px-1 py-3">{variants.length>1 && <button type="button" title={'Eliminar variante '+variant.color} onClick={()=>removeVariant(index)} className="rounded-md border border-red-100 bg-[#fff4f5] p-1.5 text-store-red hover:bg-red-100"><Trash2 size={14}/></button>}</td>
                              </tr>
                              {(skuEditor===index || variantTab==='talla') && <tr className="bg-[#fcfcfe]"><td colSpan={7} className="p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-xs font-bold">SKU individuales — {variant.color||'Color por definir'}</h4><button type="button" onClick={()=>setSkuEditor(null)} className="text-[10px] text-gray-500 hover:text-store-red">Cerrar</button></div>
                                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {variant.sizes.map((size,j)=><div key={j} className="flex items-center gap-2 rounded-md border border-gray-200 bg-white p-2">
                                    <span className="w-[39px] shrink-0 text-[10px] font-bold">{size||'—'}</span><input maxLength={120} aria-label={'SKU color '+(variant.color||index+1)+' talla '+(size||j+1)} value={variant.skus[j]??''} onChange={e=>updateSku(index,j,e.target.value)} placeholder="SKU único" className="min-w-0 flex-1 text-[11px] outline-none"/>
                                    {variant.sizes.length>1 && <button type="button" onClick={()=>removeSize(index,j)} title={'Quitar talla '+size} className="text-gray-400 hover:text-store-red"><X size={13}/></button>}
                                  </div>)}
                                </div>
                                <p className="mt-2 text-[10px] text-gray-500">SKU opcional por cada combinación de color y talla; debe ser único cuando se proporciona.</p>
                              </td></tr>}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>}
                  {!simpleProduct && <button type="button" onClick={addVariant} className="mt-3 flex items-center gap-2 rounded-lg border border-store-red px-3 py-2 text-[11px] font-bold text-store-red hover:bg-red-50"><Plus size={14}/> Agregar otro color</button>}
                </section>

                <section className="rounded-xl border border-[#e6e8ed] bg-white p-4 shadow-sm">
                  <h2 className="mb-3 border-l-[3px] border-store-red pl-3 text-[15px] font-bold">Descripción del producto</h2>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-[#fcfcfd] px-3 py-2 text-xs text-gray-700">
                      <span className="mr-3 rounded-md border border-gray-200 bg-white px-3 py-1 text-[11px]">Párrafo</span>
                      {[
                        {label:'B', insert:'**Descripción destacada**',title:'Insertar texto en negrita'},
                        {label:'I',insert:'*Énfasis*',title:'Insertar cursiva'},
                        {label:'U',insert:'<u>Subrayado</u>',title:'Insertar subrayado'},
                        {label:'☷',insert:'\n- Característica',title:'Insertar lista'},
                      ].map(action=><button key={action.label} type="button" title={action.title} onClick={()=>setForm(f=>({...f,description:f.description+action.insert}))} className="rounded px-2 py-1 font-bold hover:bg-red-50 hover:text-store-red">{action.label}</button>)}
                    </div>
                    <textarea aria-label="Descripción del producto" rows={4} maxLength={5000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe características, materiales y estilo..." className="block w-full resize-y px-3 py-3 text-[12px] leading-relaxed outline-none"/>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-semibold">Material (opcional)<input value={form.material} maxLength={100} onChange={e=>setForm({...form,material:e.target.value})} className="angelita-reference-input mt-1" placeholder="Ej.: cuero, sintético"/></label>
                    <div className="space-y-1 text-xs"><span className="font-semibold">Subcategoría</span><CatalogSearchSelect value={form.subcategory_name} options={filteredSubcategories} placeholder="Seleccionar subcategoría" disabled={!form.category_id} onChange={(id,name)=>setForm(f=>({...f,subcategory_id:id,subcategory_name:name}))}/></div>
                  </div>
                </section>
              </main>

              <aside aria-label="Opciones y resumen del producto" className="min-w-0 space-y-4 xl:sticky xl:top-5">
                <section className="rounded-xl border border-[#e6e8ed] bg-white p-4 shadow-sm">
                  <h2 className="mb-3 border-l-[3px] border-store-red pl-3 text-[14px] font-bold">Estado del producto</h2>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Borrador', helper: 'Solo visible para administradores', checked: displayedStatus === 'Borrador' },
                      { label: 'Activo', helper: 'Visible en la tienda online', checked: displayedStatus === 'Activo' },
                      { label: 'Agotado', helper: 'Sin existencias disponibles', checked: displayedStatus === 'Agotado' },
                      { label: 'Archivado', helper: 'Guardar sin publicar', checked: false },
                    ].map((status)=><div key={status.label}
                        className={'flex items-center gap-2.5 rounded-lg px-1.5 py-2 '+(status.checked?'bg-[#ffeaec]':'')}>
                      <span className={'flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border '+(status.checked?'border-store-red bg-store-red':'border-[#96a0b2] bg-white')}>
                        {status.checked && <span className="h-1.5 w-1.5 rounded-full bg-white"/>}
                      </span>
                      <div><p className={'text-[12px] font-bold '+(status.checked?'text-store-red':'text-[#242832]')}>{status.label}</p><p className="text-[10px] text-[#8b93a2]">{status.helper}</p></div>
                    </div>)}
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-gray-400">Estado informativo. Usa los botones superiores para guardar o solicitar publicación.</p>
                </section>
                <section className="rounded-xl border border-[#e6e8ed] bg-white p-4 shadow-sm">
                  <h2 className="mb-4 border-l-[3px] border-store-red pl-3 text-[14px] font-bold">Precios</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1 text-[10px] font-semibold text-gray-600">Precio de venta (MXN)<input type="number" min="0" step=".01" value={form.price} onChange={e=>setForm({...form,price:Number(e.target.value)})} className="angelita-reference-input text-[12px]"/></label>
                    <label className="space-y-1 text-[10px] font-semibold text-gray-600">Descuento (%)<input type="number" min="0" max="100" value={form.discount} onChange={e=>setForm({...form,discount:e.target.value})} className="angelita-reference-input text-[12px]"/></label>
                  </div>
                  <div className="mt-3 rounded-lg border border-gray-100 bg-[#f7f8fa] p-3">
                    <div className="flex justify-between gap-2 text-xs"><span className="text-gray-500">Precio final</span><strong>MXN {(discountedPrice || Number(form.price||0)).toFixed(2)}</strong></div>
                    <p className="mt-1 text-[10px] text-gray-400">Precio común para todos los colores. El backend calcula el descuento.</p>
                  </div>
                  {Number(form.price)===0 && <p className="mt-2 text-[11px] font-medium text-amber-600">Precio 0: el producto permanecerá oculto.</p>}
                  <label className="mt-3 flex items-center justify-between gap-2 text-[11px] text-gray-600"><span>Etiqueta comercial</span>
                    <select aria-label="Etiqueta comercial" value={form.status} onChange={e=>setForm({...form,status:e.target.value as EditorForm['status']})} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px]"><option value="normal">Normal</option><option value="oferta">Oferta</option><option value="nuevo">Nuevo</option></select></label>
                </section>
                <section className="rounded-xl border border-[#e6e8ed] bg-white p-4 shadow-sm">
                  <h2 className="mb-4 border-l-[3px] border-store-red pl-3 text-[14px] font-bold">Inventario general</h2>
                  <div className="flex items-center justify-between text-[11px]"><span className="font-semibold text-gray-600">Gestionar inventario</span><span className="relative h-[18px] w-[35px] rounded-full bg-store-red"><span className="absolute right-[3px] top-[3px] h-[12px] w-[12px] rounded-full bg-white"/></span></div>
                  <label className="mt-3 block space-y-1 text-[11px] font-semibold text-gray-600">Código general / SKU base<input aria-label="Código general del producto" value={form.product_code} onChange={e=>setForm({...form,product_code:e.target.value})} className="angelita-reference-input" placeholder="ANG-2001"/></label>
                  <label className="mt-3 block space-y-1 text-[11px] font-semibold text-gray-600">Código de barras (opcional)<input aria-label="Código de barras" maxLength={120} value={form.barcode} onChange={e=>setForm({...form,barcode:e.target.value})} placeholder="Ej.: 7501234567890" className="angelita-reference-input"/></label>
                  <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-[12px]"><span className="font-semibold text-gray-600">Stock total</span><strong className="text-lg text-store-red">{displayedStock}</strong></div>
                  <p className="mt-1 text-[10px] leading-relaxed text-gray-400">Suma automática de las cantidades por talla y color, sin duplicar existencias.</p>
                </section>
                <section className="rounded-xl border border-[#e6e8ed] bg-white p-4 shadow-sm">
                  <h2 className="mb-3 border-l-[3px] border-store-red pl-3 text-[14px] font-bold">SEO (opcional)</h2>
                  <label className="block space-y-1 text-[11px] font-semibold text-gray-600">Título SEO <input aria-label="Título SEO" maxLength={255} value={form.seo_title} onChange={e=>setForm({...form,seo_title:e.target.value})} className="angelita-reference-input" placeholder={(form.name||'Producto')+' | Zapatería Angelita'}/></label>
                  <label className="mt-3 block space-y-1 text-[11px] font-semibold text-gray-600">Descripción SEO<textarea aria-label="Descripción SEO" maxLength={500} rows={3} value={form.seo_description} onChange={e=>setForm({...form,seo_description:e.target.value})} className="angelita-reference-input resize-none" placeholder={form.description.slice(0,160) || 'Descripción para buscadores'}/></label>
                </section>
                <button type="button" onClick={onClose} className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[12px] font-semibold text-gray-600 hover:text-store-red">Volver al catálogo</button>
              </aside>
            </div>
          </form>
        </div>
      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Vista previa del producto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">Vista previa administrativa</h3>
              <button type="button" onClick={() => setPreviewOpen(false)} aria-label="Cerrar vista previa" className="rounded-xl p-2 hover:bg-gray-100"><X size={18}/></button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Esta vista no publica ni guarda el producto.</p>
            <div className="mt-5 space-y-3 rounded-xl border border-gray-200 p-4">
              <h4 className="text-lg font-bold">{form.name || 'Producto sin nombre'}</h4>
              <p className="text-sm text-gray-600">Código: {form.product_code || 'Pendiente'} · Modelo general: {form.model || 'Opcional'}</p>
              <p className="text-sm font-semibold text-store-red">MXN {Number(form.price || 0).toFixed(2)} · {displayedStock} unidades</p>
              {simpleProduct ? <p className="text-xs text-gray-600">Producto simple</p> : variants.map((variant, index) => (
                <div key={index} className="rounded-lg bg-gray-50 px-3 py-2 text-xs">
                  <strong>{variant.color || 'Color por definir'} — {variant.articleModel || 'Modelo pendiente'}</strong>
                  <p className="mt-1 text-gray-600">{variant.sizes.map((size, i) => (size || 'Talla') + ': ' + String(variant.stocks[i] || 0) + ' uds. · SKU ' + (variant.skus[i] || 'opcional')).join(' | ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

            {catalogManager === 'subcategory' && form.category_id && (
              <p className="mt-4 rounded-xl bg-gray-50 px-3 py-2 text-[10px] font-semibold text-gray-500">
                Mostrando subcategorías de: <strong>{form.category_name}</strong>
              </p>
            )}
            <p className="mt-4 text-[10px] leading-relaxed text-gray-400">
              Por seguridad, no se deben eliminar categorías, subcategorías o marcas que estén en uso.
              Una categoría con subcategorías tampoco se puede eliminar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

type CatalogSearchOption = {
  id?: number;
  name: string;
};

const CatalogSearchSelect = ({
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: {
  value: string;
  options: CatalogSearchOption[];
  placeholder: string;
  disabled?: boolean;
  onChange: (id: number | undefined, name: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const normalized = value.trim().toLocaleLowerCase();
  const visibleOptions = options.filter((item) =>
    !normalized || item.name.toLocaleLowerCase().includes(normalized),
  );

  return (
    <div className="relative">
      <input
        value={value}
        disabled={disabled}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          const next = event.target.value;
          const exact = options.find(
            (item) => item.name.trim().toLocaleLowerCase() === next.trim().toLocaleLowerCase(),
          );
          onChange(exact?.id, next);
          setOpen(true);
        }}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 pr-10 text-sm font-semibold outline-none focus:border-store-red focus:ring-2 focus:ring-store-red/20 disabled:cursor-not-allowed disabled:opacity-50"
        placeholder={placeholder}
        autoComplete="off"
      />
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[190] max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl [scrollbar-width:thin]">
          {visibleOptions.length ? (
            visibleOptions.map((item) => (
              <button
                key={item.id ?? item.name}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(item.id, item.name);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-gray-700 transition hover:bg-store-red/5 hover:text-store-red"
              >
                <span className="truncate">{item.name}</span>
                {value.trim().toLocaleLowerCase() === item.name.trim().toLocaleLowerCase() && (
                  <Check size={14} className="shrink-0" />
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs font-semibold text-gray-400">
              No hay coincidencias. Usa la opción Gestionar para crear un nuevo registro.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductEditorModal;
