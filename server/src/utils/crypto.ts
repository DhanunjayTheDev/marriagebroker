import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(env.ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));

export const hashPassword = async (password: string): Promise<string> =>
  bcrypt.hash(password, env.HASH_SALT_ROUNDS);

export const comparePassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (ciphertext: string): string => {
  const [ivHex, tagHex, encryptedHex] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted) + decipher.final('utf8');
};

export const generateSecureToken = (bytes = 32): string =>
  crypto.randomBytes(bytes).toString('hex');

export const generateShortCode = (length = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const hashSHA256 = (data: string): string =>
  crypto.createHash('sha256').update(data).digest('hex');

export const hmacSHA256 = (data: string, secret: string): string =>
  crypto.createHmac('sha256', secret).update(data).digest('hex');

export const verifyHmac = (data: string, secret: string, signature: string): boolean =>
  crypto.timingSafeEqual(
    Buffer.from(hmacSHA256(data, secret)),
    Buffer.from(signature)
  );

export const maskPhone = (phone: string): string =>
  phone.slice(0, 3) + '*'.repeat(Math.max(0, phone.length - 6)) + phone.slice(-3);

export const maskEmail = (email: string): string => {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 2)}${'*'.repeat(Math.max(0, user.length - 2))}@${domain}`;
};
