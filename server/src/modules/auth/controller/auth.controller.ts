import { Request, Response } from 'express';
import { authService } from '../service/auth.service';
import { sendSuccess, sendCreated } from '../../../utils/response';

export class AuthController {
  async sendOtp(req: Request, res: Response): Promise<void> {
    const { identifier, type, purpose } = req.body;
    const result = await authService.sendOtp(identifier, type, purpose);
    sendSuccess(res, result, result.message);
  }

  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body, req.ip ?? '');
    sendCreated(res, result, result.message);
  }

  async verifyRegistration(req: Request, res: Response): Promise<void> {
    const result = await authService.verifyRegistrationOtp(req.body, req.ip ?? '', String(req.headers['user-agent'] ?? ''));
    sendCreated(res, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      sessionId: result.sessionId,
    }, 'Registration successful');
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.loginWithOtp(req.body, req.ip ?? '', String(req.headers['user-agent'] ?? ''));
    if (result.requires2FA) {
      sendSuccess(res, { requires2FA: true }, '2FA verification required');
      return;
    }
    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      sessionId: result.sessionId,
    }, 'Login successful');
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    const result = await authService.loginWithGoogle(req.body, req.ip ?? '', String(req.headers['user-agent'] ?? ''));
    const status = result.isNew ? 201 : 200;
    res.status(status).json({
      success: true,
      message: result.isNew ? 'Account created via Google' : 'Login successful',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        sessionId: result.sessionId,
        isNew: result.isNew,
      },
    });
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken, req.ip ?? '');
    sendSuccess(res, result, 'Token refreshed');
  }

  async logout(req: Request, res: Response): Promise<void> {
    await authService.logout(req.user!.userId, req.user!.sessionId);
    sendSuccess(res, null, 'Logged out successfully');
  }

  async logoutAll(req: Request, res: Response): Promise<void> {
    const count = await authService.logoutAll(req.user!.userId, req.user?.sessionId);
    sendSuccess(res, { revokedSessions: count }, 'Logged out from all devices');
  }

  async setup2FA(req: Request, res: Response): Promise<void> {
    const result = await authService.setup2FA(req.user!.userId);
    sendSuccess(res, result, '2FA setup initiated. Scan QR code and verify to enable.');
  }

  async enable2FA(req: Request, res: Response): Promise<void> {
    await authService.enable2FA(req.user!.userId, req.body.token);
    sendSuccess(res, null, '2FA enabled successfully');
  }

  async disable2FA(req: Request, res: Response): Promise<void> {
    await authService.disable2FA(req.user!.userId, req.body.token);
    sendSuccess(res, null, '2FA disabled');
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    await authService.changePassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    sendSuccess(res, null, 'Password changed. Please log in again.');
  }

  async getSessions(req: Request, res: Response): Promise<void> {
    const sessions = await authService.getSessions(req.user!.userId);
    sendSuccess(res, sessions, 'Active sessions');
  }

  async revokeSession(req: Request, res: Response): Promise<void> {
    await authService.revokeSession(req.user!.userId, String(req.params.sessionId));
    sendSuccess(res, null, 'Session revoked');
  }

  async getLoginHistory(req: Request, res: Response): Promise<void> {
    const history = await authService.getLoginHistory(req.user!.userId);
    sendSuccess(res, history, 'Login history');
  }
}

export const authController = new AuthController();
