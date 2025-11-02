import express from 'express';
import scheduleRoutes from './scheduleRoutes.js';
import costRoutes from './costRoutes.js';
import disputeRoutes from './disputeRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import feedbackRoutes from './feedbackRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'ai-service',
    version: '1.0.0'
  });
});

// Mount feature routes
router.use('/schedule', scheduleRoutes);
router.use('/cost', costRoutes);
router.use('/dispute', disputeRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/feedback', feedbackRoutes);

export default router;