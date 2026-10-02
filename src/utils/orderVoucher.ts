import type { Order } from '../services/crudService';

const PAID_STATUSES = new Set(['paid', 'completed', 'complete', 'succeeded']);

export const isOrderPaid = (order: Pick<Order, 'paid_at' | 'payment_status'>) =>
  Boolean(order.paid_at) ||
  PAID_STATUSES.has(String(order.payment_status || '').toLowerCase());

export const canInspectOrderVoucher = (role?: string | null) =>
  ['admin', 'superadmin'].includes(String(role || '').toLowerCase());

export const voucherPaymentToken = (
  order: Pick<Order, 'paid_at' | 'payment_status' | 'payment_reference' | 'payment_transaction_id'>,
) => {
  if (isOrderPaid(order)) {
    return order.payment_reference || order.payment_transaction_id || 'CONFIRMADO';
  }

  return String(order.payment_status || 'PENDIENTE').toUpperCase();
};
