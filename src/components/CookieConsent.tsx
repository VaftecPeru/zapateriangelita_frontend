import { useRef, useState } from 'react';
import { Cookie } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { readCookieConsent, saveCookieConsent } from '../utils/cookieConsent';
import '../styles/cookie-consent.css';

export default function CookieConsent() {
  const { pathname } = useLocation();
  const [choice, setChoice] = useState(readCookieConsent);
  const [analytics, setAnalytics] = useState(choice ?? false);
  const dialog = useRef<HTMLDialogElement>(null);

  if (pathname.startsWith('/admin')) return null;

  const save = (value: boolean) => {
    saveCookieConsent(value);
    setChoice(value);
    dialog.current?.close();
  };

  const configure = () => {
    setAnalytics(choice ?? false);
    dialog.current?.showModal();
  };

  return (
    <>
      {choice === null ? (
        <aside className="cookie-consent" aria-labelledby="cookie-banner-title">
          <h2 id="cookie-banner-title"><Cookie size={18} aria-hidden="true" /> Preferencias de cookies</h2>
          <p>Usamos cookies necesarias para la tienda. Puedes permitir las estadísticas de uso o continuar solo con las necesarias. <Link to="/privacidad">Ver privacidad</Link></p>
          <div className="cookie-consent__actions">
            <button type="button" onClick={() => save(false)}>Solo necesarias</button>
            <button type="button" onClick={configure}>Configurar</button>
            <button type="button" className="cookie-consent__primary" onClick={() => save(true)}>Aceptar todas</button>
          </div>
        </aside>
      ) : (
        <button type="button" className="cookie-consent__settings" onClick={configure}>Preferencias de cookies</button>
      )}
      <dialog ref={dialog} className="cookie-consent__dialog" aria-labelledby="cookie-dialog-title">
        <h2 id="cookie-dialog-title">Configurar cookies</h2>
        <fieldset>
          <legend>Cookies necesarias</legend>
          <p>Siempre activas para funciones como mantener la sesión y el carrito.</p>
        </fieldset>
        <fieldset>
          <legend>Analítica opcional</legend>
          <label><input type="checkbox" checked={analytics} onChange={event => setAnalytics(event.target.checked)} /> Permitir estadísticas de uso</label>
        </fieldset>
        <div className="cookie-consent__actions">
          <button type="button" onClick={() => dialog.current?.close()}>Cancelar</button>
          <button type="button" className="cookie-consent__primary" onClick={() => save(analytics)}>Guardar preferencias</button>
        </div>
      </dialog>
    </>
  );
}
