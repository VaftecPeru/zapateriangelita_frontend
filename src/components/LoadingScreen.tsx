import { usePreloader, type PreloaderMode } from '../hooks/usePreloader';
import type { CSSProperties } from 'react';
import { getImageUrl } from '../config/api';
import '../styles/loading-screen.css';

const brandName = 'Zapatería Angelita';

type LoadingScreenProps = {
  label?: string;
  compact?: boolean;
  previewMode?: PreloaderMode;
  previewImageUrl?: string;
};

export default function LoadingScreen({ label = 'Cargando', compact = false, previewMode, previewImageUrl }: LoadingScreenProps) {
  const { mode, imageUrl } = usePreloader();
  const branded = (previewMode ?? mode) === 'branded';
  const customImage = previewImageUrl || imageUrl;
  const source = customImage
    ? customImage.startsWith('blob:') ? customImage : getImageUrl(customImage)
    : '/images/angelita-shoe-loading.gif';
  const staticSource = customImage && !/\.gif(?:$|[?#])/i.test(customImage)
    ? source
    : '/images/angelita-shoe-loading.webp';
  return (
    <div className={`loading-screen${compact ? " loading-screen--compact" : ""}`} role="status">
      {branded ? (
        <>
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet={staticSource} />
            <img className="loading-screen__shoe" src={source} width="320" height="320" alt="" />
          </picture>
          {!customImage && (
            <span className="loading-screen__name" aria-hidden="true">
              {Array.from(brandName, (letter, index) => (
                <span key={index} style={{ '--letter-delay': `${650 + index * 45}ms` } as CSSProperties}>{letter}</span>
              ))}
            </span>
          )}
          <span className="sr-only">{label}</span>
        </>
      ) : (
        <span className="loading-screen__label">{label}</span>
      )}
    </div>
  );
}
