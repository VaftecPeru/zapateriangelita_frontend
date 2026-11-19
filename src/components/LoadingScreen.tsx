import brandLogo from '../assets/brand/logo-angelita-horizontal.png';
import '../styles/loading-screen.css';

type LoadingScreenProps = {
  label?: string;
  compact?: boolean;
};

export default function LoadingScreen({ label = 'Cargando', compact = false }: LoadingScreenProps) {
  return (
    <div className={`loading-screen${compact ? " loading-screen--compact" : ""}`} role="status">
      <div className="loading-screen__brand">
        <img src={brandLogo} alt="" />
      </div>
      <picture>
        <source media="(prefers-reduced-motion: reduce)" srcSet="/images/angelita-shoe-loading.webp" />
        <img className="loading-screen__shoe" src="/images/angelita-shoe-loading.gif" width="320" height="320" alt="" />
      </picture>
      <div className="loading-screen__caption">
        <span className="loading-screen__name">Zapatería Angelita</span>
        <span className="loading-screen__label">{label}</span>
      </div>
    </div>
  );
}
