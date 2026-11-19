import { createContext, useContext, useEffect, useState } from 'react';

export type PreloaderMode = 'branded' | 'simple';

export function normalizePreloaderMode(value: unknown): PreloaderMode {
  return value === 'simple' ? 'simple' : 'branded';
}

export const PreloaderContext = createContext<{
  mode: PreloaderMode;
  ready: boolean;
  setMode: (mode: PreloaderMode) => void;
}>({ mode: 'branded', ready: true, setMode: () => {} });

export const usePreloader = () => useContext(PreloaderContext);

// The GIF finishes drawing at 1.44 s and holds the full shoe until 2 s.
const MINIMUM_BRANDED_MS = 1850;

export function usePreloaderMinimum(key: string | undefined): boolean {
  const { mode, ready } = usePreloader();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate = ready && mode === 'branded' && !reducedMotion;
  const [finishedKey, setFinishedKey] = useState<string | undefined>();
  const pending = key !== undefined && finishedKey !== key;

  useEffect(() => {
    if (!animate || !pending) return;
    const timer = window.setTimeout(() => setFinishedKey(key), MINIMUM_BRANDED_MS);
    return () => window.clearTimeout(timer);
  }, [animate, key, pending]);

  return pending && (!ready || animate);
}
