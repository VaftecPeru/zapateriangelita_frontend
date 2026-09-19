import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, ChevronLeft, ChevronRight, Headphones, LockKeyhole, Mail, Pause, Play, RefreshCw, ShieldCheck, Star, Truck } from 'lucide-react';
import { heroSlides, testimonials } from '../data/catalog';
import { newsletterService } from '../services/crudService';

const assets = '/images/home-reference/';
const collections = [
  { name: 'Mujer', slug: 'mujer', subtitle: 'Elegancia en cada paso', image: 'woman.webp' },
  { name: 'Hombre', slug: 'hombre', subtitle: 'Estilo que te impulsa', image: 'man.webp' },
  { name: 'Niños', slug: 'niños', subtitle: 'Grandes aventuras comienzan aquí', image: 'kids.webp' },
];
const defaultSlides = [
  { eyebrow: 'Nueva colección 2026', title: 'Camina con tu', emphasis: 'propio estilo', description: 'Calzado para cada historia, cada paso y cada día.', image: `${assets}hero-red.webp`, href: '/categoria/mujer', imagePosition: 'center' },
  { eyebrow: 'Comodidad en movimiento', title: 'Tu ritmo.', emphasis: 'Tu estilo.', description: 'Encuentra tu próximo par favorito.', image: `${assets}promo.webp`, href: '/catalogo', imagePosition: '66% center' },
  { eyebrow: 'Para cada ocasión', title: 'Elegancia en', emphasis: 'cada paso', description: 'Descubre nuestra colección para hombre.', image: `${assets}man.webp`, href: '/categoria/hombre', imagePosition: 'center' },
];

type Props = {
  products: any[];
  renderProduct: (product: any) => ReactNode;
  loading: boolean;
  error: boolean;
};

