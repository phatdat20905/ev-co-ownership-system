import { Router } from 'express';
import authRoutes from './authRoutes.js';
import kycRoutes from './kycRoutes.js';
import tokenRoutes from './tokenRoutes.js';

const router = Router();

router.use('/', authRoutes);
router.use('/kyc', kycRoutes);
router.use('/tokens', tokenRoutes);

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