import { createContext, useContext } from 'react';

export type PreloaderMode = 'branded' | 'simple';

export function normalizePreloaderMode(value: unknown): PreloaderMode {
  return value === 'simple' ? 'simple' : 'branded';
}

export const PreloaderContext = createContext<{
  mode: PreloaderMode;
  setMode: (mode: PreloaderMode) => void;
}>({ mode: 'branded', setMode: () => {} });

export const usePreloader = () => useContext(PreloaderContext);
