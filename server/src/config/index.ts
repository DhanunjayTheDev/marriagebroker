import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optionalEnv = (key: string, fallback = ''): string =>
  process.env[key] ?? fallback;

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test' | 'staging',
  PORT: parseInt(optionalEnv('PORT', '5000'), 10),
  APP_NAME: optionalEnv('APP_NAME', 'Avyuktha Matrimony'),
  APP_URL: optionalEnv('APP_URL', 'http://localhost:5000'),
  CLIENT_URL: optionalEnv('CLIENT_URL', 'http://localhost:3000'),
  API_VERSION: optionalEnv('API_VERSION', 'v1'),

  // MongoDB
  MONGODB_URI: requireEnv('MONGODB_URI'),
  MONGODB_DB_NAME: optionalEnv('MONGODB_DB_NAME', 'avyuktha'),

  // Redis
  REDIS_ENABLED: optionalEnv('REDIS_ENABLED', 'false') === 'true',
  REDIS_HOST: optionalEnv('REDIS_HOST', '127.0.0.1'),
  REDIS_PORT: parseInt(optionalEnv('REDIS_PORT', '6379'), 10),
  REDIS_PASSWORD: optionalEnv('REDIS_PASSWORD'),
  REDIS_DB: parseInt(optionalEnv('REDIS_DB', '0'), 10),
  REDIS_URL: optionalEnv('REDIS_URL', 'redis://127.0.0.1:6379'),

  // JWT
  JWT_ACCESS_SECRET: requireEnv('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: requireEnv('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRY: optionalEnv('JWT_ACCESS_EXPIRY', '15m'),
  JWT_REFRESH_EXPIRY: optionalEnv('JWT_REFRESH_EXPIRY', '30d'),
  JWT_RESET_SECRET: requireEnv('JWT_RESET_SECRET'),
  JWT_RESET_EXPIRY: optionalEnv('JWT_RESET_EXPIRY', '1h'),
  JWT_EMAIL_VERIFY_SECRET: requireEnv('JWT_EMAIL_VERIFY_SECRET'),
  JWT_EMAIL_VERIFY_EXPIRY: optionalEnv('JWT_EMAIL_VERIFY_EXPIRY', '24h'),

  // Encryption
  ENCRYPTION_KEY: requireEnv('ENCRYPTION_KEY'),
  HASH_SALT_ROUNDS: parseInt(optionalEnv('HASH_SALT_ROUNDS', '12'), 10),

  // OTP
  OTP_EXPIRY_MINUTES: parseInt(optionalEnv('OTP_EXPIRY_MINUTES', '10'), 10),
  OTP_MAX_ATTEMPTS: parseInt(optionalEnv('OTP_MAX_ATTEMPTS', '5'), 10),
  OTP_RESEND_COOLDOWN_SECONDS: parseInt(optionalEnv('OTP_RESEND_COOLDOWN_SECONDS', '60'), 10),

  // Session
  SESSION_SECRET: requireEnv('SESSION_SECRET'),
  MAX_ACTIVE_SESSIONS: parseInt(optionalEnv('MAX_ACTIVE_SESSIONS', '5'), 10),

  // Google / OAuth
  GOOGLE_CLIENT_ID: optionalEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: optionalEnv('GOOGLE_CLIENT_SECRET'),
  GOOGLE_CALLBACK_URL: optionalEnv('GOOGLE_CALLBACK_URL'),

  // Firebase
  FIREBASE_PROJECT_ID: optionalEnv('FIREBASE_PROJECT_ID'),
  FIREBASE_PRIVATE_KEY: optionalEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  FIREBASE_CLIENT_EMAIL: optionalEnv('FIREBASE_CLIENT_EMAIL'),

  // GCS
  GCS_PROJECT_ID: optionalEnv('GCS_PROJECT_ID'),
  GCS_KEY_FILE_PATH: optionalEnv('GCS_KEY_FILE_PATH'),
  GCS_PUBLIC_BUCKET: optionalEnv('GCS_PUBLIC_BUCKET', 'avyuktha-public'),
  GCS_PRIVATE_BUCKET: optionalEnv('GCS_PRIVATE_BUCKET', 'avyuktha-private'),
  GCS_CDN_URL: optionalEnv('GCS_CDN_URL'),

  // Agora
  AGORA_APP_ID: optionalEnv('AGORA_APP_ID'),
  AGORA_APP_CERTIFICATE: optionalEnv('AGORA_APP_CERTIFICATE'),
  AGORA_TOKEN_EXPIRY_SECONDS: parseInt(optionalEnv('AGORA_TOKEN_EXPIRY_SECONDS', '3600'), 10),

  // Razorpay
  RAZORPAY_KEY_ID: optionalEnv('RAZORPAY_KEY_ID'),
  RAZORPAY_KEY_SECRET: optionalEnv('RAZORPAY_KEY_SECRET'),
  RAZORPAY_WEBHOOK_SECRET: optionalEnv('RAZORPAY_WEBHOOK_SECRET'),

  // Cashfree
  CASHFREE_APP_ID: optionalEnv('CASHFREE_APP_ID'),
  CASHFREE_SECRET_KEY: optionalEnv('CASHFREE_SECRET_KEY'),
  CASHFREE_ENV: optionalEnv('CASHFREE_ENV', 'TEST') as 'TEST' | 'PROD',
  CASHFREE_WEBHOOK_SECRET: optionalEnv('CASHFREE_WEBHOOK_SECRET'),

  // Email
  SMTP_HOST: optionalEnv('SMTP_HOST', 'smtp.gmail.com'),
  SMTP_PORT: parseInt(optionalEnv('SMTP_PORT', '587'), 10),
  SMTP_SECURE: optionalEnv('SMTP_SECURE', 'false') === 'true',
  SMTP_USER: optionalEnv('SMTP_USER'),
  SMTP_PASSWORD: optionalEnv('SMTP_PASSWORD'),
  EMAIL_FROM_NAME: optionalEnv('EMAIL_FROM_NAME', 'Avyuktha Matrimony'),
  EMAIL_FROM_ADDRESS: optionalEnv('EMAIL_FROM_ADDRESS', 'noreply@avyuktha.com'),

  // SMS
  TWILIO_ACCOUNT_SID: optionalEnv('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: optionalEnv('TWILIO_AUTH_TOKEN'),
  TWILIO_PHONE_NUMBER: optionalEnv('TWILIO_PHONE_NUMBER'),
  TWILIO_MESSAGING_SERVICE_SID: optionalEnv('TWILIO_MESSAGING_SERVICE_SID'),

  // WhatsApp
  WHATSAPP_PROVIDER: optionalEnv('WHATSAPP_PROVIDER', 'twilio'),
  WHATSAPP_FROM: optionalEnv('WHATSAPP_FROM'),
  WABA_PHONE_NUMBER_ID: optionalEnv('WABA_PHONE_NUMBER_ID'),
  WABA_ACCESS_TOKEN: optionalEnv('WABA_ACCESS_TOKEN'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(optionalEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(optionalEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  RATE_LIMIT_AUTH_MAX: parseInt(optionalEnv('RATE_LIMIT_AUTH_MAX', '20'), 10),
  RATE_LIMIT_OTP_MAX: parseInt(optionalEnv('RATE_LIMIT_OTP_MAX', '5'), 10),
  RATE_LIMIT_UPLOAD_MAX: parseInt(optionalEnv('RATE_LIMIT_UPLOAD_MAX', '30'), 10),
  RATE_LIMIT_PAYMENT_MAX: parseInt(optionalEnv('RATE_LIMIT_PAYMENT_MAX', '10'), 10),

  // Logging
  LOG_LEVEL: optionalEnv('LOG_LEVEL', 'info'),
  LOG_DIR: optionalEnv('LOG_DIR', './logs'),

  // CORS
  ALLOWED_ORIGINS: optionalEnv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',').map(o => o.trim()),

  // Admin
  ADMIN_EMAIL: optionalEnv('ADMIN_EMAIL', 'admin@avyuktha.com'),
  ADMIN_DEFAULT_PASSWORD: optionalEnv('ADMIN_DEFAULT_PASSWORD'),

  // AI
  OPENAI_API_KEY: optionalEnv('OPENAI_API_KEY'),
  AI_MODEL: optionalEnv('AI_MODEL', 'gpt-4o'),
  AI_MAX_TOKENS: parseInt(optionalEnv('AI_MAX_TOKENS', '2000'), 10),

  // Bull Board
  BULL_BOARD_USERNAME: optionalEnv('BULL_BOARD_USERNAME', 'admin'),
  BULL_BOARD_PASSWORD: optionalEnv('BULL_BOARD_PASSWORD'),

  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isTest: () => process.env.NODE_ENV === 'test',
};

export type EnvConfig = typeof env;
