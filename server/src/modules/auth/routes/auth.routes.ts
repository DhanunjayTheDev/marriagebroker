import { Router } from 'express';
import { authController } from '../controller/auth.controller';
import { authenticate } from '../../../middleware/auth.middleware';
import { rateLimiter } from '../../../middleware/rateLimiter.middleware';
import { validateBody } from '../../../middleware/validate.middleware';
import {
  SendOtpSchema,
  RegisterSchema,
  VerifyOtpSchema,
  LoginSchema,
  GoogleAuthSchema,
  RefreshTokenSchema,
  ChangePasswordSchema,
  Verify2FASchema,
  Setup2FASchema,
} from '../validation/auth.validation';

const router = Router();

// Public routes
router.post('/send-otp', rateLimiter.otp, validateBody(SendOtpSchema), authController.sendOtp.bind(authController));
router.post('/register', rateLimiter.auth, validateBody(RegisterSchema), authController.register.bind(authController));
router.post('/register/verify', rateLimiter.auth, validateBody(VerifyOtpSchema), authController.verifyRegistration.bind(authController));
router.post('/login', rateLimiter.auth, validateBody(LoginSchema), authController.login.bind(authController));
router.post('/google', rateLimiter.auth, validateBody(GoogleAuthSchema), authController.googleAuth.bind(authController));
router.post('/refresh', rateLimiter.auth, validateBody(RefreshTokenSchema), authController.refreshToken.bind(authController));

// Protected routes
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/logout-all', authenticate, authController.logoutAll.bind(authController));

// 2FA
router.get('/2fa/setup', authenticate, authController.setup2FA.bind(authController));
router.post('/2fa/enable', authenticate, validateBody(Setup2FASchema), authController.enable2FA.bind(authController));
router.post('/2fa/disable', authenticate, validateBody(Setup2FASchema), authController.disable2FA.bind(authController));

// Password
router.post('/change-password', authenticate, validateBody(ChangePasswordSchema), authController.changePassword.bind(authController));

// Sessions
router.get('/sessions', authenticate, authController.getSessions.bind(authController));
router.delete('/sessions/:sessionId', authenticate, authController.revokeSession.bind(authController));

// Login history
router.get('/login-history', authenticate, authController.getLoginHistory.bind(authController));

export { router as authRoutes };
