// src/routes/userManagementRoutes.js
import express from 'express';
import userManagementController from '../controllers/userManagementController.js';
import { adminAuth, requirePermission } from '../middleware/adminAuth.js';
import { adminRateLimiter } from '../middleware/rateLimitAdmin.js';

const router = express.Router();

router.use(adminAuth);
router.use(adminRateLimiter);

// User management
router.get('/',
  requirePermission('user_management'),
  userManagementController.listUsers
);

router.get('/:userId',
  requirePermission('user_management'),
  userManagementController.getUser
);

router.put('/:userId/status',
  requirePermission('user_management'),
  userManagementController.updateUserStatus
);

router.get('/:userId/activity',
  requirePermission('user_management'),
  userManagementController.getUserActivity
);

router.get('/:userId/analytics',
  requirePermission('analytics_view'),
  userManagementController.getUserAnalytics
);

export default router;