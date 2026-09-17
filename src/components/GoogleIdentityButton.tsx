import { useCallback, useEffect, useRef, useState } from 'react';
import { authService } from '../services/authService';
import '../styles/google-identity-button.css';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            ux_mode?: 'popup' | 'redirect';
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-angelita-google-identity="true"]');
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => {
        existing.remove();
        googleScriptPromise = null;
        reject(new Error('No se pudo cargar Google Identity Services.'));
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.angelitaGoogleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      googleScriptPromise = null;
      reject(new Error('No se pudo cargar Google Identity Services.'));
    };
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

type Props = {
  mode: 'login' | 'link';
  onCredential: (credential: string) => Promise<void> | void;
  disabled?: boolean;
};

type GoogleButtonState = 'loading' | 'ready' | 'disabled' | 'error';

const wait = (ms: number) => new Promise(resolve => window.setTimeout(resolve, ms));

const GoogleIdentityButton = ({ mode, onCredential, disabled = false }: Props) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onCredential);
  const mountedRef = useRef(true);
  const [state, setState] = useState<GoogleButtonState>('loading');
  const [statusText, setStatusText] = useState('Preparando acceso con Google...');

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  const renderGoogleButton = useCallback(async (clientId: string) => {
    await loadGoogleScript();

    if (!mountedRef.current || !buttonRef.current || !window.google?.accounts?.id) {
      throw new Error('Google Identity Services no quedó disponible.');
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      cancel_on_tap_outside: true,
      ux_mode: 'popup',
      callback: async ({ credential }) => {
        if (!credential || disabled) return;
        await callbackRef.current(credential);
      },
    });

    buttonRef.current.innerHTML = '';
    const parentWidth = Math.floor(buttonRef.current.parentElement?.clientWidth || 340);

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: mode === 'link' ? 'signin_with' : 'continue_with',
      logo_alignment: 'left',
      width: Math.max(240, Math.min(parentWidth, 380)),
      locale: 'es',
    });

    setStatusText('Google listo');
    setState('ready');
  }, [disabled, mode]);

  const boot = useCallback(async (manualRetry = false) => {
    if (!mountedRef.current) return;

    setState('loading');
    setStatusText(manualRetry ? 'Revisando configuración de Google...' : 'Preparando acceso con Google...');

    try {
      let configResponse;

      // Reintenta para evitar falsos negativos justo después de un deploy o limpieza de cache.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        configResponse = await authService.googleConfig();
        const clientId = configResponse.data?.client_id;

        if (configResponse.data?.enabled && clientId) {
          await renderGoogleButton(clientId);
          return;
        }

        if (attempt < 2) {
          await wait(500 + attempt * 500);
        }
      }

      if (!mountedRef.current) return;

      const status = configResponse?.data?.status;
      setState('disabled');
      setStatusText(
        status === 'invalid'
          ? 'La configuración de Google necesita corrección.'
          : 'Google todavía no está activado en el servidor.'
      );
    } catch (error) {
      console.error('Google Identity Services:', error);
      if (!mountedRef.current) return;
      setState('error');
      setStatusText('No pudimos conectar con Google. Intenta nuevamente.');
    }
  }, [renderGoogleButton]);

  useEffect(() => {
    mountedRef.current = true;
    void boot(false);

    return () => {
      mountedRef.current = false;
    };
  }, [boot]);

  if (state === 'disabled') {
    return (
      <button
        type="button"
        className="google-button-fallback google-button-fallback--retry"
        onClick={() => void boot(true)}
        disabled={disabled}
        aria-label="Reintentar acceso con Google"
      >
        <span className="google-button-fallback__mark">G</span>
        <span>Continuar con Google</span>
        <small>{statusText}</small>
      </button>
    );
  }

  if (state === 'error') {
    return (
      <button
        type="button"
        className="google-button-fallback google-button-fallback--error google-button-fallback--retry"
        onClick={() => void boot(true)}
        disabled={disabled}
        aria-label="Reintentar conexión con Google"
      >
        <span className="google-button-fallback__mark">G</span>
        <span>Reintentar con Google</span>
        <small>{statusText}</small>
      </button>
    );
  }

  return (
    <div className={`google-identity-button ${disabled ? 'google-identity-button--disabled' : ''}`}>
      {state === 'loading' && (
        <div className="google-button-skeleton" aria-label={statusText} role="status" />
      )}
      <div ref={buttonRef} className={state === 'loading' ? 'google-button-render google-button-render--hidden' : 'google-button-render'} />
    </div>
  );
};

export default GoogleIdentityButton;
