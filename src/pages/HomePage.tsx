import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import StoreHome from '../components/StoreHome';
import LoadingScreen from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { productService, settingsService } from '../services/crudService';
import { getImageUrl } from '../config/api';
// @ts-ignore
import { heroSlides } from '../data/catalog';
import '../styles/store-home.css';
import '../styles/home-premium-experience.css';
import '../styles/store-home-mobile.css';
import '../styles/home-commerce-polish.css';
import '../styles/home-premium-motion.css';
import '../styles/home-reference.css';

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const defaultHeroSlides = heroSlides.map((slide: any) => ({ ...slide, textColor: slide.textColor || '#ffffff' }));

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [offerProduct, setOfferProduct] = useState<any | null>(null);
  const [homeReady, setHomeReady] = useState(false);

  const isLanding = location.pathname === '/' || location.pathname === '/home';
  const firstName = useMemo(() => {
    const name = String(user?.name || '').trim();
    return name ? name.split(/\s+/)[0] : 'Cliente';
  }, [user?.name]);

  useEffect(() => {
    let active = true;

    const loadManagedBanners = async () => {
      try {
        const response = await settingsService.getAll();
        const raw = response.data?.data?.homepage_banners;
        let managed: any[] = [];

        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              managed = parsed
                .filter((banner: any) => banner?.active !== false && banner?.title && banner?.image)
                .slice(0, 12)
                .map((banner: any) => ({
                  managed: true,
                  eyebrow: String(banner.eyebrow || ''),
                  title: String(banner.title || '').slice(0, 120),
                  description: String(banner.description || '').slice(0, 220),
                  image: getImageUrl(String(banner.image || '')),
                  imagePosition: String(banner.imagePosition || 'center center'),
                  textColor: /^#[0-9a-fA-F]{6}$/.test(String(banner.textColor || ''))
                    ? String(banner.textColor)
                    : '#ffffff',
                }));
            }
          } catch (parseError) {
            console.warn('Configuración de banners inválida; se usarán los banners predeterminados.', parseError);
          }
        }

        if (!active) return;
        heroSlides.splice(
          0,
          heroSlides.length,
          ...(managed.length ? managed : defaultHeroSlides.map((slide: any) => ({ ...slide }))),
        );
      } catch (error) {
        console.warn('No se pudo cargar la configuración de banners; se mantendrá la portada predeterminada.', error);
        if (active) {
          heroSlides.splice(0, heroSlides.length, ...defaultHeroSlides.map((slide: any) => ({ ...slide })));
        }
      } finally {
        if (active) setHomeReady(true);
      }
    };

    void loadManagedBanners();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!homeReady) return;

    const applyHeroContrast = () => {
      const hero = document.querySelector<HTMLElement>('.hero');
      const content = hero?.querySelector<HTMLElement>('.hero__content');
      const title = content?.querySelector('h1')?.textContent?.trim();
      if (!content || !title) return;
      const current = heroSlides.find((slide: any) => String(slide.title).trim() === title);
      content.style.setProperty('--hero-managed-text', current?.textColor || '#ffffff');
    };

    const hero = document.querySelector<HTMLElement>('.hero');
    applyHeroContrast();

    if (!hero) return;
    const observer = new MutationObserver(applyHeroContrast);
    observer.observe(hero, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [homeReady]);

  useEffect(() => {
    if (!homeReady) return;

    const enhancePaymentFooter = () => {
      const footerBottom = document.querySelector<HTMLElement>('.footer__bottom');
      if (!footerBottom || footerBottom.querySelector('.footer-payment-methods')) return;

      const legacy = footerBottom.querySelector<HTMLElement>('span:last-of-type');
      legacy?.classList.add('footer-payment-legacy');

      const group = document.createElement('div');
      group.className = 'footer-payment-methods';
      group.setAttribute('aria-label', 'Métodos de pago aceptados');

      const label = document.createElement('span');
      label.className = 'footer-payment-label';
      label.textContent = 'Pagos seguros con';
      group.appendChild(label);

      ['VISA', 'Mastercard', 'American Express', 'Carnet'].forEach((brand) => {
        const badge = document.createElement('span');
        badge.className = `payment-brand payment-brand--${brand.toLowerCase().replace(/[^a-z]+/g, '-')}`;
        badge.textContent = brand;
        group.appendChild(badge);
      });

      const provider = document.createElement('span');
      provider.className = 'payment-brand payment-brand--openpay';
      provider.textContent = 'Openpay by BBVA';
      group.appendChild(provider);
      footerBottom.appendChild(group);
    };

    enhancePaymentFooter();
  }, [homeReady, location.pathname]);

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
      {homeReady ? (
        <StoreHome />
      ) : (
        <LoadingScreen label="Cargando tienda" />
      )}

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
