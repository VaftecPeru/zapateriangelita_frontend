import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, Star, Heart, Share2 } from "lucide-react";
import { productService, Product } from "../services/crudService";
import { useCart } from "../hooks/useCart";
import fallbackImage from "../assets/foto1.jpg";
import "../styles/product-detail.css";

const money = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
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
  const imageList = images.length ? images : product.img ? [product.img] : [fallbackImage];
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

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await productService.getById(Number(productId));
        setProduct(normalizeProduct(response.data));
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
    for (let index = 0; index < quantity; index += 1) {
      addToCart({ ...product, image: product.imageList[0], price: product.salePrice });
    }
    alert("Producto agregado al carrito.");
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite);

  return (
    <main className="product-detail-page">
      {/* HEADER */}
      <header className="product-detail-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Volver" className="back-button">
          <ArrowLeft size={19} />
        </button>
        
        {/* ✅ LOGO OFICIAL - COMO EN LA TIENDA */}
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

      {/* BREADCRUMB */}
      <div className="product-detail-shell">
        <nav className="product-detail-breadcrumb">
          <Link to="/">Inicio</Link>
          <span>›</span>
          <Link to={`/categoria/${product.categoryName?.toLowerCase()}`}>{product.categoryName}</Link>
          <span>›</span>
          <strong>{product.name}</strong>
        </nav>

        {/* CONTENIDO */}
        <section className="product-detail-content">
          {/* Galería */}
          <div className="product-gallery">
            <div className="product-thumbnails">
              {product.imageList.map((image: string, index: number) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={selectedImage === index ? "is-selected" : ""}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} vista ${index + 1}`} />
                </button>
              ))}
            </div>
            <div className="product-main-image">
              {hasDiscount && (
                <span className="product-detail-discount">
                  -{discountPercentage}%
                </span>
              )}
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

          {/* Información */}
          <div className="product-information">
            <span className="product-detail-category">{product.categoryName}</span>
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

            <p className="product-availability">
              Disponibilidad: <strong className={stock > 0 ? "in-stock" : "out-of-stock"}>
                {stock > 0 ? `${stock} en stock` : "Agotado"}
              </strong>
            </p>

            {product.id && <p className="product-code">Código: {product.id}</p>}

            <div className="product-detail-divider" />

            <dl className="product-attributes">
              {product.size && (
                <div>
                  <dt>Talla</dt>
                  <dd>{product.size}</dd>
                </div>
              )}
              <div>
                <dt>Subcategoría</dt>
                <dd>{product.subcategoryName}</dd>
              </div>
              {product.brandName && (
                <div>
                  <dt>Marca</dt>
                  <dd>{product.brandName}</dd>
                </div>
              )}
              {product.color && (
                <div>
                  <dt>Color</dt>
                  <dd>
                    <span className="color-dot" style={{ backgroundColor: product.colorHex || '#000' }} title={product.color} />
                    {product.color}
                  </dd>
                </div>
              )}
              {product.material && (
                <div>
                  <dt>Material</dt>
                  <dd>{product.material}</dd>
                </div>
              )}
              {product.gender && (
                <div>
                  <dt>Género</dt>
                  <dd>{product.gender}</dd>
                </div>
              )}
              {product.discount && (
                <div>
                  <dt>Descuento</dt>
                  <dd>{product.discount}</dd>
                </div>
              )}
            </dl>

            <div className="product-prices">
              {hasDiscount && <span className="promotion-label">Promoción</span>}
              <div className="product-price-line">
                {hasDiscount && <span className="discount-percentage">-{discountPercentage}%</span>}
                <strong>{money.format(product.salePrice)}</strong>
                {hasDiscount && <del>{money.format(Number(product.price))}</del>}
              </div>
            </div>

            <div className="product-purchase">
              <label>
                Cantidad
                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={15} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.min(Math.max(1, stock), value + 1))}
                    disabled={quantity >= stock}
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </label>
              <button
                type="button"
                className="buy-button"
                disabled={stock < 1}
                onClick={addProductToCart}
              >
                {stock > 0 ? "Agregar al carrito" : "Agotado"}
              </button>
            </div>


            <div className="product-benefits">
              <div><strong>Compra segura</strong><span>Pago protegido</span></div>
              <div><strong>Envío confiable</strong><span>Coordinamos tu entrega</span></div>
              <div><strong>Calidad Angelita</strong><span>Productos seleccionados</span></div>
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
                <div><span>Talla</span><strong>{product.size || "No especificada"}</strong></div>
                <div><span>Color</span><strong>{product.color || "No especificado"}</strong></div>
                <div><span>Material</span><strong>{product.material || "No especificado"}</strong></div>
                <div><span>Stock disponible</span><strong>{stock} unidades</strong></div>
                <div><span>Reseñas</span><strong>{product.reviews || 0}</strong></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}