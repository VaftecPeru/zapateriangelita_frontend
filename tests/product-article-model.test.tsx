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

assert.match(output, /Modelo del artículo por color/);
assert.match(output, /Modelo para color/);
assert.match(output, /SKU color/);
assert.match(output, /Stock del producto simple|Producto simple/);
assert.match(output, /Agregar talla/);
assert.match(output, /Galería|galería/);
console.log('PASS Formulario de producto: modelo por color, SKU por talla, inventario y producto simple');