export default function ReferenceLanding({ products, renderProduct, loading, error }: Props) {
  // Managed banners remain available after the reference campaign.
  const slides = [...defaultSlides, ...heroSlides.filter((item: any) => item.managed).map((item: any) => ({ ...item, emphasis: '', href: '/catalogo' }))];
  const [slide, setSlide] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [newsletterNotice, setNewsletterNotice] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const brands = useRef<HTMLDivElement>(null);
  const instagram = useRef<HTMLDivElement>(null);
  const active = slides[slide % slides.length];
  const rotating = !hovered && !focused && !paused && !reducedMotion && !hidden;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    const visibility = () => setHidden(document.hidden);
    update(); visibility();
    media.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    return () => { media.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); };
  }, []);

  useEffect(() => {
    if (!rotating || slides.length < 2) return;
    const timer = window.setInterval(() => setSlide(current => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [rotating, slides.length, slide]);

  const submitNewsletter = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterNotice('Ingresa un correo electrónico válido.');
      return;
    }

    setNewsletterLoading(true);
    setNewsletterNotice('');

    try {
      const response = await newsletterService.subscribe(email);
      setNewsletterNotice(response.data.message || 'Suscripción registrada correctamente.');
      setNewsletterEmail('');
    } catch (error: any) {
      const firstValidationError = error?.response?.data?.errors?.email?.[0];
      setNewsletterNotice(firstValidationError || error?.response?.data?.message || 'No fue posible registrar la suscripción. Intenta nuevamente.');
    } finally {
      setNewsletterLoading(false);
    }
  };

    const move = (direction: number) => setSlide(current => (current + direction + slides.length) % slides.length);
  const maxDiscount = Math.max(0, ...products.map(product => {
    const before = Number(product.oldPrice);
    const after = Number(product.price);
    return before > after && after > 0 ? Math.floor((1 - after / before) * 100) : 0;
  }));
  const gallery = ['hero-red.webp', 'kids.webp', 'man.webp', 'promo.webp', 'woman.webp'];

  return (
    <div className="reference-landing">
      <section className="ref-hero ref-shell" aria-label="Colecciones destacadas" aria-roledescription="carrusel"
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
        onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); } }}
        onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
        onTouchEnd={event => { if (touch.current) { const dx = event.changedTouches[0].clientX - touch.current.x; const dy = event.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? -1 : 1); } touch.current = null; }}
        onTouchCancel={() => { touch.current = null; }}>
        <img key={`photo-${slide}`} className="ref-hero__photo" src={active.image} style={{ objectPosition: active.imagePosition }} alt="" loading="eager" />
        <div className="ref-hero__shade" />
        <div className="ref-hero__content" key={`copy-${slide}`} aria-live={rotating ? 'off' : 'polite'}>
          <p className="ref-kicker">{active.eyebrow}</p>
          <h1>{active.title}<strong>{active.emphasis}</strong></h1>
          <p className="ref-hero__description">{active.description}</p>
          <div className="ref-hero__actions"><Link className="ref-button" to={active.href}>Ver colección <ArrowRight size={17} /></Link><Link className="ref-button ref-button--ghost" to="/catalogo">Descubrir</Link></div>
          <div className="ref-hero__promises"><span><Truck />Envíos a<br />todo México</span><span><ShieldCheck />Pagos<br />seguros</span><span><Award />Calidad<br />garantizada</span></div>
        </div>
        <p className="ref-handwriting" aria-hidden="true">Más que<br />zapatos,<br />es tu historia ♡</p>
        <button className="ref-arrow ref-arrow--left" aria-label="Banner anterior" onClick={() => move(-1)}><ChevronLeft /></button>
        <button className="ref-arrow ref-arrow--right" aria-label="Banner siguiente" onClick={() => move(1)}><ChevronRight /></button>
        <div className="ref-hero__dots">{slides.map((_, index) => <button key={index} aria-label={`Mostrar banner ${index + 1}`} aria-current={index === slide ? 'true' : undefined} onClick={() => setSlide(index)} />)}</div>
        <button className="ref-pause" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Reanudar banners' : 'Pausar banners'} aria-pressed={paused}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
      </section>

      <section className="ref-collections ref-shell" aria-label="Colecciones de calzado">{collections.map(item => (
        <Link className="ref-collection" to={`/categoria/${item.slug}`} key={item.name}>
          <img src={`${assets}${item.image}`} alt={`Colección de calzado para ${item.name.toLowerCase()}`} loading="lazy" />
          <div><h2>{item.name}</h2><p>{item.subtitle}</p><span>Ver colección <ArrowRight size={15} /></span></div>
        </Link>
      ))}</section>

      <section className="ref-benefits ref-shell" aria-label="Beneficios de compra">
        <div><Truck /><p><strong>Envíos a todo México</strong><span>Compra sin límites</span></p></div>
        <div><LockKeyhole /><p><strong>Pagos seguros</strong><span>Con Openpay</span></p></div>
        <div><RefreshCw /><p><strong>Cambios y devoluciones</strong><span>Consulta condiciones</span></p></div>
        <div><Headphones /><p><strong>Atención personalizada</strong><span>Siempre contigo</span></p></div>
      </section>

      <section className="ref-products ref-shell" id="productos">
        <div className="ref-heading"><h2>Productos destacados</h2><Link to="/catalogo">Ver todos los productos <ArrowRight size={15} /></Link></div>
        <div className="ref-product-grid">{loading ? Array.from({ length: 4 }, (_, i) => <div className="ref-skeleton" role="status" aria-label="Cargando producto" key={i} />) : products.slice(0, 4).map(renderProduct)}</div>
        {!loading && !products.length && <p className="ref-empty" role="status">{error ? 'No pudimos cargar el catálogo. Intenta recargar la página.' : 'Pronto encontrarás aquí nuestros productos destacados.'}</p>}
      </section>

      <section className="ref-promotion ref-shell" id="ofertas" aria-label="Ofertas de temporada">
        <img src={`${assets}promo.webp`} alt="Tenis blancos de la colección" loading="lazy" />
        <div className="ref-promotion__copy"><h2>{maxDiscount ? <>Hasta <em>{maxDiscount}%</em> de<br /><strong>descuento</strong></> : <>Descubre nuestras<br /><strong>ofertas</strong></>}</h2><p>En productos seleccionados</p><Link to="/ofertas" className="ref-button">Ver ofertas <ArrowRight size={15} /></Link></div>
        <p className="ref-promotion__note" aria-hidden="true">Tu<br />estilo<br />siempre<br />contigo<span /></p>
      </section>

      <section className="ref-brands ref-shell" aria-label="Marcas favoritas">
        <h2>Marcas favoritas</h2><button className="ref-round" aria-label="Marcas anteriores" onClick={() => brands.current?.scrollBy({ left: -250, behavior: reducedMotion ? 'auto' : 'smooth' })}><ChevronLeft size={18} /></button>
        <div className="ref-brands__track" ref={brands}>{['Nike', 'adidas', 'PUMA', 'SKECHERS', 'CAT', 'flexi'].map(brand => <span className={`ref-brand ref-brand--${brand.toLowerCase()}`} key={brand}>{brand}</span>)}</div>
        <button className="ref-round" aria-label="Marcas siguientes" onClick={() => brands.current?.scrollBy({ left: 250, behavior: reducedMotion ? 'auto' : 'smooth' })}><ChevronRight size={18} /></button>
      </section>

      <section className="ref-testimonials ref-shell" id="opiniones">
        <div className="ref-heading"><h2>Lo que dicen nuestros clientes</h2></div>
        <div className="ref-testimonial-grid">{testimonials.map(item => <article key={item.name} className="ref-testimonial"><div className="ref-stars" aria-label="5 de 5 estrellas">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} fill="currentColor" />)}</div><p>“{item.quote}”</p><footer><img src={item.avatar} alt="" loading="lazy" /><div><strong>{item.name}</strong><span>{item.city}</span></div></footer></article>)}</div>
      </section>

      <section className="ref-instagram ref-shell" id="instagram">
        <div className="ref-instagram__intro"><span>Síguenos en</span><h2>Instagram</h2><small>@zapateriaangelita</small><p>Inspírate con nuestros looks<br />y novedades</p><a href="https://www.instagram.com/zapateriaangelita/" target="_blank" rel="noopener noreferrer">Ver Instagram <ArrowRight size={15} /></a></div>
        <div className="ref-instagram__track" ref={instagram}>{gallery.map((name, i) => <a key={i} href="https://www.instagram.com/zapateriaangelita/" target="_blank" rel="noopener noreferrer" aria-label="Visitar Instagram de Zapatería Angelita"><img src={`${assets}${name}`} alt={['Tacones rojos', 'Tenis blancos', 'Zapatos de vestir', 'Calzado urbano', 'Tacones nude'][i]} loading="lazy" /></a>)}</div>
        <button className="ref-round ref-instagram__next" aria-label="Más imágenes" onClick={() => instagram.current?.scrollBy({ left: 220, behavior: reducedMotion ? 'auto' : 'smooth' })}><ChevronRight size={18} /></button>
      </section>

      <section className="ref-newsletter ref-shell">
        <div><Mail /><p><strong>Suscríbete a nuestro newsletter</strong><span>Recibe ofertas exclusivas, novedades y mucho más.</span></p></div>
        <form onSubmit={submitNewsletter}>
          <label className="sr-only" htmlFor="ref-email">Correo electrónico para novedades</label>
          <input
            id="ref-email"
            name="email"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            autoComplete="email"
            required
            value={newsletterEmail}
            onChange={(event) => setNewsletterEmail(event.target.value)}
            disabled={newsletterLoading}
          />
          <button type="submit" disabled={newsletterLoading}>
            {newsletterLoading ? 'Suscribiendo...' : 'Suscribirme'}
          </button>
        </form>
        {newsletterNotice && <p className="ref-newsletter__notice" role="status" aria-live="polite">{newsletterNotice}</p>}
      </section>
    </div>
  );
}
