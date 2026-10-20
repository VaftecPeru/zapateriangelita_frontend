import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ProductEditorModal from '../src/pages/admin/product/ProductEditorModal';

const output = renderToStaticMarkup(
  React.createElement(ProductEditorModal, {
    open: true,
    product: null,
    products: [],
    categories: [],
    subcategories: [],
    brands: [],
    onClose: () => undefined,
    onSaved: () => undefined,
  }),
);

assert.match(output, /Modelo por color/);
assert.match(output, /Modelo para color/);
assert.match(output, /SKU por talla/);
assert.match(output, /Sin variaciones|Producto simple/);
assert.match(output, /Agregar otro color|\+ Talla/);
assert.match(output, /Imágenes|imágenes/);
for (const title of ['Información principal', 'Variantes del producto', 'Estado del producto', 'Precios', 'Inventario general', 'SEO (opcional)', 'Guardar borrador', 'Publicar producto']) {
  assert.ok(output.includes(title), 'La vista de referencia debe mostrar: ' + title);
}
console.log('PASS Formulario de producto: modelo por color, SKU por talla, inventario y producto simple');
