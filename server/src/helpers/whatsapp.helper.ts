import axios from 'axios';
import twilio from 'twilio';
import { env } from '../config';
import { logger } from '../utils/logger';

const sendWhatsAppViaTwilio = async (to: string, body: string): Promise<void> => {
  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body,
    from: env.WHATSAPP_FROM,
    to: `whatsapp:${to}`,
  });
};

const sendWhatsAppViaWABA = async (to: string, body: string): Promise<void> => {
  await axios.post(
    `https://graph.facebook.com/v18.0/${env.WABA_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to.replace(/^\+/, ''),
      type: 'text',
      text: { preview_url: false, body },
    },
    {
      headers: {
        Authorization: `Bearer ${env.WABA_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const sendWhatsApp = async (to: string, body: string): Promise<void> => {
  if (env.NODE_ENV === 'test') return;

  try {
    if (env.WHATSAPP_PROVIDER === 'waba') {
      await sendWhatsAppViaWABA(to, body);
    } else {
      await sendWhatsAppViaTwilio(to, body);
    }
    logger.debug('WhatsApp sent', { to });
  } catch (error) {
    logger.error('WhatsApp failed', { error, to });
    // Non-critical don't rethrow
  }
};

export const sendOtpWhatsApp = async (phone: string, otp: string, purpose: string): Promise<void> => {
  const msg = `*Avyuktha Matrimony*\n\nYour ${purpose} OTP is: *${otp}*\nValid for ${env.OTP_EXPIRY_MINUTES} minutes.\n\n_Do not share this OTP with anyone._`;
  await sendWhatsApp(phone, msg);
};

export const sendInterestWhatsApp = async (phone: string, senderName: string): Promise<void> => {
  const msg = `*Avyuktha Matrimony*\n\n${senderName} has sent you an interest! 💍\n\nLogin to view their profile and respond.`;
  await sendWhatsApp(phone, msg);
};
