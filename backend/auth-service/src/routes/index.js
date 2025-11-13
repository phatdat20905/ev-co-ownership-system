import { Router } from 'express';
import authRoutes from './authRoutes.js';
import kycRoutes from './kycRoutes.js';
import tokenRoutes from './tokenRoutes.js';

const router = Router();

// Mount auth routes under /auth prefix
router.use('/auth', authRoutes);
router.use('/auth/kyc', kycRoutes);
router.use('/auth/tokens', tokenRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth Service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

export default router;