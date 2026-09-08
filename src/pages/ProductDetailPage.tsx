import { useEffect, useState } from "react";
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
} from "lucide-react";
import { productService, Product } from "../services/crudService";
import { getImageUrl } from "../config/api";
import { useCart } from "../hooks/useCart";
import fallbackImage from "../assets/foto1.jpg";
import "../styles/product-detail.css";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a className={`logo ${light ? "logo--light" : ""}`} href="/" aria-label="Zapatería Angelita - inicio">
      <span className="logo__small">Zapatería</span>
      <strong>ANGELITA</strong>
      <span className="logo__tagline">Calzando tus pies desde 1980</span>
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

  const rawSizes = (product as any).sizes ?? product.size;
  let sizeOptions: string[] | null = null;
  if (Array.isArray(rawSizes)) {
    sizeOptions = rawSizes
      .map((s: any) => typeof s === "object" ? s.size : s)
      .map((s: any) => String(s ?? "").trim())
      .filter(Boolean);
  } else if (typeof rawSizes === "string" && /[,/|-]/.test(rawSizes)) {
    sizeOptions = rawSizes
      .split(/[,/|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (sizeOptions && sizeOptions.length <= 1) sizeOptions = null;

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
    sizeOptions,
  };
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any | null>(null);
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
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getById(Number(productId));
        const normalized = normalizeProduct(response.data);
        setProduct(normalized);
        setSelectedColor(normalized.colorOptions?.length === 1 ? normalized.colorOptions[0].name : normalized.colorOptions ? null : normalized.color || null);
        setSelectedSize(normalized.sizeOptions ? null : normalized.size || null);
      } catch (loadError) {
        console.error("Error loading product detail:", loadError);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (productId) loadProduct();
    window.scrollTo(0, 0);
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

  const hasDiscount = Boolean(product.discounted_price && Number(product.discounted_price) > 0);
  const stock = Number(product.stock || 0);
  const discountPercentage = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.discounted_price)) / Number(product.price)) * 100)
    : 0;

  const showPrevious = () => setSelectedImage((current) => (current - 1 + product.imageList.length) % product.imageList.length);
  const showNext = () => setSelectedImage((current) => (current + 1) % product.imageList.length);

  const addProductToCart = () => {
    const missingColor = Boolean(product.colorOptions && !selectedColor);
    const missingSize = Boolean(product.sizeOptions && !selectedSize);
    if (missingColor || missingSize) {
      setVariantError(`Selecciona ${missingSize ? "una talla" : ""}${missingSize && missingColor ? " y " : ""}${missingColor ? "un color" : ""} antes de continuar.`);
      return;
    }
    setVariantError(null);
    for (let index = 0; index < quantity; index += 1) {
      addToCart({
        ...product,
        image: product.imageList[0],
        price: product.salePrice,
        size: selectedSize,
        color: selectedColor,
      });
    }
    setToast({ product });
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  };

  const buyNow = () => {
    addProductToCart();
    navigate('/', { state: { openCart: true } });
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite);

  const quantityChoices = Array.from({ length: Math.min(Math.max(stock, 0), 10) }, (_, index) => index + 1);

  return (
    <main className="product-detail-page">
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

        <Logo />

        <div className="header-actions">
          <button type="button" className="favorite-button" onClick={toggleFavorite} aria-label="Agregar a favoritos">
            <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
          </button>
          <button type="button" className="share-button" onClick={() => navigator.share?.({ title: product.name, url: window.location.href })} aria-label="Compartir">
            <Share2 size={19} />
          </button>
          <Link to="/" className="shop-link">
            <ShoppingBag size={19} /> Tienda
          </Link>
        </div>
      </header>

      <div className="product-detail-shell">
        {/* BREADCRUMB */}
        <nav className="product-detail-breadcrumb">
          <Link to="/">Inicio</Link>
          <span>›</span>
          <Link to={`/categoria/${product.categoryName?.toLowerCase()}`}>{product.categoryName}</Link>
          <span>›</span>
          <Link to={`/categoria/${product.categoryName?.toLowerCase()}/${product.subcategoryName?.toLowerCase()}`}>{product.subcategoryName}</Link>
          <span>›</span>
          <strong>{product.name}</strong>
        </nav>

        {/* CONTENIDO: 3 columnas — galería / información / caja de compra */}
        <section className="product-detail-content">
          {/* Columna 1: Galería */}
          <div className="product-gallery">
            <div className="product-thumbnails">
              {product.imageList.map((image: string, index: number) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={selectedImage === index ? "is-selected" : ""}
                  onMouseEnter={() => setSelectedImage(index)}
                  onFocus={() => setSelectedImage(index)}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} vista ${index + 1}`} />
                </button>
              ))}
            </div>
            <div className="product-main-image">
              {hasDiscount && (
                <span className="product-detail-discount">-{discountPercentage}%</span>
              )}
              <button type="button" className="icon-share-floating" onClick={() => navigator.share?.({ title: product.name, url: window.location.href })} aria-label="Compartir producto">
                <Share2 size={16} />
              </button>
              <img src={product.imageList[selectedImage]} alt={product.name} />
              {product.imageList.length > 1 && (
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
                        disabled={!product.colorOptions}
                        onClick={() => setSelectedColor(colorOption.name)}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Selector de talla: real si product.sizeOptions viene del backend, si no, valor informativo */}
            {(product.sizeOptions || product.size) && (
              <div className="variant-block">
                <p className="variant-label">Talla:</p>
                <div className="size-grid">
                  {(product.sizeOptions || [product.size]).map((sizeOption: string) => (
                    <button
                      type="button"
                      key={sizeOption}
                      className={`size-chip ${selectedSize === sizeOption ? "is-selected" : ""}`}
                      disabled={!product.sizeOptions}
                      aria-disabled={!product.sizeOptions}
                      onClick={() => product.sizeOptions && setSelectedSize(sizeOption)}
                    >
                      {sizeOption}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="trust-icons">
              <div><ShieldCheck size={20} /><span>Pago protegido</span></div>
              <div><RotateCcw size={20} /><span>30 días de devolución</span></div>
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
                <div><span>Stock disponible</span><strong>{stock} unidades</strong></div>
                <div><span>Reseñas</span><strong>{product.reviews || 0}</strong></div>
              </div>
            </div>
          </div>

          <aside className="buy-box">
            <div className="buy-box-price">
              <strong>{money.format(product.salePrice)}</strong>
              {hasDiscount && <del>{money.format(Number(product.price))}</del>}
            </div>

            <p className="buy-box-availability">
              {stock > 0 ? (
                <span className="in-stock">{stock > 5 ? "Disponible" : `Solo quedan ${stock}`}</span>
              ) : (
                <span className="out-of-stock">Agotado</span>
              )}
            </p>

            {product.id && <p className="buy-box-code">Código: {product.id}</p>}

            {stock > 0 && (
              <label className="buy-box-quantity">
                Cantidad
                <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                  {(quantityChoices.length ? quantityChoices : [1]).map((value) => (
                    <option key={value} value={value}>{value}</option>
                  ))}
                </select>
              </label>
            )}

            <button type="button" className="buy-box-cart" disabled={stock < 1} onClick={addProductToCart}>
              {stock > 0 ? "Agregar al carrito" : "Agotado"}
            </button>
            <button type="button" className="buy-box-now" disabled={stock < 1} onClick={buyNow}>
              Comprar ahora
            </button>

            <div className="buy-box-meta">
              <div><span>Vendido por</span><strong>Zapatería Angelita</strong></div>
              <div><span>Devoluciones</span><strong>30 días sin costo</strong></div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}