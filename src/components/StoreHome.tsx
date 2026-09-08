import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import apiClient from "../services/apiClient";
import { useUbigeo } from "../hooks/useUbigeo";
import { categoryService, productService, subcategoryService, Category, Product } from "../services/crudService";
import { getImageUrl } from "../config/api";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Headphones,
  Heart,
  Mail,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  UserRound,
  X,
} from "lucide-react";

// @ts-ignore
import {
  categories as staticCategories,
  finderItems,
  heroSlides,
  instagramImages,
  testimonials,
} from "../data/catalog";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const checkoutInputStyle = {
  width: "100%",
  display: "block",
  marginTop: "6px",
  padding: "11px 12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxSizing: "border-box" as const,
};



const subcategoriasMujer = [
  "Alpargatas", "Botas", "Botines", "Casual", "Chunky",
  "Confort", "Flats y Balerinas", "Mocasín", "Pantuflas",
  "Sandalias", "Senderismo", "Tenis deportivos", "Tenis urbanos",
  "Zapatillas", "Zapatillas de fiesta"
];

const subcategoriasHombre = [
  "Botas", "Botines", "Casual", "Industrial", "Mocasín",
  "Pantufla", "Sandalia", "Senderismo", "Tacos de fútbol",
  "Tenis deportivo", "Tenis urbanos", "Zapatos de vestir"
];


const subcategoriasNiños = [
  { talla: "Bebé (8-13)", items: ["Botas", "Casual", "Sandalias", "Tenis"] },
  { talla: "Preescolar (14-17)", items: ["Balerinas", "Botas", "Botines", "Casual", "Tenis", "Sandalias"] },
  { talla: "Niña (18-21)", items: ["Alpargatas", "Balerinas y flats", "Botas", "Casual", "Graduación", "Lluvia", "Pantufla", "Sandalia", "Tenis deportivos", "Tenis urbanos"] },
  { talla: "Niño (18-21)", items: ["Botas", "Casual", "Sandalias", "Tacos de fútbol", "Tenis deportivos", "Tenis urbanos"] },
];

const brands = ["Nike", "adidas", "PUMA", "SKECHERS", "CAT", "flexi"];


const menuItems = [
  { name: "Inicio", href: "/" },
  {
    name: "Mujer",
    href: "/categoria/mujer",
    submenu: subcategoriasMujer.map(item => ({
      name: item,
      href: `/categoria/mujer?tipo=${item.toLowerCase().replace(/\s/g, '-')}`
    }))
  },
  {
    name: "Hombre",
    href: "/categoria/hombre",
    submenu: subcategoriasHombre.map(item => ({
      name: item,
      href: `/categoria/hombre?tipo=${item.toLowerCase().replace(/\s/g, '-')}`
    }))
  },
  {
    name: "Niños",
    href: "/categoria/niños",
    submenu: subcategoriasNiños.map(group => ({
      talla: group.talla,
      items: group.items.map(item => ({
        name: item,
        href: `/categoria/niños?tipo=${item.toLowerCase().replace(/\s/g, '-')}&talla=${group.talla.split(' ')[0]}`
      }))
    }))
  },
  { name: "Ofertas", href: "/ofertas" },
  { name: "Novedades", href: "/novedades" },
  { name: "Contacto", href: "/contacto" },
];



function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 8.5V7.1c0-.7.5-.9 1-.9h2V3.1L14.4 3C11.5 3 10 4.7 10 6.8v1.7H7v3.6h3V21h4v-8.9h2.7l.5-3.6H14Z" />
    </svg>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a className={`logo ${light ? "logo--light" : ""}`} href="/" aria-label="Zapatería Angelita - inicio">
      <span className="logo__small">Zapatería</span>
      <strong>ANGELITA</strong>
      <span className="logo__tagline">Calzando tus pies desde 1980</span>
    </a>
  );
}

function SectionTitle({ eyebrow, title, action, onActionClick }: { eyebrow?: string; title: React.ReactNode; action?: string; onActionClick?: () => void }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="section-heading__eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action && (
        onActionClick ? (
          <button type="button" className="text-link" onClick={onActionClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            {action} <ChevronRight size={15} aria-hidden="true" />
          </button>
        ) : (
          <a className="text-link" href="#catalogo">
            {action} <ChevronRight size={15} aria-hidden="true" />
          </a>
        )
      )}
    </div>
  );
}

