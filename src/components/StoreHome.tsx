import { useEffect, useState } from "react";
import ReferenceLanding from "./ReferenceLanding";
import PhoneField from "./PhoneField";
import brandLogo from "../assets/brand/logo-angelita-horizontal.png";
import fallbackImage from "../assets/foto1.jpg";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import apiClient from "../services/apiClient";
import { useUbigeo } from "../hooks/useUbigeo";
import { categoryService, productService, settingsService, subcategoryService, Category, Product } from "../services/crudService";
import { getImageUrl } from "../config/api";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clock3,
  Headphones,
  Heart,
  Mail,
  MapPin,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  Star,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import {
  categories as staticCategories,
} from "../data/catalog";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const applyCatalogImageFallback = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "1") return;
  image.dataset.fallbackApplied = "1";
  image.src = fallbackImage;
  image.alt = image.alt || "Imagen no disponible";
};

const colorNameToHex = (name: string) => {
  const normalized = String(name || '').trim().toLocaleLowerCase();
  const palette: Record<string, string> = {
    blanco: '#ffffff',
    negro: '#111111',
    rojo: '#d62828',
    azul: '#2563eb',
    celeste: '#7dd3fc',
    'azul cielo': '#7dd3fc',
    verde: '#2e8b57',
    amarillo: '#facc15',
    rosa: '#f472b6',
    morado: '#7c3aed',
    gris: '#9ca3af',
    cafe: '#8b5e3c',
    marron: '#8b5e3c',
    beige: '#d6c2a1',
    turquesa: '#2dd4bf',
    naranja: '#f97316',
    vino: '#7f1d1d',
    dorado: '#d4a017',
    plateado: '#c0c0c0',
  };

  return palette[normalized] || (normalized.startsWith('#') ? normalized : '#888888');
};

const productColors = (product: any) => {
  if (Array.isArray(product?.colors) && product.colors.length) {
    return product.colors
      .map((item: any) => ({
        name: String(typeof item === 'object' ? item.color || item.name || '' : item).trim(),
        hex: String(typeof item === 'object' ? item.hex || '' : '').trim(),
      }))
      .filter((item: any) => item.name)
      .map((item: any) => ({
        ...item,
        hex: !item.hex || item.hex.toLocaleLowerCase() === '#888888'
          ? colorNameToHex(item.name)
          : item.hex,
      }));
  }

  return String(product?.color || '')
    .split(/[,/|]+/)
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name, hex: colorNameToHex(name) }));
};

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

function Logo({ light = false, src = brandLogo }: { light?: boolean; src?: string }) {
  return (
    <a className={`logo ${light ? "logo--light" : ""}`} href="/" aria-label="Zapatería Angelita - inicio">
      <img className="brand-logo__image" src={src || brandLogo} alt="Zapatería Angelita" />
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
  const colors = productColors(product);

  return (
    <article className="product-card">
      <div className="product-card__media">
        {product.discount && <span className="discount-badge">{discountLabel}</span>}
        <button
          aria-pressed={isFavorite}
          className={`favorite-button ${isFavorite ? "is-active" : ""}`}
          type="button"
          onClick={(event) => { event.preventDefault(); onFavorite(product.id); }}
          aria-label={`${isFavorite ? "Quitar" : "Agregar"} ${product.name} de favoritos`}
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
        <Link to={`/producto/${product.id}`} className="product-card__image-link" aria-label={`Ver detalles de ${product.name}`}>
          <img src={product.image || fallbackImage} alt={product.name} loading="lazy" decoding="async" onError={applyCatalogImageFallback} />
        </Link>
        <button className="quick-add quick-add--media" type="button" onClick={() => onAddToCart(product)}>Agregar al carrito</button>
      </div>
      <div className="product-card__body">
        <span className="product-card__category">{product.category}</span>
        <h3><Link to={`/producto/${product.id}`}>{product.name}</Link></h3>
        {colors.length > 0 && (
          <div
            className="product-card__colors"
            aria-label={`Colores disponibles: ${colors.map((item: any) => item.name).join(', ')}`}
            style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', margin: '6px 0 2px' }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#777' }}>
              {colors.length === 1 ? `Color: ${colors[0].name}` : 'Colores:'}
            </span>
            {colors.slice(0, 5).map((item: any) => (
              <span
                key={item.name}
                title={item.name}
                aria-label={item.name}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: item.hex,
                  border: item.hex.toLowerCase() === '#ffffff' ? '1px solid #cfcfcf' : '1px solid rgba(0,0,0,.14)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,.7) inset',
                }}
              />
            ))}
            {colors.length > 1 && (
              <span style={{ fontSize: '10px', color: '#777' }}>
                {colors.map((item: any) => item.name).join(', ')}
              </span>
            )}
          </div>
        )}
        <div className="stars" aria-label={`${product.rating} de 5 estrellas`}>
          {Array.from({ length: product.rating }).map((_, index) => (
            <Star key={index} size={12} fill="currentColor" aria-hidden="true" />
          ))}
        </div>
        <div className="price-row">
          <strong>{money.format(product.price)}</strong>
          {product.oldPrice && <del>{money.format(product.oldPrice)}</del>}
        </div>
        <button className="quick-add quick-add--body" type="button" onClick={(event) => { event.preventDefault(); onAddToCart(product); }}>Agregar al carrito</button>
      </div>
    </article>
  );
}


