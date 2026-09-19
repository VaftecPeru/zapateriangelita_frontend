export type CountryDialCode = {
  code: string;
  country: string;
  iso: string;
};

export const countryDialCodes: CountryDialCode[] = [
  { code: '+52', country: 'México', iso: 'MX' },
  { code: '+51', country: 'Perú', iso: 'PE' },
  { code: '+1', country: 'Estados Unidos / Canadá', iso: 'US' },
  { code: '+34', country: 'España', iso: 'ES' },
  { code: '+54', country: 'Argentina', iso: 'AR' },
  { code: '+56', country: 'Chile', iso: 'CL' },
  { code: '+57', country: 'Colombia', iso: 'CO' },
  { code: '+58', country: 'Venezuela', iso: 'VE' },
  { code: '+593', country: 'Ecuador', iso: 'EC' },
  { code: '+591', country: 'Bolivia', iso: 'BO' },
  { code: '+595', country: 'Paraguay', iso: 'PY' },
  { code: '+598', country: 'Uruguay', iso: 'UY' },
  { code: '+502', country: 'Guatemala', iso: 'GT' },
  { code: '+503', country: 'El Salvador', iso: 'SV' },
  { code: '+504', country: 'Honduras', iso: 'HN' },
  { code: '+505', country: 'Nicaragua', iso: 'NI' },
  { code: '+506', country: 'Costa Rica', iso: 'CR' },
  { code: '+507', country: 'Panamá', iso: 'PA' },
  { code: '+55', country: 'Brasil', iso: 'BR' },
];

export const normalizeInternationalPhone = (value: string, fallback = '+52') => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return fallback;

  const normalized = `+${digits}`;
  const sorted = [...countryDialCodes].sort((a, b) => b.code.length - a.code.length);
  const prefix = sorted.find((item) => normalized.startsWith(item.code))?.code || fallback;
  const local = normalized.startsWith(prefix) ? normalized.slice(prefix.length) : digits;

  return `${prefix}${local}`;
};
