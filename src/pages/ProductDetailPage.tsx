import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Star,
  Heart,
  Share2,
  ShieldCheck,
  RotateCcw,
  Truck,
  X,
  ZoomIn,
} from "lucide-react";
import { analyticsService, productService, settingsService, Product } from "../services/crudService";
import { getImageUrl } from "../config/api";
import { useCart } from "../hooks/useCart";
import brandLogo from "../assets/brand/logo-angelita-horizontal.png";
import fallbackImage from "../assets/foto1.jpg";
import "../styles/product-detail.css";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const applyProductImageFallback = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "1") return;
  image.dataset.fallbackApplied = "1";
  image.src = fallbackImage;
  image.alt = image.alt || "Imagen no disponible";
};

function Logo({ light = false, src = brandLogo }: { light?: boolean; src?: string }) {
  return (
    <a className={`logo ${light ? "logo--light" : ""}`} href="/" aria-label="Zapatería Angelita - inicio">
      <img src={src || brandLogo} alt="Zapatería Angelita" className="pd-logo" />
    </a>
  );
}

function normalizeProduct(product: Product): any {
  const images = (product.images || []).filter(Boolean);
  const imageList = images.length
    ? images.map((image) => getImageUrl(image))
    : product.img
      ? [getImageUrl(product.img)]
      : [fallbackImage];


  const colorNameToHex = (name: string) => {
    const normalizedName = name.trim().toLowerCase();
    const colors: Record<string, string> = {
      blanco: "#ffffff",
      negro: "#111111",
      rojo: "#d62828",
      azul: "#2563eb",
      verde: "#2e8b57",
      amarillo: "#facc15",
      rosa: "#f472b6",
      morado: "#7c3aed",
      gris: "#9ca3af",
      cafe: "#8b5e3c",
      marron: "#8b5e3c",
      beige: "#d6c2a1",
      celeste: "#7dd3fc",
      "azul cielo": "#7dd3fc",
      turquesa: "#2dd4bf",
      naranja: "#f97316",
      vino: "#7f1d1d",
      dorado: "#d4a017",
      plateado: "#c0c0c0",
    };
    return colors[normalizedName] || (normalizedName.startsWith("#") ? name.trim() : "#888888");
  };

  const rawColors = (product as any).colors;
  const colorOptions = Array.isArray(rawColors) && rawColors.length > 0
    ? rawColors.map((color: any) => {
      const name = String(typeof color === "object" ? color.name || color.color : color).trim();
      return {
        name,
        hex: typeof color === "object" && (color.hex || color.color_hex)
          ? color.hex || color.color_hex
          : colorNameToHex(name),
      };
    }).filter((color: any) => color.name)
    : typeof product.color === "string"
      ? product.color.split(/[,/|]/).map((color) => color.trim()).filter(Boolean).map((name) => ({ name, hex: colorNameToHex(name) }))
      : null;

  const rawColorImages = (product as any).color_images;
  const colorImages = rawColorImages && typeof rawColorImages === "object"
    ? Object.fromEntries(Object.entries(rawColorImages).map(([color, images]) => [
      color,
      Array.isArray(images) ? images.filter(Boolean).map((image) => getImageUrl(String(image))) : [],
    ]))
    : {};

  const rawColorSizes = (product as any).color_sizes;
  const rawSizes = (product as any).sizes ?? product.size;
  const colorSizes = rawColorSizes && typeof rawColorSizes === "object"
    ? Object.fromEntries(Object.entries(rawColorSizes).map(([color, sizes]) => [
      color,
      Array.isArray(sizes) ? sizes.map((size) => String(size).trim()).filter(Boolean) : [],
    ]))
    : {};
  let sizeOptions: string[] | null = null;
  if (Array.isArray(rawSizes)) {
    sizeOptions = rawSizes
      .map((s: any) => typeof s === "object" ? s.size : s)
      .map((s: any) => String(s ?? "").trim())
      .filter(Boolean);
  } else if (typeof rawSizes === "string" && /[,/|-]/.test(rawSizes)) {
    sizeOptions = rawSizes
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (!sizeOptions?.length && typeof product.size === "string" && product.size.trim()) sizeOptions = [product.size.trim()];

  return {
    ...product,
    imageList,
    categoryName: typeof product.category === "object" ? product.category.name : product.category || "Calzado",
    subcategoryName: typeof (product as any).subcategory === "object"
      ? (product as any).subcategory.name
      : (product as any).subcategory || "Sin subcategoría",
    brandName: typeof product.brand === "object" ? product.brand.name : product.brand || "Sin marca",
    salePrice: Number(product.discounted_price || product.price),
    ratingValue: Number(product.rating || 0),
    colorOptions,
    colorImages,
    colorSizes,
    sizeOptions,
  };
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, cartCount } = useCart();
  const zoomDialog = useRef<HTMLDialogElement>(null);
  const toastTimer = useRef<number>();
  const galleryTouch = useRef<{ x: number; y: number } | null>(null);
  const [shareMessage, setShareMessage] = useState("");
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);
  const [product, setProduct] = useState<any | null>(null);
  const [siteLogo, setSiteLogo] = useState<string>(brandLogo);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [toast, setToast] = useState<{ product: any } | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);

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
    let active = true;
    setError(false); setSelectedImage(0); setQuantity(1); setVariantError(null); setToast(null);
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getById(Number(productId));
        if (!active) return;
        const normalized = normalizeProduct((response.data as any)?.data || response.data);
        setProduct(normalized);
        if (normalized.id) {
          void analyticsService.track('product_view', Number(normalized.id)).catch(() => undefined);
        }
        setSelectedColor(normalized.colorOptions?.length === 1 ? normalized.colorOptions[0].name : normalized.colorOptions ? null : normalized.color || null);
        setSelectedSize(normalized.sizeOptions?.length === 1 ? normalized.sizeOptions[0] : null);
      } catch (loadError) {
        console.error("Error loading product detail:", loadError);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (productId) loadProduct();
    window.scrollTo(0, 0);
    return () => { active = false; };
  }, [productId]);

  if (loading) {
    return (
      <div className="product-detail-state">
        <div className="loading-spinner"></div>
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-state">
        <h1>Producto no encontrado</h1>
        <Link to="/" className="product-detail-back">Volver a la tienda</Link>
      </div>
    );
  }

  const hasDiscount = Number(product.discounted_price) > 0 && Number(product.discounted_price) < Number(product.price);
  const stock = Number(product.stock || 0);
  const discountPercentage = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.discounted_price)) / Number(product.price)) * 100)
    : 0;

  const selectedColorImages = selectedColor ? product.colorImages?.[selectedColor] : null;
  const activeImageList = selectedColorImages?.length ? selectedColorImages : product.imageList;
  const selectedColorSizes = selectedColor ? product.colorSizes?.[selectedColor] : null;
  const activeSizeOptions = selectedColorSizes?.length ? selectedColorSizes : product.sizeOptions;

  const stockForSize = (sizeOption: string) => {
    const exactVariant = product.variant_stocks?.find(
      (item: any) =>
        String(item.size) === String(sizeOption) &&
        (!selectedColor || String(item.color).toLocaleLowerCase() === selectedColor.toLocaleLowerCase()),
    );
    if (exactVariant) return Number(exactVariant.stock || 0);

    const sizeRow = product.sizes?.find((item: any) => String(item.size) === String(sizeOption));
    return Number(sizeRow?.stock ?? stock);
  };

  const selectedStock = selectedSize ? stockForSize(selectedSize) : stock;

  const showPrevious = () => setSelectedImage((current) => (current - 1 + activeImageList.length) % activeImageList.length);
  const showNext = () => setSelectedImage((current) => (current + 1) % activeImageList.length);

  const addProductToCart = () => {
    const missingColor = Boolean(product.colorOptions && !selectedColor);
    const missingSize = Boolean(activeSizeOptions?.length && (!selectedSize || !activeSizeOptions.includes(selectedSize)));
    if (missingColor || missingSize) {
      setVariantError(`Selecciona ${missingSize ? "una talla" : ""}${missingSize && missingColor ? " y " : ""}${missingColor ? "un color" : ""} antes de continuar.`);
      return false;
    }
    const alreadyInCart = cart.filter(item => item.product.id === product.id).reduce((sum, item) => sum + item.quantity, 0);
    if (selectedStock < 1 || quantity + alreadyInCart > selectedStock) {
      setVariantError("La cantidad supera el stock disponible. Revisa tu carrito.");
      return false;
    }
    setVariantError(null);
    for (let index = 0; index < quantity; index += 1) {
      addToCart({
        ...product,
        image: activeImageList[0],
        price: product.salePrice,
        size: selectedSize,
        color: selectedColor,
      });
    }
    if (product.id) {
      void analyticsService.track('add_to_cart', Number(product.id), {
        color: selectedColor,
        size: selectedSize,
        quantity,
      }).catch(() => undefined);
    }
    setToast({ product });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
    return true;
  };

  const buyNow = () => {
    if (addProductToCart()) {
      if (product.id) {
        void analyticsService.track('checkout_start', Number(product.id)).catch(() => undefined);
      }
      navigate('/checkout');
    }
  };

  const shareProduct = async () => {
    try {
      if (navigator.share) await navigator.share({ title: product.name, url: window.location.href });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(window.location.href); setShareMessage("Enlace copiado."); }
      else setShareMessage("Copia la dirección de esta página para compartir el producto.");
    } catch (error) {
      if ((error as DOMException).name !== "AbortError") setShareMessage("No se pudo compartir. Copia la dirección de esta página.");
    }
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite);

  const quantityChoices = Array.from({ length: Math.min(Math.max(selectedStock, 0), 10) }, (_, index) => index + 1);

  return (
    <main className="product-detail-page">
      <div className="pd-announcement"><Truck size={15} /> Envíos a todo México <span>•</span><ShieldCheck size={15} /> Pagos seguros</div>
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
              onClick={() => {
                setToast(null);
                navigate('/', { state: { openCart: true } });
              }}
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
                border: 'none', background: 'transparent', color: '#777',
                cursor: 'pointer', fontSize: '20px', lineHeight: 1, padding: 0,
              }}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* HEADER */}
      <header className="product-detail-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Volver" className="back-button">
          <ArrowLeft size={19} />
        </button>

        <Logo src={siteLogo} />

        <div className="header-actions">
          <button type="button" className="favorite-button" onClick={toggleFavorite} aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"} aria-pressed={isFavorite}>
            <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button type="button" className="share-button" onClick={shareProduct} aria-label="Compartir">
            <Share2 size={19} />
          </button>
          <Link to="/" className="shop-link">
            <ShoppingBag size={19} /> Tienda <span className="pd-cart-count">{cartCount}</span>
          </Link>
        </div>
      </header>

      {shareMessage && <p role="status" className="pd-share-message">{shareMessage}</p>}
      <div className="product-detail-shell">
        {/* BREADCRUMB */}
        <nav className="product-detail-breadcrumb">
          <Link to="/">Inicio</Link>
          <span>›</span>
          <Link to={`/categoria/${product.categoryName?.toLowerCase()}`}>{product.categoryName}</Link>
          <span>›</span>
          <Link to={`/categoria/${product.categoryName?.toLowerCase()}?tipo=${encodeURIComponent(product.subcategoryName?.toLowerCase().replace(/\\s+/g, "-"))}`}>{product.subcategoryName}</Link>
          <span>›</span>
          <strong>{product.name}</strong>
        </nav>

        {/* CONTENIDO: 3 columnas — galería / información / caja de compra */}
        <section className="product-detail-content">
          {/* Columna 1: Galería */}
          <div className="product-gallery">
            <div className="product-thumbnails">
              {activeImageList.map((image: string, index: number) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={selectedImage === index ? "is-selected" : ""}
                  aria-label={`Ver imagen ${index + 1}`}
                  aria-pressed={selectedImage === index}
                  onMouseEnter={() => setSelectedImage(index)}
                  onFocus={() => setSelectedImage(index)}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image || fallbackImage} alt={`${product.name} vista ${index + 1}`} loading="lazy" decoding="async" onError={applyProductImageFallback} />
                </button>
              ))}
            </div>
            <div className="product-main-image"
              onTouchStart={event => { galleryTouch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
              onTouchCancel={() => { galleryTouch.current = null; }}
              onTouchEnd={event => { if (galleryTouch.current) { const dx = event.changedTouches[0].clientX - galleryTouch.current.x; const dy = event.changedTouches[0].clientY - galleryTouch.current.y; if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { if (dx > 0) showPrevious(); else showNext(); } } galleryTouch.current = null; }}>
              {hasDiscount && (
                <span className="product-detail-discount">-{discountPercentage}%</span>
              )}
              <button type="button" className="icon-share-floating" onClick={shareProduct} aria-label="Compartir producto">
                <Share2 size={16} />
              </button>
              <button className="pd-zoom-trigger" aria-label="Ampliar imagen del producto" onClick={() => zoomDialog.current?.showModal()}>
                <img src={activeImageList[selectedImage] || activeImageList[0] || fallbackImage} alt={product.name} decoding="async" onError={applyProductImageFallback} />
                <span><ZoomIn size={16} /> Ampliar imagen</span>
              </button>
              <span className="pd-image-counter">{selectedImage + 1} / {activeImageList.length}</span>
              {activeImageList.length > 1 && (
                <>
                  <button type="button" className="gallery-arrow gallery-arrow-left" onClick={showPrevious} aria-label="Imagen anterior">
                    <ChevronLeft />
                  </button>
                  <button type="button" className="gallery-arrow gallery-arrow-right" onClick={showNext} aria-label="Imagen siguiente">
                    <ChevronRight />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="product-information">
            {product.brandName && (
              <p className="product-brand-link">
                Visita la categoría de <Link to={`/categoria/${product.categoryName?.toLowerCase()}`}>{product.categoryName}</Link>
              </p>
            )}
            <h1>{product.name}</h1>

            <div className="product-rating" aria-label={`${product.ratingValue} de 5 estrellas`}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={17}
                  fill={index < Math.round(product.ratingValue) ? "currentColor" : "none"}
                />
              ))}
              <span>{product.reviews || 0} reseñas</span>
            </div>

            <div className="product-detail-divider" />

            {variantError && (
              <p role="alert" style={{ margin: "0 0 16px", padding: "10px 12px", color: "#a40000", background: "#fff0f0", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>
                {variantError}
              </p>
            )}

            <div className="product-prices">
              {hasDiscount && <span className="promotion-label">Promoción</span>}
              <div className="product-price-line">
                {hasDiscount && <span className="discount-percentage">-{discountPercentage}%</span>}
                <strong>{money.format(product.salePrice)}</strong>
              </div>
              {hasDiscount && (
                <p className="list-price">Precio de lista: <del>{money.format(Number(product.price))}</del></p>
              )}
            </div>

            {(product.colorOptions || product.color) && (
              <div className="variant-block">
                <p className="variant-label">
                  Color:{" "}
                  <strong>
                    {product.colorOptions
                      ? product.colorOptions.find((c: any) => c.name === selectedColor)?.name || selectedColor
                      : product.color}
                  </strong>
                </p>
                <div className="swatch-row">
                  {(product.colorOptions || [{ name: product.color, hex: product.colorHex || "#888" }]).map(
                    (colorOption: any) => (
                      <button
                        type="button"
                        key={colorOption.name}
                        className={`color-swatch ${selectedColor === colorOption.name ? "is-selected" : ""}`}
                        style={{ backgroundColor: colorOption.hex || "#888" }}
                        title={colorOption.name}
                        aria-label={colorOption.name}
                        aria-pressed={selectedColor === colorOption.name}
                        disabled={!product.colorOptions}
                        onClick={() => {
                          setSelectedColor(colorOption.name);
                          const sizes = product.colorSizes?.[colorOption.name]?.length ? product.colorSizes[colorOption.name] : product.sizeOptions;
                          setSelectedSize(sizes?.length === 1 ? sizes[0] : null);
                          setVariantError(null);
                          setSelectedImage(0);
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Selector de talla: real si product.sizeOptions viene del backend, si no, valor informativo */}
            {(activeSizeOptions || product.size) && (
              <div className="variant-block">
                <p className="variant-label">Talla: <strong>{selectedSize || "Selecciona tu talla"}</strong></p>
                <div className="size-grid">
                  {(activeSizeOptions || [product.size]).map((sizeOption: string) => (
                    <div className="size-option" key={sizeOption}>
                      <button
                        type="button"
                        className={`size-chip ${selectedSize === sizeOption ? "is-selected" : ""}`}
                        disabled={!activeSizeOptions || stockForSize(sizeOption) < 1}
                        aria-disabled={!activeSizeOptions || stockForSize(sizeOption) < 1}
                        aria-pressed={selectedSize === sizeOption}
                        title={stockForSize(sizeOption) > 0 ? `${stockForSize(sizeOption)} unidades disponibles` : 'Talla agotada'}
                        onClick={() => { if (activeSizeOptions && stockForSize(sizeOption) > 0) { setSelectedSize(sizeOption); setQuantity(1); setVariantError(null); } }}
                      >
                        {sizeOption}
                      </button>
                      <small className="size-option__stock">
                        {stockForSize(sizeOption) > 0 ? `${stockForSize(sizeOption)} disp.` : 'Agotado'}
                      </small>
                    </div>
                  ))}
                </div>
                {selectedSize && (
                  <p className="variant-stock" role="status">
                    Stock disponible para {selectedColor ? `${selectedColor} / ` : ''}talla {selectedSize}: <strong>{selectedStock}</strong>
                  </p>
                )}
              </div>
            )}

          <aside className="buy-box">
            <div className="buy-box-price">
              <strong>{money.format(product.salePrice)}</strong>
              {hasDiscount && <del>{money.format(Number(product.price))}</del>}
            </div>

            <p className="buy-box-availability">
              {selectedStock > 0 ? (
                <span className="in-stock">{selectedStock > 5 ? "Disponible" : `Solo quedan ${selectedStock}`}</span>
              ) : (
                <span className="out-of-stock">Agotado</span>
              )}
            </p>

            {product.id && <p className="buy-box-code">Código: {product.id}</p>}

            {selectedStock > 0 && (
              <label className="buy-box-quantity">
                Cantidad
                <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                  {(quantityChoices.length ? quantityChoices : [1]).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
            )}

            <button type="button" className="buy-box-cart" disabled={selectedStock < 1} onClick={addProductToCart}>
              {selectedStock > 0 ? "Agregar al carrito" : "Agotado"}
            </button>
            <button type="button" className="buy-box-now" disabled={selectedStock < 1} onClick={buyNow}>
              Comprar ahora
            </button>

            <div className="buy-box-meta">
              <div><span>Vendido por</span><strong>Zapatería Angelita</strong></div>
              <div><span>Devoluciones</span><strong>Consulta condiciones</strong></div>
            </div>
          </aside>

            <div className="trust-icons">
              <div><ShieldCheck size={20} /><span>Pago protegido</span></div>
              <div><RotateCcw size={20} /><span>Cambios y devoluciones</span></div>
              <div><Truck size={20} /><span>Enviado por Angelita</span></div>
            </div>

            <div className="product-description">
              <h2>Descripción</h2>
              <p>{product.description || "Este producto combina estilo, comodidad y calidad para acompañarte en cada paso."}</p>
            </div>

            <div className="product-specifications">
              <h2>Detalles del producto</h2>
              <div className="product-specification-table">
                <div><span>Nombre</span><strong>{product.name}</strong></div>
                <div><span>Categoría</span><strong>{product.categoryName}</strong></div>
                <div><span>Subcategoría</span><strong>{product.subcategoryName}</strong></div>
                <div><span>Marca</span><strong>{product.brandName}</strong></div>
                <div><span>Talla</span><strong>{selectedSize || "No especificada"}</strong></div>
                <div><span>Color</span><strong>{selectedColor || "No especificado"}</strong></div>
                <div><span>Material</span><strong>{product.material || "No especificado"}</strong></div>
                <div><span>Cantidad disponible</span><strong>{selectedStock} unidades</strong></div>
                <div><span>Reseñas</span><strong>{product.reviews || 0}</strong></div>
              </div>
            </div>
          </div>


        </section>
      </div>
      <div className="pd-mobile-bar">
        <div><small>Precio en MXN</small><strong>{money.format(product.salePrice)}</strong></div>
        <button type="button" disabled={selectedStock < 1} onClick={addProductToCart}><ShoppingBag size={18} />{selectedStock > 0 ? 'Agregar al carrito' : 'Agotado'}</button>
      </div>
      <dialog ref={zoomDialog} className="pd-zoom-dialog" aria-label="Imagen ampliada del producto">
        <button className="pd-zoom-close" onClick={() => zoomDialog.current?.close()} aria-label="Cerrar imagen ampliada"><X /></button>
        <img src={activeImageList[selectedImage] || activeImageList[0] || fallbackImage} alt={product.name} decoding="async" onError={applyProductImageFallback} />
        <div><button onClick={showPrevious} aria-label="Vista anterior"><ChevronLeft /></button><span>{selectedImage + 1} / {activeImageList.length}</span><button onClick={showNext} aria-label="Vista siguiente"><ChevronRight /></button></div>
      </dialog>
    </main>
  );
}
