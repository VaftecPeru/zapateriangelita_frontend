import brandLogo from '../assets/brand/logo-angelita-horizontal.png';
import '../styles/loading-screen.css';

type LoadingScreenProps = {
  label?: string;
};

export default function LoadingScreen({ label = 'Cargando' }: LoadingScreenProps) {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-label={label}>
      <div className="loading-screen__brand">
        <img src={brandLogo} alt="Zapatería Angelita" />
        <span className="loading-screen__spinner" aria-hidden="true" />
      </div>
      <span className="loading-screen__label">{label}</span>
    </div>
  );
}
