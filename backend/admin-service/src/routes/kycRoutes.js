// src/routes/kycRoutes.js
import express from 'express';
import kycController from '../controllers/kycController.js';
import { adminAuth, requirePermission } from '../middleware/adminAuth.js';
import { adminRateLimiter } from '../middleware/rateLimitAdmin.js';

const router = express.Router();

router.use(adminAuth);
router.use(adminRateLimiter);

// KYC management
router.get('/',
  requirePermission('kyc_approval'),
  kycController.listKYCs
);

router.get('/pending',
  requirePermission('kyc_approval'),
  (req, res, next) => {
    req.query.status = 'pending';
    next();
  },
  kycController.listKYCs
);

router.get('/stats',
  requirePermission('kyc_approval'),
  kycController.getKYCStats
);

router.get('/history',
  requirePermission('kyc_approval'),
  kycController.getKYCHistory
);

router.get('/:kycId',
  requirePermission('kyc_approval'),
  kycController.getKYC
);

router.get('/user/:userId',
  requirePermission('kyc_approval'),
  kycController.getKYCByUser
);

router.put('/:kycId/approve',
  requirePermission('kyc_approval'),
  kycController.approveKYC
);

router.put('/:kycId/reject',
  requirePermission('kyc_approval'),
  kycController.rejectKYC
);

export default router;