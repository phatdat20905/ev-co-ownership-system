// src/routes/analyticsRoutes.js
import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { adminAuth, requirePermission } from '../middleware/adminAuth.js';
import { adminRateLimiter } from '../middleware/rateLimitAdmin.js';

const router = express.Router();

router.use(adminAuth);
router.use(adminRateLimiter);

// Analytics endpoints
router.get('/users',
  requirePermission('analytics_view'),
  analyticsController.getUserAnalytics
);

router.get('/revenue',
  requirePermission('analytics_view'),
  analyticsController.getRevenueAnalytics
);

router.get('/usage',
  requirePermission('analytics_view'),
  analyticsController.getUsageAnalytics
);

router.get('/service-performance',
  requirePermission('analytics_view'),
  analyticsController.getServicePerformance
);

router.get('/business-insights',
  requirePermission('analytics_view'),
  analyticsController.getBusinessInsights
);

// System logs
router.get('/logs',
  requirePermission('analytics_view'),
  analyticsController.getSystemLogs
);

// Export analytics
router.get('/export',
  requirePermission('analytics_view'),
  analyticsController.exportAnalytics
);

export default router;