function ProductCard({ product, onFavorite, isFavorite, onAddToCart }: any) {
  const discountValue = String(product.discount || '').replace(/[%\s]/g, '');
  const discountLabel = discountValue && !Number.isNaN(Number(discountValue))
    ? `-${Math.abs(Number(discountValue))}%`
    : product.discount;

  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.discount && <span className="discount-badge">{discountLabel}</span>}
        <button
          className={`favorite-button ${isFavorite ? "is-active" : ""}`}
          type="button"
          onClick={(event) => { event.preventDefault(); onFavorite(product.id); }}
          aria-label={`${isFavorite ? "Quitar" : "Agregar"} ${product.name} de favoritos`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <Link to={`/producto/${product.id}`} className="product-card__image-link" aria-label={`Ver detalles de ${product.name}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <button className="quick-add" type="button" onClick={(event) => { event.preventDefault(); onAddToCart(product); }}>Agregar al carrito</button>
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3><Link to={`/producto/${product.id}`}>{product.name}</Link></h3>
        <div className="stars" aria-label={`${product.rating} de 5 estrellas`}>
          {Array.from({ length: product.rating }).map((_, index) => (
            <Star key={index} size={12} fill="currentColor" aria-hidden="true" />
          ))}
        </div>
        <div className="price-row">
          <strong>{money.format(product.price)}</strong>
          {product.oldPrice && <del>{money.format(product.oldPrice)}</del>}
        </div>
      </div>
    </article>
  );
}


export default function StoreHome() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [slide, setSlide] = useState<number>(0);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { cart, addToCart, removeFromCart, cartCount, cartTotal, clearCart } = useCart();
  const [toast, setToast] = useState<{ product: any } | null>(null);
  const [checkoutNotice, setCheckoutNotice] = useState<{ title: string; message: string; requiresLogin: boolean } | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({
    full_name: "",
    phone: "",
    country: "México",
    state: "",
    municipality: "",
    city: "",
    postal_code: "",
    address: "",
    reference: "",
  });
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    product_interest: "Compra de calzado",
    shoe_size: "",
    contact_preference: "WhatsApp",
    message: "",
  });
  const { states, municipalities, cities, loading: ubigeoLoading } = useUbigeo(checkoutForm.state, checkoutForm.municipality);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if ((location.state as any)?.openCart) {
      setCartOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [productsResponse, categoriesResponse, subcategoriesResponse] = await Promise.all([
          productService.getAll(),
          categoryService.getPublic(),
          subcategoryService.getPublic(),
        ]);
        const productsData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : (productsResponse.data as any)?.data || [];
        const categoriesData = Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : (categoriesResponse.data as any)?.data || [];
        const subcategoriesData = Array.isArray(subcategoriesResponse.data)
          ? subcategoriesResponse.data
          : (subcategoriesResponse.data as any)?.data || [];

        setProducts(productsData.map((product: Product) => ({
          ...product,
          image: getImageUrl(product.img || product.images?.[0]) || staticCategories[0]?.image,
          category: typeof product.category === "object"
            ? product.category.name
            : product.category || categoriesData.find((category: Category) => category.id === product.category_id)?.name || "Sin categoría",
          price: Number(product.discounted_price || product.price),
          oldPrice: product.discounted_price ? Number(product.price) : null,
          rating: Math.round(Number(product.rating || 0)),
        })));
        setCategories(categoriesData.map((category: Category, index: number) => {
          const visual = staticCategories.find((item) => item.name.toLowerCase() === category.name.toLowerCase()) || staticCategories[index % staticCategories.length];
          return {
            ...category,
            image: getImageUrl(category.image) || visual?.image,
            color: visual?.color || "#f5eee8",
          };
        }));
        setSubcategories(subcategoriesData);
      } catch (error) {
        console.error("Error loading public catalog:", error);
      }
    };

    loadCatalog();
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ product });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  };

  const selectedCategory = categories.find((category) =>
    category.slug?.toLowerCase() === categoryName?.toLowerCase() ||
    category.name.toLowerCase() === categoryName?.toLowerCase()
  );
  const activeCategory = categoryName
    ? selectedCategory?.name || categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase()
    : 'All';

  const isHomePage = activeCategory === 'All';

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSlide((current) => (current + 1) % heroSlides.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const shouldLock = menuOpen || cartOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, cartOpen]);

  const goToSlide = (direction: number) => {
    setSlide((current) => (current + direction + heroSlides.length) % heroSlides.length);
  };

  const toggleFavorite = (id: number) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleCategoryClick = (category: string) => {
    setMenuOpen(false);
    setOpenDropdown(null);
    if (category === 'Inicio' || category === 'All') {
      navigate('/');
    } else {
      navigate(`/categoria/${category.toLowerCase()}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeHero = heroSlides[slide];
  const normalizeSlug = (value?: string | null) => (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const selectedSubcategorySlug = new URLSearchParams(location.search).get("tipo");
  const selectedSubcategory = subcategories.find((subcategory: any) =>
    normalizeSlug(subcategory.name) === selectedSubcategorySlug ||
    normalizeSlug(subcategory.slug) === selectedSubcategorySlug
  );

  const filteredProducts = isHomePage
    ? products
    : products.filter((product: Product) => {
      const categoryMatches = selectedCategory
        ? product.category_id === selectedCategory.id
        : String(product.category).toLowerCase() === activeCategory.toLowerCase();

      if (!categoryMatches) return false;

      if (!selectedSubcategorySlug) return true;

      const productSubcategoryName = typeof (product as any).subcategory === "object"
        ? (product as any).subcategory?.name
        : typeof (product as any).subcategory === "string"
          ? (product as any).subcategory
          : "";

      const productSubcategoryMatches = selectedSubcategory
        ? String((product as any).subcategory_id ?? "") === String(selectedSubcategory.id)
        : false;

      return productSubcategoryMatches || normalizeSlug(productSubcategoryName) === selectedSubcategorySlug;
    });

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handlePlaceOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      await apiClient.post('/addresses', { ...checkoutForm, is_default: true });
      await apiClient.post('/orders', {
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          size: item.product.size,
          color: item.product.color,
        })),
        customer_name: checkoutForm.full_name,
        shipping_address: checkoutForm.address,
        shipping_city: checkoutForm.city,
        shipping_phone: checkoutForm.phone,
        shipping_country: checkoutForm.country,
        shipping_state: checkoutForm.state,
        shipping_municipality: checkoutForm.municipality,
        shipping_postal_code: checkoutForm.postal_code,
      });
      clearCart();
      setCheckoutOpen(false);
      setCartOpen(false);
      setCheckoutNotice({
        title: "¡Compra confirmada!",
        message: "Gracias por tu preferencia. Tu pedido ha sido registrado.",
        requiresLogin: false,
      });
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      setCheckoutError(errors ? (Object.values(errors)[0] as string[])[0] : error.response?.data?.error || 'No pudimos registrar tu pedido.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleContactSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setContactLoading(true);
    setContactError(null);
    try {
      await apiClient.post('/leads', { type: 'store', item_id: 0, ...contactForm });
      setContactSent(true);
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      setContactError(errors ? (Object.values(errors)[0] as string[])[0] : 'No pudimos enviar tu consulta. Inténtalo nuevamente.');
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="store-page">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>

      <header className="site-header" id="inicio">
        <div className="announcement-bar">
          <div className="shell announcement-bar__inner">
            <p><Truck size={14} /> Envíos a todo México</p>
            <p>Calidad y comodidad desde 1980</p>
            <div className="announcement-socials" aria-label="Redes sociales">
              <a href="#instagram" aria-label="Instagram"><InstagramIcon size={13} /></a>
              <a href="#facebook" aria-label="Facebook"><FacebookIcon size={13} /></a>
            </div>
          </div>
        </div>

        <div className="shell header-main">
          <button className="mobile-menu-button" type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <Menu />
          </button>
          <Logo />
          <nav className="desktop-nav" aria-label="Navegación principal">
            {menuItems.map((item) => {
              const isChildrenMenu = item.name === "Niños" && Array.isArray(item.submenu) && item.submenu.length > 0 && "talla" in (item.submenu[0] as object);

              return (
                <div
                  key={item.name}
                  className="nav-item"
                  onMouseEnter={() => item.submenu && setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {item.submenu ? (
                    <>
                      <button
                        className={`nav-link ${activeCategory === item.name ? "is-active" : ""}`}
                        onClick={() => {
                          toggleDropdown(item.name);
                          handleCategoryClick(item.name);
                        }}
                        aria-expanded={openDropdown === item.name}
                      >
                        {item.name} <ChevronDown size={13} />
                      </button>
                      {openDropdown === item.name && (
                        <div className="dropdown-menu">
                          {isChildrenMenu ? (
                            item.submenu.map((group: any) => (
                              <div key={group.talla} className="dropdown-group">
                                <span className="dropdown-group-title">{group.talla}</span>
                                {group.items.map((sub: any) => (
                                  <a
                                    key={sub.name}
                                    href={sub.href}
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigate(sub.href);
                                      setOpenDropdown(null);
                                    }}
                                  >
                                    {sub.name}
                                  </a>
                                ))}
                              </div>
                            ))
                          ) : (
                            item.submenu.map((sub: any) => (
                              <a
                                key={sub.name}
                                href={sub.href}
                                className="dropdown-item"
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(sub.href);
                                  setOpenDropdown(null);
                                }}
                              >
                                {sub.name}
                              </a>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <a
                      className={`nav-link ${activeCategory === item.name || (activeCategory === 'All' && item.name === 'Inicio') ? "is-active" : ""}`}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.name === 'Contacto') {
                          setContactSent(false);
                          setContactError(null);
                          setContactOpen(true);
                        } else if (item.name === 'Inicio') {
                          navigate('/');
                        } else {
                          navigate(item.href);
                        }
                      }}
                    >
                      {item.name}
                    </a>
                  )}
                </div>
              );
            })}
          </nav>
          <div className="header-actions">
            <button type="button" aria-label="Buscar" onClick={() => setSearchOpen((value) => !value)}><Search /></button>
            <Link to={isAuthenticated ? "/profile" : "/login"} className="header-user-icon" aria-label={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}><UserRound /></Link>
            <button className="header-actions__cart" type="button" aria-label={`Carrito, ${cartCount} productos`} onClick={() => setCartOpen(true)}>
              <ShoppingBag />{cartCount > 0 && <span>{cartCount}</span>}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form className="search-panel shell" role="search" onSubmit={(event) => event.preventDefault()}>
            <Search size={20} />
            <input autoFocus type="search" placeholder="¿Qué calzado estás buscando?" aria-label="Buscar productos" />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Cerrar buscador"><X /></button>
          </form>
        )}

        <div className={`mobile-drawer ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
          <button className="mobile-drawer__backdrop" type="button" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />
          <div className="mobile-drawer__panel">
            <div className="mobile-drawer__header">
              <Logo />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X /></button>
            </div>
            <nav aria-label="Navegación móvil">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.name === 'Inicio') {
                      navigate('/');
                    } else if (item.submenu) {
                      handleCategoryClick(item.name);
                    } else {
                      navigate(item.href);
                    }
                    setMenuOpen(false);
                  }}
                >
                  {item.name}
                  {item.submenu && <ChevronRight size={17} />}
                </a>
              ))}
            </nav>
            <div className="mobile-drawer__auth">
              <Link
                to={isAuthenticated ? "/profile" : "/login"}
                onClick={() => setMenuOpen(false)}
                aria-label={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
              >
                <UserRound size={19} />
                {isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}
              </Link>
            </div>
          </div>
        </div>

        <div className={`mobile-drawer ${cartOpen ? "is-open" : ""}`} aria-hidden={!cartOpen} style={{ zIndex: 10000 }}>
          <button className="mobile-drawer__backdrop" type="button" aria-label="Cerrar carrito" onClick={() => setCartOpen(false)} />
          <div className="mobile-drawer__panel mobile-drawer__panel--right" style={{ right: 0, left: 'auto', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column' }}>
            <div className="mobile-drawer__header" style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>Mi Carrito ({cartCount})</h2>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito"><X /></button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {cart.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Tu carrito está vacío.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {cart.map((item: any) => (
                    <div key={item.product.id} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <img src={item.product.image} alt={item.product.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>{item.product.name}</strong>
                        <span style={{ color: '#666', fontSize: '13px' }}>{item.quantity} x {money.format(Number(item.product.price || 0))}</span>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.product.id)} style={{ padding: '5px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }} aria-label="Eliminar producto">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ padding: '20px', borderTop: '1px solid #eee', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 'bold', fontSize: '18px' }}>
                  <span>Total:</span>
                  <span>{money.format(Number(cartTotal || 0))}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  style={{ width: '100%', padding: '16px', background: '#000', color: '#fff', borderRadius: '30px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  Confirmar Compra
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="contenido">
        {isHomePage ? (
          <>
            <section className="hero shell" aria-label="Colecciones destacadas">
              <div
                className="hero__image"
                style={{ backgroundImage: `url(${activeHero.image})`, backgroundPosition: activeHero.imagePosition }}
              />
              <div className="hero__overlay" />
              <div className="hero__content">
                <span>{activeHero.eyebrow}</span>
                <h1>{activeHero.title}</h1>
                <p>{activeHero.description}</p>
                <div className="hero__actions">
                  <a className="button button--primary" href="#productos">Ver colección <ArrowRight size={17} /></a>
                  <a className="button button--light" href="#ofertas">Ver ofertas</a>
                </div>
              </div>
              <div className="hero__since"><span>Desde</span><strong>1980</strong></div>
              <button className="hero-arrow hero-arrow--left" type="button" onClick={() => goToSlide(-1)} aria-label="Anterior"><ChevronLeft /></button>
              <button className="hero-arrow hero-arrow--right" type="button" onClick={() => goToSlide(1)} aria-label="Siguiente"><ChevronRight /></button>
              <div className="hero-dots" aria-label="Seleccionar diapositiva">
                {heroSlides.map((_: any, index: number) => (
                  <button key={index} className={index === slide ? "is-active" : ""} onClick={() => setSlide(index)} type="button" aria-label={`Diapositiva ${index + 1}`} />
                ))}
              </div>
            </section>

            {/* BENEFITS */}
            <section className="benefits shell" aria-label="Beneficios de compra">
              <div><Truck /><p><strong>Variedad para todos</strong><span>Mujer, hombre y niños</span></p></div>
              <div><ShieldCheck /><p><strong>Compra segura</strong><span>Pagos 100% protegidos</span></p></div>
              <div><PackageCheck /><p><strong>Envíos a todo el país</strong><span>Rápido y confiable</span></p></div>
              <div><Headphones /><p><strong>Calidad y atención</strong><span>Desde 1980 contigo</span></p></div>
            </section>

            {/* FINDER */}
            <section className="finder shell section-block">
              <SectionTitle eyebrow="Elige para quién estás buscando" title="Encuentra tu próximo par favorito" />
              <div className="finder-grid">
                {finderItems.map((item: any) => (
                  <a className="finder-card" href="#catalogo" key={item.name} onClick={(e) => { e.preventDefault(); handleCategoryClick(item.name); }}>
                    <div><strong>{item.name}</strong><span>{item.subtitle}</span><ArrowRight size={18} /></div>
                    <img src={item.image} alt="" loading="lazy" />
                  </a>
                ))}
                <a className="finder-card finder-card--sale" href="#ofertas">
                  <div><strong>Ofertas especiales</strong><span>Aprovecha hoy</span><ArrowRight size={18} /></div>
                  <span className="finder-card__percent">%</span>
                </a>
              </div>
            </section>

            {/* CATEGORÍAS */}
            <section className="categories shell section-block" id="catalogo">
              <SectionTitle title="Compra por categoría" action="Ver todas las categorías" />
              <div className="category-grid">
                {categories.map((category: any) => (
                  <a className="category-card" href="#productos" key={category.name} onClick={(e) => { e.preventDefault(); handleCategoryClick(category.name); }}>
                    <div className="category-card__media" style={{ background: category.color }}>
                      <img src={category.image} alt={`Calzado para ${category.name}`} loading="lazy" />
                    </div>
                    <strong>{category.name}</strong>
                    <span>Ver colección <ChevronRight size={14} /></span>
                  </a>
                ))}
              </div>
            </section>

            {/* PRODUCTOS */}
            <section className="products shell section-block" id="productos">
              <SectionTitle title="Productos destacados" action="Ver catálogo completo" />
              <div className="product-grid">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} onFavorite={toggleFavorite} isFavorite={favorites.includes(product.id)} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </section>

            {/* PROMOCIONES */}
            <section className="promo-grid shell section-block" id="ofertas" aria-label="Promociones">
              <article className="promo promo--dark">
                <div><span>Ofertas especiales</span><h2>Hasta <strong>40%</strong> de descuento</h2><a className="button button--primary" href="#productos">Ver ofertas <ArrowRight size={16} /></a></div>
                <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=88" alt="Zapato rojo de oferta" loading="lazy" />
              </article>
              <article className="promo promo--light">
                <div><span>Nueva colección</span><h2>Deportiva</h2><p>Máximo rendimiento en cada paso.</p><a className="outline-link" href="#productos">Ver colección <ArrowRight size={16} /></a></div>
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=88" alt="Zapatilla deportiva" loading="lazy" />
              </article>
            </section>

            {/* MARCAS */}
            <section className="brands shell section-block" aria-label="Marcas disponibles">
              <p>Las mejores marcas</p>
              <div>
                {brands.map((brand) => (
                  <strong key={brand}>{brand}</strong>
                ))}
              </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="testimonials shell section-block">
              <SectionTitle title={<>Lo que dicen <span className="red-text">nuestros clientes</span></>} />
              <div className="testimonial-grid">
                {testimonials.map((testimonial: any) => (
                  <article className="testimonial-card" key={testimonial.name}>
                    <div className="stars">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={13} fill="currentColor" />)}</div>
                    <p>“{testimonial.quote}”</p>
                    <footer><img src={testimonial.avatar} alt="" loading="lazy" /><div><strong>{testimonial.name}</strong><span>{testimonial.city}</span></div></footer>
                  </article>
                ))}
              </div>
            </section>

            {/* INSTAGRAM */}
            <section className="instagram shell section-block" id="instagram">
              <div className="instagram__intro">
                <span>Síguenos en</span>
                <h2>Instagram</h2>
                <p>@zapateriaangelita</p>
                <a className="outline-link" href="#instagram">Ver Instagram <ArrowRight size={15} /></a>
              </div>
              <div className="instagram__grid">
                {instagramImages.map((image: string, index: number) => (
                  <a href="#instagram" key={image} aria-label={`Publicación de Instagram ${index + 1}`}>
                    <img src={image} alt="" loading="lazy" />
                    <InstagramIcon />
                  </a>
                ))}
              </div>
            </section>

            {/* NEWSLETTER */}
            <section className="newsletter shell">
              <div className="newsletter__copy">
                <Mail />
                <div>
                  <strong>Suscríbete a nuestro newsletter</strong>
                  <span>Recibe ofertas exclusivas, novedades y mucho más.</span>
                </div>
              </div>
              <form onSubmit={(event) => event.preventDefault()}>
                <label className="sr-only" htmlFor="newsletter-email">Correo electrónico</label>
                <input id="newsletter-email" type="email" placeholder="Ingresa tu correo electrónico" required />
                <button type="submit">Suscribirme</button>
              </form>
            </section>
          </>
        ) : (
          <section className="products shell section-block" style={{ paddingTop: '40px', minHeight: '60vh' }}>
            <SectionTitle
              title={`Calzado para ${activeCategory}`}
              action="Volver al inicio"
              onActionClick={() => navigate('/')}
            />
            <div className="product-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} onFavorite={toggleFavorite} isFavorite={favorites.includes(product.id)} onAddToCart={handleAddToCart} />
                ))
              ) : (
                <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#888' }}>
                  No hay productos en esta categoría aún.
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="shell footer__grid">
          <div className="footer__brand">
            <Logo light />
            <p>Tu tienda de calzado para toda la familia. Calidad, comodidad y estilo desde 1980.</p>
            <div className="footer__social">
              <a href="#facebook" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#instagram" aria-label="Instagram"><InstagramIcon /></a>
            </div>
          </div>
          <div>
            <h2>Información</h2>
            <a href="#nosotros">Nosotros</a>
            <a href="#tienda">Tienda</a>
            <a href="#cambios">Cambios y devoluciones</a>
            <a href="#privacidad">Privacidad</a>
          </div>
          <div>
            <h2>Ayuda</h2>
            <a href="#comprar">¿Cómo comprar?</a>
            <a href="#pagos">Métodos de pago</a>
            <a href="#tallas">Guía de tallas</a>
            <a href="#preguntas">Preguntas frecuentes</a>
          </div>
          <div className="footer__contact">
            <h2>Contacto</h2>
            <p><Headphones /> +52 55 #### ####</p>
            <p><Mail /> hola@zapateriaangelita.com</p>
            <p><MapPin /> México</p>
            <p><Clock3 /> Lun–Sáb: 9:00–19:00</p>
          </div>
        </div>
        <div className="shell footer__bottom">
          <span>© 2026 Zapatería Angelita. Todos los derechos reservados.</span>
          <span>Visa · Mastercard · Yape · Plin</span>
        </div>
      </footer>

      {contactOpen && (
        <div role="dialog" aria-modal="true" aria-labelledby="contact-title" onClick={() => setContactOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 12000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(18, 18, 18, 0.55)" }}>
          <form onSubmit={handleContactSubmit} onClick={(event) => event.stopPropagation()} style={{ width: "100%", maxWidth: "560px", maxHeight: "92vh", overflowY: "auto", padding: "30px", background: "#fff", borderRadius: "18px", boxShadow: "0 24px 70px rgba(0, 0, 0, 0.22)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "22px" }}>
              <div>
                <p style={{ margin: 0, color: "#e30613", fontSize: "11px", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>ATENCIÓN</p>
                <h2 id="contact-title" style={{ margin: "7px 0 0", fontSize: "26px", color: "#121212" }}>¿Qué calzado estás buscando?</h2>
                <p style={{ margin: "7px 0 0", color: "#666" }}>Déjanos tus datos y te ayudamos a encontrar tu próximo par.</p>
              </div>
              <button type="button" onClick={() => setContactOpen(false)} aria-label="Cerrar contacto" style={{ border: "none", background: "none", cursor: "pointer" }}><X /></button>
            </div>
            {contactSent ? (
              <div style={{ padding: "30px 10px 12px", textAlign: "center" }}>
                <PackageCheck size={44} color="#2e7d32" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ margin: "0 0 8px", fontSize: "22px" }}>¡Consulta recibida!</h3>
                <p style={{ color: "#666", lineHeight: 1.6 }}>Nuestro equipo se pondrá en contacto contigo pronto.</p>
                <button type="button" onClick={() => setContactOpen(false)} style={{ marginTop: "14px", padding: "12px 24px", border: "none", borderRadius: "24px", background: "#121212", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Cerrar</button>
              </div>
            ) : (
              <>
                {contactError && <p role="alert" style={{ padding: "12px", margin: "0 0 16px", color: "#a40000", background: "#fff0f0", borderRadius: "8px" }}>{contactError}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
                  <label>Nombre *<input required minLength={2} value={contactForm.first_name} onChange={(event) => setContactForm({ ...contactForm, first_name: event.target.value })} style={checkoutInputStyle} /></label>
                  <label>Apellido *<input required minLength={2} value={contactForm.last_name} onChange={(event) => setContactForm({ ...contactForm, last_name: event.target.value })} style={checkoutInputStyle} /></label>
                  <label>Correo electrónico<input required type="email" value={contactForm.email} onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })} style={checkoutInputStyle} /></label>
                  <label>WhatsApp / teléfono *<input required minLength={7} value={contactForm.phone} onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })} style={checkoutInputStyle} /></label>
                  <label>¿Qué necesitas? *<select required value={contactForm.product_interest} onChange={(event) => setContactForm({ ...contactForm, product_interest: event.target.value })} style={checkoutInputStyle}><option value="">Selecciona una opción</option><option>Compra de calzado</option><option>Disponibilidad de un producto</option><option>Asesoría de talla</option><option>Cambios y devoluciones</option><option>Compra mayorista</option></select></label>
                  <label>Talla de interés *<input required value={contactForm.shoe_size} onChange={(event) => setContactForm({ ...contactForm, shoe_size: event.target.value })} placeholder="Ej. 24, 38 o 6 US" style={checkoutInputStyle} /></label>
                  <label>Prefiero que me contacten *<select required value={contactForm.contact_preference} onChange={(event) => setContactForm({ ...contactForm, contact_preference: event.target.value })} style={checkoutInputStyle}><option value="">Selecciona una opción</option><option>WhatsApp</option><option>Llamada</option><option>Correo</option></select></label>
                  <label style={{ gridColumn: "1 / -1" }}>Cuéntanos un poco más *<textarea required minLength={10} rows={4} value={contactForm.message} onChange={(event) => setContactForm({ ...contactForm, message: event.target.value })} placeholder="Modelo, color, talla o cualquier detalle que necesites" style={{ ...checkoutInputStyle, resize: "vertical" }} /></label>
                </div>
                <button type="submit" disabled={contactLoading} style={{ width: "100%", marginTop: "22px", padding: "15px", background: "#e30613", color: "#fff", borderRadius: "30px", fontWeight: "bold", border: "none", cursor: "pointer" }}>{contactLoading ? "Enviando consulta..." : "Solicitar asesoría"}</button>
              </>
            )}
          </form>
        </div>
      )}

      {checkoutOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
          style={{ position: "fixed", inset: 0, zIndex: 12000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "rgba(18, 18, 18, 0.52)" }}
          onClick={() => setCheckoutOpen(false)}
        >
          <form
            onSubmit={handlePlaceOrder}
            onClick={(event) => event.stopPropagation()}
            style={{ width: "100%", maxWidth: "620px", maxHeight: "92vh", overflowY: "auto", padding: "28px", background: "#fff", borderRadius: "18px", boxShadow: "0 24px 70px rgba(0, 0, 0, 0.2)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <div>
                <h2 id="checkout-title" style={{ margin: 0, fontSize: "24px", color: "#121212" }}>Datos de envío</h2>
                <p style={{ margin: "6px 0 0", color: "#666" }}>Completa la dirección donde recibirás tu pedido.</p>
              </div>
              <button type="button" onClick={() => setCheckoutOpen(false)} aria-label="Cerrar checkout" style={{ border: "none", background: "none", cursor: "pointer" }}><X /></button>
            </div>

            {checkoutError && <p role="alert" style={{ padding: "12px", margin: "0 0 16px", color: "#a40000", background: "#fff0f0", borderRadius: "8px" }}>{checkoutError}</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
              <label>Nombre completo<input required value={checkoutForm.full_name} onChange={(event) => setCheckoutForm({ ...checkoutForm, full_name: event.target.value })} style={checkoutInputStyle} /></label>
              <label>Teléfono<input required value={checkoutForm.phone} onChange={(event) => setCheckoutForm({ ...checkoutForm, phone: event.target.value })} style={checkoutInputStyle} /></label>
              <label>País<select required value={checkoutForm.country} onChange={(event) => setCheckoutForm({ ...checkoutForm, country: event.target.value })} style={checkoutInputStyle}><option value="México">México</option></select></label>
              <label>Estado<select required value={checkoutForm.state} disabled={ubigeoLoading} onChange={(event) => setCheckoutForm({ ...checkoutForm, state: event.target.value, municipality: "", city: "" })} style={checkoutInputStyle}><option value="">Seleccionar</option>{states.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
              <label>Municipio<select required value={checkoutForm.municipality} disabled={!checkoutForm.state || ubigeoLoading} onChange={(event) => setCheckoutForm({ ...checkoutForm, municipality: event.target.value, city: "" })} style={checkoutInputStyle}><option value="">Seleccionar</option>{municipalities.map((municipality) => <option key={municipality} value={municipality}>{municipality}</option>)}</select></label>
              <label>Ciudad<select required value={checkoutForm.city} disabled={!checkoutForm.municipality || ubigeoLoading} onChange={(event) => setCheckoutForm({ ...checkoutForm, city: event.target.value })} style={checkoutInputStyle}><option value="">Seleccionar</option>{cities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
              <label>Código postal<input required inputMode="numeric" value={checkoutForm.postal_code} onChange={(event) => setCheckoutForm({ ...checkoutForm, postal_code: event.target.value })} style={checkoutInputStyle} /></label>
              <label style={{ gridColumn: "1 / -1" }}>Dirección<input required value={checkoutForm.address} onChange={(event) => setCheckoutForm({ ...checkoutForm, address: event.target.value })} placeholder="Calle, número y colonia" style={checkoutInputStyle} /></label>
              <label style={{ gridColumn: "1 / -1" }}>Referencia (opcional)<input value={checkoutForm.reference} onChange={(event) => setCheckoutForm({ ...checkoutForm, reference: event.target.value })} style={checkoutInputStyle} /></label>
            </div>
            <button type="submit" disabled={checkoutLoading} style={{ width: "100%", marginTop: "22px", padding: "15px", background: "#000", color: "#fff", borderRadius: "30px", fontWeight: "bold", border: "none", cursor: "pointer" }}>
              {checkoutLoading ? "Registrando pedido..." : `Confirmar compra · ${money.format(Number(cartTotal || 0))}`}
            </button>
          </form>
        </div>
      )}
      
      {checkoutNotice && (

        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-notice-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 11000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(18, 18, 18, 0.52)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setCheckoutNotice(null)}
        >
          
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              padding: "32px",
              background: "#fff",
              borderRadius: "18px",
              boxShadow: "0 24px 70px rgba(0, 0, 0, 0.2)",
              textAlign: "center",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "#fbe8e9",
              color: "#e30613",
            }}>
              {checkoutNotice.requiresLogin ? <UserRound size={25} /> : <PackageCheck size={25} />}
            </div>
            <h2 id="checkout-notice-title" style={{ margin: "0 0 10px", fontSize: "22px", color: "#121212" }}>
              {checkoutNotice.title}
            </h2>
            <p style={{ margin: "0 auto 24px", maxWidth: "320px", color: "#666", lineHeight: 1.6 }}>
              {checkoutNotice.message}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              {checkoutNotice.requiresLogin ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    style={{ padding: "12px 20px", border: "none", borderRadius: "24px", background: "#e30613", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    onClick={() => setCheckoutNotice(null)}
                    style={{ padding: "12px 20px", border: "1px solid #ddd", borderRadius: "24px", background: "#fff", color: "#333", fontWeight: 700, cursor: "pointer" }}
                  >
                    Ahora no
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setCheckoutNotice(null)}
                  style={{ padding: "12px 28px", border: "none", borderRadius: "24px", background: "#121212", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                >
                  Entendido
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '24px',
          zIndex: 9999,
          transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: toast ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
          opacity: toast ? 1 : 0,
          pointerEvents: toast ? 'auto' : 'none',
        }}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            background: '#fff',
            border: '1px solid #e9e9e9',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.13)',
            minWidth: '280px',
            maxWidth: '340px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}>
            <div style={{
              width: '40px', height: '40px', minWidth: '40px',
              background: '#e30613', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#e30613', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Agregado al carrito
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '13px', fontWeight: 600, color: '#121212', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {toast.product.name}
              </p>
            </div>
            <button
              onClick={() => { setCartOpen(true); setToast(null); }}
              style={{
                padding: '7px 13px', background: '#121212', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '11px',
                fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                letterSpacing: '0.04em', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e30613')}
              onMouseLeave={e => (e.currentTarget.style.background = '#121212')}
            >
              Ver carrito
            </button>
            <button
              onClick={() => setToast(null)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '4px', color: '#aaa', display: 'flex', alignItems: 'center',
              }}
              aria-label="Cerrar notificación"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}