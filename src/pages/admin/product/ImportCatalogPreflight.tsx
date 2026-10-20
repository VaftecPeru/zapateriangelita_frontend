import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, PlusCircle, ShieldCheck } from 'lucide-react';
import type { Brand, Category, Subcategory } from '../../../services/crudService';

export type CatalogType = 'brands' | 'categories' | 'subcategories';
export type CatalogMappings = Record<CatalogType, Record<string, string>>;
export type CatalogData = { brands: Brand[]; categories: Category[]; subcategories: Subcategory[] };
export type CatalogRow = { brand: string; category: string; subcategory?: string };

export const emptyCatalogMappings = (): CatalogMappings => ({
  brands: {}, categories: {}, subcategories: {},
});

export const normalizeCatalogName = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' ');

type Issue = {
  kind: CatalogType;
  name: string;
  category?: Category;
  key: string;
  inactive?: Brand | Category | Subcategory;
};

export const unresolvedCatalogs = (rows: CatalogRow[], catalogs: CatalogData): Issue[] => {
  const issues: Issue[] = [];
  const seen = new Set<string>();
  const add = (issue: Issue) => {
    const id = issue.kind + '|' + issue.key;
    if (!seen.has(id)) { issues.push(issue); seen.add(id); }
  };
  for (const row of rows) {
    const brand = row.brand?.trim();
    const category = row.category?.trim();
    const subcategory = row.subcategory?.trim();
    if (brand) {
      const exact = catalogs.brands.find((item) => normalizeCatalogName(item.name) === normalizeCatalogName(brand));
      if (!exact || !exact.is_active) {
        add({ kind: 'brands', name: brand, key: normalizeCatalogName(brand), inactive: exact });
      }
    }
    const categoryMatch = category
      ? catalogs.categories.find((item) => normalizeCatalogName(item.name) === normalizeCatalogName(category))
      : undefined;
    if (category && (!categoryMatch || !categoryMatch.is_active)) {
      add({ kind: 'categories', name: category, key: normalizeCatalogName(category), inactive: categoryMatch });
    }
    if (subcategory && categoryMatch?.id && categoryMatch.is_active) {
      const existing = catalogs.subcategories.find((item) =>
        item.category_id === categoryMatch.id && normalizeCatalogName(item.name) === normalizeCatalogName(subcategory));
      if (!existing || !existing.is_active) {
        add({
          kind: 'subcategories', name: subcategory, category: categoryMatch,
          key: normalizeCatalogName(categoryMatch.name) + '|' + normalizeCatalogName(subcategory),
          inactive: existing,
        });
      }
    }
  }
  return issues;
};

type Props = {
  rows: CatalogRow[];
  catalogs: CatalogData;
  loading: boolean;
  busy: boolean;
  onCreate: (kind: CatalogType, name: string, parent?: Category) => Promise<void>;
  onActivate: (kind: CatalogType, item: Brand | Category | Subcategory) => Promise<void>;
  onMap: (kind: CatalogType, key: string, target: string) => Promise<void>;
  onContinue: () => void;
};

