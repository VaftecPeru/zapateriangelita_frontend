import { useEffect, useRef, useState } from 'react';
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
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google Identity Services.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.angelitaGoogleIdentity = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services.'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

type Props = {
  mode: 'login' | 'link';
  onCredential: (credential: string) => Promise<void> | void;
  disabled?: boolean;
};

const GoogleIdentityButton = ({ mode, onCredential, disabled = false }: Props) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const callbackRef = useRef(onCredential);
  const [state, setState] = useState<'loading' | 'ready' | 'disabled' | 'error'>('loading');

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let active = true;

    const boot = async () => {
      try {
        const response = await authService.googleConfig();
        const clientId = response.data?.client_id;

        if (!active) return;
        if (!response.data?.enabled || !clientId) {
          setState('disabled');
          return;
        }

        await loadGoogleScript();
        if (!active || !buttonRef.current || !window.google?.accounts?.id) return;

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
          text: 'continue_with',
          logo_alignment: 'left',
          width: Math.max(240, Math.min(parentWidth, 380)),
          locale: 'es',
        });

        setState('ready');
      } catch (error) {
        console.error('Google Identity Services:', error);
        if (active) setState('error');
      }
    };

    boot();

    return () => {
      active = false;
    };
  }, [mode, disabled]);

  if (state === 'disabled') {
    return (
      <div className="google-button-fallback google-button-fallback--disabled" aria-live="polite">
        <span className="google-button-fallback__mark">G</span>
        <span>Continuar con Google</span>
        <small>Configura Google para activar</small>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="google-button-fallback google-button-fallback--error" role="status">
        <span className="google-button-fallback__mark">G</span>
        <span>Google no está disponible</span>
      </div>
    );
  }

  return (
    <div className={`google-identity-button ${disabled ? 'google-identity-button--disabled' : ''}`}>
      {state === 'loading' && <div className="google-button-skeleton" aria-hidden="true" />}
      <div ref={buttonRef} className={state === 'loading' ? 'google-button-render google-button-render--hidden' : 'google-button-render'} />
    </div>
  );
};

export default GoogleIdentityButton;
