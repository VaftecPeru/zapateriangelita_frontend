import { createContext, useContext } from 'react';

export type PreloaderMode = 'branded' | 'simple';

export function normalizePreloaderMode(value: unknown): PreloaderMode {
  return value === 'simple' ? 'simple' : 'branded';
}

export const PreloaderContext = createContext<{
  mode: PreloaderMode;
  setMode: (mode: PreloaderMode) => void;
  imageUrl: string | null;
  setImageUrl: (imageUrl: string | null) => void;
}>({ mode: 'branded', setMode: () => {}, imageUrl: null, setImageUrl: () => {} });

export const usePreloader = () => useContext(PreloaderContext);
