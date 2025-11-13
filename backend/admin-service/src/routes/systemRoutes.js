// src/routes/systemRoutes.js
import express from 'express';
import systemController from '../controllers/systemController.js';
import { adminAuth, requirePermission, superAdminOnly } from '../middleware/adminAuth.js';
import { adminRateLimiter, sensitiveEndpointRateLimiter } from '../middleware/rateLimitAdmin.js';

const router = express.Router();

router.use(adminAuth);
router.use(adminRateLimiter);

// System settings (super admin only)
router.get('/settings',
  requirePermission('system_settings'),
  systemController.getSettings
);

router.put('/settings/:key',
  superAdminOnly,
  sensitiveEndpointRateLimiter,
  systemController.updateSetting
);

router.put('/settings',
  superAdminOnly,
  sensitiveEndpointRateLimiter,
  systemController.updateMultipleSettings
);

router.post('/settings',
  superAdminOnly,
  sensitiveEndpointRateLimiter,
  systemController.createSetting
);

// Audit logs
router.get('/audit-logs',
  requirePermission('system_settings'),
  systemController.getAuditLogs
);

// System monitoring
router.get('/metrics',
  requirePermission('system_settings'),
  systemController.getSystemMetrics
);

router.get('/health',
  requirePermission('system_settings'),
  systemController.getHealthStatus
);

export default router;