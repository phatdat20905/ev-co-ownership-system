import express from 'express';
import authController from '../controllers/authController.js';
import { validateRequest, authSchemas } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(authSchemas.register), authController.register);
router.post('/login', validateRequest(authSchemas.login), authController.login);
router.post('/refresh-token', validateRequest(authSchemas.refreshToken), authController.refreshToken);
router.post('/forgot-password', validateRequest(authSchemas.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validateRequest(authSchemas.resetPassword), authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Protected routes (require authentication)
router.post('/logout', authController.logout);

export default router;