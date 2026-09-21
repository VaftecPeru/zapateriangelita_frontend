import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  CreditCard,
  LockKeyhole,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import apiClient from "../services/apiClient";
import openpayLogo from "../assets/payment/openpay-by-bbva.jpg";
import visaLogo from "../assets/payment/visa.png";
import mastercardLogo from "../assets/payment/mastercard.png";
import americanExpressLogo from "../assets/payment/american-express.png";

export interface OpenpayChargeResult {
  ok: boolean;
  message?: string;
  payment_status: "paid" | "processing" | "failed";
  order_id?: number;
  order_code?: string;
  transaction_id?: string;
  openpay_status?: string;
  requires_redirect?: boolean;
  redirect_url?: string;
  error_code?: number | string;
  error_key?: string;
  error_title?: string;
  stage?: "tokenization" | "charge" | "verify" | string;
  request_id?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  shippingCost?: number;
  cart: any[];
  customerName: string;
  customerEmail?: string;
  onClose: () => void;
  onBack: () => void;
  onPay: (paymentData: {
    tokenId: string;
    deviceSessionId: string;
  }) => Promise<OpenpayChargeResult>;
  onSuccess: (result: OpenpayChargeResult) => void;
}

type PaymentNotice = {
  title: string;
  message: string;
  tone: "success" | "info";
};

const fieldStyle = {
  width: "100%",
  display: "block",
  marginTop: "5px",
  padding: "10px 11px",
  border: "1px solid #dcdcdc",
  borderRadius: "7px",
  boxSizing: "border-box" as const,
  fontSize: "13px",
  color: "#333",
  background: "#fff",
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 4)
    .replace(/^(\d{2})(\d)/, "$1/$2");

const getCardBrand = (cardNumber: string) => {
  const clean = cardNumber.replace(/\D/g, "");
  if (/^3[47]/.test(clean)) return "amex";
  if (/^4/.test(clean)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(clean)) return "mastercard";
  if (/^506/.test(clean)) return "carnet";
  return "unknown";
};

const getExpectedCvvLength = (cardNumber: string) =>
  getCardBrand(cardNumber) === "amex" ? 4 : 3;

const isExpiryInPast = (month: string, year: string) => {
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  if (!monthNumber || monthNumber < 1 || monthNumber > 12 || year.length !== 2) {
    return true;
  }

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  return yearNumber < currentYear || (yearNumber === currentYear && monthNumber < currentMonth);
};

