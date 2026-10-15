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
import { productService } from '../../../services/crudService';
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
  };
};

const ProductImportModal = ({ open, onClose, onImported }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [message, setMessage] = useState('');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'errors' | 'valid'>('all');

  const filteredPreviewRows = useMemo(() => {
    const rows = preview?.rows ?? [];
    if (previewFilter === 'errors') return rows.filter((row) => !row.valid);
    if (previewFilter === 'valid') return rows.filter((row) => row.valid);
    return rows;
  }, [preview, previewFilter]);

  const previewPagination = usePagination(filteredPreviewRows, 25);

  if (!open) return null;

  const reset = () => {
    if (previewing || importing) return;
    setFile(null);
    setPreview(null);
    setResult(null);
    setMessage('');
    setPreviewFilter('all');
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

  const previewFile = async (selected: File) => {
    setFile(selected);
    setPreview(null);
    setResult(null);
    setMessage('');
    setPreviewing(true);

    try {
      const response = await productService.previewInventoryImport(selected);
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

    await previewFile(selected);
  };

  const executeImport = async () => {
    if (!file || !preview?.valid || importing) return;

    setImporting(true);
    setMessage('');
    setResult(null);

    try {
      const response = await productService.commitInventoryImport(file);
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
      link.download = 'Plantilla_Importacion_Productos_Inventario_Zapateria_Angelita_V1.xlsx';
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-store-red">Inventario masivo · V1</p>
            <h2 className="mt-1 text-2xl font-black text-black">Importar productos desde Excel o CSV</h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-500">
              Compatible con XLSX y CSV. El servidor detecta automáticamente coma o punto y coma como delimitador. Una fila representa una variante
              <strong> color + talla</strong>. Las filas con el mismo código se consolidan en un solo producto.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            disabled={previewing || importing}
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
              disabled={previewing || importing}
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
            Plantilla XLSX V1
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
            <strong className="block text-black">CREAR</strong>
            El código debe ser nuevo. También se reconocen valores equivalentes como CREATE, ALTA o NUEVO.
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
            <strong className="block text-black">Variantes del mismo producto</strong>
            Si repites el mismo código, puedes dejar vacíos los datos generales: acción, nombre, marca, categoría, precio y estado se heredan automáticamente.
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-xs text-green-800">
            <strong className="block">Catálogo inteligente</strong>
            CATEGORÍA es opcional. Las categorías nuevas se registran al importar y alias conocidos de marca, como FLEXI DAMA, se normalizan sin bloquear la fila.
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <strong className="block">Imágenes</strong>
            Se aceptan URL https:// o rutas /uploads/. Los nombres de archivo sueltos se muestran como advertencia y no se importan.
          </div>
        </div>

        {message && (
          <div className="mt-5 flex gap-2 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {preview && (
          <div className="mt-6 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <Metric label="Formato" value={preview.format.toUpperCase()} />
              <Metric label="Productos" value={preview.summary.products} />
              <Metric label="Variantes" value={preview.summary.variants} />
              <Metric label="Listos" value={preview.summary.valid_products} success />
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
                    : 'La importación permanece bloqueada hasta corregir todas las filas marcadas con error.'}
                  {' '}Encabezado detectado en la fila {preview.header_row}.
                </p>
              </div>
            </div>

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
                </p>
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
              disabled={!file || !preview?.valid || importing || previewing}
              title={
                preview && !preview.valid
                  ? `Corrige las ${preview.summary.error_rows} filas con error para habilitar la importación.`
                  : 'Importar productos validados'
              }
              className="inline-flex items-center gap-2 rounded-xl bg-store-red px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-store-redDark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
              {importing
                ? 'Importando...'
                : preview && !preview.valid
                  ? 'Corregir ' + preview.summary.error_rows + ' filas para importar'
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
