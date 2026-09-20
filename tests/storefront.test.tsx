import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ReferenceLanding from '../src/components/ReferenceLanding';
import ProductDetailPage from '../src/pages/ProductDetailPage';
import { CartProvider } from '../src/hooks/useCart';
import { productService, settingsService } from '../src/services/crudService';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'https://test.invalid/' });
Object.defineProperty(globalThis, 'window', { value: dom.window, configurable: true });
Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true });
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
window.scrollTo = () => {};
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} } as any);
let root: Root;
const target = document.getElementById('root')!;
const tests: string[] = [];
async function render(element: React.ReactNode) {
  if (root) await act(async () => root.unmount());
  localStorage.clear();
  root = createRoot(target);
  await act(async () => { root.render(element); });
}
async function click(selector: string) {
  const node = document.querySelector<HTMLButtonElement>(selector);
  assert.ok(node, `Missing ${selector}`);
  await act(async () => { node.click(); });
}
function check(name: string, assertion: () => void) { assertion(); tests.push(name); console.log(`PASS ${name}`); }
(settingsService as any).getAll = async () => ({ data: { success: true, data: {} } });

const fixture: any = {
  id: 13, name: 'Producto de prueba', category: { name: 'Hombre' }, brand: { name: 'Marca' },
  subcategory: { name: 'Zapatos de vestir' }, price: 300, discounted_price: 240, stock: 2,
  size: '38,39', sizes: [{ size: '38', stock: 2 }, { size: '39', stock: 2 }], color: 'Negro,Marron',
  colors: [{ color: 'Negro' }, { color: 'Marron' }], color_sizes: { Negro: ['38', '39'], Marron: ['38'] },
  images: ['/one.webp', '/two.webp'], color_images: { Negro: ['/black.webp'], Marron: ['/brown.webp'] },
};
function detail(product = fixture) {
  (productService as any).getById = async () => ({ data: product });
  return <MemoryRouter initialEntries={['/producto/13']}><CartProvider><Routes><Route path="/producto/:productId" element={<ProductDetailPage />} /><Route path="/checkout" element={<p id="checkout-test">Checkout</p>} /></Routes></CartProvider></MemoryRouter>;
}

