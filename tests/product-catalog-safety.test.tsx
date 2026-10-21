import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Simulate } from 'react-dom/test-utils';
import { JSDOM } from 'jsdom';
import ProductManager from '../src/pages/admin/product/ProductManagerV2';
import RenderErrorBoundary from '../src/components/RenderErrorBoundary';
import { brandService, categoryService, productService, subcategoryService } from '../src/services/crudService';
import { getCatalogName } from '../src/utils/catalogName';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document, File: dom.window.File,
  FormData: dom.window.FormData, IS_REACT_ACT_ENVIRONMENT: true,
});
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} } as any);
const target = document.getElementById('root')!;
let root: Root | undefined;
async function mount(ui: React.ReactNode) {
  if (root) await act(async () => root!.unmount());
  root = createRoot(target);
  await act(async () => { root!.render(ui); });
}
async function click(selector: string) {
  const button = target.querySelector<HTMLButtonElement>(selector);
  assert.ok(button, selector);
  await act(async () => { button.click(); });
}
async function search(value: string) {
  const input = target.querySelector<HTMLInputElement>('input[placeholder^="Buscar por código"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    Simulate.change(input);
  });
}
const original = {
  products: productService.getAllAdmin, categories: categoryService.getAll,
  brands: brandService.getAll, subcategories: subcategoryService.getAll,
};
const fixture = Array.from({ length: 26 }, (_, index) => ({
  id: index + 1, product_code: `IMP-${index + 1}`, name: `Importado ${index + 1}`,
  brand: index % 3 === 0 ? null : index % 3 === 1 ? { name: 'Flexi' } : 'Pirma',
  category: index % 2 === 0 ? null : { name: 'Hombre' },
  price: 0, stock: 3, color: '', size: '', img: '', model: 'ABC', is_active: false,
}));
function BrokenView(): React.ReactNode { throw new Error('Simulated render failure'); }
async function run() {
  try {
    for (const value of [null, undefined, {}, 0]) assert.equal(getCatalogName(value), '');
    assert.equal(getCatalogName({ name: ' Flexi ' }), 'Flexi');
    assert.equal(getCatalogName(' Pirma '), 'Pirma');
    (categoryService as any).getAll = (brandService as any).getAll = (subcategoryService as any).getAll = async () => ({ data: [] });
    const pages: number[] = [];
    (productService as any).getAllAdmin = async (params: any = {}) => {
      const page = params.page || 1;
      pages.push(page);
      return { data: { data: page === 1 ? fixture.slice(0, 25) : fixture.slice(25), last_page: 2 } };
    };
    await mount(<ProductManager />);
    assert.deepEqual(pages, [1, 2]);
    assert.equal(target.querySelectorAll('tbody tr').length, 25);
    assert.ok(target.textContent?.includes('Sin marca'));
    assert.ok(target.textContent?.includes('Sin categoría'));
    await click('[aria-label="Página siguiente"]');
    assert.equal(target.querySelectorAll('tbody tr').length, 1);
    assert.ok(target.querySelector('tbody')?.textContent?.includes('Importado 26'));
    await click('[aria-label="Página anterior"]');
    assert.equal(target.querySelectorAll('tbody tr').length, 25);
    const sizeSelect = target.querySelector<HTMLSelectElement>('[aria-label="Filas por página"]')!;
    await act(async () => {
      sizeSelect.value = '10';
      sizeSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    assert.equal(target.querySelectorAll('tbody tr').length, 10);
    await click('[aria-label="Página siguiente"]');
    await search('Importado 26');
    assert.equal(target.querySelectorAll('tbody tr').length, 1);
    assert.ok(target.querySelector('tbody')?.textContent?.includes('Importado 26'));
    assert.equal(target.querySelector('[aria-current="page"]')?.textContent, '1');
    await search('Flexi');
    assert.equal(target.querySelectorAll('tbody tr').length, 9);
    await search('');
    const stateFilter = [...target.querySelectorAll('select')].find(select => select.textContent?.includes('Visibles en tienda'))!;
    await act(async () => {
      stateFilter.value = 'active';
      stateFilter.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    assert.ok(target.textContent?.includes('No hay productos registrados.'));
    assert.equal(target.querySelector('[aria-current="page"]')?.textContent, '1');
    await act(async () => {
      stateFilter.value = 'all';
      stateFilter.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    });
    await click('[title="Editar producto"]');
    assert.ok(target.querySelector('.product-editor-workspace'), 'Editor opens for imported product with null relations');
    console.log('PASS Catálogo: relaciones nulas, 26 productos, páginas, tamaño, filtros y edición.');

    let fail = true;
    (productService as any).getAllAdmin = async (params: any = {}) => {
      if (params.page === 2 && fail) throw new Error('Simulated second page failure');
      return { data: { data: params.page === 2 ? fixture.slice(25) : fixture.slice(0, 25), last_page: 2 } };
    };
    await mount(<ProductManager />);
    assert.ok(target.querySelector('[role="alert"]')?.textContent?.includes('catálogo completo'));
    assert.equal(target.querySelector('tbody'), null, 'Never show incomplete catalog as a successful load');
    fail = false;
    await click('button');
    assert.equal(target.querySelectorAll('tbody tr').length, 25);
    console.log('PASS Recuperación: fallo de página intermedia informa y permite reintentar sin reimportar.');

    const requested: number[] = [];
    (productService as any).getAllAdmin = async (params: any = {}) => {
      const page = params.page || 1;
      requested.push(page);
      return { data: { data: [{ ...fixture[0], id: page }], last_page: 31 } };
    };
    await mount(<ProductManager />);
    assert.equal(requested.length, 31);
    assert.ok(target.textContent?.includes('31 productos registrados'));
    console.log('PASS Carga: incluye páginas posteriores a la 30 sin truncar el catálogo.');

    await mount(<RenderErrorBoundary><BrokenView /></RenderErrorBoundary>);
    assert.ok(target.querySelector('[role="alert"]'));
    assert.ok(target.querySelector('a[href="/"]'));
    console.log('PASS Recuperación global: errores de render muestran opciones en lugar de pantalla en blanco.');
  } finally {
    productService.getAllAdmin = original.products;
    categoryService.getAll = original.categories;
    brandService.getAll = original.brands;
    subcategoryService.getAll = original.subcategories;
    if (root) await act(async () => root!.unmount());
    dom.window.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
