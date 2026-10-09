import { z } from 'zod';

const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number')
  .transform(v => v.startsWith('+') ? v : `+${v}`);

export const RegisterSchema = z.object({
  phone: phoneSchema,
  firstName: z.string().min(2).max(50).trim(),
  lastName: z.string().min(2).max(50).trim(),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  email: z.string().email().optional(),
  referralCode: z.string().optional(),
});

export const SendOtpSchema = z.object({
  identifier: z.string(),
  type: z.enum(['mobile', 'email']),
  purpose: z.enum(['login', 'register', 'reset', 'email_verify', 'account_recovery']),
});

export const VerifyOtpSchema = z.object({
  identifier: z.string(),
  type: z.enum(['mobile', 'email']),
  purpose: z.enum(['login', 'register', 'reset', 'email_verify', 'account_recovery']),
  otp: z.string().length(6).regex(/^\d+$/),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  platform: z.enum(['web', 'android', 'ios', 'admin_panel']).optional(),
  appVersion: z.string().optional(),
  fcmToken: z.string().optional(),
});

export const LoginSchema = z.object({
  phone: phoneSchema.optional(),
  email: z.string().email().optional(),
  otp: z.string().length(6).regex(/^\d+$/),
  deviceId: z.string().optional(),
  deviceName: z.string().optional(),
  platform: z.enum(['web', 'android', 'ios', 'admin_panel']).optional(),
  appVersion: z.string().optional(),
  fcmToken: z.string().optional(),
}).refine(data => data.phone || data.email, 'Phone or email required');

export const GoogleAuthSchema = z.object({
  idToken: z.string().min(1),
  deviceId: z.string().optional(),
  platform: z.enum(['web', 'android', 'ios']).optional(),
  fcmToken: z.string().optional(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(100).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number and special character'
  ),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const Verify2FASchema = z.object({
  token: z.string().length(6).regex(/^\d+$/),
  sessionId: z.string().optional(),
});

export const Setup2FASchema = z.object({
  token: z.string().length(6).regex(/^\d+$/),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type SendOtpDto = z.infer<typeof SendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type GoogleAuthDto = z.infer<typeof GoogleAuthSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
export type Verify2FADto = z.infer<typeof Verify2FASchema>;