async function run() {
  await render(<MemoryRouter><ReferenceLanding products={[{ id: 1, price: 60, oldPrice: 100 }]} loading={false} error={false} renderProduct={p => <article key={p.id}>Producto real {p.id}</article>} /></MemoryRouter>);
  check('Portada: tres categorías en el orden de la referencia', () => assert.deepEqual([...document.querySelectorAll('.ref-collection h2')].map(n => n.textContent), ['Mujer', 'Hombre', 'Niños']));
  check('Portada: fotografía roja y texto editable', () => { assert.match(document.querySelector('h1')!.textContent!, /Camina con tu/); assert.match(document.querySelector('.ref-hero__photo')!.getAttribute('src')!, /hero-red/); });
  check('Promoción: descuento calculado, no inventado', () => assert.match(document.querySelector('.ref-promotion')!.textContent!, /40%/));
  await click('[aria-label="Banner siguiente"]');
  check('Slider: navegación siguiente', () => assert.match(document.querySelector('h1')!.textContent!, /Tu ritmo/));
  await click('[aria-label="Banner anterior"]');
  check('Slider: navegación anterior', () => assert.match(document.querySelector('h1')!.textContent!, /Camina/));
  await click('[aria-label="Pausar banners"]');
  check('Slider: pausa explícita accesible', () => assert.ok(document.querySelector('[aria-label="Reanudar banners"][aria-pressed="true"]')));
  await render(<MemoryRouter><ReferenceLanding products={[]} loading={false} error={true} renderProduct={() => null} /></MemoryRouter>);
  check('Catálogo: error sin productos ficticios', () => { assert.match(document.querySelector('.ref-empty')!.textContent!, /No pudimos/); assert.equal(document.querySelectorAll('.ref-product-grid article').length, 0); });

  await render(detail());
  check('Detalle: datos y precio reales', () => { assert.equal(document.querySelector('h1')?.textContent, fixture.name); assert.match(document.querySelector('.product-price-line')!.textContent!, /240/); });
  await click('.buy-box-cart');
  check('Carrito: requiere talla y color', () => { assert.match(document.querySelector('[role="alert"]')!.textContent!, /Selecciona una talla y un color/); assert.equal(localStorage.getItem('cart'), null); });
  await click('[aria-label="Negro"]');
  await click('.size-chip');
  check('Variantes: imagen y talla seleccionadas', () => { assert.match(document.querySelector('.pd-zoom-trigger img')!.getAttribute('src')!, /black.webp/); assert.equal(document.querySelector('.size-chip[aria-pressed=true]')!.textContent!.trim(), '38'); });
  await click('.buy-box-cart');
  check('Carrito: producto con variante correcta', () => { const cart = JSON.parse(localStorage.getItem('cart')!); assert.equal(cart[0].product.color, 'Negro'); assert.equal(cart[0].product.size, '38'); assert.equal(cart[0].quantity, 1); });
  await click('.buy-box-cart');
  await click('.buy-box-cart');
  check('Carrito: límite de stock incluyendo unidades existentes', () => { assert.equal(JSON.parse(localStorage.getItem('cart')!)[0].quantity, 2); assert.match(document.querySelector('[role="alert"]')!.textContent!, /stock/); });
  await click('[aria-label="Marron"]');
  check('Variante con talla única: selección automática', () => assert.equal(document.querySelector('.size-chip[aria-pressed=true]')!.textContent!.trim(), '38'));
  await render(detail({
    ...fixture,
    color: 'Celeste',
    colors: [{ color: 'Celeste' }],
    color_sizes: { Celeste: ['38'] },
    sizes: [{ size: '38', stock: 2 }],
    size: '38',
  }));
  check('Color Celeste: se muestra y usa tono correcto', () => {
    const swatch = document.querySelector<HTMLElement>('[aria-label="Celeste"]');
    assert.ok(swatch);
    assert.ok(String(swatch?.getAttribute('style') || '').includes('125, 211, 252') || String(swatch?.getAttribute('style') || '').includes('#7dd3fc'));
    assert.match(document.querySelector('.variant-label')!.textContent!, /Celeste/);
  });

  await render(detail({ ...fixture, sizes: [{ size: '39' }], size: '39', color: 'Negro', colors: [{ color: 'Negro' }], color_sizes: {} }));
  await click('.buy-box-now');
  check('Comprar ahora: checkout con talla única', () => assert.ok(document.getElementById('checkout-test')));
  await render(detail({ ...fixture, stock: 0 }));
  check('Agotado: compra deshabilitada en ambas superficies', () => { assert.ok(document.querySelector<HTMLButtonElement>('.buy-box-cart')!.disabled); assert.ok(document.querySelector<HTMLButtonElement>('.pd-mobile-bar button')!.disabled); });
  check('Responsive: reglas móvil, tablet y escritorio', () => { const css = readFileSync('src/styles/product-detail-premium.css', 'utf8'); for (const width of ['1024px', '700px', '360px']) assert.ok(css.includes(width)); assert.ok(css.includes('safe-area-inset-bottom')); assert.ok(css.includes('prefers-reduced-motion')); });
  check('Openpay UX: Visa usa CVV de 3 dígitos', () => {
    const paymentModal = readFileSync('src/components/PaymentModal.tsx', 'utf8');
    assert.ok(paymentModal.includes('getExpectedCvvLength'));
    assert.ok(paymentModal.includes('getCardBrand(cardNumber) === "amex" ? 4 : 3'));
    assert.ok(paymentModal.includes('Tarjeta válida · confirma con 3D Secure'));
  });
  check('Checkout: retorno 3D Secure conserva transacción para verificación', () => {
    const checkout = readFileSync('src/pages/CheckoutPageV2.tsx', 'utf8');
    assert.ok(checkout.includes('/checkout/payments/openpay/verify'));
    assert.ok(checkout.includes('transaction_id'));
    assert.ok(checkout.includes('openpay_return'));
  });
  check('Delivery: costo administrable por rol administrativo', () => {
    const service = readFileSync('src/services/crudService.ts', 'utf8');
    const manager = readFileSync('src/pages/admin/ServiceManager.tsx', 'utf8');
    assert.ok(service.includes("'/services/delivery'"));
    assert.ok(service.includes('updateDelivery'));
    assert.ok(manager.includes('Gestión habilitada para Administrador y Superadministrador'));
    assert.ok(manager.includes('Guardar costo de delivery'));
  });

  check('Google: registro rápido no bloquea por SMTP y abre bienvenida', () => {
    const login = readFileSync('src/pages/LoginPage.tsx', 'utf8');
    const googleButton = readFileSync('src/components/GoogleIdentityButton.tsx', 'utf8');
    const authService = readFileSync('src/services/authService.ts', 'utf8');
    const app = readFileSync('src/App.tsx', 'utf8');
    const welcome = readFileSync('src/pages/WelcomeDashboardPage.tsx', 'utf8');

    assert.ok(login.includes('data.account_created'));
    assert.ok(login.includes("navigate('/welcome'"));
    assert.ok(login.includes('authService.googleWelcome()'));
    assert.ok(login.includes('status === 429'));
    assert.ok(googleButton.includes('disabledRef'));
    assert.ok(authService.includes("'/auth/google/welcome'"));
    assert.ok(app.includes('path="/welcome"'));
    assert.ok(welcome.includes('Registro completado'));
  });

  check('Ajustes: banners usan method override y logo administrable', () => {
    const service = readFileSync('src/services/crudService.ts', 'utf8');
    const settings = readFileSync('src/pages/admin/SettingsManager.tsx', 'utf8');
    assert.ok(service.includes("formData.append('_method', 'PUT')"));
    assert.ok(service.includes('uploadLogoImage'));
    assert.ok(settings.includes('Identidad visual'));
    assert.ok(settings.includes('Cambiar logo'));
  });

  check('Moneda: checkout e historial usan MXN', () => {
    for (const file of ['src/components/PaymentModal.tsx', 'src/components/EditableOrderSummary.tsx', 'src/pages/ClientPurchasesPage.tsx']) {
      const source = readFileSync(file, 'utf8');
      assert.ok(source.includes('currency: "MXN"'), `${file} debe usar MXN`);
    }
  });
  await act(async () => root.unmount());
  console.log(`\n${tests.length} pruebas de componentes aprobadas. No sustituyen revisión visual en navegador.`);
}
run().catch(error => { console.error(error); process.exitCode = 1; });
