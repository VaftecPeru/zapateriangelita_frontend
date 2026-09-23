import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate} from "react-router-dom";
import { ArrowLeft, PackageCheck, ShoppingBag } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useUbigeo } from "../hooks/useUbigeo";
import { getSuggestedCity, isValidColony, isValidMexicoPostalCode } from "../utils/checkoutAddress";
import apiClient from "../services/apiClient";
import PaymentModal, { OpenpayChargeResult, getFriendlyPaymentError } from "../components/PaymentModal";
import "../styles/checkout.css";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const baseFont = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" };

const inputStyle = {
  width: "100%",
  display: "block",
  marginTop: "6px",
  padding: "11px 12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxSizing: "border-box" as const,
  fontSize: "14px",
  fontFamily: baseFont.fontFamily,
  background: "#fff",
  color: "#1a1a1a",
  transition: "border-color 0.2s ease",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#333",
  fontFamily: baseFont.fontFamily,
};

const flexCenter = { display: "grid", placeItems: "center" };
const cardStyle = { padding: "28px", background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.06)" };

const initialFormState = {
  full_name: "",
  email: "",
  phone: "",
  country: "México",
  state: "",
  municipality: "",
  city: "",
  postal_code: "",
  colony: "",
  address: "",
  reference: "",
};

