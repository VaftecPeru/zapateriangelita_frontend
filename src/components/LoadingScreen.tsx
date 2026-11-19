import { usePreloader, type PreloaderMode } from '../hooks/usePreloader';
import brandLogo from '../assets/brand/logo-angelita-horizontal.png';
import '../styles/loading-screen.css';

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
      {branded && (
        <>
          <div className="loading-screen__brand">
            <img src={brandLogo} alt="" />
          </div>
          <picture>
            <source media="(prefers-reduced-motion: reduce)" srcSet="/images/angelita-shoe-loading.webp" />
            <img className="loading-screen__shoe" src="/images/angelita-shoe-loading.gif" width="320" height="320" alt="" />
          </picture>
        </>
      )}
      <div className="loading-screen__caption">
        {branded && <span className="loading-screen__name">Zapatería Angelita</span>}
        <span className="loading-screen__label">{label}</span>
      </div>
    </div>
  );
}