export const getFriendlyPaymentError = (code?: number | string, message?: string, cardNumber?: string, sandboxMode = false) => {
  const errorCode = String(code ?? "");
  const text = String(message ?? "").toLowerCase();

  // En Sandbox, los números de certificación de Openpay representan escenarios
  // determinísticos. Se usan solo para garantizar que la UI muestre el mensaje
  // requerido durante certificación, sin afectar tarjetas reales en Producción.
  if (sandboxMode) {
    const testCard = String(cardNumber ?? "").replace(/\D/g, "");
    const sandboxCases: Record<string, { title: string; message: string }> = {
      "4222222222222220": {
        title: "Tarjeta rechazada",
        message: "La tarjeta fue rechazada.",
      },
      "4000000000000069": {
        title: "Tarjeta expirada",
        message: "La tarjeta ha expirado.",
      },
      "4444444444444448": {
        title: "Fondos insuficientes",
        message: "La tarjeta no tiene fondos suficientes.",
      },
      "4000000000000119": {
        title: "Tarjeta rechazada",
        message: "La tarjeta fue rechazada.",
      },
      "4000000000000044": {
        title: "Tarjeta rechazada por seguridad",
        message: "La tarjeta ha sido rechazada por el sistema antifraudes.",
      },
      "5454545454545454": {
        title: "Tarjeta rechazada por seguridad",
        message: "La tarjeta ha sido rechazada por el sistema antifraudes.",
      },
      "340000000000009": {
        title: "Tarjeta rechazada",
        message: "La tarjeta fue rechazada.",
      },
      "373737373737374": {
        title: "Tarjeta expirada",
        message: "La tarjeta ha expirado.",
      },
      "370000000000002": {
        title: "Fondos insuficientes",
        message: "La tarjeta no tiene fondos suficientes.",
      },
    };

    const sandboxError = sandboxCases[testCard];
    if (sandboxError) return sandboxError;
  }

  // Errores de tarjeta documentados por Openpay. Se clasifican por error_code,
  // no por número de tarjeta, para que funcione igual en Sandbox y Producción.
  if (["3001", "3007"].includes(errorCode)) {
    return {
      title: "Tarjeta rechazada",
      message: "La tarjeta fue rechazada. Intenta con otra tarjeta o comunícate con tu banco.",
    };
  }

  if (["3002", "2005"].includes(errorCode)) {
    return {
      title: "Tarjeta expirada",
      message: "La tarjeta ha expirado.",
    };
  }

  if (errorCode === "3003") {
    return {
      title: "Fondos insuficientes",
      message: "La tarjeta no tiene fondos suficientes.",
    };
  }

  if (errorCode === "3004") {
    return {
      title: "Tarjeta rechazada",
      message: "La tarjeta fue rechazada.",
    };
  }

  if (errorCode === "3005") {
    return {
      title: "Tarjeta rechazada por seguridad",
      message: "La tarjeta ha sido rechazada por el sistema antifraudes.",
    };
  }

  if (errorCode === "3006") {
    return {
      title: "Operación no permitida",
      message: "Esta operación no está permitida para la tarjeta. Intenta con otra tarjeta.",
    };
  }

  if (errorCode === "3008") {
    return {
      title: "Tarjeta no compatible",
      message: "Esta tarjeta no permite compras en línea. Intenta con otra tarjeta.",
    };
  }

  if (errorCode === "3009") {
    return {
      title: "Tarjeta no autorizada",
      message: "El banco no autorizó esta tarjeta. Utiliza otra tarjeta o comunícate con tu banco.",
    };
  }

  if (errorCode === "3010") {
    return {
      title: "Tarjeta restringida",
      message: "El banco ha restringido la tarjeta. Comunícate con tu banco o utiliza otra tarjeta.",
    };
  }

  if (errorCode === "3011") {
    return {
      title: "Tarjeta no autorizada",
      message: "El banco no autorizó el pago. Comunícate con tu banco o utiliza otra tarjeta.",
    };
  }

  if (errorCode === "3012") {
    return {
      title: "Autorización bancaria requerida",
      message: "Tu banco requiere una autorización adicional para realizar este pago.",
    };
  }

  if (errorCode === "2004") {
    return {
      title: "Número de tarjeta inválido",
      message: "El número de tarjeta no es válido. Verifica los datos e intenta nuevamente.",
    };
  }

  if (["2006", "2009"].includes(errorCode)) {
    return {
      title: "CVV inválido",
      message: "Verifica el código de seguridad (CVV) de la tarjeta e intenta nuevamente.",
    };
  }

  if (errorCode === "2007") {
    return {
      title: "Tarjeta de prueba no permitida",
      message: "La tarjeta de prueba solo puede utilizarse en el ambiente Sandbox de Openpay.",
    };
  }

  if (errorCode === "2010") {
    return {
      title: "Verificación 3D Secure fallida",
      message: "No se pudo completar la verificación de seguridad. Intenta nuevamente o usa otra tarjeta.",
    };
  }

  if (errorCode === "1002" || errorCode === "401") {
    return {
      title: "Pasarela no disponible",
      message: "No pudimos iniciar el pago en este momento. Intenta nuevamente en unos minutos.",
    };
  }

  // Respaldo por descripción cuando un intermediario no devuelve error_code.
  if (
    text.includes("fondos insuficientes") ||
    text.includes("insufficient funds") ||
    text.includes("enough funds") ||
    text.includes("fondos suficientes")
  ) {
    return {
      title: "Fondos insuficientes",
      message: "La tarjeta no tiene fondos suficientes.",
    };
  }

  if (text.includes("expir") || text.includes("venc")) {
    return {
      title: "Tarjeta expirada",
      message: "La tarjeta ha expirado.",
    };
  }

  if (text.includes("stolen") || text.includes("robada")) {
    return {
      title: "Tarjeta rechazada",
      message: "La tarjeta fue rechazada.",
    };
  }

  if (text.includes("antifraud") || text.includes("antifraude") || text.includes("fraudulent")) {
    return {
      title: "Tarjeta rechazada por seguridad",
      message: "La tarjeta ha sido rechazada por el sistema antifraudes.",
    };
  }

  if (
    text.includes("declin") ||
    text.includes("rechaz") ||
    text.includes("reportada como perdida") ||
    text.includes("restringida")
  ) {
    return {
      title: "Tarjeta rechazada",
      message: "La tarjeta fue rechazada. Intenta con otra tarjeta o comunícate con tu banco.",
    };
  }

  if (
    ["1000", "1004", "1005", "1007", "500", "502", "503", "504"].includes(errorCode) ||
    text.includes("network") ||
    text.includes("timeout") ||
    text.includes("communication") ||
    text.includes("comunicación")
  ) {
    return {
      title: "No se pudo completar el pago",
      message: "Ocurrió un problema de comunicación. Intenta nuevamente en unos minutos.",
    };
  }

  return {
    title: "Transacción fallida",
    message: "Tu pago no pudo ser realizado. Intenta nuevamente o utiliza otra tarjeta.",
  };
};

