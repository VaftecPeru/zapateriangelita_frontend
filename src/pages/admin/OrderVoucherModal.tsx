import { Download, Printer, QrCode, X } from 'lucide-react';
import type { Order } from '../../services/crudService';

type Props = {
  order: Order;
  onClose: () => void;
};

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const isPaid = (order: Order) =>
  Boolean(order.paid_at) ||
  ['paid', 'completed', 'complete', 'succeeded'].includes(String(order.payment_status || '').toLowerCase());

const qrPayload = (order: Order) =>
  [
    'ZAPATERIA ANGELITA',
    `PEDIDO:${order.code}`,
    `PAGO:${order.payment_reference || order.payment_transaction_id || 'CONFIRMADO'}`,
    `TOTAL:${Number(order.total || 0).toFixed(2)} MXN`,
    `FECHA:${order.paid_at || order.created_at || ''}`,
  ].join('|');

const qrUrl = (order: Order, size = 260) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(qrPayload(order))}`;

const voucherHtml = (order: Order) => {
  const rows = (order.items || []).map((item) => {
    const unitPrice = Number(item.unit_price || 0);
    const quantity = Number(item.quantity || 0);
    return `
      <tr>
        <td>${escapeHtml(item.product_name || 'Producto')}</td>
        <td>${escapeHtml(item.color || '—')}</td>
        <td>${escapeHtml(item.size || '—')}</td>
        <td style="text-align:center">${quantity}</td>
        <td style="text-align:right">${money.format(unitPrice)}</td>
        <td style="text-align:right">${money.format(unitPrice * quantity)}</td>
      </tr>`;
  }).join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Voucher ${escapeHtml(order.code)} - Zapatería Angelita</title>
<style>
  *{box-sizing:border-box} body{font-family:Arial,sans-serif;margin:0;background:#f4f4f4;color:#151515}
  .page{max-width:820px;margin:24px auto;background:white;padding:34px;border-radius:20px}
  .head{display:flex;justify-content:space-between;gap:24px;border-bottom:3px solid #e30613;padding-bottom:18px}
  .brand small{display:block;letter-spacing:.22em;text-transform:uppercase}.brand h1{margin:2px 0;color:#e30613}
  .status{font-weight:800;color:#167a3d;text-transform:uppercase}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 30px;margin:24px 0}
  .label{font-size:11px;color:#777;text-transform:uppercase;font-weight:700}.value{font-size:14px;font-weight:700;margin-top:3px}
  table{width:100%;border-collapse:collapse;margin-top:18px} th,td{padding:10px 8px;border-bottom:1px solid #eee;font-size:12px} th{text-align:left;background:#fafafa}
  .summary{margin:24px 0 0 auto;width:min(320px,100%)} .summary div{display:flex;justify-content:space-between;padding:7px 0}.summary .total{font-size:18px;font-weight:900;border-top:2px solid #111;margin-top:5px;padding-top:12px}
  .qr{display:flex;align-items:center;gap:20px;margin-top:30px;border-top:1px dashed #bbb;padding-top:22px}.qr img{width:150px;height:150px}.qr p{font-size:12px;color:#555;line-height:1.5}
  .footer{text-align:center;color:#777;font-size:11px;margin-top:26px}
  @media print{body{background:#fff}.page{margin:0;max-width:none;border-radius:0;padding:18mm}.no-print{display:none!important}}
  @media(max-width:620px){.grid{grid-template-columns:1fr}.head,.qr{flex-direction:column}}
</style>
</head>
<body>
  <main class="page">
    <div class="head">
      <div class="brand"><small>Zapatería</small><h1>ANGELITA</h1><div>Voucher de compra</div></div>
      <div><div class="label">Pedido</div><div class="value">${escapeHtml(order.code)}</div><div class="status">${isPaid(order) ? 'Pago confirmado' : escapeHtml(order.payment_status || 'Pendiente')}</div></div>
    </div>
    <section class="grid">
      <div><div class="label">Cliente</div><div class="value">${escapeHtml(order.customer_name || order.user?.name || 'Cliente')}</div></div>
      <div><div class="label">Contacto</div><div class="value">${escapeHtml(order.shipping_phone || order.user?.phone || '—')}</div></div>
      <div><div class="label">Fecha y hora</div><div class="value">${escapeHtml(formatDate(order.paid_at || order.created_at))}</div></div>
      <div><div class="label">Método de pago</div><div class="value">${escapeHtml((order.payment_method || 'OpenPay').toUpperCase())}</div></div>
      <div><div class="label">Referencia</div><div class="value">${escapeHtml(order.payment_reference || '—')}</div></div>
      <div><div class="label">Transacción</div><div class="value">${escapeHtml(order.payment_transaction_id || '—')}</div></div>
    </section>
    <table>
      <thead><tr><th>Producto</th><th>Color</th><th>Talla</th><th>Cant.</th><th>Precio</th><th>Importe</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="6">Sin detalle de artículos.</td></tr>'}</tbody>
    </table>
    <section class="summary">
      <div><span>Subtotal</span><strong>${money.format(Number(order.subtotal ?? order.total ?? 0))}</strong></div>
      <div><span>Descuento</span><strong>-${money.format(Number(order.discount || 0))}</strong></div>
      <div><span>Envío</span><strong>${money.format(Number(order.shipping_cost || 0))}</strong></div>
      <div class="total"><span>Total</span><strong>${money.format(Number(order.total || 0))}</strong></div>
    </section>
    <section class="qr">
      <img src="${escapeHtml(qrUrl(order, 300))}" alt="QR del voucher" />
      <p><strong>QR de validación del voucher.</strong><br/>Contiene únicamente el código del pedido, referencia/transacción, total y fecha. No incluye datos personales del cliente.</p>
    </section>
    <p class="footer">Zapatería Angelita · Comprobante generado desde la intranet.</p>
  </main>
</body>
</html>`;
};

