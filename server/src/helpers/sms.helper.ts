import twilio from 'twilio';
import { env } from '../config';
import { logger } from '../utils/logger';

let twilioClient: twilio.Twilio;

const getClient = (): twilio.Twilio => {
  if (!twilioClient) {
    twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
};

export const sendSms = async (to: string, body: string): Promise<void> => {
  if (env.NODE_ENV === 'test') return;
  if (!env.TWILIO_ACCOUNT_SID) {
    logger.warn('Twilio not configured SMS skipped', { to });
    return;
  }

  try {
    const opts: Parameters<ReturnType<typeof twilio>['messages']['create']>[0] = { body, to };
    if (env.TWILIO_MESSAGING_SERVICE_SID) {
      opts.messagingServiceSid = env.TWILIO_MESSAGING_SERVICE_SID;
    } else {
      opts.from = env.TWILIO_PHONE_NUMBER;
    }
    const msg = await getClient().messages.create(opts);
    logger.debug('SMS sent', { sid: msg.sid, to });
  } catch (error) {
    logger.error('SMS failed', { error, to });
    throw error;
  }
};

export const sendOtpSms = async (phone: string, otp: string, purpose: string): Promise<void> => {
  const purposeLabel = {
    login: 'Login',
    register: 'Registration',
    reset: 'Password Reset',
  }[purpose] ?? 'Verification';

  await sendSms(
    phone,
    `${otp} is your Avyuktha Matrimony ${purposeLabel} OTP. Valid for ${env.OTP_EXPIRY_MINUTES} mins. Do not share.`
  );
};

export const sendInterestNotificationSms = async (phone: string, name: string): Promise<void> => {
  await sendSms(phone, `${name} has sent you an interest on Avyuktha Matrimony. Login to view and respond.`);
};
