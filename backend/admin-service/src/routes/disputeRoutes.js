// src/routes/disputeRoutes.js
import express from 'express';
import disputeController from '../controllers/disputeController.js';
import { adminAuth, requirePermission } from '../middleware/adminAuth.js';
import { adminRateLimiter } from '../middleware/rateLimitAdmin.js';

const router = express.Router();

router.use(adminAuth);
router.use(adminRateLimiter);

// Dispute management
router.post('/',
  requirePermission('dispute_management'),
  disputeController.createDispute
);

router.get('/',
  requirePermission('dispute_management'),
  disputeController.listDisputes
);

router.get('/stats',
  requirePermission('dispute_management'),
  disputeController.getDisputeStats
);

router.get('/:disputeId',
  requirePermission('dispute_management'),
  disputeController.getDispute
);

router.put('/:disputeId/assign',
  requirePermission('dispute_management'),
  disputeController.assignDispute
);

router.post('/:disputeId/messages',
  requirePermission('dispute_management'),
  disputeController.addDisputeMessage
);

router.put('/:disputeId/resolve',
  requirePermission('dispute_management'),
  disputeController.resolveDispute
);

router.put('/:disputeId/escalate',
  requirePermission('dispute_management'),
  disputeController.escalateDispute
);

export default router;