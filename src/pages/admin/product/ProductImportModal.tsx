import { useMemo, useRef, useState } from 'react';
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
  const validProductGroups = useMemo(() => {
    const groups = new Map<string, ImportPreviewRow[]>();

    validRows.forEach((row) => {
      const key = normalize(row.code);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(row);
    });

    return Array.from(groups.values());
  }, [validRows]);

  if (!open) return null;

  const findCategory = (name: string) => categories.find((item) => normalize(item.name) === normalize(name));
  const findSubcategory = (name: string, categoryId?: number) => subcategories.find((item) =>
    normalize(item.name) === normalize(name) && (!categoryId || item.category_id === categoryId)
  );
  const findBrand = (name: string) => brands.find((item) => normalize(item.name) === normalize(name));

  const buildPreviewRows = (data: Record<string, unknown>[]) => {
    const previewRows: ImportPreviewRow[] = data.map((raw, index) => {
      const code = String(pick(raw, ['codigo producto', 'código producto', 'codigo', 'sku']) || '').trim();
      const name = String(pick(raw, ['producto', 'nombre producto', 'nombre', 'product']) || '').trim();
      const category = String(pick(raw, ['categoria', 'categoría', 'category']) || '').trim();
      const subcategory = String(pick(raw, ['subcategoria', 'subcategoría', 'subcategory']) || '').trim();
      const brand = String(pick(raw, ['marca', 'brand']) || '').trim();
      const price = toNumber(pick(raw, ['precio mxn', 'precio usd', 'precio', 'price']));
      const discount = toNumber(pick(raw, ['descuento %', 'descuento', 'discount']));
      const rawStock = pick(raw, ['stock talla', 'stock por talla', 'stock', 'cantidad', 'inventario']);
      const parsedStock = toNumber(rawStock);
      const stock = Math.max(0, Math.trunc(parsedStock));
      const size = String(pick(raw, ['talla', 'tallas', 'size', 'sizes']) || '').trim();
      const colors = String(pick(raw, ['colores', 'color', 'colors']) || '').trim();
      const material = String(pick(raw, ['material']) || '').trim();
      const status = toStatus(pick(raw, ['estado', 'status']));
      const description = String(pick(raw, ['descripcion', 'descripción', 'description']) || '').trim();

      const errors: string[] = [];
      const categoryMatch = findCategory(category);

      if (!code) errors.push('Código de producto obligatorio');
      if (!name) errors.push('Producto obligatorio');
      if (!category) errors.push('Categoría obligatoria');
      if (category && !categoryMatch) errors.push(`Categoría no registrada: ${category}`);
      if (!(price > 0)) errors.push('Precio debe ser mayor que 0');
      if (discount < 0 || discount > 100) errors.push('Descuento debe estar entre 0 y 100');
      if (!size) errors.push('Talla obligatoria');
      if (/[|,]/.test(size)) errors.push('Usa una sola talla por fila');
      if (String(rawStock ?? '').trim() === '') errors.push('Stock talla obligatorio');
      if (!Number.isInteger(parsedStock) || parsedStock < 0) errors.push('Stock talla debe ser un entero mayor o igual a 0');

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
        size,
        colors,
        material,
        status,
        description,
        valid: false,
        errors,
      };
    });

    const grouped = new Map<string, ImportPreviewRow[]>();
    previewRows.forEach((row) => {
      if (!row.code) return;
      const key = normalize(row.code);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(row);
    });

    grouped.forEach((group) => {
      const first = group[0];
      const duplicateSizes = new Set<string>();
      const seenSizes = new Set<string>();

      group.forEach((row) => {
        const sizeKey = normalize(row.size);
        if (!sizeKey) return;
        if (seenSizes.has(sizeKey)) duplicateSizes.add(sizeKey);
        seenSizes.add(sizeKey);
      });

      if (duplicateSizes.size) {
        group.forEach((row) => {
          if (duplicateSizes.has(normalize(row.size))) {
            row.errors.push(`Talla duplicada para ${row.code}: ${row.size}`);
          }
        });
      }

      const sameText = (left: string, right: string) => normalize(left) === normalize(right);
      const hasConflictingGeneralData = group.some((row) =>
        !sameText(row.name, first.name) ||
        !sameText(row.category, first.category) ||
        !sameText(row.subcategory, first.subcategory) ||
        !sameText(row.brand, first.brand) ||
        Math.abs(row.price - first.price) > 0.001 ||
        Math.abs(row.discount - first.discount) > 0.001 ||
        !sameText(row.colors, first.colors) ||
        !sameText(row.material, first.material) ||
        row.status !== first.status ||
        !sameText(row.description, first.description)
      );

      if (hasConflictingGeneralData) {
        group.forEach((row) => row.errors.push('Los datos generales del mismo código deben coincidir en todas sus filas'));
      }

      if (group.some((row) => row.errors.length > 0)) {
        group.forEach((row) => {
          if (row.errors.length === 0) {
            row.errors.push('Otra fila del mismo producto tiene errores; se bloquea la importación parcial');
          }
        });
      }
    });

    previewRows.forEach((row) => {
      row.valid = row.errors.length === 0;
    });

    return previewRows;
  };

  const parseCsv = (text: string): Record<string, unknown>[] => {
    const rows = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim() !== '');
    if (rows.length < 2) return [];

    const parseLine = (line: string) => {
      const values: string[] = [];
      let current = '';
      let quoted = false;

      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        if (char === '"') {
          if (quoted && line[index + 1] === '"') {
            current += '"';
            index += 1;
          } else {
            quoted = !quoted;
          }
        } else if (char === ',' && !quoted) {
          values.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current);
      return values;
    };

    const headers = parseLine(rows[0]).map((value) => value.trim());
    return rows.slice(1).map((line) => {
      const values = parseLine(line);
      return headers.reduce<Record<string, unknown>>((acc, header, index) => {
        acc[header] = values[index] ?? '';
        return acc;
      }, {});
    });
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    setSummary(null);
    setFileName(file.name);

    try {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Formato no permitido');
      }

      const data = parseCsv(await file.text());
      setRows(buildPreviewRows(data));
    } catch (error) {
      console.error('Error reading import file', error);
      setRows([]);
      alert('No se pudo leer el archivo. Usa la plantilla CSV de inventario por talla.');
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'Código producto', 'Producto', 'Categoría', 'Subcategoría', 'Marca',
      'Precio MXN', 'Descuento %', 'Talla', 'Stock talla', 'Colores',
      'Material', 'Estado', 'Descripción',
    ];

    const samples = [
      ['ZAP-001', 'Nike Air Max 90', 'Mujer', 'Tenis deportivos', 'Nike', '1899.90', '10', '36', '6', 'Negro|Blanco', 'Cuero sintético', 'normal', 'Tenis deportivo para uso diario'],
      ['ZAP-001', 'Nike Air Max 90', 'Mujer', 'Tenis deportivos', 'Nike', '1899.90', '10', '37', '8', 'Negro|Blanco', 'Cuero sintético', 'normal', 'Tenis deportivo para uso diario'],
      ['ZAP-001', 'Nike Air Max 90', 'Mujer', 'Tenis deportivos', 'Nike', '1899.90', '10', '38', '7', 'Negro|Blanco', 'Cuero sintético', 'normal', 'Tenis deportivo para uso diario'],
      ['ZAP-001', 'Nike Air Max 90', 'Mujer', 'Tenis deportivos', 'Nike', '1899.90', '10', '39', '4', 'Negro|Blanco', 'Cuero sintético', 'normal', 'Tenis deportivo para uso diario'],
    ];

    const escapeCsv = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

    const csv = '\uFEFF' + [headers, ...samples]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Plantilla_Importacion_Productos_Angelita_v2_inventario_por_talla.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const buildFormData = (group: ImportPreviewRow[]) => {
    const row = group[0];
    const category = findCategory(row.category)!;
    const subcategory = row.subcategory ? findSubcategory(row.subcategory, category.id) : undefined;
    const brand = row.brand ? findBrand(row.brand) : undefined;
    const sizes = group.map((item) => item.size.trim());
    const totalStock = group.reduce((sum, item) => sum + item.stock, 0);

    const data = new FormData();
    data.append('name', row.name);
    if (row.code) data.append('product_code', row.code);
    data.append('category_id', String(category.id || ''));
    if (subcategory?.id) data.append('subcategory_id', String(subcategory.id));
    if (brand?.id) data.append('brand_id', String(brand.id));
    data.append('price', String(row.price));
    data.append('stock', String(totalStock));
    data.append('size', sizes.join('|'));
    data.append('size_stocks', JSON.stringify(group.map((item) => ({ size: item.size, stock: item.stock }))));
    data.append('color', row.colors);
    data.append('material', row.material);
    data.append('rating', '0');
    data.append('reviews', '0');
    data.append('discount', row.discount > 0 ? String(row.discount) : '');
    data.append('status', row.status);
    data.append('description', row.description);

    const colors = row.colors.split(/[,/|]+/).map((value) => value.trim()).filter(Boolean);
    const colorSizes = colors.reduce<Record<string, string[]>>((acc, color) => {
      acc[color] = sizes;
      return acc;
    }, {});
    data.append('color_sizes', JSON.stringify(colorSizes));

    return data;
  };

  const resolveExistingProduct = async (code: string) => {
    const local = products.find((product) => normalize(product.product_code) === normalize(code));
    if (local?.id) return local;

    const response = await productService.getAll({ search: code, per_page: 20 });
    const payload: any = response.data;
    const candidates: Product[] = Array.isArray(payload) ? payload : (payload?.data || []);

    return candidates.find((product) => normalize(product.product_code) === normalize(code));
  };

  const executeImport = async () => {
    if (!validProductGroups.length || importing) return;
    setImporting(true);
    setSummary(null);
    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const group of validProductGroups) {
      try {
        const data = buildFormData(group);
        const existing = await resolveExistingProduct(group[0].code);

        if (existing?.id) {
          await productService.update(existing.id, data);
          updated += 1;
        } else {
          await productService.create(data);
          created += 1;
        }
      } catch (error) {
        console.error(`Error importing product ${group[0].code}`, error);
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
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2.2rem] border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-store-red">Inventario masivo</p>
            <h2 className="mt-1 text-2xl font-black text-black">Importar productos con inventario por talla</h2>
            <p className="mt-1 text-sm text-gray-500">Cada fila representa una talla. Las filas con el mismo código se consolidan como un solo producto.</p>
          </div>
          <button type="button" onClick={close} className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-red-50 hover:text-red-500"><X size={20} /></button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center transition hover:border-store-red/40 hover:bg-red-50/30">
            <Upload size={22} className="text-store-red" />
            <div className="text-left">
              <p className="text-sm font-black text-black">{fileName || 'Seleccionar archivo CSV'}</p>
              <p className="text-xs text-gray-400">Usa la plantilla V2: una fila por talla y su stock independiente.</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
          </label>
          <button type="button" onClick={downloadTemplate} className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-gray-600 hover:border-store-red hover:text-store-red">
            <Download size={16} /> Descargar plantilla
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <div className="flex gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p><strong>Regla de inventario:</strong> repite el mismo código para todas las tallas del producto. Cada combinación código + talla debe aparecer una sola vez. El stock total se calcula automáticamente sumando el stock de todas sus tallas.</p>
          </div>
        </div>

        {rows.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-black">Vista previa</h3>
                <p className="text-xs text-gray-400">{validProductGroups.length} productos listos · {validRows.length} filas válidas · {rows.length - validRows.length} filas con observaciones</p>
              </div>
              <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="rounded-full bg-green-50 px-3 py-1 text-green-700">Productos {validProductGroups.length}</span>
                <span className="rounded-full bg-red-50 px-3 py-1 text-red-600">Errores {rows.length - validRows.length}</span>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="min-w-[1020px] w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Fila</th>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Producto</th>
                    <th className="px-4 py-3">Categoría</th>
                    <th className="px-4 py-3">Talla</th>
                    <th className="px-4 py-3">Stock talla</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Validación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.row} className={row.valid ? 'bg-white' : 'bg-red-50/40'}>
                      <td className="px-4 py-3 font-bold text-gray-400">{row.row}</td>
                      <td className="px-4 py-3 font-semibold">{row.code || '—'}</td>
                      <td className="px-4 py-3 font-bold text-black">{row.name || '—'}</td>
                      <td className="px-4 py-3">{row.category || '—'}</td>
                      <td className="px-4 py-3 font-black">{row.size || '—'}</td>
                      <td className="px-4 py-3 font-black">{row.stock}</td>
                      <td className="px-4 py-3">${row.price.toFixed(2)}</td>
                      <td className="px-4 py-3 uppercase">{row.status}</td>
                      <td className="px-4 py-3">
                        {row.valid ? (
                          <span className="inline-flex items-center gap-1 font-bold text-green-600"><CheckCircle2 size={14} /> Válido</span>
                        ) : (
                          <span className="font-semibold text-red-600">{row.errors.join(' · ')}</span>
                        )}
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
            <p><strong>Importación finalizada:</strong> {summary.created} productos creados, {summary.updated} actualizados y {summary.failed} con error.</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">
          <button type="button" onClick={close} disabled={importing} className="rounded-xl bg-gray-100 px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-200 disabled:opacity-50">Cerrar</button>
          <button type="button" onClick={executeImport} disabled={!validProductGroups.length || importing} className="inline-flex items-center gap-2 rounded-xl bg-store-red px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-store-redDark disabled:cursor-not-allowed disabled:opacity-50">
            {importing ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
            {importing ? 'Importando...' : `Importar ${validProductGroups.length} productos`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductImportModal;