const OrderVoucherModal = ({ order, onClose }: Props) => {
  const paid = isPaid(order);

  const openPrintable = () => {
    const win = window.open('', '_blank', 'noopener,noreferrer,width=980,height=800');
    if (!win) return;
    win.document.open();
    win.document.write(voucherHtml(order));
    win.document.close();
    window.setTimeout(() => {
      win.focus();
      win.print();
    }, 450);
  };

  const downloadVoucher = () => {
    const blob = new Blob([voucherHtml(order)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `voucher-${order.code}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[3300] flex items-center justify-center bg-black/65 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Voucher del pedido ${order.code}`}>
      <section className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-store-red">Voucher + QR</p>
            <h3 className="mt-1 text-xl font-black text-black">Pedido {order.code}</h3>
            <p className="mt-1 text-xs font-bold text-gray-400">{formatDate(order.paid_at || order.created_at)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-gray-50 p-2 text-gray-500 hover:bg-red-50 hover:text-store-red" aria-label="Cerrar voucher"><X size={18} /></button>
        </header>

        <div className="p-6 md:p-8">
          {!paid && (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
              El voucher definitivo se habilita cuando el pago está confirmado.
            </div>
          )}

          <div className="grid gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:grid-cols-2">
            <div><p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Cliente</p><p className="mt-1 text-sm font-black">{order.customer_name || order.user?.name || 'Cliente'}</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Teléfono</p><p className="mt-1 text-sm font-black">{order.shipping_phone || order.user?.phone || '—'}</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Pago</p><p className={`mt-1 text-sm font-black ${paid ? 'text-green-700' : 'text-amber-700'}`}>{paid ? 'Confirmado' : (order.payment_status || 'Pendiente')}</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Método</p><p className="mt-1 text-sm font-black">{(order.payment_method || 'OpenPay').toUpperCase()}</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Referencia</p><p className="mt-1 break-all text-xs font-bold">{order.payment_reference || '—'}</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Transacción</p><p className="mt-1 break-all text-xs font-bold">{order.payment_transaction_id || '—'}</p></div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-[620px] w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                <tr><th className="px-4 py-3">Producto</th><th className="px-4 py-3">Color</th><th className="px-4 py-3">Talla</th><th className="px-4 py-3">Cant.</th><th className="px-4 py-3 text-right">Importe</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(order.items || []).map((item, index) => (
                  <tr key={`${order.id}-voucher-${index}`}>
                    <td className="px-4 py-3 font-bold">{item.product_name || 'Producto'}</td>
                    <td className="px-4 py-3">{item.color || '—'}</td>
                    <td className="px-4 py-3">{item.size || '—'}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3 text-right font-black">{money.format(Number(item.unit_price || 0) * Number(item.quantity || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid items-center gap-6 md:grid-cols-[1fr_220px]">
            <div className="rounded-2xl border border-gray-100 p-5">
              <div className="flex justify-between py-1 text-sm"><span className="text-gray-500">Subtotal</span><strong>{money.format(Number(order.subtotal ?? order.total ?? 0))}</strong></div>
              <div className="flex justify-between py-1 text-sm"><span className="text-gray-500">Descuento</span><strong>-{money.format(Number(order.discount || 0))}</strong></div>
              <div className="flex justify-between py-1 text-sm"><span className="text-gray-500">Envío</span><strong>{money.format(Number(order.shipping_cost || 0))}</strong></div>
              <div className="mt-3 flex justify-between border-t border-gray-200 pt-4 text-lg"><span className="font-black">Total</span><strong className="text-store-red">{money.format(Number(order.total || 0))}</strong></div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
              <img src={qrUrl(order)} alt={`QR voucher ${order.code}`} className="mx-auto h-44 w-44 rounded-xl" />
              <p className="mt-2 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-500"><QrCode size={13} /> Validación QR</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={downloadVoucher} disabled={!paid} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"><Download size={15} /> Descargar</button>
            <button type="button" onClick={openPrintable} disabled={!paid} className="inline-flex items-center justify-center gap-2 rounded-xl bg-store-red px-5 py-3 text-xs font-black uppercase tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-40"><Printer size={15} /> Imprimir / PDF</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderVoucherModal;
