import express from 'express';
import kycController from '../controllers/kycController.js';
import { authenticateToken, requireRole, requireVerified } from '../middlewares/authMiddleware.js';
import { validateRequest, authSchemas } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// User routes - require authentication and verification
router.post('/submit', 
  authenticateToken, 
  requireVerified,
  validateRequest(authSchemas.kycSubmission), 
  kycController.submitKYC
);

router.get('/status', 
  authenticateToken, 
  kycController.getKYCStatus
);

// Admin routes - require admin role
router.get('/pending', 
  authenticateToken, 
  requireRole(['admin', 'staff']), 
  kycController.getPendingKYC
);

router.put('/verify/:kycId', 
  authenticateToken, 
  requireRole(['admin', 'staff']), 
  validateRequest(authSchemas.kycVerification), 
  kycController.verifyKYC
);

export default router;