import { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, ShoppingBag } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PaymentModal, { OpenpayChargeResult } from "../components/PaymentModal";
import EditableOrderSummary from "../components/EditableOrderSummary";
import PhoneField from "../components/PhoneField";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useUbigeo } from "../hooks/useUbigeo";
import { getSuggestedCity, isValidColony, isValidMexicoPostalCode } from "../utils/checkoutAddress";
import apiClient from "../services/apiClient";
import "../styles/checkout.css";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const DRAFT_KEY = "angelita_checkout_draft";
const LEGACY_TOKEN_KEY = "angelita_checkout_token";
const ORDER_KEY = "angelita_checkout_order_id";
const ORDER_TOKEN_PREFIX = "angelita_checkout_token_order_";

const tokenKeyForOrder = (orderId: number) => `${ORDER_TOKEN_PREFIX}${orderId}`;

const storeCheckoutSession = (orderId: number, checkoutToken: string) => {
  sessionStorage.setItem(tokenKeyForOrder(orderId), checkoutToken);
  sessionStorage.setItem(ORDER_KEY, String(orderId));
  // Compatibilidad temporal con sesiones creadas por versiones anteriores del checkout.
  sessionStorage.setItem(LEGACY_TOKEN_KEY, checkoutToken);
};

const getCheckoutTokenForOrder = (orderId: number) => {
  const scopedToken = sessionStorage.getItem(tokenKeyForOrder(orderId));
  if (scopedToken) return scopedToken;

  const legacyOrderId = Number(sessionStorage.getItem(ORDER_KEY) || 0);
  return legacyOrderId === orderId ? sessionStorage.getItem(LEGACY_TOKEN_KEY) : null;
};

const clearCheckoutSession = (orderId?: number) => {
  if (orderId) {
    sessionStorage.removeItem(tokenKeyForOrder(orderId));
  }

  const currentOrderId = Number(sessionStorage.getItem(ORDER_KEY) || 0);
  if (!orderId || !currentOrderId || currentOrderId === orderId) {
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
    sessionStorage.removeItem(ORDER_KEY);
  }
};

const initialFormState = {
  full_name: "",
  email: "",
  phone: "+52",
  country: "México",
  state: "",
  municipality: "",
  city: "",
  postal_code: "",
  colony: "",
  address: "",
  reference: "",
};

const inputStyle = {
  width: "100%",
  display: "block",
  marginTop: "6px",
  padding: "11px 12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  boxSizing: "border-box" as const,
  fontSize: "14px",
  background: "#fff",
  color: "#1a1a1a",
};

const labelStyle = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#333",
};

const cardStyle = {
  padding: "28px",
  background: "#fff",
  boxShadow: "0 10px 30px rgba(0,0,0,.06)",
};