export default function StoreHome() {
  const [products, setProducts] = useState<any[]>([]);
  const [siteLogo, setSiteLogo] = useState<string>(brandLogo);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { cart, removeFromCart, cartCount, cartTotal, clearCart } = useCart();
  const [toast, setToast] = useState<{ product: any } | null>(null);
  const [checkoutNotice, setCheckoutNotice] = useState<{ title: string; message: string; requiresLogin: boolean } | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({
    full_name: "",
    phone: "+52",
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
  const [offerCategory, setOfferCategory] = useState('Todas');
  const [offerSort, setOfferSort] = useState('relevance');
  const [offerPage, setOfferPage] = useState(1);
  const [catalogCategory, setCatalogCategory] = useState('Todas');
  const [catalogSubcategory, setCatalogSubcategory] = useState('Todas');
  const [categorySubcategory, setCategorySubcategory] = useState('Todas');
  const [contactForm, setContactForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "+52",
    product_interest: "Compra de calzado",
    shoe_size: "",
    contact_preference: "WhatsApp",
    message: "",
  });
  const { states, municipalities, cities, loading: ubigeoLoading } = useUbigeo(checkoutForm.state, checkoutForm.municipality);

  useEffect(() => {
    if ((location.state as any)?.openCart) {
      setCartOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    let active = true;

    const loadSiteLogo = async () => {
      try {
        const response = await settingsService.getAll();
        const configuredLogo = response.data?.data?.logo_url;
        if (active && configuredLogo) {
          setSiteLogo(getImageUrl(configuredLogo) || brandLogo);
        }
      } catch {
        if (active) setSiteLogo(brandLogo);
      }
    };

    void loadSiteLogo();
    return () => {
      active = false;
    };
  }, []);

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
        setCatalogError(true);
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const handleAddToCart = (product: any) => {
    navigate(`/producto/${product.id}`);
  };

  const selectedCategory = categories.find((category) =>
    category.slug?.toLowerCase() === categoryName?.toLowerCase() ||
    category.name.toLowerCase() === categoryName?.toLowerCase()
  );
  const activeCategory = categoryName
    ? selectedCategory?.name || categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase()
    : 'All';

  const statusFilter = location.pathname === '/ofertas'
    ? 'oferta'
    : location.pathname === '/novedades'
      ? 'nuevo'
      : null;
  const isHomePage = activeCategory === 'All' && !statusFilter;
  const isCatalogPage = location.pathname === '/catalogo';

  const isMenuItemActive = (item: typeof menuItems[number]) => {
    if (item.name === 'Inicio') return isHomePage && location.pathname !== '/catalogo';
    if (item.name === 'Ofertas') return location.pathname === '/ofertas';
    if (item.name === 'Novedades') return location.pathname === '/novedades';
    if (item.name === 'Contacto') return false;
    return location.pathname === item.href || location.pathname.startsWith(`${item.href}?`);
  };

  useEffect(() => {
    const shouldLock = menuOpen || cartOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, cartOpen]);

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

  const categorySubcategories = subcategories.filter((subcategory: any) =>
    selectedCategory ? String(subcategory.category_id) === String(selectedCategory.id) : true
  );
  const inventoryUnitsOf = (items: any[]) =>
    items.reduce((total, item) => total + Math.max(0, Number(item.stock || 0)), 0);

  const categoryProducts = products.filter((product: any) => {
    const categoryMatches = selectedCategory
      ? String(product.category_id) === String(selectedCategory.id)
      : String(product.category).toLowerCase() === activeCategory.toLowerCase();
    if (!categoryMatches || categorySubcategory === 'Todas') return categoryMatches;
    return String(product.subcategory_id) === String(categorySubcategory);
  });

  useEffect(() => {
    setCategorySubcategory(selectedSubcategory?.id ? String(selectedSubcategory.id) : 'Todas');
  }, [categoryName, location.search, selectedSubcategory?.id]);

  const filteredProducts = statusFilter
    ? products.filter((product: Product) => product.status === statusFilter)
    : isHomePage
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

  const catalogStatus = statusFilter || 'oferta';
  const catalogStatusTitle = catalogStatus === 'nuevo' ? 'Novedades' : 'Ofertas de temporada';
  const catalogStatusEyebrow = catalogStatus === 'nuevo' ? 'Recién llegados' : 'Selección especial';
  const offerCategoryItems = categories.map((category: any) => ({
    ...category,
    offerCount: inventoryUnitsOf(products.filter((product: any) => product.status === catalogStatus && product.category_id === category.id)),
  }));
  const offerProducts = products
    .filter((product: any) => product.status === catalogStatus)
    .filter((product: any) => offerCategory === 'Todas' || String(product.category).toLowerCase() === offerCategory.toLowerCase());
  const sortedOfferProducts = [...offerProducts].sort((first, second) => {
    if (offerSort === 'price-asc') return Number(first.price) - Number(second.price);
    if (offerSort === 'price-desc') return Number(second.price) - Number(first.price);
    if (offerSort === 'name') return String(first.name).localeCompare(String(second.name));
    return 0;
  });
  const offerPageSize = 8;
  const offerPageCount = Math.max(1, Math.ceil(sortedOfferProducts.length / offerPageSize));
  const visibleOfferProducts = sortedOfferProducts.slice((offerPage - 1) * offerPageSize, offerPage * offerPageSize);

  const catalogSubcategoryOptions = subcategories.filter((subcategory: any) =>
    catalogCategory === 'Todas' || String(subcategory.category_id) === String(catalogCategory)
  );
  const catalogProducts = products.filter((product: any) => {
    const query = new URLSearchParams(location.search).get("q")?.toLocaleLowerCase() || "";
    if (query && !String(product.name).toLocaleLowerCase().includes(query)) return false;
    const categoryMatches = catalogCategory === 'Todas' || String(product.category_id) === String(catalogCategory);
    if (!categoryMatches || catalogSubcategory === 'Todas') return categoryMatches;
    return String(product.subcategory_id) === String(catalogSubcategory);
  });

  useEffect(() => {
    setOfferPage(1);
  }, [offerCategory, offerSort]);

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
            <div className="announcement-promises" aria-label="Compromisos de compra">
              <span>Pagos seguros</span>
              <span>La confianza de miles de familias</span>
            </div>
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
          <Logo src={siteLogo} />
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
            <form className="header-search" role="search" onSubmit={event => { event.preventDefault(); navigate('/catalogo?q=' + encodeURIComponent(searchText.trim())); }}>
              <button type="submit" aria-label="Buscar en catálogo"><Search size={16} /></button>
              <input value={searchText} onChange={event => setSearchText(event.target.value)} aria-label="Buscar productos" placeholder="Buscar productos..." type="search" />
            </form>
            <button className="header-search-toggle" type="button" aria-label="Buscar" onClick={() => setSearchOpen((value) => !value)}><Search /></button>
            <Link to={isAuthenticated ? "/profile" : "/login"} className="header-user-icon" aria-label={isAuthenticated ? "Mi cuenta" : "Iniciar sesión"}><UserRound /></Link>
            <button className="header-actions__cart" type="button" aria-label={`Carrito, ${cartCount} productos`} onClick={() => setCartOpen(true)}>
              <ShoppingBag />{cartCount > 0 && <span>{cartCount}</span>}
            </button>
          </div>
        </div>

        {searchOpen && (
          <form className="search-panel shell" role="search" onSubmit={event => { event.preventDefault(); setSearchOpen(false); navigate("/catalogo?q=" + encodeURIComponent(searchText.trim())); }}>
            <Search size={20} />
            <input autoFocus type="search" value={searchText} onChange={event => setSearchText(event.target.value)} placeholder="¿Qué calzado estás buscando?" aria-label="Buscar productos en móvil" />
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Cerrar buscador"><X /></button>
          </form>
        )}

        <div className={`mobile-drawer ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
          <button className="mobile-drawer__backdrop" type="button" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />
          <div className="mobile-drawer__panel">
            <div className="mobile-drawer__header">
              <Logo src={siteLogo} />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú"><X /></button>
            </div>
            <nav aria-label="Navegación móvil">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={isMenuItemActive(item) ? 'is-active' : undefined}
                  aria-current={isMenuItemActive(item) ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.name === 'Inicio') {
                      navigate('/');
                    } else if (item.name === 'Contacto') {
                      setContactSent(false); setContactError(null); setContactOpen(true);
                    } else if (item.submenu) {
                      navigate(item.href);
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
                      <img src={item.product.image || fallbackImage} alt={item.product.name} loading="lazy" decoding="async" onError={applyCatalogImageFallback} style={{ width: '70px', height: '70px', objectFit: 'contain', background: '#fff', borderRadius: '8px' }} />
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
        {isCatalogPage ? (
          <section className="full-catalog shell section-block">
            <div className="full-catalog__heading">
              <div>
                <span className="offers-catalog__eyebrow">Toda la colección</span>
                <h1>Catálogo completo</h1>
                <p>Explora todo nuestro calzado y encuentra tu próximo par.</p>
              </div>
              <Link className="offers-catalog__back" to="/">Volver al inicio <ChevronRight size={16} /></Link>
            </div>
            <div className="full-catalog__filters" aria-label="Filtros del catálogo">
              <label>
                Categoría
                <select
                  value={catalogCategory}
                  onChange={(event) => {
                    setCatalogCategory(event.target.value);
                    setCatalogSubcategory('Todas');
                  }}
                >
                  <option value="Todas">Todas las categorías</option>
                  {categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label>
                Subcategoría
                <select value={catalogSubcategory} onChange={(event) => setCatalogSubcategory(event.target.value)}>
                  <option value="Todas">Todas las subcategorías</option>
                  {catalogSubcategoryOptions.map((subcategory: any) => <option key={subcategory.id} value={subcategory.id}>{subcategory.name}</option>)}
                </select>
              </label>
              <span className="full-catalog__count">{catalogProducts.length} productos</span>
            </div>
            <div className="product-grid full-catalog__grid">
              {catalogProducts.length > 0 ? catalogProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} onFavorite={toggleFavorite} isFavorite={favorites.includes(product.id)} onAddToCart={handleAddToCart} />
              )) : (
                <p className="offers-results__empty">No hay productos con estos filtros.</p>
              )}
            </div>
          </section>
        ) : isHomePage ? (
          <ReferenceLanding
            products={products}
            loading={catalogLoading}
            error={catalogError}
            renderProduct={product => <ProductCard key={product.id} product={product} onFavorite={toggleFavorite} isFavorite={favorites.includes(product.id)} onAddToCart={handleAddToCart} />}
          />
        ) : (
          statusFilter === 'oferta' || statusFilter === 'nuevo' ? (
            <section className="offers-catalog shell section-block">
              <div className="offers-catalog__heading">
                <div>
                  <span className="offers-catalog__eyebrow">{catalogStatusEyebrow}</span>
                  <h1>{catalogStatusTitle}</h1>
                  <p>{inventoryUnitsOf(offerProducts)} unidades disponibles</p>
                </div>
                <button className="offers-catalog__back" type="button" onClick={() => navigate('/')}>
                  Volver al inicio <ChevronRight size={16} />
                </button>
              </div>

              <div className="offers-catalog__categories" aria-label="Categorías de ofertas">
                <button
                  type="button"
                  className={`offers-category ${offerCategory === 'Todas' ? 'is-active' : ''}`}
                  onClick={() => setOfferCategory('Todas')}
                >
                  <span className="offers-category__image offers-category__image--all">%</span>
                  <strong>Todas</strong>
                </button>
                {offerCategoryItems.map((category: any) => (
                  <button
                    type="button"
                    key={category.id || category.name}
                    className={`offers-category ${offerCategory === category.name ? 'is-active' : ''}`}
                    onClick={() => setOfferCategory(category.name)}
                  >
                    <span className="offers-category__image">
                      <img src={category.image || fallbackImage} alt={category.name || "Categoría"} loading="lazy" decoding="async" onError={applyCatalogImageFallback} />
                    </span>
                    <strong>{category.name}</strong>
                    <small>{category.offerCount}</small>
                  </button>
                ))}
              </div>

              <div className="offers-catalog__layout">
                <aside className="offers-filters" aria-label="Filtros de ofertas">
                  <div className="offers-filters__title">
                    <strong>Filtrar por</strong>
                    <button type="button" onClick={() => setOfferCategory('Todas')}>Limpiar</button>
                  </div>
                  <div className="offers-filter-group">
                    <strong>Categoría</strong>
                    <label className="offers-check is-selected">
                      <input type="checkbox" checked={offerCategory === 'Todas'} onChange={() => setOfferCategory('Todas')} />
                      <span>{catalogStatusTitle}</span>
                      <small>{products.filter((product: any) => product.status === catalogStatus).length}</small>
                    </label>
                    {offerCategoryItems.map((category: any) => (
                      <label className="offers-check" key={category.id || category.name}>
                        <input type="checkbox" checked={offerCategory === category.name} onChange={() => setOfferCategory(category.name)} />
                        <span>{category.name}</span>
                        <small>{category.offerCount}</small>
                      </label>
                    ))}
                  </div>
                </aside>

                <div className="offers-results">
                  <div className="offers-results__toolbar">
                    <span>{sortedOfferProducts.length} resultados</span>
                    <label>
                      Ordenar por
                      <select value={offerSort} onChange={(event) => setOfferSort(event.target.value)}>
                        <option value="relevance">Relevancia</option>
                        <option value="price-asc">Precio: menor a mayor</option>
                        <option value="price-desc">Precio: mayor a menor</option>
                        <option value="name">Nombre</option>
                      </select>
                    </label>
                  </div>
                  <div className="offers-results__grid">
                    {visibleOfferProducts.length > 0 ? visibleOfferProducts.map((product: any) => (
                      <ProductCard key={product.id} product={product} onFavorite={toggleFavorite} isFavorite={favorites.includes(product.id)} onAddToCart={handleAddToCart} />
                    )) : (
                      <p className="offers-results__empty">No hay productos disponibles en esta categoría.</p>
                    )}
                  </div>
                  {offerPageCount > 1 && (
                    <nav className="offers-pagination" aria-label="Paginación de ofertas">
                      <button type="button" disabled={offerPage === 1} onClick={() => setOfferPage((page) => page - 1)} aria-label="Página anterior"><ChevronLeft size={18} /></button>
                      {Array.from({ length: offerPageCount }, (_, index) => index + 1).map((page) => (
                        <button type="button" key={page} className={offerPage === page ? 'is-active' : ''} onClick={() => setOfferPage(page)}>{page}</button>
                      ))}
                      <button type="button" disabled={offerPage === offerPageCount} onClick={() => setOfferPage((page) => page + 1)} aria-label="Página siguiente"><ChevronRight size={18} /></button>
                    </nav>
                  )}
                </div>
              </div>
            </section>
          ) : categoryName ? (
            <section className="category-catalog shell section-block">
              <div className="category-catalog__heading">
                <div>
                  <span className="offers-catalog__eyebrow">Colección de calzado</span>
                  <h1>Calzado para {activeCategory}</h1>
                  <p>{inventoryUnitsOf(categoryProducts)} unidades disponibles</p>
                </div>
                <button className="offers-catalog__back" type="button" onClick={() => navigate('/')}>
                  Volver al inicio <ChevronRight size={16} />
                </button>
              </div>

              <div className="category-catalog__layout">
                <div className="category-catalog__products">
                  <div className="offers-results__toolbar">
                    <span>{categoryProducts.length} resultados</span>
                    <span>{categorySubcategory === 'Todas' ? 'Toda la categoría' : categorySubcategories.find((item: any) => String(item.id) === String(categorySubcategory))?.name}</span>
                  </div>
                  <div className="product-grid">
                    {categoryProducts.length > 0 ? categoryProducts.map((product: any) => (
                      <ProductCard key={product.id} product={product} onFavorite={toggleFavorite} isFavorite={favorites.includes(product.id)} onAddToCart={handleAddToCart} />
                    )) : (
                      <p className="offers-results__empty">No hay productos en esta subcategoría.</p>
                    )}
                  </div>
                </div>

                <aside className="category-catalog__sidebar" aria-label={`Subcategorías de ${activeCategory}`}>
                  <div className="category-catalog__sidebar-heading">
                    <strong>Filtrar por</strong>
                    <button type="button" onClick={() => setCategorySubcategory('Todas')}>Limpiar</button>
                  </div>
                  <strong className="category-catalog__sidebar-title">Subcategorías</strong>
                  <label className="offers-check">
                    <input type="checkbox" checked={categorySubcategory === 'Todas'} onChange={() => setCategorySubcategory('Todas')} />
                    <span>Todos</span>
                    <small>{inventoryUnitsOf(products.filter((product: any) => selectedCategory ? String(product.category_id) === String(selectedCategory.id) : String(product.category).toLowerCase() === activeCategory.toLowerCase()))}</small>
                  </label>
                  {categorySubcategories.map((subcategory: any) => (
                    <label className="offers-check" key={subcategory.id}>
                      <input type="checkbox" checked={String(categorySubcategory) === String(subcategory.id)} onChange={() => setCategorySubcategory(String(subcategory.id))} />
                      <span>{subcategory.name}</span>
                      <small>{products.filter((product: any) => String(product.subcategory_id) === String(subcategory.id)).length}</small>
                    </label>
                  ))}
                </aside>
              </div>
            </section>
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
          )
        )}
      </main>

      <footer className="footer">
        <div className="shell footer__grid">
          <div className="footer__brand">
            <Logo light src={siteLogo} />
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
            <p><Headphones /> +52 5578636092</p>
            <p><Mail /> soporte@zapateriangelita.com</p>
            <p><MapPin /> Leando Valle 8 Colonia centro CP 61100,Hidalgo - Michoacán. México</p>
            <p><Clock3 /> Lun–Sáb: 9:00–19:00</p>
          </div>
        </div>
        <div className="shell footer__bottom">
          <span>© 2026 Zapatería Angelita. Todos los derechos reservados.</span>
          <span>Visa · Paypal</span>
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
                  <label>WhatsApp / teléfono *<PhoneField required value={contactForm.phone} onChange={(phone) => setContactForm({ ...contactForm, phone })} defaultDialCode="+52" selectClassName="store-phone-prefix" inputClassName="store-phone-number" /></label>
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
              <label>Teléfono<PhoneField required value={checkoutForm.phone} onChange={(phone) => setCheckoutForm({ ...checkoutForm, phone })} defaultDialCode="+52" selectClassName="store-phone-prefix" inputClassName="store-phone-number" /></label>
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
