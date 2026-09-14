import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import '../styles/legal-pages.css';

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a className={`logo ${light ? "logo--light" : ""}`} href="/" aria-label="Zapatería Angelita - inicio">
      <span className="logo__small">Zapatería</span>
      <strong>ANGELITA</strong>
      <span className="logo__tagline">Calzando tus pies desde 1980</span>
    </a>
  );
}

type PurchasePolicy = {
    text?: string;
};

const TermsPage = () => {
    const { settings, loading } = useSettings();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    let policies: PurchasePolicy[] = [];
    try {
        const parsedPolicies = settings.reservation_policies
            ? JSON.parse(settings.reservation_policies)
            : [];
        policies = Array.isArray(parsedPolicies)
            ? parsedPolicies.filter((policy) => typeof policy?.text === 'string' && policy.text.trim())
            : [];
    } catch {
        policies = [];
    }

    return (
        <main className="legal-page">
            <div className="legal-page__topbar">
                <div className="legal-page__topbar-inner">
                    <span>Compra con confianza</span>
                    <span>Lee Atentamente</span>
                </div>
            </div>

            <div className="legal-page__brand">
                <Logo />
            </div>

            <div className="legal-page__content">
                <Link
                    to="/checkout"
                    className="legal-page__back"
                >
                    <ArrowLeft size={20} />
                    <span>Atrás</span>
                </Link>

                <section className="legal-page__panel">
                    <div className="legal-page__heading">
                        <div>
                            <p className="legal-page__eyebrow">Información de compra</p>
                            <h1 className="legal-page__title">Términos y condiciones</h1>
                        </div>
                    </div>

                    <div className="legal-page__body">
                        {loading ? (
                            <p className="legal-page__loading">Cargando políticas de compra...</p>
                        ) : policies.length > 0 ? (
                            <div>
                                <p className="legal-page__intro">
                                    Estas son las políticas de compra vigentes para tu pedido:
                                </p>
                                <ol className="legal-page__list">
                                    {policies.map((policy, index) => (
                                        <li key={`${policy.text}-${index}`}>
                                            {policy.text}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        ) : (
                            <p className="legal-page__empty">Actualmente no hay políticas de compra publicadas.</p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default TermsPage;