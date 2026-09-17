import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import StoreHome from '../components/StoreHome';
import { useAuth } from '../hooks/useAuth';
import { productService } from '../services/crudService';
import { getImageUrl } from '../config/api';
import '../styles/store-home.css';
import '../styles/home-premium-experience.css';
import '../styles/store-home-mobile.css';
import '../styles/home-social-payments.css';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [offerProduct, setOfferProduct] = useState<any | null>(null);

  const isLanding = location.pathname === '/' || location.pathname === '/home';
  const firstName = useMemo(() => {
    const name = String(user?.name || '').trim();
    return name ? name.split(/\s+/)[0] : 'Cliente';
  }, [user?.name]);

  useEffect(() => {
    if (!isLanding) return;

    let active = true;

    const loadOffer = async () => {
      try {
        const response = await productService.getAll();
        const data = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.data || [];

        if (!active || !data.length) return;

        const selected = data.find((product: any) => product.status === 'oferta')
          || data.find((product: any) => Number(product.discounted_price || 0) > 0)
          || data[0];

        setOfferProduct({
          ...selected,
          image: getImageUrl(selected.img || selected.images?.[0]),
          displayPrice: Number(selected.discounted_price || selected.price || 0),
          oldPrice: selected.discounted_price ? Number(selected.price || 0) : null,
        });
      } catch (error) {
        console.warn('No se pudo cargar la oferta para el boletín de bienvenida.', error);
      }
    };

    void loadOffer();

    return () => {
      active = false;
    };
  }, [isLanding]);

  useEffect(() => {
    if (!isLanding || !isAuthenticated || !user?.id) return;

    const storageKey = `angelita_welcome_offer_${user.id}`;
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, 'shown');
    const timer = window.setTimeout(() => setWelcomeOpen(true), 420);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isLanding, user?.id]);

  useEffect(() => {
    if (!welcomeOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setWelcomeOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [welcomeOpen]);

  const goToOffer = () => {
    setWelcomeOpen(false);
    if (offerProduct?.id) {
      navigate(`/producto/${offerProduct.id}`);
      return;
    }
    navigate('/ofertas');
  };

  return (
    <div
      className={[
        'home-experience',
        isLanding ? 'home-experience--landing' : '',
        isAuthenticated ? 'home-experience--authenticated' : '',
      ].filter(Boolean).join(' ')}
    >
      <StoreHome />

      {welcomeOpen && isLanding && isAuthenticated && (
        <div
          className="angelita-welcome-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="angelita-welcome-title"
          onClick={() => setWelcomeOpen(false)}
        >
          <article className="angelita-welcome-card" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="angelita-welcome-close"
              aria-label="Cerrar bienvenida"
              onClick={() => setWelcomeOpen(false)}
            >
              <X size={17} />
            </button>

            <div className="angelita-welcome-media">
              {offerProduct?.image ? (
                <img src={offerProduct.image} alt={offerProduct.name || 'Oferta destacada'} />
              ) : null}
              <span className="angelita-welcome-badge">Oferta seleccionada</span>
            </div>

            <div className="angelita-welcome-body">
              <span className="angelita-welcome-kicker">Bienvenido a Angelita</span>
              <h2 id="angelita-welcome-title">Hola, {firstName}</h2>
              <p className="angelita-welcome-message">
                Nos alegra tenerte aquí. Elegimos una oportunidad especial para inspirar tu próxima compra.
              </p>

              <div className="angelita-welcome-product">
                <div>
                  <strong>{offerProduct?.name || 'Descubre nuestras ofertas de temporada'}</strong>
                  <span>{offerProduct?.category?.name || offerProduct?.category || 'Selección Angelita'}</span>
                </div>
                {offerProduct?.displayPrice ? (
                  <span className="angelita-welcome-price">{money.format(offerProduct.displayPrice)}</span>
                ) : null}
              </div>

              <button type="button" className="angelita-welcome-action" onClick={goToOffer}>
                Ver oferta
              </button>
              <button type="button" className="angelita-welcome-skip" onClick={() => setWelcomeOpen(false)}>
                Seguir explorando la tienda
              </button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};

export default HomePage;
