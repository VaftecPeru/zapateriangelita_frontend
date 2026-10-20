import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';
import { brandService, categoryService, productService, subcategoryService } from '../../../services/crudService';
import type { Brand, Category, Subcategory } from '../../../services/crudService';
import ImportCatalogPreflight, {
  emptyCatalogMappings,
} from './ImportCatalogPreflight';
import type { CatalogData, CatalogMappings, CatalogType } from './ImportCatalogPreflight';
import Pagination from '../../../components/Pagination';
import { usePagination } from '../../../hooks/usePagination';

type Props = {
  open: boolean;
  onClose: () => void;
  onImported: () => Promise<void> | void;
};

type PreviewRow = {
  row: number;
  action: 'CREAR' | 'ACTUALIZAR' | string;
  code: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number | null;
  offer_price: number | null;
  color: string;
  size: string;
  stock: number;
  is_active: boolean;
  valid: boolean;
  errors: string[];
  warnings: string[];
};

type Preview = {
  valid: boolean;
  format: 'xlsx' | 'csv';
  header_row: number;
  summary: {
    rows: number;
    products: number;
    variants: number;
    valid_products: number;
    ready_products?: number;
    draft_products?: number;
    error_rows: number;
    warnings: number;
  };
  rows: PreviewRow[];
  groups: Array<{
    code: string;
    action: string;
    name: string;
    variants: Array<{ color: string; size: string; stock: number }>;
    total_stock: number;
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
};

type ImportResult = {
  success: boolean;
  message: string;
  summary: {
    created: number;
    updated: number;
    variants: number;
    units: number;
    published?: number;
    drafts?: number;
    skipped?: number;
    skipped_codes?: string[];
  };
};

const ProductImportModal = ({ open, onClose, onImported }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validOnly, setValidOnly] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState('');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'errors' | 'valid'>('all');
  const [catalogs, setCatalogs] = useState<CatalogData>({ brands: [], categories: [], subcategories: [] });
  const [catalogMappings, setCatalogMappings] = useState<CatalogMappings>(emptyCatalogMappings);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [stage, setStage] = useState<'catalog' | 'review'>('catalog');

  const filteredPreviewRows = useMemo(() => {
    const rows = preview?.rows ?? [];
    if (previewFilter === 'errors') return rows.filter((row) => !row.valid);
    if (previewFilter === 'valid') return rows.filter((row) => row.valid);
    return rows;
  }, [preview, previewFilter]);

  const previewPagination = usePagination(filteredPreviewRows, 25);
  // Catálogos faltantes ya no bloquean el registro: quedan pendientes en borrador.
  const catalogReady = !catalogLoading && !!preview;

  if (!open) return null;

  const reset = () => {
    if (previewing || importing) return;
    setFile(null);
    setPreview(null);
    setResult(null);
    setMessage('');
    setPreviewFilter('all');
    setStage('catalog');
    setValidOnly(false);
    setCatalogMappings(emptyCatalogMappings());
    setCatalogs({ brands: [], categories: [], subcategories: [] });
    previewPagination.resetPage();
    if (fileRef.current) fileRef.current.value = '';
  };

  const close = () => {
    if (previewing || importing) return;
    reset();
    onClose();
  };

  const getApiMessage = (error: any, fallback: string) => {
    const raw = error?.response?.data?.message
      || error?.response?.data?.error
      || error?.message
      || fallback;
    const message = typeof raw === 'string' ? raw : fallback;

    if (/SQLSTATE|General error|insert into|Connection:|Database:/i.test(message)) {
      return 'La base de datos rechazó el registro por una incompatibilidad interna. No se aplicaron cambios. Intenta nuevamente después de actualizar el backend.';
    }

    return message;
  };

  const loadCatalogs = async (): Promise<void> => {
    setCatalogLoading(true);
    try {
      const [brands, categories, subcategories] = await Promise.all([
        brandService.getAll(), categoryService.getAll(), subcategoryService.getAll(),
      ]);
      setCatalogs({
        brands: brands.data, categories: categories.data, subcategories: subcategories.data,
      });
    } finally {
      setCatalogLoading(false);
    }
  };

  const previewFile = async (selected: File, mappings: CatalogMappings = catalogMappings) => {
    setFile(selected);
    setPreview(null);
    setResult(null);
    setMessage('');
    setPreviewing(true);

    try {
      const response = await productService.previewInventoryImport(selected, mappings);
      const nextPreview = response.data as Preview;
      setPreview(nextPreview);
      setPreviewFilter(nextPreview.valid ? 'all' : 'errors');
      previewPagination.resetPage();
    } catch (error: any) {
      console.error('Error previewing inventory import', error);
      setMessage(getApiMessage(error, 'No se pudo validar el archivo.'));
      const serverPreview = error?.response?.data?.preview;
      if (serverPreview) {
        const nextPreview = serverPreview as Preview;
        setPreview(nextPreview);
        setPreviewFilter(nextPreview.valid ? 'all' : 'errors');
        previewPagination.resetPage();
      }
    } finally {
      setPreviewing(false);
    }
  };

  const handleFile = async (selected?: File) => {
    if (!selected) return;

    const extension = selected.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'csv'].includes(extension || '')) {
      setFile(null);
      setPreview(null);
      setMessage('Formato no permitido. Selecciona un archivo XLSX o CSV.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setFile(null);
      setPreview(null);
      setMessage('El archivo supera el máximo permitido de 10 MB.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const initialMappings = emptyCatalogMappings();
    setCatalogMappings(initialMappings);
    setStage('catalog');
    setValidOnly(false);
    try {
      await loadCatalogs();
      await previewFile(selected, initialMappings);
    } catch (error: any) {
      setMessage(getApiMessage(error, 'No se pudieron consultar los catálogos. Reintenta la validación.'));
    }
  };

  const applyCatalogMapping = async (kind: CatalogType, key: string, target: string) => {
    if (!file || catalogBusy) return;
    const next = {
      ...catalogMappings,
      [kind]: { ...catalogMappings[kind], [key]: target },
    };
    setCatalogBusy(true);
    setCatalogMappings(next);
    try {
      await previewFile(file, next);
    } finally {
      setCatalogBusy(false);
    }
  };

  const createCatalog = async (kind: CatalogType, name: string, parent?: Category) => {
    if (catalogBusy) return;
    setCatalogBusy(true);
    try {
      if (kind === 'brands') await brandService.create({ name, is_active: false });
      else if (kind === 'categories') await categoryService.create({ name, is_active: false });
      else {
        if (!parent?.id) throw new Error('Primero debes registrar o aprobar la categoría principal.');
        await subcategoryService.create({ name, category_id: parent.id, is_active: false });
      }
      await loadCatalogs();
    } finally {
      setCatalogBusy(false);
    }
  };

  const activateCatalog = async (kind: CatalogType, item: Brand | Category | Subcategory) => {
    if (catalogBusy || !item.id) return;
    setCatalogBusy(true);
    try {
      if (kind === 'brands') await brandService.update(item.id, { is_active: true });
      else if (kind === 'categories') await categoryService.update(item.id, { is_active: true });
      else await subcategoryService.update(item.id, { is_active: true });
      await loadCatalogs();
      if (file) await previewFile(file);
    } finally {
      setCatalogBusy(false);
    }
  };

  const executeImport = async () => {
    if (!file || importing || stage !== 'review' || !catalogReady
      || (!preview?.valid && !(validOnly && (preview?.summary.valid_products ?? 0) > 0))) return;

    setImporting(true);
    setMessage('');
    setResult(null);

    try {
      const response = await productService.commitInventoryImport(file, catalogMappings, validOnly);
      setResult(response.data as ImportResult);
      await onImported();
    } catch (error: any) {
      console.error('Error committing inventory import', error);
      setMessage(getApiMessage(error, 'No se pudo completar la importación. No se aplicaron cambios.'));
      const serverPreview = error?.response?.data?.preview;
      if (serverPreview) {
        const nextPreview = serverPreview as Preview;
        setPreview(nextPreview);
        setPreviewFilter(nextPreview.valid ? 'all' : 'errors');
        previewPagination.resetPage();
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    if (downloading) return;

    setDownloading(true);
    setMessage('');

    try {
      const response = await productService.downloadInventoryImportTemplate();
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Plantilla_Importacion_Productos_Inventario_Zapateria_Angelita_V2.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading import template', error);
      setMessage(getApiMessage(error, 'No se pudo descargar la plantilla XLSX.'));
    } finally {
      setDownloading(false);
    }
  };

  const statusLabel = (row: PreviewRow) => row.is_active ? 'ACTIVO' : 'INACTIVO';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[94vh] w-full max-w-7xl overflow-y-auto rounded-[2.2rem] border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-store-red">Inventario masivo · V3</p>
            <h2 className="mt-1 text-2xl font-black text-black">Importar productos desde Excel o CSV</h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-500">
              Compatible con XLSX y CSV. Puedes registrar varias tallas en una sola fila por color, siempre que indiques
              <strong> el stock exacto de cada talla</strong>. Las filas del mismo código se consolidan en un producto. Todos los campos del producto son opcionales. Los datos incompletos se guardan como borradores; ninguna talla ni código se inventa.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={previewing || importing || catalogBusy}
            className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="flex min-h-28 cursor-pointer items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-6 transition hover:border-store-red/40 hover:bg-red-50/30">
            {previewing ? <Loader2 size={26} className="animate-spin text-store-red" /> : <Upload size={26} className="text-store-red" />}
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-black">
                {file?.name || 'Seleccionar archivo XLSX o CSV'}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Máximo 10 MB · La validación se ejecuta en el servidor antes de habilitar la importación.
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              disabled={previewing || importing || catalogBusy}
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </label>

          <button
            type="button"
            onClick={downloadTemplate}
            disabled={downloading || importing}
            className="inline-flex min-h-28 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 text-xs font-black uppercase tracking-widest text-gray-600 transition hover:border-store-red hover:text-store-red disabled:opacity-50"
          >
            {downloading ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
            Plantilla XLSX V3
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-gray-800">
          <p className="font-black text-store-red">Inventario por talla · Una fila por producto y color</p>
          <p className="mt-1">
            Ejemplo: TALLA <code>2,3,4,5,6</code> · STOCK_POR_TALLA <code>2:3;3:4;4:2;5:5;6:1</code> · STOCK <strong>15</strong>.
            El sistema registra cinco variantes independientes y comprueba que el total coincida.
          </p>
          <p className="mt-1 font-semibold">
            Si indicas varias tallas sin desglose, se conservará el stock total SIN asignarlo a ninguna talla y el producto seguirá como borrador.
            Si falta stock, se guardará 0 hasta conocer las cantidades.
          </p>
          <p className="mt-2">
            PRECIO vacío o 0 = <strong>borrador, no publicable</strong>. Un precio positivo único para una misma marca,
            categoría y modelo se aplica a sus colores sin precio; los precios distintos se respetan.
            Para publicar automáticamente se necesitan código original, nombre comercial, precio positivo,
            marca y categoría activas, modelo, talla, color y existencias asignadas a variantes.
            Las fotografías son opcionales y pueden cargarse después.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
            <strong className="block text-black">CREAR</strong>
            ACCIÓN puede quedar vacía: el sistema elige CREAR para códigos nuevos o ACTUALIZAR para los existentes. No se fabrica un código cuando falta.
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
            <strong className="block text-black">Variantes del mismo producto</strong>
            Si repites el mismo código, puedes dejar vacíos los datos generales: acción, nombre, marca, categoría, precio y estado se heredan automáticamente.
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-xs text-green-800">
            <strong className="block">Catálogo inteligente</strong>
            MARCA, CATEGORÍA y SUBCATEGORÍA pueden quedar pendientes. El Paso 0 permite registrarlas o asociarlas sin impedir guardar el borrador.
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <strong className="block">Imágenes</strong>
            Las fotografías no son obligatorias para importar ni publicar. Se aceptan URL https:// o rutas /uploads/.
            Los nombres de archivo sueltos se muestran como advertencia y no se importan.
          </div>
        </div>

        {message && (
          <div className="mt-5 flex gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {file && preview && stage === 'catalog' && (
          <ImportCatalogPreflight
            rows={preview.rows}
            catalogs={catalogs}
            loading={catalogLoading}
            busy={catalogBusy || previewing || importing}
            onCreate={createCatalog}
            onActivate={activateCatalog}
            onMap={applyCatalogMapping}
            onContinue={() => setStage('review')}
          />
        )}

        {preview && stage === 'review' && (
          <div className="mt-6 space-y-5">
            <button type="button" onClick={() => setStage('catalog')}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:text-store-red">
              ← Revisar catálogos (Paso 0)
            </button>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Formato" value={preview.format.toUpperCase()} />
              <Metric label="Productos" value={preview.summary.products} />
              <Metric label="Variantes" value={preview.summary.variants} />
              <Metric label="Válidos para inventario" value={preview.summary.valid_products} success />
              <Metric label="Publicables" value={preview.summary.ready_products ?? 0} success />
              <Metric label="Borradores" value={preview.summary.draft_products ?? 0} warning />
              <Metric label="Filas con error" value={preview.summary.error_rows} danger={preview.summary.error_rows > 0} />
              <Metric label="Advertencias" value={preview.summary.warnings} warning={preview.summary.warnings > 0} />
            </div>

            <div className={'rounded-2xl border px-4 py-3 text-sm ' + (
              preview.valid
                ? 'border-green-100 bg-green-50 text-green-800'
                : 'border-amber-100 bg-amber-50 text-amber-800'
            )}>
              <div className="flex items-start gap-2">
                {preview.valid ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                <p>
                  {preview.valid
                    ? 'Archivo validado. ' + preview.summary.products + ' productos y ' + preview.summary.variants + ' variantes están listos para importar.'
                    : validOnly && preview.summary.valid_products > 0
                      ? 'Hay filas con error: solo se importarán los productos válidos. Los demás se omitirán y se reportarán.'
                      : 'Hay filas con error. Puedes corregirlas o habilitar la importación parcial de grupos válidos.'}
                  {' '}Encabezado detectado en la fila {preview.header_row}.
                </p>
              </div>
            </div>

            {!preview.valid && preview.summary.valid_products > 0 && (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <input
                  type="checkbox"
                  checked={validOnly}
                  onChange={(event) => setValidOnly(event.target.checked)}
                  disabled={importing || previewing}
                  className="mt-0.5 accent-red-600"
                />
                <span>
                  <strong>Importar solo grupos válidos ({preview.summary.valid_products}).</strong>
                  {' '}Los grupos con errores de talla, códigos duplicados o referencias sin aprobar
                  NO se guardarán. Revisa las filas omitidas posteriormente.
                </span>
              </label>
            )}
            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-700">Vista previa de filas</p>
                  <p className="mt-1 text-[11px] text-gray-400">
                    Revisa por páginas para localizar errores sin recorrer todo el archivo.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2" aria-label="Filtrar vista previa">
                  {([
                    ['all', 'Todas'],
                    ['errors', 'Con error'],
                    ['valid', 'Válidas'],
                  ] as const).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setPreviewFilter(value);
                        previewPagination.resetPage();
                      }}
                      className={
                        'rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition ' +
                        (previewFilter === value
                          ? 'border-store-red bg-store-red text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-store-red hover:text-store-red')
                      }
                    >
                      {label}
                      {value === 'errors' && preview.summary.error_rows > 0 ? ` (${preview.summary.error_rows})` : ''}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
              <table className="min-w-[1280px] w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="px-3 py-3">Fila</th>
                    <th className="px-3 py-3">Acción</th>
                    <th className="px-3 py-3">Código</th>
                    <th className="px-3 py-3">Producto</th>
                    <th className="px-3 py-3">Marca</th>
                    <th className="px-3 py-3">Categoría</th>
                    <th className="px-3 py-3">Color</th>
                    <th className="px-3 py-3">Talla</th>
                    <th className="px-3 py-3">Stock</th>
                    <th className="px-3 py-3">Precio</th>
                    <th className="px-3 py-3">Oferta</th>
                    <th className="px-3 py-3">Estado</th>
                    <th className="px-3 py-3">Validación</th>
                  </tr>
                </thead>
                <tbody key={previewPagination.page + '-' + previewFilter} className="ui-motion-rows divide-y divide-gray-100">
                  {previewPagination.paginatedItems.map((row) => (
                    <tr key={[row.row, row.code, row.color, row.size].join('-')} className={row.valid ? 'bg-white' : 'bg-red-50/50'}>
                      <td className="px-3 py-3 font-bold text-gray-400">{row.row}</td>
                      <td className="px-3 py-3">
                        <span className={'rounded-full px-2 py-1 text-[10px] font-black ' + (
                          row.action === 'ACTUALIZAR'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        )}>{row.action || '—'}</span>
                      </td>
                      <td className="px-3 py-3 font-black">{row.code || '—'}</td>
                      <td className="px-3 py-3 font-bold text-black">{row.name || '—'}</td>
                      <td className="px-3 py-3">{row.brand || '—'}</td>
                      <td className="px-3 py-3">{row.category || '—'}</td>
                      <td className="px-3 py-3 font-semibold">{row.color || '—'}</td>
                      <td className="px-3 py-3 font-black">{row.size || '—'}</td>
                      <td className="px-3 py-3 font-black">{row.stock}</td>
                      <td className="px-3 py-3">{row.price !== null ? '$' + Number(row.price).toFixed(2) : '—'}</td>
                      <td className="px-3 py-3">{row.offer_price !== null ? '$' + Number(row.offer_price).toFixed(2) : '—'}</td>
                      <td className="px-3 py-3">
                        <span className={'rounded-full px-2 py-1 text-[10px] font-black ' + (
                          row.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        )}>{statusLabel(row)}</span>
                      </td>
                      <td className="max-w-sm px-3 py-3">
                        {row.valid ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 font-bold text-green-600">
                              <CheckCircle2 size={14} /> Válido
                            </span>
                            {row.warnings.map((warning) => (
                              <p key={warning} className="text-[10px] font-semibold text-amber-700">{warning}</p>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {row.errors.map((error) => (
                              <p key={error} className="font-semibold text-red-600">{error}</p>
                            ))}
                            {row.warnings.map((warning) => (
                              <p key={warning} className="text-[10px] font-semibold text-amber-700">{warning}</p>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              <Pagination
                page={previewPagination.page}
                pageSize={previewPagination.pageSize}
                totalItems={previewPagination.totalItems}
                onPageChange={previewPagination.setPage}
                onPageSizeChange={previewPagination.setPageSize}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </div>
          </div>
        )}

        {result && (
          <div className="mt-5 rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm text-green-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-black">{result.message}</p>
                <p className="mt-1">
                  {result.summary.created} creados · {result.summary.updated} actualizados · {result.summary.variants} variantes · {result.summary.units} unidades.
                  {' '}Publicados: {result.summary.published ?? 0} · En borrador: {result.summary.drafts ?? 0} · Omitidos: {result.summary.skipped ?? 0}.
                </p>
                {!!result.summary.skipped_codes?.length && (
                  <p className="mt-2 text-xs text-amber-700">
                    Códigos no importados: {result.summary.skipped_codes.join(', ')}.
                  </p>
                )}
                {preview?.groups?.length ? (
                  <p className="mt-2 text-xs font-semibold text-green-700">
                    Registros disponibles en Productos: {preview.groups.slice(0, 5).map((group) => `${group.code} · ${group.name}`).join(' | ')}
                    {preview.groups.length > 5 ? ` · +${preview.groups.length - 5} más` : ''}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
          {file && !result && (
            <button
              type="button"
              onClick={() => previewFile(file)}
              disabled={previewing || importing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-600 hover:border-gray-400 disabled:opacity-50"
            >
              {previewing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Validar de nuevo
            </button>
          )}
          <button
            type="button"
            onClick={close}
            disabled={previewing || importing}
            className="rounded-xl bg-gray-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            {result ? 'Ver productos importados' : 'Cerrar'}
          </button>
          {!result && (
            <button
              type="button"
              onClick={executeImport}
              disabled={!file || (!preview?.valid && !(validOnly && (preview?.summary.valid_products ?? 0) > 0))
                || importing || previewing || !catalogReady || stage !== 'review'}
              title={
                preview && !preview.valid && !validOnly
                  ? `Corrige las ${preview.summary.error_rows} filas con error o habilita importar solo válidos.`
                  : 'Importar productos validados'
              }
              className="inline-flex items-center gap-2 rounded-xl bg-store-red px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-store-redDark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
              {importing
                ? 'Guardando borradores y productos...'
                : preview && !preview.valid
                  ? validOnly ? 'Importar solo ' + preview.summary.valid_products + ' válidos' : 'Corregir ' + preview.summary.error_rows + ' filas para importar'
                  : 'Importar ' + (preview?.summary.valid_products || 0) + ' productos'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Metric = ({
  label,
  value,
  success = false,
  danger = false,
  warning = false,
}: {
  label: string;
  value: string | number;
  success?: boolean;
  danger?: boolean;
  warning?: boolean;
}) => (
  <div className={'rounded-2xl border px-4 py-3 ' + (
    danger
      ? 'border-red-100 bg-red-50'
      : warning
        ? 'border-amber-100 bg-amber-50'
        : success
          ? 'border-green-100 bg-green-50'
          : 'border-gray-100 bg-gray-50'
  )}>
    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    <p className={'mt-1 text-xl font-black ' + (
      danger ? 'text-red-600' : warning ? 'text-amber-700' : success ? 'text-green-700' : 'text-black'
    )}>{value}</p>
  </div>
);

export default ProductImportModal;
