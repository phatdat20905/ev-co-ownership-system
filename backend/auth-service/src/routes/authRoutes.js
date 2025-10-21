import { Router } from 'express';
import authController from '../controllers/authController.js';
import { authenticate, validate, loginRateLimiter, generalRateLimiter } from '@ev-coownership/shared';
import { 
  registerValidator, 
  loginValidator, 
  refreshTokenValidator, 
  forgotPasswordValidator, 
  resetPasswordValidator,
  verifyEmailValidator 
} from '../validators/authValidator.js';

const router = Router();

// Public routes
router.post('/register', 
  generalRateLimiter,
  validate(registerValidator), 
  authController.register
);

router.post('/login', 
  loginRateLimiter,
  validate(loginValidator), 
  authController.login
);

router.post('/refresh-token', 
  generalRateLimiter,
  validate(refreshTokenValidator), 
  authController.refreshToken
);

router.post('/forgot-password', 
  generalRateLimiter,
  validate(forgotPasswordValidator), 
  authController.forgotPassword
);

router.post('/reset-password', 
  generalRateLimiter,
  validate(resetPasswordValidator), 
  authController.resetPassword
);

router.post('/verify-email', 
  generalRateLimiter,
  validate(verifyEmailValidator), 
  authController.verifyEmail
);

// Protected routes
router.post('/logout', 
  authenticate,
  validate(refreshTokenValidator), 
  authController.logout
);

router.get('/profile', 
  authenticate,
  authController.getProfile
);

router.post('/send-verification-email', 
  authenticate,
  authController.sendVerificationEmail
);

export default router;