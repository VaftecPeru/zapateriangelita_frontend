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
        <img src={brandLogo} alt="Zapatería Angelita" />

      </div>
      <img className="loading-screen__shoe" src="/images/angelita-shoe-loading.webp" width="420" height="210" alt="" />
      <span className="loading-screen__label">{label}</span>
    </div>
  );
}
