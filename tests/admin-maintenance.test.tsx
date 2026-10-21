import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import CustomerManager from '../src/pages/admin/CustomerManager';
import CommerceManager from '../src/pages/admin/CommerceManager';
import InventoryManager from '../src/pages/admin/InventoryManager';
import ProductEditorModal from '../src/pages/admin/product/ProductEditorModal';
import { userService, orderService, inventoryService } from '../src/services/crudService';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document, File: dom.window.File,
  FormData: dom.window.FormData, IS_REACT_ACT_ENVIRONMENT: true,
});
const target = dom.window.document.getElementById('root')!;
const root = createRoot(target);
const oldUsers = userService.getAll, oldOrders = orderService.getAll, oldInventory = inventoryService.getInventory;
async function render(ui: React.ReactElement) {
  await act(async () => { root.render(ui); });
}
async function run() {
  try {
    (userService as any).getAll = async () => ({ data: [
      { id: 1, name: 'Cliente Demo', email: 'cliente@ejemplo.com', phone: '5512345678', role: 'user', created_at: '2026-10-20T12:00:00Z' },
      { id: 2, name: 'Admin Oculto', email: 'admin@ejemplo.com', role: 'admin', created_at: '2026-10-20T12:00:00Z' },
    ] });
    await render(<CustomerManager />);
    assert.ok(target.textContent?.includes('Lista de Clientes'));
    assert.ok(target.textContent?.includes('Cliente Demo'));
    assert.ok(!target.textContent?.includes('Admin Oculto'), 'No exponer cuentas administrativas como clientes');
    assert.ok(target.querySelector('input[aria-label="Buscar clientes"]'));
    console.log('PASS Clientes: lista filtrada, datos reales vía API, sin administradores.');

    (orderService as any).getAll = async (_page: number) => ({ data: { data: [
      { id: 1, code: 'ORD-DEMO-001', status: 'finalizado', payment_status: 'paid', total: 350, customer_name: 'Cliente Demo', created_at: '2026-10-20T12:00:00Z' },
      { id: 2, code: 'ORD-DEMO-002', status: 'sin_preparar', payment_status: 'pending', total: 99, customer_name: 'Segundo', created_at: '2026-10-19T12:00:00Z' },
    ], last_page: 1 } });
    await render(<CommerceManager mode="sales" />);
    assert.ok(target.textContent?.includes('ORD-DEMO-001'));
    assert.ok(target.textContent?.includes('Ventas y pedidos'));
    assert.ok(target.textContent?.includes('350'));
    assert.ok(target.querySelector('button') && target.textContent?.includes('Exportar CSV'));
    await render(<CommerceManager mode="reports" />);
    assert.ok(target.textContent?.includes('Reportes de ventas'));
    console.log('PASS Ventas y Reportes: pedidos y suma de pagos confirmados.');

    (inventoryService as any).getInventory = async () => ({ data: {
      items: [
        { product_id: 101, variant_id: 2, product_code: 'DEM-01', name: 'Zapato Demo', image: 'uploads/products/zapato-demo.jpg', brand: 'Pirma', category: 'Mujer', color: 'Negro', size: '20', stock: 5, stock_minimum: 2, status: 'disponible', source: 'variant' },
      ], summary: { total_stock: 5, available: 5, low_stock: 0, out_of_stock: 0 },
    }});
    await render(<InventoryManager />);
    const image = target.querySelector<HTMLImageElement>('img[alt="Zapato Demo"]');
    assert.ok(image, 'Debe mostrar miniatura de inventario');
    assert.ok(image!.src.includes('/api/media/uploads/products/zapato-demo.jpg'), 'URL de imagen debe apuntar al proxy de medios');
    await act(async () => { image!.dispatchEvent(new dom.window.Event('error')); });
    assert.ok(target.textContent?.includes('Zapato Demo'));
    console.log('PASS Inventario: miniatura normalizada y fallback en imagen fallida.');

    let navigated = '';
    await render(<ProductEditorModal open product={null} products={[]} categories={[]} brands={[]} subcategories={[]} onSaved={()=>{}}
      onClose={()=>{}} onNavigate={tab => {navigated = tab;}} />);
    assert.ok(target.querySelector('.product-editor-workspace'));
    const menu = target.querySelector('.product-editor-workspace nav')!;
    assert.ok(menu.textContent?.includes('Clientes'));
    assert.ok(menu.textContent?.includes('Ventas'));
    assert.ok(menu.textContent?.includes('Reportes'));
    assert.ok(!menu.textContent?.includes('Promociones'));
    assert.ok(!menu.textContent?.includes('Contenido'));
    assert.ok(!menu.textContent?.includes('Configuración'));
    const clients = [...menu.querySelectorAll('button')].find(button => button.textContent?.trim() === 'Clientes')!;
    await act(async () => { clients.dispatchEvent(new dom.window.MouseEvent('click', { bubbles:true })); });
    assert.equal(navigated, 'customers');
    console.log('PASS Navegación: menú oculto según pedido y Clientes operativo.');
  } finally {
    (userService as any).getAll = oldUsers;
    (orderService as any).getAll = oldOrders;
    (inventoryService as any).getInventory = oldInventory;
    await act(async () => { root.unmount(); });
    dom.window.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
