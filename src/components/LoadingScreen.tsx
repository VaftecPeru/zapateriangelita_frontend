import { usePreloader, type PreloaderMode } from '../hooks/usePreloader';
import brandLogo from '../assets/brand/logo-angelita-horizontal.png';
import { getImageUrl } from '../config/api';
import '../styles/loading-screen.css';

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
      {branded && (
        <>
          {!customImage && (
            <div className="loading-screen__brand">
              <img src={brandLogo} alt="" />
            </div>
          )}
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet={staticSource} />
            <img className="loading-screen__shoe" src={source} width="320" height="320" alt="" />
          </picture>
        </>
      )}
      <div className="loading-screen__caption">
        {branded && !customImage && <span className="loading-screen__name">Zapatería Angelita</span>}
        <span className="loading-screen__label">{label}</span>
      </div>
    </div>
  );
}
