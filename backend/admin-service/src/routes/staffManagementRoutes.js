// src/routes/staffManagementRoutes.js
import express from 'express';
import staffManagementController from '../controllers/staffManagementController.js';
import { adminAuth, requirePermission, superAdminOnly } from '../middleware/adminAuth.js';
import { adminRateLimiter, sensitiveEndpointRateLimiter } from '../middleware/rateLimitAdmin.js';

const router = express.Router();

router.use(adminAuth);
router.use(adminRateLimiter);

// Get current staff profile
router.get('/profile', staffManagementController.getMyProfile);

// Staff management (super admin only)
router.post('/',
  superAdminOnly,
  sensitiveEndpointRateLimiter,
  staffManagementController.createStaff
);

router.get('/',
  requirePermission('user_management'),
  staffManagementController.listStaff
);

router.get('/performance',
  requirePermission('user_management'),
  staffManagementController.getStaffPerformance
);

router.get('/:staffId',
  requirePermission('user_management'),
  staffManagementController.getStaff
);

router.put('/:staffId',
  superAdminOnly,
  staffManagementController.updateStaff
);

router.put('/:staffId/permissions',
  superAdminOnly,
  sensitiveEndpointRateLimiter,
  staffManagementController.updateStaffPermissions
);

router.delete('/:staffId',
  superAdminOnly,
  sensitiveEndpointRateLimiter,
  staffManagementController.deactivateStaff
);

export default router;