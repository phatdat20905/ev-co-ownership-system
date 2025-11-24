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
// These routes are already prefixed with /contracts/documents from index.js
// So /:contractId/documents here becomes /contracts/documents/:contractId/documents
router.post('/:contractId/documents', 
  contractAccess,
  documentUpload.single('file'), // Changed from 'document' to 'file' to match frontend
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

router.get('/:contractId/documents/:documentId/view',
  contractAccess,
  documentController.viewDocument
);

router.delete('/:contractId/documents/:documentId', 
  contractAccess,
  documentController.deleteDocument
);

export default router;