const PaymentModal = ({
  isOpen,
  total,
  shippingCost = 0,
  cart = [],
  customerName,
  customerEmail = "",
  onClose,
  onBack,
  onPay,
  onSuccess,
}: PaymentModalProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<PaymentNotice | null>(null);
  const [deviceSessionId, setDeviceSessionId] = useState("");
  const [openpayReady, setOpenpayReady] = useState(false);
  const [sandboxMode, setSandboxMode] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    const initializeOpenpay = async () => {
      try {
        setOpenpayReady(false);
        setError(null);
        setErrorTitle(null);
        setPaymentNotice(null);

        if (!window.OpenPay) {
          throw new Error("La librería de Openpay no está disponible.");
        }

        const { data } = await apiClient.get("/openpay/config");
        if (!active) return;

        if (data.configured === false || !data.merchant_id || !data.public_key) {
          throw new Error("La configuración de Openpay está incompleta.");
        }

        const sandbox = Boolean(data.sandbox);
        setSandboxMode(sandbox);

        window.OpenPay.setId(String(data.merchant_id));
        window.OpenPay.setApiKey(String(data.public_key));
        window.OpenPay.setSandboxMode(sandbox);

        const sessionId = window.OpenPay.deviceData.setup();
        if (!sessionId) {
          throw new Error("No se pudo generar la sesión antifraude de Openpay.");
        }

        setDeviceSessionId(sessionId);
        setOpenpayReady(true);
      } catch (err) {
        console.error("Error configurando Openpay:", err);
        setErrorTitle("Pasarela no disponible");
        setError("No fue posible iniciar Openpay. Verifica la configuración e intenta nuevamente.");
      }
    };

    initializeOpenpay();

    return () => {
      active = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setCardName(customerName || "");
    setEmail(customerEmail || "");
  }, [isOpen, customerName, customerEmail]);

  if (!isOpen) return null;

  const displayTotal = money.format(Number(total));
  const productSubtotal = cart.reduce(
    (sum: number, item: any) => sum + Number(item.product?.price || 0) * Number(item.quantity || 0),
    0,
  );

  const submitPayment = (event: React.FormEvent) => {
    event.preventDefault();

    // Certificación Openpay: evita doble clic y cargos duplicados.
    if (processing) return;

    const cleanCardNumber = cardNumber.replace(/\s/g, "");
    const cleanEmail = email.trim();

    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 16) {
      setErrorTitle("Datos incompletos");
      setError("El número de tarjeta debe contener como máximo 16 dígitos.");
      return;
    }

    if (!cardName.trim()) {
      setErrorTitle("Datos incompletos");
      setError("Ingresa el nombre del titular de la tarjeta.");
      return;
    }

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorTitle("Datos incompletos");
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    const expectedCvvLength = getExpectedCvvLength(cleanCardNumber);
    if (cardCvv.length !== expectedCvvLength) {
      setErrorTitle("CVV inválido");
      setError(
        expectedCvvLength === 4
          ? "American Express requiere un CVV de 4 dígitos."
          : "Visa, Mastercard y Carnet requieren un CVV de 3 dígitos."
      );
      return;
    }

    const [month, year] = cardExpiry.split("/");
    if (cardExpiry.length !== 5 || isExpiryInPast(month, year)) {
      setErrorTitle("Datos de tarjeta inválidos");
      setError("Verifica la fecha de vencimiento en formato MM/AA y asegúrate de que la tarjeta no esté vencida.");
      return;
    }

    if (!openpayReady || !deviceSessionId || !window.OpenPay) {
      setErrorTitle("Pasarela no disponible");
      setError("Openpay todavía no está listo. Intenta nuevamente.");
      return;
    }

    setError(null);
    setErrorTitle(null);
    setPaymentNotice({
      title: "Verificando tarjeta",
      message: "Estamos validando los datos de tu tarjeta con Openpay. Espera un momento.",
      tone: "info",
    });
    setProcessing(true);

    window.OpenPay.token.create(
      {
        card_number: cleanCardNumber,
        holder_name: cardName.trim(),
        expiration_year: year,
        expiration_month: month,
        cvv2: cardCvv,
      },
      async (response) => {
        try {
          const tokenId = response.data.id;
          const result = await onPay({ tokenId, deviceSessionId });

          if (result.payment_status === "paid") {
            setPaymentNotice({
              title: "Transacción exitosa",
              message: "Recibimos tu pago. ¡Gracias por tu compra!",
              tone: "success",
            });
            setProcessing(false);
            window.setTimeout(() => onSuccess(result), 500);
            return;
          }

          if (
            result.payment_status === "processing" &&
            result.requires_redirect &&
            result.redirect_url
          ) {
            setPaymentNotice({
              title: "Tarjeta válida · confirma con 3D Secure",
              message:
                result.message ||
                "El cargo fue generado correctamente. Continúa con la autenticación 3D Secure para confirmar el pago.",
              tone: "info",
            });

            window.setTimeout(() => {
              window.location.href = result.redirect_url!;
            }, 500);
            return;
          }

          const friendly =
            result.error_title && result.message
              ? { title: result.error_title, message: result.message }
              : getFriendlyPaymentError(
                  result.error_code,
                  result.message,
                  cleanCardNumber,
                  sandboxMode === true
                );

          console.warn("Openpay: cargo no aprobado", {
            stage: result.stage || "charge",
            errorKey: result.error_key,
            errorCode: result.error_code,
            requestId: result.request_id,
          });

          setProcessing(false);
          setPaymentNotice(null);
          setErrorTitle(friendly.title);
          setError(friendly.message);
        } catch (err: any) {
          console.error("Error procesando pago:", err);
          const data = err.response?.data;
          const friendly =
            data?.error_title && data?.message
              ? { title: data.error_title, message: data.message }
              : getFriendlyPaymentError(
                  data?.error_code ?? err.response?.status,
                  data?.message ?? err.message,
                  cleanCardNumber,
                  sandboxMode === true
                );

          console.warn("Openpay: error al crear cargo", {
            stage: data?.stage || "charge",
            errorKey: data?.error_key,
            errorCode: data?.error_code ?? err.response?.status,
            requestId: data?.request_id,
            httpStatus: err.response?.status,
          });

          setProcessing(false);
          setPaymentNotice(null);
          setErrorTitle(friendly.title);
          setError(friendly.message);
        }
      },
      (response) => {
        const errorCode = response.data?.error_code;
        const description =
          response.data?.description || response.data?.message || response.message;
        const requestId = (response.data as any)?.request_id;

        console.error("Error tokenizando tarjeta en Openpay", {
          errorCode,
          requestId,
          description,
          sandboxMode,
        });

        const friendly = getFriendlyPaymentError(
          errorCode,
          description,
          cleanCardNumber,
          sandboxMode === true
        );
        setProcessing(false);
        setPaymentNotice(null);
        setErrorTitle(friendly.title);
        setError(friendly.message);
      }
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
      onClick={processing ? undefined : onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 13000,
        display: "grid",
        placeItems: "center",
        padding: "16px",
        background: "rgba(0,0,0,.55)",
      }}
    >
      <form
        onSubmit={submitPayment}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "430px",
          maxHeight: "94vh",
          overflowY: "auto",
          padding: "14px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,.24)",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "2px 2px 10px",
          }}
        >
          <h2
            id="payment-title"
            style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#222" }}
          >
            <CreditCard size={15} style={{ verticalAlign: "-3px", marginRight: "6px" }} />
            Pago con tarjeta
          </h2>
          <button
            type="button"
            disabled={processing}
            onClick={onClose}
            aria-label="Cerrar pago"
            style={{
              border: 0,
              background: "transparent",
              color: "#666",
              cursor: processing ? "not-allowed" : "pointer",
              padding: "2px",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <p style={{ margin: "0 0 11px", color: "#777", fontSize: "11px" }}>
          Ingresa los datos de tu tarjeta para completar tu compra.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            marginBottom: "8px",
            background: "#e8f8f4",
            borderRadius: "8px",
            color: "#248a7d",
          }}
        >
          <ShieldCheck size={19} style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <strong style={{ display: "block", fontSize: "11px" }}>
              Pago seguro · 3D Secure
            </strong>
            <span style={{ display: "block", fontSize: "9px", color: "#6a918a" }}>
              Procesado mediante Openpay México
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              width: "96px",
              minWidth: "78px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              overflow: "hidden",
              borderRadius: "4px",
              background: "#fff",
            }}
            aria-label="Openpay by BBVA"
          >
            <img
              src={openpayLogo}
              alt="Openpay by BBVA"
              style={{
                display: "block",
                width: "92px",
                maxWidth: "100%",
                height: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
            padding: "8px 10px",
            border: "1px solid #eee",
            borderRadius: "7px",
            background: "#fafafa",
          }}
        >
          <span style={{ color: "#777", fontSize: "9px", whiteSpace: "nowrap" }}>
            Tarjetas aceptadas
          </span>
          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "center",
              justifyContent: "flex-end",
              minWidth: 0,
            }}
            aria-label="Visa, Mastercard y American Express"
          >
            <img
              src={visaLogo}
              alt="Visa"
              title="Visa"
              style={{ display: "block", width: "36px", height: "22px", objectFit: "contain" }}
            />
            <img
              src={mastercardLogo}
              alt="Mastercard"
              title="Mastercard"
              style={{ display: "block", width: "34px", height: "22px", objectFit: "contain" }}
            />
            <img
              src={americanExpressLogo}
              alt="American Express"
              title="American Express"
              style={{ display: "block", width: "26px", height: "22px", objectFit: "contain" }}
            />
          </div>
        </div>

        {sandboxMode === true && (
          <div
            role="status"
            style={{
              marginBottom: "12px",
              padding: "8px 10px",
              background: "#fff8dc",
              border: "1px solid #f0df9d",
              borderRadius: "7px",
              color: "#6b5200",
              fontSize: "10px",
            }}
          >
            Modo de certificación/pruebas Openpay activo. No se realizarán cargos reales.
          </div>
        )}

        <label
          style={{
            display: "block",
            marginBottom: "10px",
            color: "#777",
            fontSize: "10px",
            fontWeight: 600,
          }}
        >
          Nombre del titular
          <input
            required
            value={cardName}
            onChange={(event) => setCardName(event.target.value)}
            placeholder="Nombre completo"
            autoComplete="cc-name"
            style={fieldStyle}
          />
        </label>

        <div
          style={{
            marginBottom: "12px",
            padding: "11px 12px",
            border: "1px solid #d9e8ff",
            borderRadius: "8px",
            background: "#f7faff",
          }}
        >
          <label
            style={{
              display: "block",
              color: "#315b91",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            <Mail size={14} style={{ verticalAlign: "-3px", marginRight: "5px" }} />
            Correo electrónico *
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            style={{ ...fieldStyle, marginTop: "7px", borderColor: "#b9d2f5" }}
          />
          <span
            style={{
              display: "block",
              marginTop: "5px",
              color: "#7892b5",
              fontSize: "9px",
            }}
          >
            Recibirás aquí los detalles de tu pedido.
          </span>
        </div>

        <label
          style={{
            display: "block",
            marginBottom: "10px",
            color: "#777",
            fontSize: "10px",
            fontWeight: 600,
          }}
        >
          Número de tarjeta
          <div style={{ position: "relative" }}>
            <CreditCard
              size={14}
              style={{ position: "absolute", left: "10px", top: "14px", color: "#aaa" }}
            />
            <input
              required
              value={cardNumber}
              onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              aria-describedby="card-number-help"
              style={{ ...fieldStyle, paddingLeft: "31px" }}
            />
          </div>
          <span
            id="card-number-help"
            style={{ display: "block", marginTop: "4px", color: "#999", fontSize: "8px" }}
          >
            Hasta 16 dígitos. Se admiten tarjetas de 15 dígitos como American Express.
          </span>
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <label style={{ color: "#777", fontSize: "10px", fontWeight: 600 }}>
            Vencimiento (MM/AA)
            <input
              required
              value={cardExpiry}
              onChange={(event) => setCardExpiry(formatExpiry(event.target.value))}
              placeholder="MM/AA"
              inputMode="numeric"
              autoComplete="cc-exp"
              maxLength={5}
              style={fieldStyle}
            />
          </label>
          <label style={{ color: "#777", fontSize: "10px", fontWeight: 600 }}>
            CVV
            <div style={{ position: "relative" }}>
              <input
                required
                value={cardCvv}
                onChange={(event) => {
                  const expectedLength = getExpectedCvvLength(cardNumber);
                  setCardCvv(event.target.value.replace(/\D/g, "").slice(0, expectedLength));
                }}
                placeholder="•••"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={getExpectedCvvLength(cardNumber)}
                aria-describedby="cvv-help"
                style={fieldStyle}
              />
              <LockKeyhole
                size={13}
                style={{ position: "absolute", right: "9px", top: "14px", color: "#999" }}
              />
            </div>
            <span
              id="cvv-help"
              style={{ display: "block", marginTop: "4px", color: "#999", fontSize: "8px" }}
            >
              {getExpectedCvvLength(cardNumber) === 4
                ? "4 dígitos para American Express."
                : "3 dígitos para Visa, Mastercard y Carnet."}
            </span>
          </label>
        </div>

        <div
          style={{
            marginTop: "14px",
            padding: "12px",
            background: "#f7f7f7",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ margin: "0 0 9px", fontSize: "11px", color: "#555" }}>
            Resumen del pago
          </h3>
          {cart.slice(0, 3).map((item: any, index: number) => (
            <div
              key={`${item.product?.id ?? "item"}-${index}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                padding: "5px 0",
                borderBottom: "1px solid #e5e5e5",
                color: "#777",
                fontSize: "10px",
              }}
            >
              <span>
                {item.product?.name || "Producto"} x {item.quantity}
              </span>
              <span>{money.format(Number(item.product?.price || 0) * Number(item.quantity || 0))}</span>
            </div>
          ))}
          <div style={{ display: "grid", gap: "5px", marginTop: "10px", color: "#555", fontSize: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span>Subtotal productos</span>
              <strong>{money.format(productSubtotal)}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
              <span>Costo de delivery</span>
              <strong>{money.format(Math.max(0, Number(shippingCost || 0)))}</strong>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "9px",
              paddingTop: "9px",
              borderTop: "1px solid #ddd",
              color: "#333",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            <span>Total a pagar</span>
            <strong style={{ fontSize: "20px" }}>{displayTotal}</strong>
          </div>
        </div>

        {paymentNotice && (
          <div
            role="status"
            aria-live="polite"
            style={{
              margin: "11px 0 0",
              padding: "10px",
              color: paymentNotice.tone === "success" ? "#12613a" : "#315b91",
              background: paymentNotice.tone === "success" ? "#eefaf3" : "#f2f7ff",
              border:
                paymentNotice.tone === "success"
                  ? "1px solid #bee8cf"
                  : "1px solid #c9dcf7",
              borderRadius: "6px",
              fontSize: "11px",
            }}
          >
            <CheckCircle size={14} style={{ verticalAlign: "-3px", marginRight: "5px" }} />
            <strong style={{ display: "block", marginBottom: "3px" }}>
              {paymentNotice.title}
            </strong>
            {paymentNotice.message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              margin: "11px 0 0",
              padding: "9px",
              color: "#a40000",
              background: "#fff0f0",
              border: "1px solid #f3c4c4",
              borderRadius: "6px",
              fontSize: "11px",
            }}
          >
            <AlertTriangle size={14} style={{ verticalAlign: "-3px", marginRight: "5px" }} />
            {errorTitle && (
              <strong style={{ display: "block", marginBottom: "3px" }}>{errorTitle}</strong>
            )}
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "8px", marginTop: "13px" }}>
          <button
            type="button"
            disabled={processing}
            onClick={onBack}
            style={{
              flex: "0 0 74px",
              padding: "11px",
              border: "1px solid #ddd",
              background: "#fff",
              borderRadius: "20px",
              fontSize: "11px",
              cursor: processing ? "not-allowed" : "pointer",
              opacity: processing ? 0.6 : 1,
            }}
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={processing || !openpayReady || cart.length === 0}
            style={{
              flex: 1,
              padding: "12px",
              border: 0,
              background: "#050505",
              color: "#fff",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 700,
              cursor: processing || !openpayReady ? "not-allowed" : "pointer",
              opacity: processing || !openpayReady ? 0.7 : 1,
            }}
          >
            <LockKeyhole size={12} style={{ verticalAlign: "-2px", marginRight: "4px" }} />
            {processing ? "Verificando tarjeta..." : `Pagar ${displayTotal}`}
          </button>
        </div>

        <p
          style={{
            margin: "10px 0 0",
            textAlign: "center",
            color: "#999",
            fontSize: "8px",
          }}
        >
          Los datos de tu tarjeta se tokenizan directamente con Openpay y no se almacenan en
          Zapatería Angelita.
        </p>
      </form>
    </div>
  );
};

export default PaymentModal;
