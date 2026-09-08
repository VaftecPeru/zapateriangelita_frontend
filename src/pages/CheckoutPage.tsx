import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PackageCheck, ShoppingBag } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useUbigeo } from "../hooks/useUbigeo";
import apiClient from "../services/apiClient";
import PaymentModal from "../components/PaymentModal";
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
  phone: "",
  country: "México",
  state: "",
  municipality: "",
  city: "",
  postal_code: "",
  address: "",
  reference: "",
};

const CheckoutPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
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
    if (!isAuthenticated) return;
    apiClient.get<any[]>("/addresses")
      .then(({ data }) => {
        const defaultAddress = data.find((a) => a.is_default) || data[0];
        if (defaultAddress) {
          setForm((c) => ({
            ...c,
            ...defaultAddress,
            full_name: defaultAddress.full_name || "",
            phone: defaultAddress.phone || "",
            state: defaultAddress.state || "",
            municipality: defaultAddress.municipality || "",
            city: defaultAddress.city || "",
            postal_code: defaultAddress.postal_code || "",
            address: defaultAddress.address || "",
            reference: defaultAddress.reference || "",
          }));
        }
      })
      .catch(() => undefined);
  }, [isAuthenticated]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((c) => ({ ...c, [field]: value }));
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
      // ✅ LOG 1: Verificar el carrito
      console.log("🛒 Carrito completo:", JSON.stringify(cart, null, 2));
      console.log("📊 Total del carrito:", cartTotal);
      console.log("📝 Datos del formulario:", JSON.stringify(form, null, 2));

      // ✅ Validar que el carrito no esté vacío
      if (!cart || cart.length === 0) {
        setError("Tu carrito está vacío");
        setSubmitting(false);
        return;
      }

      // ✅ Validar que los productos tengan ID
      const invalidProducts = cart.filter(item => !item.product?.id);
      if (invalidProducts.length > 0) {
        console.error("❌ Productos sin ID:", invalidProducts);
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
        shipping_address: form.address?.trim() || "",
        shipping_city: form.city?.trim() || "",
        shipping_phone: form.phone?.trim() || "",
        shipping_country: form.country?.trim() || "México",
        shipping_state: form.state?.trim() || "",
        shipping_municipality: form.municipality?.trim() || "",
        shipping_postal_code: form.postal_code?.trim() || "",
        payment_method: "card",
      };

      // ✅ LOG 2: Datos a enviar al backend
      console.log("📦 Enviando al backend:", JSON.stringify(orderPayload, null, 2));

      // ✅ Guardar dirección si está autenticado
      if (isAuthenticated) {
        try {
          await apiClient.post("/addresses", { ...form, is_default: true });
          console.log("✅ Dirección guardada");
        } catch (addressError) {
          console.warn("⚠️ No se pudo guardar la dirección:", addressError);
        }
      }

      // ✅ Enviar la orden
      const orderResponse = await apiClient.post("/orders", orderPayload);
      
      // ✅ LOG 3: Respuesta exitosa
      console.log("✅ Orden creada:", orderResponse.data);

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
      // ✅ LOG 4: Error detallado
      console.error("❌ Error completo:", err);
      console.error("📋 Response data:", err.response?.data);
      console.error("📊 Status code:", err.response?.status);
      
      // ✅ Mostrar mensaje de error detallado
      let errorMessage = "No pudimos registrar tu pedido. ";
      
      if (err.response?.data?.errors) {
        // Errores de validación de Laravel
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(" ");
        errorMessage += errorMessages;
        console.error("🔍 Errores de validación:", errors);
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

  const handlePaymentSuccess = (paymentData: { paymentMethod: string; customerName: string }) => {
    console.log("Pago exitoso:", paymentData);
    clearCart();
    setShowPayment(false);
    setOrderData(null);
    setNotice("¡Tu pago ha sido procesado exitosamente! Recibirás un correo con los detalles de tu pedido.");
  };

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
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px 60px" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "7px", textDecoration: "none", marginBottom: "24px", color: "#333", fontSize: "14px", fontWeight: 500 }}>
          <ArrowLeft size={17} /> Volver a la tienda
        </Link>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, .8fr)", gap: "28px", alignItems: "start" }}>
          
          <form onSubmit={placeOrder} style={cardStyle}>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>Finaliza tu compra</h1>
            <p style={{ color: "#666", margin: "8px 0 24px", fontSize: "14px" }}>Completa tus datos de envío para registrar tu pedido.</p>
            
            {error && <p role="alert" style={{ padding: "12px", color: "#a40000", background: "#fff0f0", fontSize: "14px", borderRadius: "8px" }}>{error}</p>}
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label style={labelStyle}>Nombre completo *
                <input 
                  required 
                  value={form.full_name || ""} 
                  onChange={(e) => updateField("full_name", e.target.value)} 
                  style={inputStyle} 
                />
              </label>
              <label style={labelStyle}>Teléfono *
                <input 
                  required 
                  value={form.phone || ""} 
                  onChange={(e) => updateField("phone", e.target.value)} 
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
                  onChange={(e) => setForm((c) => ({ ...c, state: e.target.value, municipality: "", city: "" }))} 
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
                  onChange={(e) => setForm((c) => ({ ...c, municipality: e.target.value, city: "" }))} 
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Seleccionar</option>
                  {municipalities.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label style={labelStyle}>Ciudad *
                <select 
                  required 
                  value={form.city || ""} 
                  disabled={!form.municipality || ubigeoLoading} 
                  onChange={(e) => updateField("city", e.target.value)} 
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Seleccionar</option>
                  {cities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              
              <div style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "14px" }}>
                <label style={labelStyle}>Código postal *
                  <input 
                    required 
                    inputMode="numeric" 
                    value={form.postal_code || ""} 
                    onChange={(e) => updateField("postal_code", e.target.value)} 
                    style={inputStyle} 
                  />
                </label>
                <label style={labelStyle}>Dirección *
                  <input 
                    required 
                    value={form.address || ""} 
                    onChange={(e) => updateField("address", e.target.value)} 
                    placeholder="Calle, número y colonia" 
                    style={inputStyle} 
                  />
                </label>
              </div>

              <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>Referencia (opcional)
                <input 
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
          </form>
          
          <aside style={cardStyle}>
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
          onClose={() => {
            setShowPayment(false);
            setOrderData(null);
          }}
          onBack={() => {
            setShowPayment(false);
          }}
          onPay={handlePaymentSuccess}
        />
      )}
    </main>
  );
};

export default CheckoutPage;