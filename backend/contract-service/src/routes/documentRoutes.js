import express from 'express';
import documentController from '../controllers/documentController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { documentValidators } from '../validators/documentValidators.js';
import { contractAccess, documentUpload } from '../middleware/contractAccessMiddleware.js';

const router = express.Router();

router.use(authenticate);

// Document management operations
router.post('/:contractId/documents', 
  contractAccess,
  documentUpload.single('document'),
  validate(documentValidators.uploadDocument), 
  documentController.uploadDocument
);

router.get('/:contractId/documents', 
  contractAccess,
  documentController.getDocuments
);

router.get('/:contractId/documents/:documentId/download', 
  contractAccess,
  documentController.downloadDocument
);

router.delete('/:contractId/documents/:documentId', 
  contractAccess,
  documentController.deleteDocument
);

export default router;