export default function ImportCatalogPreflight({
  rows, catalogs, loading, busy, onCreate, onActivate, onMap, onContinue,
}: Props) {
  const issues = useMemo(() => unresolvedCatalogs(rows, catalogs), [rows, catalogs]);
  const [localError, setLocalError] = useState('');
  const [selected, setSelected] = useState<Record<string, string>>({});
  const labels: Record<CatalogType, string> = {
    brands: 'Marca', categories: 'Categoría', subcategories: 'Subcategoría',
  };

  const act = async (work: () => Promise<void>) => {
    setLocalError('');
    try { await work(); }
    catch (error: any) {
      setLocalError(error?.response?.data?.message || error?.message || 'No se pudo actualizar el catálogo.');
    }
  };

  if (loading) {
    return <div className="flex items-center gap-2 rounded-2xl border p-5 text-sm text-gray-600">
      <Loader2 className="animate-spin" size={18} /> Consultando catálogos existentes…
    </div>;
  }

  return (
    <section className="mt-5 space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5" aria-label="Paso 0: Catálogos">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 shrink-0 text-store-red" size={23} />
        <div>
          <h3 className="font-black text-black">Paso 0 · Preparar marcas, categorías y subcategorías</h3>
          <p className="mt-1 text-xs leading-5 text-gray-600">
            Se reutilizan los registros existentes. Los nuevos se crean inactivos y necesitan aprobación explícita.
            No se crearán catálogos de forma automática al importar productos. También puedes continuar con campos vacíos o catálogos pendientes.
          </p>
        </div>
      </div>
      {issues.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <span className="flex items-center gap-2 text-sm font-bold text-green-800">
            <CheckCircle2 size={18} /> Catálogos conciliados. Ya puedes validar productos e inventario.
          </span>
          <button type="button" disabled={busy} onClick={onContinue}
            className="rounded-xl bg-store-red px-5 py-3 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50">
            Continuar a validación
          </button>
        </div>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <AlertTriangle size={17} /> {issues.length} referencias pendientes de resolver.
          </p>
          <div className="grid gap-3 lg:grid-cols-2">
            {issues.map((issue) => {
              const identity = issue.kind + '|' + issue.key;
              const pool = issue.kind === 'brands' ? catalogs.brands
                : issue.kind === 'categories' ? catalogs.categories
                  : catalogs.subcategories.filter((item) => item.category_id === issue.category?.id);
              const options = pool.filter((item) => item.is_active);
              return (
                <div key={identity} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      {labels[issue.kind]}{issue.category ? ' · ' + issue.category.name : ''}
                    </p>
                    <p className="mt-1 break-all text-sm font-bold text-black">{issue.name}</p>
                    {issue.inactive ? (
                      <p className="mt-1 text-xs text-amber-700">Ya existe, pero permanece pendiente de aprobación.</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">No existe en el catálogo activo.</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {issue.inactive?.id ? (
                      <button type="button" disabled={busy}
                        onClick={() => act(() => onActivate(issue.kind, issue.inactive!))}
                        className="rounded-lg bg-black px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">
                        <ShieldCheck size={14} className="mr-1 inline" /> Aprobar y activar
                      </button>
                    ) : (
                      <button type="button" disabled={busy}
                        onClick={() => act(() => onCreate(issue.kind, issue.name, issue.category))}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-[11px] font-bold text-gray-800 hover:border-store-red disabled:opacity-50">
                        <PlusCircle size={14} className="mr-1 inline" /> Registrar pendiente
                      </button>
                    )}
                    {options.length > 0 && (
                      <div className="flex min-w-[190px] flex-1 gap-2">
                        <select aria-label={'Usar ' + labels[issue.kind] + ' existente para ' + issue.name}
                          value={selected[identity] ?? ''} disabled={busy}
                          onChange={(event) => setSelected((prev) => ({ ...prev, [identity]: event.target.value }))}
                          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2 py-2 text-xs">
                          <option value="">Asociar con existente…</option>
                          {options.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                        </select>
                        <button type="button" disabled={busy || !selected[identity]}
                          onClick={() => act(() => onMap(issue.kind, issue.key, selected[identity]))}
                          className="rounded-lg bg-store-red px-3 py-2 text-[11px] font-black text-white disabled:opacity-50">
                          Asociar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {issues.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="max-w-2xl text-xs font-semibold text-amber-900">
            Puedes continuar sin registrar estos catálogos. Los productos se guardarán como borradores
            y las referencias sin asociar quedarán en los pendientes de importación.
          </p>
          <button type="button" disabled={busy} onClick={onContinue}
            className="rounded-xl bg-store-red px-5 py-3 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50">
            Continuar con pendientes
          </button>
        </div>
      )}
      {localError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{localError}</p>}
    </section>
  );
}
