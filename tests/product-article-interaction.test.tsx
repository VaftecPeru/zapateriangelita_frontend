import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import ProductEditorModal from '../src/pages/admin/product/ProductEditorModal';
import { productService } from '../src/services/crudService';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
});
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  File: dom.window.File,
  FormData: dom.window.FormData,
  IS_REACT_ACT_ENVIRONMENT: true,
});

const product = {
  id: 1, product_code: '2001', name: 'Zapatilla Casual Dama', model: 'GENERAL-2001',
  category_id: 1, category: {id: 1, name: 'Zapatillas'}, brand_id: 2,
  brand: {id: 2, name: 'Angelita'}, price: 129.9, stock: 14,
  size: '38,39', color: 'Negro,Beige', material: 'Cuero', description: '',
  img: '', rating: 0, reviews: 0, status: 'normal' as const,
  color_sizes: {Negro: ['38', '39'], Beige: ['38', '39']},
  variant_stocks: [
    {id: 1,color: 'Negro',size: '38',stock: 2,article_model: '2001-N',sku: '2001-N-38'},
    {id: 2,color: 'Negro',size: '39',stock: 3,article_model: '2001-N',sku: '2001-N-39'},
    {id: 3,color: 'Beige',size: '38',stock: 4,article_model: '2001-B',sku: '2001-B-38'},
    {id: 4,color: 'Beige',size: '39',stock: 5,article_model: '2001-B',sku: '2001-B-39'},
  ],
};
const mount = dom.window.document.getElementById('root')!;
const root = createRoot(mount);
let captured: FormData | null = null;
const original = productService.update;
(productService as any).update = async (_id: number, form: FormData) => {
  captured = form;
  return { data: product };
};
let saved = 0;
async function run() {
  try {
    await act(async () => root.render(React.createElement(ProductEditorModal, {
      open: true,
      product: product as any,
      products: [product as any],
      categories: [{id: 1,name: 'Zapatillas'}],
      subcategories: [], brands: [{id: 2,name: 'Angelita'}],
      onClose: () => undefined, onSaved: () => {saved++;},
    })));
    const modelN = mount.querySelector<HTMLInputElement>('input[aria-label="Modelo para color Negro"]');
    const modelB = mount.querySelector<HTMLInputElement>('input[aria-label="Modelo para color Beige"]');
    const skuN = mount.querySelector<HTMLInputElement>('input[aria-label="SKU color Negro talla 38"]');
    const skuB = mount.querySelector<HTMLInputElement>('input[aria-label="SKU color Beige talla 39"]');
    assert.equal(modelN?.value, '2001-N');
    assert.equal(modelB?.value, '2001-B');
    assert.equal(skuN?.value, '2001-N-38');
    assert.equal(skuB?.value, '2001-B-39');

    const form = mount.querySelector('form')!;
    await act(async () => { form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); });
    assert.ok(captured, 'Formulario no envió cambios a la API simulada');
    const payload = JSON.parse(String(captured!.get('variant_stocks')));
    assert.equal(payload.length, 4);
    assert.equal(payload[0].article_model, '2001-N');
    assert.equal(payload[2].article_model, '2001-B');
    assert.equal(payload[3].sku, '2001-B-39');
    assert.equal(captured!.get('stock'), '14');
    assert.equal(saved, 1);
    console.log('PASS Formulario interactivo: carga, SKU, modelos por color y payload de edición conciliados.');
  } finally {
    (productService as any).update = original;
    await act(async () => root.unmount());
    dom.window.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
