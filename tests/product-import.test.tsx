import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import apiClient from '../src/services/apiClient';
import { productService } from '../src/services/crudService';
import { unresolvedCatalogs } from '../src/pages/admin/product/ImportCatalogPreflight';

const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://test.invalid/' });
Object.defineProperty(globalThis, 'window', { value: dom.window, configurable: true });
Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true });
Object.defineProperty(globalThis, 'File', { value: dom.window.File, configurable: true });
Object.defineProperty(globalThis, 'FormData', { value: dom.window.FormData, configurable: true });
Object.defineProperty(globalThis, 'Blob', { value: dom.window.Blob, configurable: true });

const requests: Array<{ url?: string; method?: string; data?: unknown; responseType?: string }> = [];

apiClient.defaults.adapter = async (config) => {
  requests.push({
    url: config.url,
    method: config.method,
    data: config.data,
    responseType: config.responseType,
  });

  return {
    data: config.url?.includes('/template')
      ? new Blob(['xlsx'])
      : { valid: true, summary: { products: 1 } },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
};

async function run() {
  const file = new File(['xlsx-content'], 'Plantilla_Angelita_V2.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  await productService.previewInventoryImport(file);
  assert.equal(requests.at(-1)?.url, '/admin/products/import/preview');
  assert.equal(requests.at(-1)?.method, 'post');
  assert.ok(requests.at(-1)?.data instanceof FormData);
  assert.equal((requests.at(-1)?.data as FormData).get('file'), file);
  console.log('PASS Importación: preview envía XLSX al endpoint administrativo');

  await productService.commitInventoryImport(file);
  assert.equal(requests.at(-1)?.url, '/admin/products/import/commit');
  assert.equal(requests.at(-1)?.method, 'post');
  assert.ok(requests.at(-1)?.data instanceof FormData);
  console.log('PASS Importación: commit reenvía archivo original al backend');

  const mappings = {
    brands: { 'flexi dama': 'Flexi' },
    categories: { senores: 'Hombre' },
    subcategories: { 'hombre|bota': 'Botas' },
  };
  await productService.previewInventoryImport(file, mappings);
  const payload = requests.at(-1)?.data as FormData;
  assert.deepEqual(JSON.parse(String(payload.get('catalog_mappings'))), mappings);
  await productService.commitInventoryImport(file, mappings);
  assert.deepEqual(
    JSON.parse(String((requests.at(-1)?.data as FormData).get('catalog_mappings'))),
    mappings,
  );
  console.log('PASS Paso 0: preview y commit comparten las mismas correspondencias');

  const rows = [{ brand: 'Flexi', category: 'Hombre', subcategory: 'Botas' }];
  const catalogs = {
    brands: [{ id: 1, name: 'Flexi', is_active: false }],
    categories: [{ id: 1, name: 'Hombre', is_active: true }],
    subcategories: [{ id: 1, category_id: 1, name: 'Botas', is_active: false }],
  };
  assert.equal(unresolvedCatalogs(rows, catalogs).length, 2);
  catalogs.brands[0].is_active = true;
  catalogs.subcategories[0].is_active = true;
  assert.equal(unresolvedCatalogs(rows, catalogs).length, 0);
  console.log('PASS Paso 0: los catálogos pendientes no se consideran aprobados');

  await productService.downloadInventoryImportTemplate();
  assert.equal(requests.at(-1)?.url, '/admin/products/import/template');
  assert.equal(requests.at(-1)?.responseType, 'blob');
  console.log('PASS Importación: plantilla V2 se descarga como archivo');

  await productService.getAllAdmin();
  assert.equal(requests.at(-1)?.url, '/admin/products');
  console.log('PASS Productos: administración usa catálogo completo');

  console.log('Product import UI service tests completed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
