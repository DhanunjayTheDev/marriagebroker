import { Cashfree, CFEnvironment } from 'cashfree-pg';
import { env } from '../../config';
import { hmacSHA256 } from '../../utils/crypto';
import { logger } from '../../utils/logger';

Cashfree.XClientId = env.CASHFREE_APP_ID;
Cashfree.XClientSecret = env.CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = env.CASHFREE_ENV === 'PROD' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

export interface CreateCashfreeOrderOptions {
  orderId: string;
  amount: number;
  currency?: string;
  customerId: string;
  customerEmail?: string;
  customerPhone: string;
  returnUrl?: string;
  notifyUrl?: string;
  orderNote?: string;
}

export const createCashfreeOrder = async (options: CreateCashfreeOrderOptions) => {
  try {
    const response = await Cashfree.PGCreateOrder('2023-08-01', {
      order_id: options.orderId,
      order_amount: options.amount,
      order_currency: options.currency ?? 'INR',
      customer_details: {
        customer_id: options.customerId,
        customer_email: options.customerEmail,
        customer_phone: options.customerPhone,
      },
      order_meta: {
        return_url: options.returnUrl,
        notify_url: options.notifyUrl,
      },
      order_note: options.orderNote,
    });
    return response.data;
  } catch (error) {
    logger.error('Cashfree order creation failed', { error });
    throw error;
  }
};

export const verifyCashfreeWebhook = (rawBody: string, signature: string, timestamp: string): boolean => {
  const data = `${timestamp}${rawBody}`;
  const computed = hmacSHA256(data, env.CASHFREE_WEBHOOK_SECRET);
  return computed === signature;
};

export const fetchCashfreeOrder = async (orderId: string) => {
  const response = await Cashfree.PGFetchOrder('2023-08-01', orderId);
  return response.data;
};

export const refundCashfreePayment = async (orderId: string, refundId: string, amount: number) => {
  const response = await Cashfree.PGOrderCreateRefund('2023-08-01', orderId, {
    refund_amount: amount,
    refund_id: refundId,
  });
  return response.data;
};
