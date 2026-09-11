import { useEffect, useState } from "react";
import { CheckCircle, CreditCard, LockKeyhole, Mail, X } from "lucide-react";
import apiClient from "../services/apiClient";


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
  request_id?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  cart: any[];
  customerName: string;
  customerEmail?: string;
  onClose: () => void;
  onBack: () => void;
  onPay: (paymentData: { tokenId: string; deviceSessionId: string; }) => Promise<OpenpayChargeResult>;
  onSuccess: (result: OpenpayChargeResult) => void;
}

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

const PaymentModal = ({  isOpen, total, cart = [], customerName, customerEmail = "", onClose,  onBack,  onPay,  onSuccess}: PaymentModalProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [deviceSessionId, setDeviceSessionId] = useState("");
  const [openpayReady, setOpenpayReady] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    const initializeOpenpay = async () => {
      try {
        setOpenpayReady(false);
        setError(null);
        setErrorTitle(null);

        if (!window.OpenPay) { throw new Error("La librería de Openpay no está disponible."); }

        const { data } = await apiClient.get("/openpay/config");

        if (!active) return;

        if (!data.merchant_id || !data.public_key) {
          throw new Error("La configuración de Openpay está incompleta.");
        }
        window.OpenPay.setId(data.merchant_id);
        window.OpenPay.setApiKey(data.public_key);
        window.OpenPay.setSandboxMode(Boolean(data.sandbox));

        const sessionId = window.OpenPay.deviceData.setup();

        if (!sessionId) { throw new Error("No se pudo generar la sesión de seguridad."); }
        setDeviceSessionId(sessionId);
        setOpenpayReady(true);

      } catch (err) {
        console.error("Error configurando Openpay:", err);

        setErrorTitle("Transacción fallida");
        setError(
          "No fue posible iniciar Openpay. Intenta de nuevo."
        );
      }
    };
    initializeOpenpay();
    return () => { active = false; };
  }, [isOpen]);
  if (!isOpen) return null;

  const formatCardNumber = (value: string) => value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (value: string) => value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  const displayTotal = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", minimumFractionDigits: 2,}).format(Number(total));
  const getFriendlyPaymentError = (code?: number | string, message?: string ) => {
      const errorCode = String(code ?? "");
      if (errorCode === "3003") {
        return {
          title: "Fondos insuficientes",
          message: "Tu pago no pudo ser realizado. Intenta con otra tarjeta",
        };
      }

      if (errorCode === "3001" || errorCode === "3004" || errorCode === "3005" ) {
        return {
          title: "Tarjeta rechazada",
          message: "El pago no pudo ser realizado, intenta de nuevo.",
        };
      }

      if (errorCode === "3002") {
        return {
          title: "Transacción fallida",
          message: "Tu pago no pudo ser realizado, intenta de nuevo.",
        };
      }

      if (["502", "503", "504"].includes(errorCode) ) {
        return {
          title: "Transacción fallida",
          message: "Ocurrió un error, intenta de nuevo o comunícate con tu banco.",
        };
      }
      const text = String(message ?? "").toLowerCase();
      if (
        text.includes("network") ||
        text.includes("timeout") ||
        text.includes("communication") ||
        text.includes("comunicación")
      ) {
        return {
          title: "Transacción fallida",
          message: "Ocurrió un error, intenta de nuevo o comunícate con tu banco.",
        };
      }

      return {
        title: "Transacción fallida",
        message: "Tu pago no pudo ser realizado, intenta de nuevo.",
      };
    };
  const submitPayment = (event: React.FormEvent) => {
  event.preventDefault();

  const cleanCardNumber = cardNumber.replace(/\s/g, "");

  if (
    cleanCardNumber.length < 16 ||
    !cardName.trim() ||
    !email.trim() ||
    cardExpiry.length < 5 ||
    cardCvv.length < 3
  ) {
    setErrorTitle("Datos incompletos");
    setError("Completa correctamente los datos de tu tarjeta.");
    return;
  }

  const [month, year] = cardExpiry.split("/");
  const monthNumber = Number(month);

  if (
    !month ||
    !year ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    setErrorTitle("Datos incompletos");
    setError("Verifica la fecha de vencimiento de la tarjeta.");
    return;
  }

  if (
    !openpayReady ||
    !deviceSessionId ||
    !window.OpenPay
  ) {
    setErrorTitle("Transacción fallida");
    setError(
      "Openpay todavía no está listo. Intenta nuevamente."
    );
    return;
  }

  setError(null);
  setErrorTitle(null);
  setPaymentNotice(null);
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

        const result = await onPay({
          tokenId,
          deviceSessionId,
        });

        console.log("Respuesta final Openpay:", result);

        if (result.payment_status === "paid") {
          setProcessing(false);
          onSuccess(result);
          return;
        }

        if (
          result.payment_status === "processing" &&
          result.requires_redirect &&
          result.redirect_url
        ) {
          setPaymentNotice(
            result.message ||
              "Continúa con la verificación de seguridad."
          );

          window.setTimeout(() => {
            window.location.href = result.redirect_url!;
          }, 1800);

          return;
        }

        const friendly = getFriendlyPaymentError(
          result.error_code,
          result.message
        );

        setProcessing(false);
        setErrorTitle(friendly.title);
        setError(friendly.message);

      } catch (err: any) {
        console.error("Error procesando pago:", err);

        const data = err.response?.data;

        const friendly = getFriendlyPaymentError(
          data?.error_code ?? err.response?.status,
          data?.message ?? err.message
        );

        setProcessing(false);
        setErrorTitle(friendly.title);
        setError(friendly.message);
      }
    },

    (response) => {
      console.error(
        "Error tokenizando tarjeta:",
        response
      );

      const friendly = getFriendlyPaymentError(
        response.data?.error_code,
        response.data?.description ||
          response.data?.message ||
          response.message
      );

      setProcessing(false);
      setErrorTitle(friendly.title);
      setError(friendly.message);
    }
  );
};

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="payment-title" onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 13000, display: "grid", placeItems: "center", padding: "16px", background: "rgba(0,0,0,.55)" }}>
      <form onSubmit={submitPayment} onClick={(event) => event.stopPropagation()} style={{ width: "100%", maxWidth: "430px", maxHeight: "94vh", overflowY: "auto", padding: "10px", background: "#fff", borderRadius: "10px", boxShadow: "0 20px 60px rgba(0,0,0,.24)", fontFamily: "Inter, Arial, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 2px 10px" }}>
          <h2 id="payment-title" style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#333" }}><CreditCard size={15} style={{ verticalAlign: "-3px", marginRight: "6px" }} />Pago con tarjeta</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar pago" style={{ border: 0, background: "transparent", color: "#666", cursor: "pointer", padding: "2px" }}><X size={16} /></button>
        </div>
        <p style={{ margin: "0 0 11px", color: "#888", fontSize: "11px" }}>Ingresa los datos de tu tarjeta para completar tu compra.</p>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", marginBottom: "14px", background: "#e8f8f4", borderRadius: "8px", color: "#248a7d" }}>
          <CheckCircle size={19} />
          <div><strong style={{ display: "block", fontSize: "11px" }}>Pago seguro</strong><span style={{ display: "block", fontSize: "9px", color: "#6a918a" }}>Procesado mediante Openpay México</span></div>
          <strong style={{ marginLeft: "auto", fontSize: "15px", color: "#268d82" }}>openpay</strong>
        </div>

        <label style={{ display: "block", marginBottom: "10px", color: "#777", fontSize: "10px", fontWeight: 600 }}>Nombre del titular<input required value={cardName} onChange={(event) => setCardName(event.target.value)} placeholder="Nombre completo" style={fieldStyle} /></label>
        <div style={{ marginBottom: "12px", padding: "11px 12px", border: "1px solid #d9e8ff", borderRadius: "8px", background: "#f7faff" }}>
          <label style={{ display: "block", color: "#315b91", fontSize: "11px", fontWeight: 700 }}><Mail size={14} style={{ verticalAlign: "-3px", marginRight: "5px" }} />Correo electrónico *</label>
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@ejemplo.com" autoComplete="email" style={{ ...fieldStyle, marginTop: "7px", borderColor: "#b9d2f5" }} />
          <span style={{ display: "block", marginTop: "5px", color: "#7892b5", fontSize: "9px" }}>Recibirás aquí los detalles de tu pedido.</span>
        </div>
        <label style={{ display: "block", marginBottom: "10px", color: "#777", fontSize: "10px", fontWeight: 600 }}>Número de tarjeta<div style={{ position: "relative" }}><CreditCard size={14} style={{ position: "absolute", left: "10px", top: "14px", color: "#aaa" }} /><input required value={cardNumber} onChange={(event) => setCardNumber(formatCardNumber(event.target.value))} inputMode="numeric" placeholder="0000 0000 0000 0000" style={{ ...fieldStyle, paddingLeft: "31px" }} /></div></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}><label style={{ color: "#777", fontSize: "10px", fontWeight: 600 }}>Vencimiento<input required value={cardExpiry} onChange={(event) => setCardExpiry(formatExpiry(event.target.value))} placeholder="MM/AA" inputMode="numeric" style={{ ...fieldStyle, background: "#eef5ff" }} /></label><label style={{ color: "#777", fontSize: "10px", fontWeight: 600 }}>CVV<div style={{ position: "relative" }}><input required value={cardCvv} onChange={(event) => setCardCvv(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" inputMode="numeric" style={fieldStyle} /><LockKeyhole size={13} style={{ position: "absolute", right: "9px", top: "14px", color: "#999" }} /></div></label></div>

        <div style={{ marginTop: "14px", padding: "12px", background: "#f7f7f7", borderRadius: "8px" }}><h3 style={{ margin: "0 0 9px", fontSize: "11px", color: "#555" }}>Resumen del pago</h3>{cart.slice(0, 3).map((item: any) => <div key={item.product?.id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "5px 0", borderBottom: "1px solid #e5e5e5", color: "#777", fontSize: "10px" }}><span>{item.product?.name || "Producto"} x {item.quantity}</span><span>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD"}).format(Number(item.product?.price || 0))}</span></div>)}<div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", color: "#333", fontSize: "12px", fontWeight: 700 }}><span>Total a pagar</span><strong style={{ fontSize: "20px" }}>{displayTotal}</strong></div></div>
        {paymentNotice && (  
          <div role="status" style={{ margin: "11px 0 0", padding: "10px", color: "#6b5200", background: "#fff8dc", border: "1px solid #f0df9d", borderRadius: "6px", fontSize: "11px" }}>
            <strong style={{ display: "block", marginBottom: "3px" }} > Verificación de seguridad </strong>{paymentNotice}
          </div>)}
        {error && (
          <div role="alert" style={{ margin: "11px 0 0", padding: "9px", color: "#a40000", background: "#fff0f0", borderRadius: "6px", fontSize: "11px"}}>
            {errorTitle && (<strong style={{ display: "block", marginBottom: "3px" }}>{errorTitle}</strong>)}{error}
          </div>
        )}
        <div style={{ display: "flex", gap: "8px", marginTop: "13px" }}><button type="button" onClick={onBack} style={{ flex: "0 0 74px", padding: "11px", border: "1px solid #ddd", background: "#fff", borderRadius: "20px", fontSize: "11px", cursor: "pointer" }}>Volver</button><button type="submit" disabled={processing || cart.length === 0} style={{ flex: 1, padding: "12px", border: 0, background: "#050505", color: "#fff", borderRadius: "20px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}><LockKeyhole size={12} style={{ verticalAlign: "-2px", marginRight: "4px" }} />{processing ? "Procesando..." : `Pagar ${displayTotal}`}</button></div>
        <p style={{ margin: "10px 0 0", textAlign: "center", color: "#aaa", fontSize: "8px" }}>Tu pago será procesado de forma segura mediante Openpay México.</p>
      </form>
    </div>
  );
};

export default PaymentModal;
