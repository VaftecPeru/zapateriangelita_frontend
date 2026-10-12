import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import apiClient from '../src/services/apiClient';
import { productService } from '../src/services/crudService';

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
  const file = new File(['xlsx-content'], 'Plantilla_Angelita_V1.xlsx', {
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

  await productService.downloadInventoryImportTemplate();
  assert.equal(requests.at(-1)?.url, '/admin/products/import/template');
  assert.equal(requests.at(-1)?.responseType, 'blob');
  console.log('PASS Importación: plantilla V1 se descarga como archivo');

  await productService.getAllAdmin();
  assert.equal(requests.at(-1)?.url, '/admin/products');
  console.log('PASS Productos: administración usa catálogo completo');

  console.log('Product import UI service tests completed');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
