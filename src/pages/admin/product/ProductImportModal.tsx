import { useMemo, useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from 'lucide-react';
import { Brand, Category, Product, Subcategory, productService } from '../../../services/crudService';
import { ImportPreviewRow } from './types';

type Props = {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  products: Product[];
  onImported: () => Promise<void> | void;
};

const normalize = (value: unknown) => String(value ?? '')
  .trim()
  .toLocaleLowerCase('es-MX')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ');

const pick = (row: Record<string, unknown>, aliases: string[]) => {
  const normalizedEntries = Object.entries(row).map(([key, value]) => [normalize(key), value] as const);
  for (const alias of aliases) {
    const found = normalizedEntries.find(([key]) => key === normalize(alias));
    if (found) return found[1];
  }
  return '';
};

const toNumber = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value ?? '').replace(',', '.').trim());
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStatus = (value: unknown): 'normal' | 'oferta' | 'nuevo' => {
  const normalized = normalize(value);
  if (normalized === 'oferta') return 'oferta';
  if (normalized === 'nuevo' || normalized === 'novedad') return 'nuevo';
  return 'normal';
};

const ProductImportModal = ({ open, onClose, categories, subcategories, brands, products, onImported }: Props) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ImportPreviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [summary, setSummary] = useState<{ created: number; updated: number; failed: number } | null>(null);

  const validRows = useMemo(() => rows.filter((row) => row.valid), [rows]);

  if (!open) return null;

  const findCategory = (name: string) => categories.find((item) => normalize(item.name) === normalize(name));
  const findSubcategory = (name: string, categoryId?: number) => subcategories.find((item) =>
    normalize(item.name) === normalize(name) && (!categoryId || item.category_id === categoryId)
  );
  const findBrand = (name: string) => brands.find((item) => normalize(item.name) === normalize(name));

  const buildPreviewRows = (data: Record<string, unknown>[]) => data.map((raw, index): ImportPreviewRow => {
    const code = String(pick(raw, ['codigo producto', 'código producto', 'codigo', 'sku']) || '').trim();
    const name = String(pick(raw, ['producto', 'nombre producto', 'nombre', 'product']) || '').trim();
    const category = String(pick(raw, ['categoria', 'categoría', 'category']) || '').trim();
    const subcategory = String(pick(raw, ['subcategoria', 'subcategoría', 'subcategory']) || '').trim();
    const brand = String(pick(raw, ['marca', 'brand']) || '').trim();
    const price = toNumber(pick(raw, ['precio usd', 'precio', 'price']));
    const discount = toNumber(pick(raw, ['descuento %', 'descuento', 'discount']));
    const stock = Math.max(0, Math.trunc(toNumber(pick(raw, ['stock', 'cantidad', 'inventario']))));
    const sizes = String(pick(raw, ['tallas', 'talla', 'sizes', 'size']) || '').trim();
    const colors = String(pick(raw, ['colores', 'color', 'colors']) || '').trim();
    const material = String(pick(raw, ['material']) || '').trim();
    const status = toStatus(pick(raw, ['estado', 'status']));
    const description = String(pick(raw, ['descripcion', 'descripción', 'description']) || '').trim();

    const errors: string[] = [];
    const categoryMatch = findCategory(category);
    if (!name) errors.push('Producto obligatorio');
    if (!category) errors.push('Categoría obligatoria');
    if (category && !categoryMatch) errors.push(`Categoría no registrada: ${category}`);
    if (!(price > 0)) errors.push('Precio debe ser mayor que 0');
    if (discount < 0 || discount > 100) errors.push('Descuento debe estar entre 0 y 100');

    if (subcategory && categoryMatch && !findSubcategory(subcategory, categoryMatch.id)) {
      errors.push(`Subcategoría no registrada: ${subcategory}`);
    }
    if (brand && !findBrand(brand)) errors.push(`Marca no registrada: ${brand}`);

    return {
      row: index + 2,
      code,
      name,
      category,
      subcategory,
      brand,
      price,
      discount,
      stock,
      sizes,
      colors,
      material,
      status,
      description,
      valid: errors.length === 0,
      errors,
    };
  });

  const handleFile = async (file?: File) => {
    if (!file) return;
    setSummary(null);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      setRows(buildPreviewRows(data));
    } catch (error) {
      console.error('Error reading import file', error);
      setRows([]);
      alert('No se pudo leer el archivo. Usa un archivo XLSX, XLS o CSV válido.');
    }
  };

  const downloadTemplate = () => {
    const sheet = XLSX.utils.json_to_sheet([
      {
        'Código producto': 'ZAP-001',
        'Producto': 'Nike Air Max 90',
        'Categoría': 'Mujer',
        'Subcategoría': 'Tenis deportivos',
        'Marca': 'Nike',
        'Precio USD': 89.9,
        'Descuento %': 10,
        'Stock': 25,
        'Tallas': '36,37,38,39',
        'Colores': 'Negro,Blanco',
        'Material': 'Cuero sintético',
        'Estado': 'normal',
        'Descripción': 'Tenis deportivo para uso diario',
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Productos');
    XLSX.writeFile(workbook, 'Plantilla_Importacion_Productos_Angelita.xlsx');
  };

  const buildFormData = (row: ImportPreviewRow) => {
    const category = findCategory(row.category)!;
    const subcategory = row.subcategory ? findSubcategory(row.subcategory, category.id) : undefined;
    const brand = row.brand ? findBrand(row.brand) : undefined;
    const data = new FormData();
    data.append('name', row.name);
    if (row.code) data.append('product_code', row.code);
    data.append('category_id', String(category.id || ''));
    if (subcategory?.id) data.append('subcategory_id', String(subcategory.id));
    if (brand?.id) data.append('brand_id', String(brand.id));
    data.append('price', String(row.price));
    data.append('stock', String(row.stock));
    data.append('size', row.sizes);
    data.append('color', row.colors);
    data.append('material', row.material);
    data.append('rating', '0');
    data.append('reviews', '0');
    data.append('discount', row.discount > 0 ? String(row.discount) : '');
    data.append('status', row.status);
    data.append('description', row.description);

    const colors = row.colors.split(/[,/|]+/).map((value) => value.trim()).filter(Boolean);
    const sizes = row.sizes.split(/[,|]+/).map((value) => value.trim()).filter(Boolean);
    const colorSizes = colors.reduce<Record<string, string[]>>((acc, color) => {
      acc[color] = sizes;
      return acc;
    }, {});
    data.append('color_sizes', JSON.stringify(colorSizes));
    return data;
  };

  const executeImport = async () => {
    if (!validRows.length || importing) return;
    setImporting(true);
    setSummary(null);
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        const data = buildFormData(row);
        const existing = row.code
          ? products.find((product) => normalize(product.product_code) === normalize(row.code))
          : undefined;

        if (existing?.id) {
          await productService.update(existing.id, data);
          updated += 1;
        } else {
          await productService.create(data);
          created += 1;
        }
      } catch (error) {
        console.error(`Error importing row ${row.row}`, error);
        failed += 1;
      }
    }

    setSummary({ created, updated, failed });
    setImporting(false);
    await onImported();
  };

  const close = () => {
    if (importing) return;
    setRows([]);
    setFileName('');
    setSummary(null);
    if (fileRef.current) fileRef.current.value = '';
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2.2rem] border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-store-red">Inventario masivo</p>
            <h2 className="mt-1 text-2xl font-black text-black">Importar productos desde Excel</h2>
            <p className="mt-1 text-sm text-gray-500">Sube la plantilla, valida los registros y confirma antes de guardar.</p>
          </div>
          <button type="button" onClick={close} className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-red-50 hover:text-red-500"><X size={20} /></button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center transition hover:border-store-red/40 hover:bg-red-50/30">
            <Upload size={22} className="text-store-red" />
            <div className="text-left">
              <p className="text-sm font-black text-black">{fileName || 'Seleccionar archivo XLSX, XLS o CSV'}</p>
              <p className="text-xs text-gray-400">La primera hoja del archivo será utilizada.</p>
            </div>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          </label>
          <button type="button" onClick={downloadTemplate} className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-gray-600 hover:border-store-red hover:text-store-red">
            <Download size={16} /> Descargar plantilla
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <div className="flex gap-2"><AlertTriangle size={16} className="mt-0.5 shrink-0" /><p><strong>Categorías, subcategorías y marcas deben existir previamente.</strong> Así evitamos duplicados por diferencias de escritura. El stock importado se guarda en el stock maestro del producto.</p></div>
        </div>

        {rows.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-black">Vista previa</h3>
                <p className="text-xs text-gray-400">{validRows.length} válidos · {rows.length - validRows.length} con observaciones</p>
              </div>
              <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">Listos {validRows.length}</span>
                <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">Errores {rows.length - validRows.length}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="min-w-[900px] w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <tr><th className="px-4 py-3">Fila</th><th className="px-4 py-3">Código</th><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Precio</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Validación</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.row} className={row.valid ? 'bg-white' : 'bg-red-50/40'}>
                      <td className="px-4 py-3 font-bold text-gray-400">{row.row}</td>
                      <td className="px-4 py-3 font-semibold">{row.code || '—'}</td>
                      <td className="px-4 py-3 font-bold text-black">{row.name || '—'}</td>
                      <td className="px-4 py-3">{row.category || '—'}</td>
                      <td className="px-4 py-3">${row.price.toFixed(2)}</td>
                      <td className="px-4 py-3 font-black">{row.stock}</td>
                      <td className="px-4 py-3 uppercase">{row.status}</td>
                      <td className="px-4 py-3">
                        {row.valid ? <span className="inline-flex items-center gap-1 font-bold text-green-600"><CheckCircle2 size={14} /> Válido</span> : <span className="font-semibold text-red-600">{row.errors.join(' · ')}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {summary && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50 px-4 py-4 text-sm text-green-800">
            <CheckCircle2 size={19} className="mt-0.5" />
            <p><strong>Importación finalizada:</strong> {summary.created} creados, {summary.updated} actualizados y {summary.failed} con error.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
          <button type="button" onClick={close} disabled={importing} className="rounded-xl bg-gray-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-200 disabled:opacity-50">Cerrar</button>
          <button type="button" onClick={executeImport} disabled={!validRows.length || importing} className="inline-flex items-center gap-2 rounded-xl bg-store-red px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-store-redDark disabled:cursor-not-allowed disabled:opacity-50">
            {importing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            {importing ? 'Importando...' : `Importar ${validRows.length} productos`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductImportModal;
