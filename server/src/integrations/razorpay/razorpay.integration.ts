import Razorpay from 'razorpay';
import { env } from '../../config';
import { hmacSHA256, verifyHmac } from '../../utils/crypto';
import { AppError } from '../../utils/AppError';
import { ErrorCode } from '../../constants';

let razorpayClient: Razorpay;

export const getRazorpay = (): Razorpay => {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
};

export interface CreateRazorpayOrderOptions {
  amount: number; // in paise
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export const createRazorpayOrder = async (options: CreateRazorpayOrderOptions) => {
  const rz = getRazorpay();
  return rz.orders.create({
    amount: options.amount,
    currency: options.currency ?? 'INR',
    receipt: options.receipt ?? `rcpt_${Date.now()}`,
    notes: options.notes ?? {},
  });
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const body = `${orderId}|${paymentId}`;
  return verifyHmac(body, env.RAZORPAY_KEY_SECRET, signature);
};

export const verifyRazorpayWebhook = (rawBody: string, signature: string): boolean => {
  return verifyHmac(rawBody, env.RAZORPAY_WEBHOOK_SECRET, signature);
};

export const createRazorpayRefund = async (paymentId: string, amount?: number) => {
  const rz = getRazorpay();
  return rz.payments.refund(paymentId, { amount });
};

export const fetchRazorpayPayment = async (paymentId: string) => {
  return getRazorpay().payments.fetch(paymentId);
};
