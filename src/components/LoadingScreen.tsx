import { usePreloader, type PreloaderMode } from '../hooks/usePreloader';
import type { CSSProperties } from 'react';
import '../styles/loading-screen.css';

const brandName = 'Zapatería Angelita';

type LoadingScreenProps = {
  label?: string;
  compact?: boolean;
  previewMode?: PreloaderMode;
};

export default function LoadingScreen({ label = 'Cargando', compact = false, previewMode }: LoadingScreenProps) {
  const { mode } = usePreloader();
  const branded = (previewMode ?? mode) === 'branded';
  return (
    <div className={`loading-screen${compact ? " loading-screen--compact" : ""}`} role="status">
      {branded ? (
        <>
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet="/images/angelita-shoe-loading.webp" />
            <img className="loading-screen__shoe" src="/images/angelita-shoe-loading.gif" width="320" height="320" alt="" />
          </picture>
          <span className="loading-screen__name" aria-hidden="true">
            {Array.from(brandName, (letter, index) => (
              <span key={index} style={{ '--letter-delay': `${650 + index * 45}ms` } as CSSProperties}>{letter}</span>
            ))}
          </span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        <span className="loading-screen__label">{label}</span>
      )}
    </div>
  );
}
