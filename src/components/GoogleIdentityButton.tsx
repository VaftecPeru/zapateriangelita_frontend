import { useEffect, useRef, useState } from 'react';
import { authService } from '../services/authService';

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
        const parentWidth = buttonRef.current.parentElement?.clientWidth || 320;
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          logo_alignment: 'left',
          width: Math.max(220, Math.min(parentWidth, 360)),
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
      <p className="text-center text-[11px] font-semibold text-gray-400">
        Acceso con Google pendiente de configuración.
      </p>
    );
  }

  if (state === 'error') {
    return (
      <p className="text-center text-[11px] font-semibold text-red-500">
        Google no está disponible en este momento.
      </p>
    );
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : ''}>
      {state === 'loading' && (
        <div className="h-11 rounded-full border border-gray-200 bg-gray-50 animate-pulse" />
      )}
      <div ref={buttonRef} className={state === 'loading' ? 'h-0 overflow-hidden' : 'flex justify-center'} />
    </div>
  );
};

export default GoogleIdentityButton;
