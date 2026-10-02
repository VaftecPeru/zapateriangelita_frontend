import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, CheckCircle2, MessageCircle, Package, ReceiptText, ShieldCheck, ShoppingBag } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import GoogleIdentityButton from "../components/GoogleIdentityButton";
import OrderVoucherModal from "./admin/OrderVoucherModal";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { analyticsService, Order, orderService, settingsService } from "../services/crudService";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const statusLabel = (status?: string) => {
  const map: Record<string, string> = {
    sin_preparar: "Compra recibida",
    preparado: "Preparando pedido",
    enviado: "Enviado",
    entregado: "Entregado",
    cancelado: "Finalizado",
    finalizado: "Finalizado",
    pending: "Compra recibida",
    confirmed: "Preparando pedido",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Finalizado",
  };
  return map[String(status || "").toLowerCase()] || status || "Procesando";
};

const ClientPurchasesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, updateUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [googleLinking, setGoogleLinking] = useState(false);
  const [googleMessage, setGoogleMessage] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [supportNumber, setSupportNumber] = useState('');
  const purchaseConfirmed = (location.state as any)?.purchaseConfirmed as
    | {
        orderCode?: string | null;
        transactionId?: string | null;
        paymentReference?: string | null;
        emailScheduled?: boolean;
      }
    | undefined;

  useEffect(() => {
    settingsService.getAll()
      .then((response) => setSupportNumber(String(response.data?.data?.whatsapp_number || '')))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true, state: { from: "/profile/purchases" } });
      return;
    }

    setLoadingOrders(true);
    setError(null);
    orderService
      .getMyOrders()
      .then((response) => setOrders(response.data || []))
      .catch((err) => {
        console.error("Error cargando compras:", err);
        setError("No pudimos cargar tus compras. Intenta nuevamente.");
      })
      .finally(() => setLoadingOrders(false));
  }, [user, loading, navigate]);

  const handleGoogleLink = async (credential: string) => {
    setGoogleLinking(true);
    setGoogleMessage(null);
    setGoogleError(null);

    try {
      const response = await authService.googleLink(credential);
      const updatedUser = response.data?.user;
      if (updatedUser) updateUser(updatedUser);
      setGoogleMessage("Tu cuenta de Google quedó vinculada. En tu próximo acceso podrás entrar sin contraseña.");
    } catch (err: any) {
      setGoogleError(
        err.response?.data?.message
        || err.message
        || "No fue posible vincular tu cuenta de Google."
      );
    } finally {
      setGoogleLinking(false);
    }
  };

  if (loading || (user && loadingOrders)) {
    return (
      <main className="min-h-screen bg-[#f7f7f7] grid place-items-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#e30613] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.25em]">Cargando tus compras...</p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const googleLinked = Boolean(user.google_linked_at);

  return (
    <main className="min-h-screen bg-[#f7f7f7] px-4 md:px-6 pb-20">
      <header className="max-w-6xl mx-auto pt-7 pb-6 border-b border-black/5">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#121212]/60 hover:text-[#121212]"
          >
            <ArrowLeft size={17} /> Mi perfil
          </button>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#e30613]">Área cliente</p>
            <h1 className="text-2xl md:text-3xl font-black text-[#121212] tracking-tight">Mis Compras</h1>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto mt-8">
        {purchaseConfirmed && (
          <div
            role="status"
            className="mb-6 rounded-[2rem] border border-emerald-200 bg-emerald-50 p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-white">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-700">Pago confirmado</p>
                <h2 className="mt-1 text-2xl font-black text-[#121212]">¡Gracias por tu compra!</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-900/70">
                  Tu pago fue confirmado y tu pedido ya está registrado.
                  {purchaseConfirmed.emailScheduled
                    ? " Estamos preparando el correo con tu voucher y datos de acceso."
                    : ""}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-emerald-900/70">
                  {purchaseConfirmed.orderCode && (
                    <span className="rounded-full bg-white/80 px-3 py-1.5">Pedido: {purchaseConfirmed.orderCode}</span>
                  )}
                  {purchaseConfirmed.transactionId && (
                    <span className="rounded-full bg-white/80 px-3 py-1.5">Movimiento: {purchaseConfirmed.transactionId}</span>
                  )}
                  {purchaseConfirmed.paymentReference && (
                    <span className="rounded-full bg-white/80 px-3 py-1.5">Referencia: {purchaseConfirmed.paymentReference}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-[2rem] border border-black/5 shadow-sm p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e30613]">Historial de pedidos</p>
              <h2 className="text-2xl font-black text-[#121212] mt-1">Hola, {user.name}</h2>
              <p className="text-sm text-gray-400 mt-1">Aquí puedes revisar tu compra y el avance de cada pedido.</p>
            </div>
            <div className="inline-flex items-center gap-3 bg-[#f7f7f7] px-5 py-3 rounded-2xl border border-black/5">
              <ReceiptText size={18} className="text-[#e30613]" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Compras</p>
                <p className="font-black text-[#121212]">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className={`mb-8 rounded-3xl border p-5 md:p-6 ${googleLinked ? "border-emerald-200 bg-emerald-50/70" : "border-blue-100 bg-[#f7f9ff]"}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 ${googleLinked ? "bg-emerald-100 text-emerald-700" : "bg-white text-[#e30613] border border-black/5"}`}>
                  {googleLinked ? <CheckCircle2 size={23} /> : <ShieldCheck size={23} />}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Seguridad de tu cuenta</p>
                  <h3 className="mt-1 text-lg font-black text-[#121212]">
                    {googleLinked ? "Google está vinculado" : "Entra más rápido con Google"}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                    {googleLinked
                      ? `Tu cuenta ${user.google_email || user.email} puede usar Google para iniciar sesión sin escribir la contraseña.`
                      : `Vincula la misma cuenta de Google asociada a ${user.email}. Mantendrás también tu contraseña como método alternativo de acceso.`}
                  </p>
                </div>
              </div>

              {!googleLinked && (
                <div className="w-full lg:w-[360px] shrink-0">
                  <GoogleIdentityButton
                    mode="link"
                    onCredential={handleGoogleLink}
                    disabled={googleLinking}
                  />
                </div>
              )}
            </div>

            {googleMessage && (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm font-semibold text-emerald-700">
                {googleMessage}
              </p>
            )}
            {googleError && (
              <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-[#bd0711]">
                {googleError}
              </p>
            )}
          </div>

          {error && (
            <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-[#bd0711]">
              {error}
            </p>
          )}

          {orders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <article key={order.id} className="bg-[#f7f7f7] border border-black/5 rounded-2xl p-5 hover:border-[#e30613]/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-black/5 shrink-0">
                        <Package size={21} className="text-[#e30613]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-[#121212]">Pedido {order.code}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} /> {order.created_at ? new Date(order.created_at).toLocaleDateString("es-MX") : "Fecha pendiente"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ShoppingBag size={12} /> {order.items?.length || 0} productos
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:text-right">
                      <span className="inline-flex px-4 py-2 rounded-full bg-[#121212] text-white text-[9px] font-black uppercase tracking-widest">
                        {statusLabel(order.status)}
                      </span>
                      <div className="mt-3 space-y-1 text-xs text-gray-500">
                        <div className="flex justify-between gap-5 md:justify-end">
                          <span>Subtotal</span>
                          <strong className="text-[#121212]">{money.format(Number(order.subtotal ?? 0))}</strong>
                        </div>
                        <div className="flex justify-between gap-5 md:justify-end">
                          <span>Costo de delivery</span>
                          <strong className="text-[#121212]">{money.format(Number(order.shipping_cost || 0))}</strong>
                        </div>
                      </div>
                      <p className="text-xl font-black text-[#e30613] mt-2">{money.format(Number(order.total || 0))}</p>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-black/5 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.items.map((item, index) => (
                        <div key={`${order.id}-${index}`} className="bg-white rounded-xl border border-black/5 px-4 py-3 text-sm">
                          <div className="flex justify-between gap-3">
                            <strong className="text-[#121212]">{item.product_name || "Producto"}</strong>
                            <span className="font-black">x{item.quantity}</span>
                          </div>
                          {(item.size || item.color) && (
                            <p className="text-[11px] text-gray-400 mt-1">
                              {item.size ? `Talla ${item.size}` : ""}{item.size && item.color ? " · " : ""}{item.color ? `Color ${item.color}` : ""}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-black/5 pt-4">
                    <button type="button" onClick={() => setReceiptOrder(order)} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#121212]">
                      <ReceiptText size={14} /> Comprobante
                    </button>
                    {supportNumber && (
                      <a
                        href={`https://wa.me/${supportNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola, necesito ayuda con mi pedido ${order.code}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => void analyticsService.track('whatsapp_click', undefined, { source: 'my_purchases', order_id: order.id }).catch(() => undefined)}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                      >
                        <MessageCircle size={14} /> Chat con administración
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-[#f7f7f7] rounded-3xl border border-black/5 text-center">
              <div className="w-20 h-20 bg-white text-[#e30613] rounded-full flex items-center justify-center mb-5 border border-black/5">
                <ShoppingBag size={34} />
              </div>
              <h3 className="text-2xl font-black text-[#121212]">Aún no tienes compras</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-sm">Cuando completes tu primera compra, aparecerá aquí automáticamente.</p>
              <button type="button" onClick={() => navigate("/")} className="mt-6 px-6 py-3 rounded-full bg-[#e30613] text-white text-xs font-black uppercase tracking-widest">
                Ir a la tienda
              </button>
            </div>
          )}
        </div>
      </section>

      {receiptOrder && (
        <OrderVoucherModal
          order={receiptOrder}
          onClose={() => setReceiptOrder(null)}
        />
      )}
    </main>
  );
};

export default ClientPurchasesPage;
