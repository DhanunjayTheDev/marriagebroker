import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config';
import { logger } from '../utils/logger';

let transporter: Transporter;

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }
  return transporter;
};

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }>;
}

export const sendEmail = async (payload: EmailPayload): Promise<void> => {
  if (env.NODE_ENV === 'test') return;

  try {
    const info = await getTransporter().sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`,
      ...payload,
    });
    logger.debug('Email sent', { messageId: info.messageId, to: payload.to });
  } catch (error) {
    logger.error('Email send failed', { error, to: payload.to });
    throw error;
  }
};

export const sendOtpEmail = async (email: string, otp: string, purpose: string): Promise<void> => {
  const purposeLabel = {
    login: 'Login',
    register: 'Registration',
    reset: 'Password Reset',
    email_verify: 'Email Verification',
  }[purpose] ?? 'Verification';

  await sendEmail({
    to: email,
    subject: `${otp}  Your Avyuktha ${purposeLabel} OTP`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e44d26;">Avyuktha Matrimony</h2>
        <p>Your ${purposeLabel} OTP is:</p>
        <h1 style="font-size: 48px; letter-spacing: 8px; color: #333; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">${otp}</h1>
        <p>Valid for <strong>${env.OTP_EXPIRY_MINUTES} minutes</strong>. Do not share this OTP with anyone.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">If you did not request this, please ignore this email or contact support.</p>
      </div>
    `,
    text: `Your Avyuktha ${purposeLabel} OTP is: ${otp}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`,
  });
};

export const sendWelcomeEmail = async (email: string, firstName: string, verifyUrl: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `Welcome to Avyuktha Matrimony, ${firstName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e44d26;">Welcome, ${firstName}!</h2>
        <p>Thank you for joining Avyuktha Matrimony  your journey to finding the perfect life partner begins now.</p>
        <p>Please verify your email address to get started:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #e44d26; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Verify Email</a>
        <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Password Reset  Avyuktha Matrimony',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #e44d26;">Password Reset Request</h2>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #e44d26; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 16px 0;">Reset Password</a>
        <p>If you didn't request this, ignore this email. Your password won't change.</p>
        <p style="color: #999; font-size: 12px;">For security, this link expires in 1 hour.</p>
      </div>
    `,
  });
};
