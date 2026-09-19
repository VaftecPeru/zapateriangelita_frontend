import { useMemo } from 'react';
import { countryDialCodes } from '../data/countryDialCodes';

type Props = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  selectClassName?: string;
  placeholder?: string;
  defaultDialCode?: string;
};

const parseValue = (value: string, fallback: string) => {
  const compact = String(value || '').replace(/\s+/g, '');
  const digits = compact.replace(/\D/g, '');
  const international = compact.startsWith('+') ? `+${digits}` : digits ? `+${digits}` : '';

  const prefix = [...countryDialCodes]
    .sort((a, b) => b.code.length - a.code.length)
    .find((item) => international.startsWith(item.code))?.code || fallback;

  const local = international.startsWith(prefix)
    ? international.slice(prefix.length)
    : digits;

  return { prefix, local };
};

const PhoneField = ({
  value,
  onChange,
  id,
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  selectClassName = '',
  placeholder = 'Número de teléfono',
  defaultDialCode = '+52',
}: Props) => {
  const parsed = useMemo(() => parseValue(value, defaultDialCode), [value, defaultDialCode]);

  const emit = (prefix: string, local: string) => {
    const digits = local.replace(/\D/g, '').slice(0, 15);
    onChange(digits ? `${prefix}${digits}` : prefix);
  };

  return (
    <div className={`flex w-full gap-2 ${className}`.trim()}>
      <select
        aria-label="Código internacional"
        value={parsed.prefix}
        disabled={disabled}
        onChange={(event) => emit(event.target.value, parsed.local)}
        className={selectClassName}
      >
        {countryDialCodes.map((item) => (
          <option key={`${item.iso}-${item.code}`} value={item.code}>
            {item.iso} {item.code}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        required={required}
        disabled={disabled}
        value={parsed.local}
        maxLength={15}
        placeholder={placeholder}
        onChange={(event) => emit(parsed.prefix, event.target.value)}
        className={inputClassName}
      />
    </div>
  );
};

export default PhoneField;
