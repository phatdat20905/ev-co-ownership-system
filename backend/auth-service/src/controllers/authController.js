import authService from '../services/authService.js';
import { 
  successResponse, 
  errorResponse, 
  logger,
  AppError 
} from '@ev-coownership/shared';

export class AuthController {
  async register(req, res, next) {
    try {
      const { email, phone, password, role } = req.body;

      const result = await authService.register({
        email,
        phone,
        password,
        role
      });

      logger.info('User registration successful', { email });

      return successResponse(res, 'Registration successful. Please check your email for verification.', result, 201);
    } catch (error) {
      logger.error('User registration failed', { error: error.message, email: req.body.email });
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      // Support both email and phone
      const { email, phone, password } = req.body;
      const identifier = email || phone;

      if (!identifier) {
        throw new AppError('Email or phone is required', 400, 'MISSING_CREDENTIALS');
      }

      const result = await authService.login(identifier, password);

      logger.info('User login successful', { identifier: identifier.includes('@') ? 'email' : 'phone' });

      return successResponse(res, 'Login successful', result);
    } catch (error) {
      logger.warn('User login failed', { error: error.message });
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      const result = await authService.refreshToken(refreshToken);

      logger.info('Token refreshed successfully', { 
        userId: req.user?.id || 'unknown' 
      });

      return successResponse(res, 'Token refreshed', result);
    } catch (error) {
      logger.warn('Token refresh failed', { error: error.message });
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;

      await authService.logout(refreshToken);

      logger.info('User logged out successfully', { userId: req.user?.id });

      return successResponse(res, 'Logout successful');
    } catch (error) {
      logger.error('Logout failed', { error: error.message, userId: req.user?.id });
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const result = await authService.forgotPassword(email);

      logger.info('Password reset requested', { email });

      return successResponse(res, result.message);
    } catch (error) {
      logger.error('Password reset request failed', { error: error.message, email: req.body.email });
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const result = await authService.resetPassword(token, password);

      logger.info('Password reset successful', { token });

      return successResponse(res, result.message);
    } catch (error) {
      logger.error('Password reset failed', { error: error.message, token: req.body.token });
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      return successResponse(res, 'Profile retrieved successfully', req.user);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      const result = await authService.verifyEmail(token);

      logger.info('Email verification successful', { token });

      return successResponse(res, result.message);
    } catch (error) {
      logger.error('Email verification failed', { 
        error: error.message, 
        token: req.body.token 
      });
      next(error);
    }
  }

  async sendVerificationEmail(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await authService.sendVerificationEmail(userId);

      logger.info('Verification email sent', { userId });

      return successResponse(res, result.message);
    } catch (error) {
      logger.error('Failed to send verification email', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      logger.info('Password changed successfully', { userId });

      return successResponse(res, result.message);
    } catch (error) {
      logger.error('Password change failed', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new AuthController();