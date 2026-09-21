import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/hooks/useAuth';
import { CartProvider } from '../src/hooks/useCart';
import { authService } from '../src/services/authService';
import apiClient from '../src/services/apiClient';
import axios from 'axios';
import LoginPage from '../src/pages/LoginPage';
import CheckoutPageV2 from '../src/pages/CheckoutPageV2';

const dom = new JSDOM('<div id="root"></div>', { url: 'https://test.invalid/' });
// Ninguna prueba puede alcanzar la API real, incluso si falta un mock.
const denyNetwork = async () => { throw new Error('Unexpected network request in offline UI test'); };
axios.defaults.adapter = denyNetwork;
apiClient.defaults.adapter = denyNetwork;
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, localStorage: dom.window.localStorage, sessionStorage: dom.window.sessionStorage })) {
  Object.defineProperty(globalThis, key, { value, configurable: true });
}
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
window.scrollTo = () => {};
globalThis.fetch = async () => ({ ok: true, json: async () => [] } as Response);
const customer = { id: 17, email: 'customer@gmail.com', name: 'Cliente', role: 'user' };
let auth: ReturnType<typeof useAuth>;
let root: Root | undefined;
let googleCallback: ((response: { credential: string }) => void) | undefined;
window.google = { accounts: { id: {
  initialize: options => { googleCallback = options.callback; }, renderButton: () => {},
} } };
authService.googleConfig = async () => ({ data: { enabled: true, client_id: 'test-client' } } as any);
authService.googleWelcome = () => new Promise(() => {}); // SMTP nunca responde: no debe bloquear el panel.

function Probe() {
  auth = useAuth();
  const location = useLocation();
  return <div id="session" data-path={location.pathname} data-auth={String(auth.isAuthenticated)}>
    {auth.loading ? 'loading' : auth.sessionError || auth.user?.email || 'guest'}
  </div>;
}
async function mount(element: React.ReactNode, token?: string) {
  if (root) await act(async () => root!.unmount());
  localStorage.clear(); sessionStorage.clear();
  if (token) localStorage.setItem('token', token);
  root = createRoot(document.getElementById('root')!);
  await act(async () => { root!.render(element); });
}
const provider = () => <MemoryRouter><AuthProvider><Probe /></AuthProvider></MemoryRouter>;
function check(name: string, assertion: () => void) { assertion(); console.log(`PASS ${name}`); }

async function run() {
  authService.getProfile = async () => { throw { response: { status: 503 } }; };
  await mount(provider(), 'persisted-token');
  check('Fallo temporal conserva token y no autoriza con datos locales', () => {
    assert.equal(localStorage.getItem('token'), 'persisted-token');
    assert.equal(auth.isAuthenticated, false); assert.ok(auth.sessionError);
  });
  authService.getProfile = async () => ({ data: customer } as any);
  await act(async () => { await auth.retrySession(); });
  check('Reintento recupera sesión aunque falte el perfil local', () => {
    assert.equal(auth.user?.id, 17); assert.equal(auth.sessionError, null);
  });
  authService.getProfile = async () => { throw { response: { status: 401 } }; };
  await mount(provider(), 'expired-token');
  check('Sesión realmente rechazada elimina el token', () => {
    assert.equal(localStorage.getItem('token'), null); assert.equal(auth.isAuthenticated, false);
  });
  let rejectOld: (error: unknown) => void = () => {};
  authService.getProfile = () => new Promise((_resolve, reject) => { rejectOld = reject; });
  await mount(provider(), 'old-token');
  await act(async () => { auth.login(customer, 'new-token'); rejectOld({ response: { status: 401 } }); });
  check('Respuesta antigua no borra una sesión recién emitida', () => {
    assert.equal(localStorage.getItem('token'), 'new-token'); assert.equal(auth.user?.id, 17);
  });

  for (const from of ['/profile/purchases', '/checkout', undefined]) {
    let calls = 0;
    authService.googleLogin = async () => { calls++; return { data: { user: customer, token: 'google-token', account_created: true } } as any; };
    await mount(<MemoryRouter initialEntries={[{ pathname: '/login', state: { from } }]}>
      <AuthProvider><Routes><Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Probe />} /></Routes></AuthProvider>
    </MemoryRouter>);
    assert.ok(googleCallback);
    await act(async () => { await Promise.all([googleCallback!({ credential: 'signed-token' }), googleCallback!({ credential: 'signed-token' })]); });
    check(`Google conserva destino ${from || '/welcome'} sin esperar SMTP`, () => {
      assert.equal(document.getElementById('session')?.dataset.path, from || '/welcome');
      assert.equal(document.getElementById('session')?.dataset.auth, 'true');
      assert.equal(calls, 1); assert.equal(localStorage.getItem('token'), 'google-token');
    });
  }

  let verifyCalls = 0;
  (apiClient as any).get = async (url: string) => {
    if (url === '/checkout/payments/openpay/verify') {
      verifyCalls++;
      return { data: { payment_status: 'paid', order_id: 55, auth_token: 'checkout-token', user: customer } };
    }
    return { data: url === '/addresses' ? [] : { price: 0 } };
  };
  // La sesión de checkout existe antes de montar el retorno de 3DS.
  function CheckoutFixture() {
    sessionStorage.setItem('angelita_checkout_token_order_55', 'proof');
    sessionStorage.setItem('angelita_checkout_order_id', '55');
    return <CheckoutPageV2 />;
  }
  await mount(<MemoryRouter initialEntries={['/checkout?openpay_return=1&order_id=55&id=transaction-55']}>
    <AuthProvider><CartProvider><Routes><Route path="/checkout" element={<CheckoutFixture />} />
      <Route path="/profile/purchases" element={<Probe />} /></Routes></CartProvider></AuthProvider>
  </MemoryRouter>);
  check('Pago confirmado abre Mis compras autenticado sin recargar', () => {
    assert.equal(document.getElementById('session')?.dataset.path, '/profile/purchases');
    assert.equal(auth.user?.id, 17); assert.equal(localStorage.getItem('token'), 'checkout-token');
    assert.equal(verifyCalls, 1);
  });
  await act(async () => root!.unmount());
}
run().catch(error => { console.error(error); process.exitCode = 1; });
