import { createContext, useContext } from 'react';
import defaultLogo from '../assets/brand/logo-angelita-horizontal.png';
import { getImageUrl } from '../config/api';

export function resolveSiteLogo(path?: string | null): string {
  const value = path?.trim();
  if (!value) return defaultLogo;
  if (/^(?:https?:\/\/|\/?(?:api\/media|uploads|storage)\/)/i.test(value)) return getImageUrl(value);
  return '/' + value.replace(/^\/+/, '');
}

export const SiteLogoContext = createContext({
  logo: defaultLogo,
  setSiteLogo: (_path: string) => {},
});

export const useSiteLogo = () => useContext(SiteLogoContext);
