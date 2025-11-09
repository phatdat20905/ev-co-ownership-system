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

// Mount routes with /ai prefix
router.use('/ai/schedule', scheduleRoutes);
router.use('/ai/cost', costRoutes);
router.use('/ai/dispute', disputeRoutes);
router.use('/ai/analytics', analyticsRoutes);
router.use('/ai/feedback', feedbackRoutes);

export default router;