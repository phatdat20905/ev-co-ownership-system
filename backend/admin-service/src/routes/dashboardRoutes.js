// src/routes/dashboardRoutes.js
import express from 'express';
import dashboardController from '../controllers/dashboardController.js';
import { adminAuth, requirePermission } from '../middleware/adminAuth.js';

const router = express.Router();

router.use(adminAuth);

// Dashboard overview
router.get('/overview', 
  requirePermission('reports_view'),
  dashboardController.getOverview
);

// Detailed stats
router.get('/stats',
  requirePermission('reports_view'),
  dashboardController.getStats
);

// Real-time metrics
router.get('/live-metrics',
  requirePermission('analytics_view'),
  dashboardController.getLiveMetrics
);

// System health
router.get('/system-health',
  requirePermission('reports_view'),
  dashboardController.getSystemHealth
);

// Growth analytics
router.get('/growth',
  requirePermission('analytics_view'),
  dashboardController.getGrowthAnalytics
);

export default router;