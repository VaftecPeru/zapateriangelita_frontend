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

const PrivacyPage = () => {
    const { settings, loading } = useSettings();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    let privacyPolicies: string[] = [];
    try {
        const parsedPrivacy = settings.privacy_policy
            ? JSON.parse(settings.privacy_policy)
            : [];
        privacyPolicies = Array.isArray(parsedPrivacy)
            ? parsedPrivacy
                .map((item) => typeof item === 'string' ? item : item?.text)
                .filter((item): item is string => Boolean(item?.trim()))
            : [settings.privacy_policy].filter(Boolean);
    } catch {
        privacyPolicies = settings.privacy_policy ? [settings.privacy_policy] : [];
    }

    return (
        <main className="legal-page">
            <div className="legal-page__topbar">
                <div className="legal-page__topbar-inner">
                    <span>Con nosotros desde 1980</span>
                    <span>Tus datos, bien cuidados
</span>
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
                            <p className="legal-page__eyebrow">Protección de tus datos</p>
                            <h1 className="legal-page__title">Aviso de privacidad</h1>
                        </div>
                    </div>

                    <div className="legal-page__body">
                        {loading ? (
                            <p className="legal-page__loading">Cargando aviso de privacidad...</p>
                        ) : privacyPolicies.length > 0 ? (
                            <ol className="legal-page__list">
                                {privacyPolicies.map((policy, index) => (
                                    <li key={`${policy}-${index}`}>
                                        {policy}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="legal-page__empty">Actualmente no hay un aviso de privacidad publicado.</p>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default PrivacyPage;