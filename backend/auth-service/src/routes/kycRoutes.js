import { Router } from 'express';
import kycController from '../controllers/kycController.js';
import { authenticate, authorize, validate } from '@ev-coownership/shared';
import { kycSubmitValidator, kycVerifyValidator } from '../validators/kycValidator.js';
import { uploadKYCDocuments, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = Router();

// User routes
router.post('/submit', 
  authenticate,
  uploadKYCDocuments,
  handleUploadError,
  validate(kycSubmitValidator),
  kycController.submitKYC
);

router.get('/status', 
  authenticate,
  kycController.getKYCStatus
);

// Admin routes
router.put('/verify/:id', 
  authenticate,
  authorize('admin', 'staff'),
  validate(kycVerifyValidator),
  kycController.verifyKYC
);

router.get('/pending', 
  authenticate,
  authorize('admin', 'staff'),
  kycController.getPendingKYCs
);

export default router;