const onlyLettersAndSpaces = (value: string) => value.replace(/[^\p{L}\s'-]/gu, "");
const onlyDigits = (value: string) => value.replace(/\D/g, "");

const CheckoutPageV2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const { isAuthenticated, loading: authLoading, user, login: authLogin } = useAuth();

  const [form, setForm] = useState<typeof initialFormState>(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      return saved ? { ...initialFormState, ...JSON.parse(saved) } : initialFormState;
    } catch {
      return initialFormState;
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [deliveryLoading, setDeliveryLoading] = useState(true);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<{
    orderId: number;
    subtotal: number;
    shippingCost: number;
    total: number;
    customerName: string;
    checkoutToken: string;
  } | null>(null);

  const { states, municipalities, cities, loading: ubigeoLoading } = useUbigeo(
    form.state,
    form.municipality
  );

  useEffect(() => {
    const suggestedCity = getSuggestedCity(cities, form.city);
    if (!suggestedCity) return;

    setForm((current) => {
      if (!current.municipality || current.city.trim()) return current;
      return { ...current, city: suggestedCity };
    });
  }, [form.municipality, form.city, cities]);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    let cancelled = false;

    const loadDeliveryCost = async () => {
      setDeliveryLoading(true);
      setDeliveryError(null);

      try {
        const { data } = await apiClient.get("/checkout/delivery-cost", {
          params: { _ts: Date.now() },
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
          timeout: 8000,
        });
        if (cancelled) return;
        setDeliveryCost(Math.max(0, Number(data?.price || 0)));
      } catch {
        if (cancelled) return;
        setDeliveryError("No fue posible consultar el costo de delivery. Actualiza la página antes de continuar.");
      } finally {
        if (!cancelled) setDeliveryLoading(false);
      }
    };

    void loadDeliveryCost();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setForm((current) => ({
      ...current,
      full_name: current.full_name || user.name || "",
      email: user.email || current.email,
      phone: current.phone || (user as any).phone || "",
    }));

    apiClient
      .get<any[]>("/addresses")
      .then(({ data }) => {
        const defaultAddress = data.find((address) => address.is_default) || data[0];
        if (!defaultAddress) return;

        setForm((current) => ({
          ...current,
          full_name: current.full_name || defaultAddress.full_name || user.name || "",
          email: user.email || current.email,
          phone: current.phone || defaultAddress.phone || "",
          country: defaultAddress.country || current.country || "México",
          state: current.state || defaultAddress.state || "",
          municipality: current.municipality || defaultAddress.municipality || "",
          city: current.city || defaultAddress.city || "",
          postal_code: current.postal_code || defaultAddress.postal_code || "",
          colony: current.colony || defaultAddress.colony || "",
          address: current.address || defaultAddress.address || "",
          reference: current.reference || defaultAddress.reference || "",
        }));
      })
      .catch(() => undefined);
  }, [isAuthenticated, user]);

  const finishPaidPurchase = (result: any) => {
    const paidOrderId = Number(result?.order_id || sessionStorage.getItem(ORDER_KEY) || 0);

    if (result?.auth_token && result?.user) {
      // El backend crea la cuenta únicamente después de confirmar el pago.
      // Guardamos la sesión antes de abandonar el checkout para que el cliente
      // llegue autenticado a su historial de compras.
      authLogin(result.user, result.auth_token);
    }

    clearCart();
    sessionStorage.removeItem(DRAFT_KEY);
    clearCheckoutSession(paidOrderId || undefined);
    setShowPayment(false);
    setOrderData(null);

    if (result?.requires_login && !result?.auth_token && !isAuthenticated) {
      navigate("/login", {
        replace: true,
        state: { from: "/profile/purchases" },
      });
      return;
    }

    // La sesión ya fue entregada por el backend y guardada en AuthProvider.
    // Conservar el proveedor evita una segunda autenticación y una recarga.
    navigate("/profile/purchases", { replace: true });
  };

  useEffect(() => {
    if (authLoading) return;

    const params = new URLSearchParams(location.search);
    if (params.get("openpay_return") !== "1") return;

    const orderIdFromUrl = Number(params.get("order_id") || 0);
    const storedOrderId = Number(sessionStorage.getItem(ORDER_KEY) || 0);
    const orderId = orderIdFromUrl || storedOrderId;
    const transactionId = params.get("id");
    const checkoutToken = orderId ? getCheckoutTokenForOrder(orderId) : null;

    if (!orderId || !transactionId || !checkoutToken) {
      setError(
        "No fue posible recuperar la sesión segura de esta compra. No repitas el cobro; vuelve a iniciar el checkout si la operación no fue confirmada."
      );
      navigate("/checkout", { replace: true });
      return;
    }

    let cancelled = false;

    const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

    const verifyPayment = async () => {
      setVerifyingPayment(true);
      setError(null);

      const maxAttempts = 5;
      let lastMessage = "Estamos confirmando tu pago con Openpay.";

      try {
        for (let attempt = 1; attempt <= maxAttempts && !cancelled; attempt += 1) {
          try {
            const { data } = await apiClient.get("/checkout/payments/openpay/verify", {
              params: {
                order_id: orderId,
                transaction_id: transactionId,
                checkout_token: checkoutToken,
              },
              timeout: 9000,
            });

            if (cancelled) return;

            if (data.payment_status === "paid") {
              finishPaidPurchase(data);
              return;
            }

            if (data.payment_status === "failed") {
              setError(data.message || "El pago no fue aprobado.");
              navigate("/checkout", { replace: true });
              return;
            }

            if (data.payment_status === "processing") {
              lastMessage = data.message || "Openpay todavía está confirmando tu pago.";
              if (attempt < maxAttempts) {
                await sleep(attempt <= 2 ? 800 : 1400);
                continue;
              }
            } else {
              lastMessage = data.message || "Estamos verificando el estado final de tu compra.";
            }
          } catch (err: any) {
            if (cancelled) return;

            const responseData = err.response?.data;
            const errorCode = responseData?.error_code;
            const status = Number(err.response?.status || 0);

            if (errorCode === "CHECKOUT_TOKEN_INVALID") {
              clearCheckoutSession(orderId);
              setError(
                "La sesión segura de esta compra ya no coincide con el pedido. No repitas el cobro. Si el pago fue aprobado, inicia sesión con el correo utilizado y revisa Mis Compras."
              );
              navigate("/checkout", { replace: true });
              return;
            }

            const retryable =
              !err.response ||
              err.code === "ECONNABORTED" ||
              status >= 500 ||
              [408, 409, 429].includes(status);

            if (!retryable) {
              setError(
                responseData?.message ||
                  "No fue posible verificar el pago con Openpay. No repitas el cobro hasta confirmar su estado."
              );
              navigate("/checkout", { replace: true });
              return;
            }

            lastMessage =
              responseData?.message ||
              "El pago fue enviado y estamos esperando la confirmación final de Openpay.";

            if (attempt < maxAttempts) {
              await sleep(attempt <= 2 ? 800 : 1400);
              continue;
            }
          }
        }

        if (!cancelled) {
          setError(
            `${lastMessage} No realices otro cobro. Si ya recibiste confirmación, inicia sesión con el correo utilizado y revisa Mis Compras.`
          );
          navigate("/checkout", { replace: true });
        }
      } finally {
        if (!cancelled) setVerifyingPayment(false);
      }
    };

    verifyPayment();
    return () => {
      cancelled = true;
    };
  }, [location.search, authLoading]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validateForm = () => {
    const name = form.full_name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const postalCode = form.postal_code.trim();
    const colony = form.colony.trim();
    const address = form.address.trim();

    if (!name || !/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u.test(name)) {
      return "Ingresa un nombre válido.";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Ingresa un correo electrónico válido.";
    }
    if (!/^\+[0-9]{8,20}$/.test(phone)) {
      return "Ingresa un teléfono internacional válido.";
    }
    if (!form.country || !form.state || !form.municipality || !form.city) {
      return "Selecciona país, estado, municipio y ciudad.";
    }
    if (!isValidMexicoPostalCode(postalCode)) {
      return "Ingresa un código postal mexicano válido de 5 dígitos.";
    }
    if (!isValidColony(colony)) {
      return "Ingresa una colonia válida.";
    }
    if (address.length < 5 || address.length > 255) {
      return "Ingresa una dirección válida.";
    }
    if (form.reference.trim().length > 200) {
      return "La referencia no puede superar los 200 caracteres.";
    }
    return null;
  };

  const getValidSize = (product: any) => {
    const raw = typeof product.size === "object" ? product.size?.size : product.size;
    if (typeof raw !== "string") return undefined;
    const value = raw.trim();
    return value && value.length <= 10 && !/[,/|-]/.test(value) ? value : undefined;
  };

  const getValidColor = (product: any) => {
    const raw =
      typeof product.color === "object"
        ? product.color?.name || product.color?.color
        : product.color;
    if (typeof raw !== "string") return undefined;
    const value = raw.trim();
    return value && value.length <= 50 ? value : undefined;
  };

  const openPaymentGateway = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const formError = validateForm();
    if (formError) {
      setError(formError);
      return;
    }

    if (!cart.length) {
      setError("Tu carrito está vacío.");
      return;
    }

    if (deliveryLoading) {
      setError("Estamos calculando el costo de delivery. Espera un momento.");
      return;
    }

    if (deliveryError) {
      setError(deliveryError);
      return;
    }

    setSubmitting(true);

    try {
      const items = cart.map((item) => {
        const productId = Number(item.product?.id);
        if (!productId || Number.isNaN(productId)) {
          throw new Error(`El producto ${item.product?.name || "seleccionado"} no tiene un ID válido.`);
        }

        const payload: any = {
          product_id: productId,
          quantity: Number(item.quantity),
        };
        const size = getValidSize(item.product);
        const color = getValidColor(item.product);
        if (size) payload.size = size;
        if (color) payload.color = color;
        return payload;
      });

      if (isAuthenticated) {
        try {
          await apiClient.post("/addresses", { ...form, is_default: true });
        } catch {
          // Guardar la dirección es secundario; no debe bloquear la compra.
        }
      }

      const { data } = await apiClient.post("/checkout/orders", {
        items,
        customer_name: form.full_name.trim(),
        customer_email: form.email.trim(),
        shipping_address: form.address.trim(),
        shipping_city: form.city.trim(),
        shipping_phone: form.phone.trim(),
        shipping_country: form.country.trim() || "México",
        shipping_state: form.state.trim(),
        shipping_municipality: form.municipality.trim(),
        shipping_postal_code: form.postal_code.trim(),
        shipping_colony: form.colony.trim(),
        payment_method: "openpay",
        notes: form.reference.trim() || null,
      });

      const orderId = Number(data.order_id || data.id);
      const checkoutToken = String(data.checkout_token || "");

      if (!orderId || !checkoutToken) {
        throw new Error("No se recibió la sesión segura de pago.");
      }

      // El token queda ligado al pedido exacto. Esto evita que una compra nueva
      // sobrescriba la sesión que Openpay necesita al regresar de 3D Secure.
      storeCheckoutSession(orderId, checkoutToken);
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));

      const serverDeliveryCost = Math.max(0, Number(data.shipping_cost ?? 0));
      setDeliveryCost(serverDeliveryCost);
      setOrderData({
        orderId,
        subtotal: Number(data.subtotal ?? cartTotal),
        shippingCost: serverDeliveryCost,
        total: Number(data.total ?? (cartTotal + serverDeliveryCost)),
        customerName: form.full_name.trim(),
        checkoutToken,
      });
      setShowPayment(true);
    } catch (err: any) {
      const data = err.response?.data;

      if (err.response?.status === 429) {
        const retryAfter = Math.max(1, Number(data?.retry_after || err.response?.headers?.['retry-after'] || 30));
        setError(`Has realizado varios intentos seguidos. Espera aproximadamente ${retryAfter} segundos y vuelve a intentar.`);
        return;
      }

      if (err.response?.status === 409 && data?.requires_login) {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        setError("Este correo ya tiene una cuenta. Inicia sesión y volverás automáticamente a tu compra.");
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }

      const validationErrors = data?.errors
        ? Object.values(data.errors).flat().join(" ")
        : null;
      setError(
        validationErrors ||
          data?.message ||
          data?.error ||
          err.message ||
          "No pudimos preparar la compra."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (result: OpenpayChargeResult) => {
    finishPaidPurchase(result as any);
  };

  if (authLoading || verifyingPayment) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <LockKeyhole size={36} style={{ margin: "0 auto 12px" }} />
          <h1 style={{ fontSize: "24px", marginBottom: "6px" }}>
            {verifyingPayment ? "Verificando tu pago" : "Preparando tu compra"}
          </h1>
          <p style={{ color: "#666" }}>
            {verifyingPayment
              ? "Estamos confirmando la transacción con Openpay..."
              : "Un momento, por favor."}
          </p>
        </div>
      </main>
    );
  }

  if (!cart.length) {
    return (
      <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: "32px" }}>
        <div style={{ textAlign: "center" }}>
          <ShoppingBag size={42} style={{ margin: "0 auto 14px" }} />
          <h1 style={{ fontSize: "28px" }}>Tu carrito está vacío</h1>
          <p style={{ color: "#666" }}>Agrega productos para continuar con tu compra.</p>
          <Link to="/" style={{ color: "#e30613", fontWeight: 700 }}>
            Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px 60px" }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            textDecoration: "none",
            marginBottom: "24px",
            color: "#333",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={17} /> Volver a la tienda
        </Link>

        <div className="checkout-page__grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(280px,.8fr)", gap: "28px", alignItems: "start" }}>
          <form onSubmit={openPaymentGateway} style={cardStyle}>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800 }}>Finaliza tu compra</h1>
            <p style={{ color: "#666", margin: "8px 0 6px", fontSize: "14px" }}>
              Completa tus datos de entrega. Al presionar <strong>Comprar</strong> se abrirá la pasarela de pago segura.
            </p>
            {!isAuthenticated && (
              <p style={{ margin: "0 0 22px", color: "#666", fontSize: "12px", lineHeight: 1.5 }}>
                No necesitas registrarte antes. Si el pago se confirma, crearemos tu cuenta de cliente y enviaremos tus credenciales al correo indicado.
              </p>
            )}

            {error && (
              <p role="alert" style={{ padding: "12px", color: "#a40000", background: "#fff0f0", borderRadius: "8px", fontSize: "13px" }}>
                {error}
              </p>
            )}

            <div className="checkout-page__fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <label style={labelStyle}>
                Nombre completo *
                <input required maxLength={150} value={form.full_name} onChange={(event) => updateField("full_name", onlyLettersAndSpaces(event.target.value))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Teléfono *
                <PhoneField
                  required
                  value={form.phone}
                  onChange={(phone) => updateField("phone", phone)}
                  defaultDialCode="+52"
                  selectClassName="checkout-phone-prefix"
                  inputClassName="checkout-phone-number"
                />
              </label>
              <label style={labelStyle}>
                Correo electrónico *
                <input required type="email" maxLength={255} value={form.email} readOnly={isAuthenticated} onChange={(event) => updateField("email", event.target.value)} style={{ ...inputStyle, background: isAuthenticated ? "#f4f4f4" : "#fff" }} />
              </label>
              <label style={labelStyle}>
                País *
                <select required value={form.country} onChange={(event) => updateField("country", event.target.value)} style={inputStyle}>
                  <option value="México">México</option>
                </select>
              </label>
              <label style={labelStyle}>
                Estado *
                <select required value={form.state} disabled={ubigeoLoading} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value, municipality: "", city: "", postal_code: "", colony: "" }))} style={inputStyle}>
                  <option value="">Seleccionar</option>
                  {states.map((state) => <option key={state}>{state}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                Municipio *
                <select required value={form.municipality} disabled={!form.state || ubigeoLoading} onChange={(event) => setForm((current) => ({ ...current, municipality: event.target.value, city: "", postal_code: "", colony: "" }))} style={inputStyle}>
                  <option value="">Seleccionar</option>
                  {municipalities.map((municipality) => <option key={municipality}>{municipality}</option>)}
                </select>
              </label>
              <label style={labelStyle}>
                Ciudad / Localidad *
                <input
                  required
                  list="checkout-city-suggestions"
                  value={form.city}
                  disabled={!form.municipality || ubigeoLoading}
                  onChange={(event) => updateField("city", event.target.value)}
                  placeholder="Escribe tu ciudad o localidad"
                  maxLength={100}
                  style={inputStyle}
                />
                <datalist id="checkout-city-suggestions">
                  {cities.map((city) => <option key={city} value={city} />)}
                </datalist>
              </label>
              <label style={labelStyle}>
                Código postal *
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  value={form.postal_code}
                  onChange={(event) => updateField("postal_code", onlyDigits(event.target.value))}
                  placeholder="00000"
                  style={inputStyle}
                />
              </label>
              <label style={labelStyle}>
                Colonia *
                <input
                  required
                  maxLength={120}
                  value={form.colony}
                  onChange={(event) => updateField("colony", event.target.value)}
                  placeholder="Ej. Centro"
                  autoComplete="address-level3"
                  style={inputStyle}
                />
              </label>
              <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
                Dirección *
                <input required maxLength={255} value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Calle y número" autoComplete="street-address" style={inputStyle} />
              </label>
              <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
                Referencia (opcional)
                <input maxLength={200} value={form.reference} onChange={(event) => updateField("reference", event.target.value)} style={inputStyle} />
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
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 800,
                cursor: submitting ? "wait" : "pointer",
              }}
            >
              {submitting
                ? "Preparando pago..."
                : deliveryLoading
                  ? "Calculando delivery..."
                  : `Comprar · ${money.format(cartTotal + deliveryCost)}`}
            </button>

            <p style={{ margin: "14px 0 0", color: "#666", fontSize: "12px", textAlign: "center" }}>
              Al continuar, aceptas los <Link to="/terms" style={{ color: "#e30613", fontWeight: 700 }}>Términos y condiciones</Link> y el <Link to="/privacy" style={{ color: "#e30613", fontWeight: 700 }}>Aviso de privacidad</Link>.
            </p>
          </form>

          <EditableOrderSummary
  deliveryCost={deliveryCost}
  deliveryLoading={deliveryLoading}
  onVariantChanged={() => {
    // Cualquier cambio de cantidad/talla/color invalida sesiones de pago previas.
    clearCheckoutSession();
    setOrderData(null);
    setShowPayment(false);
    setError(null);
  }}
/>
        </div>
      </div>

      {showPayment && orderData && (
        <PaymentModal
          isOpen={showPayment}
          total={orderData.total}
          shippingCost={orderData.shippingCost}
          cart={cart}
          customerName={orderData.customerName}
          customerEmail={form.email}
          onClose={() => setShowPayment(false)}
          onBack={() => setShowPayment(false)}
          onPay={async ({ tokenId, deviceSessionId }) => {
            const { data } = await apiClient.post(
              "/checkout/payments/openpay/charge",
              {
                order_id: orderData.orderId,
                checkout_token: orderData.checkoutToken,
                token_id: tokenId,
                device_session_id: deviceSessionId,
              },
              { timeout: 18000 },
            );
            return data;
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </main>
  );
};

export default CheckoutPageV2;
