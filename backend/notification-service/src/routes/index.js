// src/routes/index.js
import express from 'express';
import notificationRoutes from './notificationRoutes.js';
import templateRoutes from './templateRoutes.js';
import preferenceRoutes from './preferenceRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Notification Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'notification-service',
  });
});

// Mount routes with /notifications prefix
router.use('/notifications', notificationRoutes);
router.use('/notifications/templates', templateRoutes);
router.use('/notifications/preferences', preferenceRoutes);

export default router;