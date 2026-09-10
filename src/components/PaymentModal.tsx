import { useState } from "react";
import { CheckCircle, CreditCard, LockKeyhole, Mail, X } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  cart: any[];
  customerName: string;
  customerEmail?: string;
  onClose: () => void;
  onBack: () => void;
  onPay: (paymentData: { paymentMethod: string; customerName: string; customerEmail: string }) => void | Promise<void>;
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

const PaymentModal = ({ isOpen, total, cart = [], customerName, customerEmail = "", onClose, onBack, onPay }: PaymentModalProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatCardNumber = (value: string) => value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (value: string) => value.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  const displayTotal = `S/ ${Number(total).toFixed(2)}`;

  const submitPayment = (event: React.FormEvent) => {
    event.preventDefault();
    if (cardNumber.replace(/\s/g, "").length < 16 || !cardName.trim() || cardExpiry.length < 5 || cardCvv.length < 3) {
      setError("Completa correctamente los datos de tu tarjeta.");
      return;
    }
    setError(null);
    setProcessing(true);
    window.setTimeout(async () => {
      try {
        await onPay({ paymentMethod: "openpay_card", customerName: cardName, customerEmail: email });
      } catch {
        setError("No se pudo completar el registro del correo. Inténtalo nuevamente.");
      } finally {
        setProcessing(false);
      }
    }, 500);
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

        <div style={{ marginTop: "14px", padding: "12px", background: "#f7f7f7", borderRadius: "8px" }}><h3 style={{ margin: "0 0 9px", fontSize: "11px", color: "#555" }}>Resumen del pago</h3>{cart.slice(0, 3).map((item: any) => <div key={item.product?.id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "5px 0", borderBottom: "1px solid #e5e5e5", color: "#777", fontSize: "10px" }}><span>{item.product?.name || "Producto"} x {item.quantity}</span><span>S/ {Number(item.product?.price || 0).toFixed(2)}</span></div>)}<div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", color: "#333", fontSize: "12px", fontWeight: 700 }}><span>Total a pagar</span><strong style={{ fontSize: "20px" }}>{displayTotal}</strong></div></div>
        {error && <p role="alert" style={{ margin: "11px 0 0", padding: "9px", color: "#a40000", background: "#fff0f0", borderRadius: "6px", fontSize: "11px" }}>{error}</p>}
        <div style={{ display: "flex", gap: "8px", marginTop: "13px" }}><button type="button" onClick={onBack} style={{ flex: "0 0 74px", padding: "11px", border: "1px solid #ddd", background: "#fff", borderRadius: "20px", fontSize: "11px", cursor: "pointer" }}>Volver</button><button type="submit" disabled={processing || cart.length === 0} style={{ flex: 1, padding: "12px", border: 0, background: "#050505", color: "#fff", borderRadius: "20px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}><LockKeyhole size={12} style={{ verticalAlign: "-2px", marginRight: "4px" }} />{processing ? "Procesando..." : `Pagar ${displayTotal}`}</button></div>
        <p style={{ margin: "10px 0 0", textAlign: "center", color: "#aaa", fontSize: "8px" }}>Tu pago será procesado de forma segura mediante Openpay México.</p>
      </form>
    </div>
  );
};

export default PaymentModal;