const onlyLettersAndSpaces = (value: string) => value.replace(/[^\p{L}\s]/gu, "");
const onlyDigits = (value: string) => value.replace(/\D/g, "");

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [showPayment, setShowPayment] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string | number;
    total: number;
    customerName: string;
  } | null>(null);
  const { states, municipalities, cities, loading: ubigeoLoading } = useUbigeo(form.state, form.municipality);

  useEffect(() => {
    const suggestedCity = getSuggestedCity(cities, form.city);
    if (!suggestedCity) return;

    setForm((current) => {
      if (!current.municipality || current.city.trim()) return current;
      return { ...current, city: suggestedCity };
    });
  }, [form.municipality, form.city, cities]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setForm((current) => ({ ...current, email: user?.email || current.email }));
    apiClient.get<any[]>("/addresses")
      .then(({ data }) => {
        const defaultAddress = data.find((a) => a.is_default) || data[0];
        if (defaultAddress) {
          setForm((c) => ({
            ...c,
            ...defaultAddress,
            full_name: defaultAddress.full_name || "",
            email: user?.email || "",
            phone: defaultAddress.phone || "",
            state: defaultAddress.state || "",
            municipality: defaultAddress.municipality || "",
            city: defaultAddress.city || "",
            postal_code: defaultAddress.postal_code || "",
            colony: defaultAddress.colony || "",
            address: defaultAddress.address || "",
            reference: defaultAddress.reference || "",
          }));
        }
      })
      .catch(() => undefined);
  }, [isAuthenticated, user?.email]);
  useEffect(() => {
    if (authLoading) return;
    const params = new URLSearchParams(location.search);
    const openpayReturn = params.get("openpay_return");
    const orderId = params.get("order_id");
    const transactionId = params.get("id");
    if (openpayReturn !== "1") { return;}
    const cleanOpenpayUrl = () => {
      navigate("/checkout", {replace: true});
    };
    if (!isAuthenticated) {
      setError("Tu sesión no está disponible para verificar el pago.");
      cleanOpenpayUrl();
      return;
    }

    if (!orderId || !transactionId) {
      setError( "Openpay regresó sin la información necesaria para verificar el pago." );
      cleanOpenpayUrl();
      return;
    }

    let cancelled = false;
    const verifyPayment = async () => {
      setVerifyingPayment(true);
      setError(null);
      try {
        const { data } = await apiClient.get(
          "/payments/openpay/verify",
          {
            params: {order_id: Number(orderId), transaction_id: transactionId},
          }
        );

        if (cancelled) return;
        console.log( "Resultado verificación Openpay:", data );

        if (data.payment_status === "paid") {
          clearCart();
          setShowPayment(false);
          setOrderData(null);
          setNotice( "Recibimos tu pago. ¡Gracias por tu compra!");
          return;
        }

        if (data.payment_status === "processing") {
          setError( "Openpay todavía está procesando tu pago. No vuelvas a realizarlo." );
          return;
        }

        const friendly = getFriendlyPaymentError(data.error_code, data.message);
        setError(`${friendly.title}: ${friendly.message}`);

      } catch (err: any) {
        console.error( "Error verificando Openpay:", err);

        if (!cancelled) {
          const data = err.response?.data;
          const friendly = getFriendlyPaymentError(
            data?.error_code ?? err.response?.status,
            data?.message ?? err.message
          );
          setError(`${friendly.title}: ${friendly.message}`);
        }

      } finally {
        if (!cancelled) {
          setVerifyingPayment(false);
          cleanOpenpayUrl();
        }
      }
    };
    verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [
    location.search,
    authLoading,
    isAuthenticated
  ]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((c) => ({ ...c, [field]: value }));
  };

  const validateCheckoutForm = () => {
    const name = form.full_name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const postalCode = form.postal_code.trim();
    const address = form.address.trim();

    if (!name || !/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u.test(name)) {
      return "Ingresa un nombre válido usando solo letras, espacios, apóstrofes o guiones.";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Ingresa un correo electrónico válido.";
    }
    if (!/^\d{7,20}$/.test(phone)) {
      return "El teléfono debe contener entre 7 y 20 números.";
    }
    if (!form.country || !form.state || !form.municipality || !form.city) {
      return "Selecciona país, estado, municipio y ciudad.";
    }
    if (!/^\d{4,20}$/.test(postalCode)) {
      return "El código postal debe contener entre 4 y 20 números.";
    }
    if (address.length < 5 || address.length > 255) {
      return "Ingresa una dirección válida de entre 5 y 255 caracteres.";
    }
    if (form.reference.trim().length > 200) {
      return "La referencia no puede superar los 200 caracteres.";
    }
    return null;
  };

  const getValidSize = (product: any) => {
    const rawSize = typeof product.size === "object" ? product.size?.size : product.size;
    if (typeof rawSize !== "string") return undefined;
    const size = rawSize.trim();
    return size && size.length <= 10 && !/[,/|-]/.test(size) ? size : undefined;
  };

  const getValidColor = (product: any) => {
    const rawColor = typeof product.color === "object"
      ? product.color?.name || product.color?.color
      : product.color;
    if (typeof rawColor !== "string") return undefined;
    const color = rawColor.trim();
    return color && color.length <= 50 ? color : undefined;
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const formError = validateCheckoutForm();
      if (formError) {
        setError(formError);
        return;
      }

      if (!cart || cart.length === 0) {
        setError("Tu carrito está vacío");
        setSubmitting(false);
        return;
      }

      // ✅ Validar que los productos tengan ID
      const invalidProducts = cart.filter(item => !item.product?.id);
      if (invalidProducts.length > 0) {
        setError(`Los siguientes productos no tienen ID: ${invalidProducts.map(i => i.product?.name || 'Desconocido').join(', ')}`);
        setSubmitting(false);
        return;
      }

      // ✅ Preparar los items de la orden
      const orderItems = cart.map((item) => {
        const productId = Number(item.product.id);
        if (!productId || isNaN(productId)) {
          throw new Error(`Producto "${item.product.name}" tiene ID inválido: ${item.product.id}`);
        }

        const itemData: any = {
          product_id: productId,
          quantity: Number(item.quantity),
        };

        const size = getValidSize(item.product);
        if (size) {
          itemData.size = size;
        }

        const color = getValidColor(item.product);
        if (color) {
          itemData.color = color;
        }

        return itemData;
      });

      // ✅ Preparar datos completos de la orden
      const orderPayload = {
        items: orderItems,
        customer_name: form.full_name?.trim() || "",
        customer_email: form.email?.trim() || null,
        shipping_address: form.address?.trim() || "",
        shipping_city: form.city?.trim() || "",
        shipping_phone: form.phone?.trim() || "",
        shipping_country: form.country?.trim() || "México",
        shipping_state: form.state?.trim() || "",
        shipping_municipality: form.municipality?.trim() || "",
        shipping_postal_code: form.postal_code?.trim() || "",
        shipping_colony: form.colony?.trim() || "",
        payment_method: "openpay",
      };

      if (isAuthenticated) {
        try {
          await apiClient.post("/addresses", { ...form, is_default: true });
        } catch {
        }
      }

      const orderResponse = await apiClient.post("/orders", orderPayload);

      const newOrderId = orderResponse.data?.id || orderResponse.data?.order_id;
      
      if (!newOrderId) {
        throw new Error("No se recibió ID de la orden");
      }

      setOrderData({
        orderId: newOrderId,
        total: cartTotal,
        customerName: form.full_name,
      });

      setShowPayment(true);

    } catch (err: any) {
      let errorMessage = "No pudimos registrar tu pedido. ";
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(" ");
        errorMessage += errorMessages;
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += err.message || "Error desconocido";
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (result: OpenpayChargeResult) => {
  console.log("Pago Openpay exitoso:", result);

  clearCart();
  setShowPayment(false);
  setOrderData(null);

  setNotice(
    "Recibimos tu pago. ¡Gracias por tu compra!"
  );
};
  if (verifyingPayment) {
    return (
      <main style={{ minHeight: "70vh", ...flexCenter, ...baseFont }}>
        <div style={{ textAlign: "center" }}>
          <h1>Verificando pago</h1>
          <p style={{ color: "#666" }}> Estamos confirmando tu transacción con Openpay... </p>
        </div>
      </main>
    );
  }
  if (authLoading) return <main style={{ minHeight: "60vh", ...flexCenter, ...baseFont }}>Cargando checkout...</main>;

  if (cart.length === 0 && !notice) {
    return (
      <main style={{ minHeight: "70vh", ...flexCenter, padding: "32px", ...baseFont }}>
        <div style={{ textAlign: "center" }}>
          <ShoppingBag size={42} style={{ margin: "0 auto 14px" }} />
          <h1 style={{ fontSize: "28px" }}>Tu carrito está vacío</h1>
          <p style={{ color: "#666" }}>Agrega productos para continuar con tu compra.</p>
          <Link to="/" style={{ color: "#e30613", fontWeight: 700 }}>Volver a la tienda</Link>
        </div>
      </main>
    );
  }

  if (notice) {
    return (
      <main style={{ minHeight: "70vh", ...flexCenter, padding: "32px", ...baseFont }}>
        <div style={{ textAlign: "center", maxWidth: "420px" }}>
          <PackageCheck size={48} color="#2e7d32" style={{ margin: "0 auto 14px" }} />
          <h1 style={{ fontSize: "28px" }}>¡Compra confirmada!</h1>
          <p style={{ color: "#333" }}>{notice}</p>
          <Link to="/" style={{ display: "inline-block", marginTop: "12px", padding: "12px 22px", background: "#121212", color: "#fff", textDecoration: "none", fontWeight: 600, borderRadius: "8px" }}>
            Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ ...baseFont }}>
      <div className="checkout-page__content" style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px 60px" }}>
        <Link className="checkout-page__back" to="/" style={{ display: "inline-flex", alignItems: "center", gap: "7px", textDecoration: "none", marginBottom: "24px", color: "#333", fontSize: "14px", fontWeight: 500 }}>
          <ArrowLeft size={17} /> Volver a la tienda
        </Link>
        <div className="checkout-page__grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, .8fr)", gap: "28px", alignItems: "start" }}>
          
          <form className="checkout-page__panel" onSubmit={placeOrder} style={cardStyle}>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>Finaliza tu compra</h1>
            <p style={{ color: "#666", margin: "8px 0 24px", fontSize: "14px" }}>Completa tus datos de envío para registrar tu pedido.</p>
            
            {error && <p role="alert" style={{ padding: "12px", color: "#a40000", background: "#fff0f0", fontSize: "14px", borderRadius: "8px" }}>{error}</p>}
            
            <div className="checkout-page__fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label style={labelStyle}>Nombre completo *
                <input 
                  required 
                  maxLength={150}
                  value={form.full_name || ""} 
                  onChange={(e) => updateField("full_name", onlyLettersAndSpaces(e.target.value))} 
                  style={inputStyle} 
                />
              </label>
              <label style={labelStyle}>Teléfono *
                <input 
                  required 
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{7,20}"
                  maxLength={20}
                  value={form.phone || ""} 
                  onChange={(e) => updateField("phone", onlyDigits(e.target.value))} 
                  style={inputStyle} 
                />
              </label>
              <label style={labelStyle}>Correo electrónico *
                <input
                  required
                  type="email"
                  maxLength={255}
                  value={form.email || ""}
                  onChange={(e) => updateField("email", e.target.value)}
                  autoComplete="email"
                  style={inputStyle}
                />
              </label>
              
              <label style={labelStyle}>País *
                <select 
                  required 
                  value={form.country || "México"} 
                  onChange={(e) => updateField("country", e.target.value)} 
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option>México</option>
                </select>
              </label>
              <label style={labelStyle}>Estado *
                <select 
                  required 
                  value={form.state || ""} 
                  disabled={ubigeoLoading} 
                  onChange={(e) => setForm((c) => ({ ...c, state: e.target.value, municipality: "", city: "", postal_code: "", colony: "" }))} 
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Seleccionar</option>
                  {states.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              
              <label style={labelStyle}>Municipio *
                <select 
                  required 
                  value={form.municipality || ""} 
                  disabled={!form.state || ubigeoLoading} 
                  onChange={(e) => setForm((c) => ({ ...c, municipality: e.target.value, city: "", postal_code: "", colony: "" }))} 
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Seleccionar</option>
                  {municipalities.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label style={labelStyle}>Ciudad / Localidad *
                <input
                  required
                  list="checkout-city-suggestions-legacy"
                  value={form.city || ""}
                  disabled={!form.municipality || ubigeoLoading}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="Escribe tu ciudad o localidad"
                  maxLength={100}
                  style={inputStyle}
                />
                <datalist id="checkout-city-suggestions-legacy">
                  {cities.map((c) => <option key={c} value={c} />)}
                </datalist>
              </label>
              
              <div className="checkout-page__address-fields" style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <label style={labelStyle}>Código postal *
                  <input
                    required
                    inputMode="numeric"
                    pattern="[0-9]{5}"
                    maxLength={5}
                    value={form.postal_code || ""}
                    onChange={(e) => updateField("postal_code", onlyDigits(e.target.value))}
                    placeholder="00000"
                    style={inputStyle}
                  />
                </label>
                <label style={labelStyle}>Colonia *
                  <input
                    required
                    maxLength={120}
                    value={form.colony || ""}
                    onChange={(e) => updateField("colony", e.target.value)}
                    placeholder="Ej. Centro"
                    autoComplete="address-level3"
                    style={inputStyle}
                  />
                </label>
              </div>
              <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Dirección *
                <input
                  required
                  minLength={5}
                  maxLength={255}
                  value={form.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="Calle y número"
                  autoComplete="street-address"
                  style={inputStyle}
                />
              </label>

              <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Referencia (opcional)
                <input 
                  maxLength={200}
                  value={form.reference || ""} 
                  onChange={(e) => updateField("reference", e.target.value)} 
                  style={inputStyle} 
                />
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={submitting} 
              style={{ 
                width: "100%", 
                marginTop: "22px", 
                padding: "16px", 
                background: "#e30613", 
                color: "#fff", 
                border: 0, 
                fontWeight: 700, 
                cursor: "pointer", 
                fontSize: "16px",
                borderRadius: "8px",
                transition: "background 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#bd0711"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#e30613"}
            >
              {submitting ? "Registrando pedido..." : `Confirmar compra · ${money.format(cartTotal)}`}
            </button>

            <p style={{ margin: "14px 0 0", color: "#666", fontSize: "12px", lineHeight: 1.5, textAlign: "center" }}>
              Al continuar, aceptas los{" "}
              <Link to="/terms" style={{ color: "#e30613", fontWeight: 700 }}>
                Términos y condiciones
              </Link>{" "}
              y el{" "}
              <Link to="/privacy" style={{ color: "#e30613", fontWeight: 700 }}>
                Aviso de privacidad
              </Link>.
            </p>
          </form>
          
          <aside className="checkout-page__summary" style={cardStyle}>
            <h2 style={{ marginTop: 0, fontSize: "20px", fontWeight: 700 }}>Resumen del pedido</h2>
            {cart.map((item) => (
              <div key={item.product.id} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eee" }}>
                <img src={item.product.image} alt="" style={{ width: "58px", height: "58px", objectFit: "cover", borderRadius: "4px" }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "14px" }}>{item.product.name}</strong>
                  <div style={{ color: "#666", fontSize: "12px", marginTop: "2px" }}>
                    {item.product.size ? `Talla: ${item.product.size}` : ""}
                    {item.product.color ? ` | Color: ${typeof item.product.color === "object" ? item.product.color.name : item.product.color}` : ""}
                  </div>
                  <div style={{ color: "#666", fontSize: "13px", marginTop: "3px" }}>{item.quantity} x {money.format(Number(item.product.price || 0))}</div>
                </div>
              </div>
            ))}
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              marginTop: "20px", 
              paddingTop: "16px",
              borderTop: "2px solid #eee",
              fontWeight: 700, 
              fontSize: "20px"
            }}>
              <span style={{ fontSize: "18px" }}>Total</span>
              <span style={{ 
                color: "#e30613", 
                fontSize: "24px",
                fontWeight: 800
              }}>
                {money.format(cartTotal)}
              </span>
            </div>
          </aside>
        </div>
      </div>
      {showPayment && orderData && (
        <PaymentModal
          isOpen={showPayment}
          total={orderData.total}
          cart={cart}
          customerName={orderData.customerName}
          customerEmail={form.email}
          onClose={() => {
            setShowPayment(false);
            setOrderData(null);
          }}
          onBack={() => {setShowPayment(false);}}

          onPay={async ({tokenId,deviceSessionId}) => {
            const { data } = await apiClient.post("/payments/openpay/charge",{
                order_id: orderData.orderId,
                token_id: tokenId,
                device_session_id: deviceSessionId,
              }
            );
            console.log("Respuesta Openpay:",data);
            return data;
          }}

          onSuccess={handlePaymentSuccess}
        />
      )}
    </main>
  );
};

export default CheckoutPage;