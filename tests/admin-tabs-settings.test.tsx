import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import AdminModuleTabs, { ADMIN_MODULE_TABS } from '../src/pages/admin/AdminModuleTabs';
import AdminSettingsWorkspace from '../src/pages/admin/AdminSettingsWorkspace';
import { AuthProvider } from '../src/hooks/useAuth';
import { additionalServiceService, settingsService } from '../src/services/crudService';
import { authService } from '../src/services/authService';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/' });
Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    localStorage: dom.window.localStorage,
    File: dom.window.File,
    FormData: dom.window.FormData,
    IS_REACT_ACT_ENVIRONMENT: true,
});
const mount = dom.window.document.getElementById('root')!;
const root = createRoot(mount);
const initialGetAll = additionalServiceService.getAll;
const initialProfile = authService.getProfile;
const initialSettings = settingsService.getAll;
const initialUpload = settingsService.uploadPreloaderImage;
async function render(ui: React.ReactElement) {
    await act(async () => { root.render(ui); });
}
async function click(button: HTMLElement) {
    await act(async () => { button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })); });
}

async function run() {
    try {
        assert.deepEqual(
            ADMIN_MODULE_TABS.map(item => item.label),
            ['Estadísticas', 'Pedido', 'Productos', 'Inventario', 'Clientes', 'Ventas', 'Reportes', 'Interesados', 'Ajustes'],
        );
        let clicked = '';
        await render(<AdminModuleTabs activeTab="settings" onSelect={tab => { clicked = tab; }} />);
        const tabs = [...mount.querySelectorAll<HTMLElement>('[role="tab"]')];
        assert.equal(tabs.length, 9);
        assert.ok(!tabs.some(x => x.textContent?.trim() === 'Usuarios'), 'Usuarios solo estará dentro de Ajustes');
        assert.ok(tabs.find(x => x.textContent?.trim() === 'Ajustes')?.getAttribute('aria-selected') === 'true');
        assert.ok(!mount.textContent?.includes('Interesados en Calzado'));
        assert.ok(!mount.textContent?.includes('Servicios'));
        assert.ok(mount.querySelector('nav')?.className.includes('overflow-x-auto'));
        const interested = tabs.find(x => x.textContent?.trim() === 'Interesados');
        assert.ok(interested);
        await click(interested!);
        assert.equal(clicked, 'funnelLeads');
        console.log('PASS intranet: 9 pestañas compactas, Usuarios trasladado a Ajustes, Servicios retirado, Interesados renombrado');

        (authService as any).getProfile = async () => ({ data: {
            id: 1, name: 'Administrador', email: 'admin@angelita.test', role: 'admin',
        } });
        dom.window.localStorage.setItem('token','fake-token-for-test');
        (additionalServiceService as any).getAll = async () => ({ data: [
            { id: 10, name: 'Costo de delivery', code: 'delivery', description: 'Envío', price: 75, is_active: true },
            { id: 20, name: 'Regalo', code: 'gift', description: 'Envoltura', price: 25, is_active: true },
        ] });
        await render(
            <AuthProvider>
                <AdminSettingsWorkspace initialSection="users" initialUsers={[
                    { id: 1, name: 'Administrador', email: 'admin@angelita.test', role: 'admin' },
                    { id: 2, name: 'Cliente Demo', email: 'cliente@angelita.test', role: 'user' },
                ]} />
            </AuthProvider>
        );
        assert.ok(mount.textContent?.includes('Usuarios Registrados'), 'Gestión de usuarios accesible desde Ajustes');
        assert.ok(mount.textContent?.includes('Cliente Demo'), 'Conserva el listado real de usuarios');
        assert.ok(mount.textContent?.includes('Costo delivery'), 'Ajustes incluye Costo delivery');
        const usersSettingsTab = [...mount.querySelectorAll<HTMLElement>('[role="tab"]')]
            .find(el => el.textContent?.trim() === 'Usuarios');
        assert.equal(usersSettingsTab?.getAttribute('aria-selected'), 'true', 'Subpestaña Usuarios activa');
        const deliverySettingsTab = [...mount.querySelectorAll<HTMLElement>('[role="tab"]')]
            .find(el => el.textContent?.trim() === 'Costo delivery');
        assert.ok(deliverySettingsTab, 'Subpestaña Costo delivery disponible');
        await click(deliverySettingsTab!);
        assert.equal(deliverySettingsTab!.getAttribute('aria-selected'), 'true');
        assert.ok(mount.textContent?.includes('Costo de delivery'));
        assert.ok(mount.textContent?.includes('75.00'), 'Se reutiliza el precio de delivery guardado');
        assert.ok(!mount.textContent?.includes('Regalo'), 'Los otros servicios no se muestran en la vista de delivery');
        assert.ok(!mount.textContent?.includes('Nuevo Servicio'), 'No se crean servicios generales desde ajustes');
        assert.ok(!mount.textContent?.includes('Gestión de Servicios'), 'No se expone el módulo antiguo');
        const edit = [...mount.querySelectorAll('button')].find(x => x.textContent?.includes('Editar delivery'));
        assert.ok(edit, 'Debe conservar el botón de edición de delivery');
        assert.ok(!edit!.disabled, 'El administrador debe poder editar el costo de delivery');
        await click(edit!);
        assert.ok(mount.textContent?.includes('Configurar costo de delivery'));
        const price = mount.querySelector<HTMLInputElement>('input[name="price"]');
        assert.equal(price?.value, '75');
        console.log('PASS ajustes: Usuarios operativo, Costo delivery reutiliza tarifa real y edición del administrador');

        const objectUrl = 'blob:http://localhost/preloader-preview';
        URL.createObjectURL = () => objectUrl;
        URL.revokeObjectURL = () => {};
        Object.assign(dom.window.HTMLDialogElement.prototype, {
            showModal(this: HTMLDialogElement) { this.open = true; },
            close(this: HTMLDialogElement) { this.open = false; },
        });
        settingsService.getAll = async () => ({ data: { data: {} } }) as Awaited<ReturnType<typeof initialSettings>>;
        let uploads = 0;
        const file = new dom.window.File(['GIF89a'], 'precarga.gif', { type: 'image/gif' });
        settingsService.uploadPreloaderImage = async (selected) => {
            assert.equal(selected, file);
            uploads++;
            return { data: { data: { path: '/api/media/uploads/settings/preloader_qa.gif' } } } as Awaited<ReturnType<typeof initialUpload>>;
        };
        await render(<AdminSettingsWorkspace key="preloader-test" />);
        const button = (label: string) => {
            const found = [...mount.querySelectorAll<HTMLButtonElement>('button')]
                .find(element => element.textContent?.includes(label));
            assert.ok(found, `Botón esperado: ${label}`);
            return found;
        };
        await click(button('Pantalla de carga de la tienda'));
        assert.ok(!mount.textContent?.includes('Estilo de precarga'));
        assert.equal(mount.querySelector('label[for="preloader-upload"]')?.textContent?.trim(), 'Cambiar imagen');
        const input = mount.querySelector<HTMLInputElement>('#preloader-upload');
        assert.ok(input);
        assert.equal(button('Revisar archivo').disabled, true);
        Object.defineProperty(input, 'files', { value: [file] });
        await act(async () => { input.dispatchEvent(new dom.window.Event('change', { bubbles: true })); });
        assert.ok(mount.querySelector(`img[src="${objectUrl}"]`), 'La vista previa usa el archivo local');
        const dialog = mount.querySelector('dialog');
        assert.ok(dialog);
        await click(button('Aceptar y publicar'));
        assert.equal(uploads, 0, 'La aceptación directa sin revisión no publica');
        await click(button('Revisar archivo'));
        assert.equal(dialog.open, true);
        assert.equal(uploads, 0, 'La revisión no publica');
        assert.ok(dialog.textContent?.includes('precarga.gif'));
        await click(button('Volver a la vista previa'));
        assert.equal(dialog.open, false);
        assert.equal(uploads, 0, 'Volver cancela el intento de publicación');
        await click(button('Revisar archivo'));
        await click(button('Aceptar y publicar'));
        assert.equal(uploads, 1);
        assert.equal(dialog.open, false);
        assert.ok(mount.textContent?.includes('Animación publicada'));
        console.log('PASS precarga: vista previa local, revisión, cancelación y una publicación tras aceptar');
    } finally {
        (authService as any).getProfile = initialProfile;
        (additionalServiceService as any).getAll = initialGetAll;
        settingsService.getAll = initialSettings;
        settingsService.uploadPreloaderImage = initialUpload;
        await act(async () => { root.unmount(); });
        dom.window.close();
    }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
