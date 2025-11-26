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
// Routes mounted at /contracts/documents in index.js
// Frontend calls: /api/v1/contracts/documents/:contractId/documents
// So we need /:contractId/documents here
router.post('/:contractId/documents', 
  contractAccess,
  documentUpload.single('file'),
  documentController.uploadDocument.bind(documentController)
);

router.get('/:contractId/documents', 
  contractAccess,
  documentController.getDocuments.bind(documentController)
);

router.get('/:contractId/documents/:documentId/download', 
  contractAccess,
  documentController.downloadDocument.bind(documentController)
);

router.get('/:contractId/documents/:documentId/view',
  contractAccess,
  documentController.viewDocument.bind(documentController)
);

router.delete('/:contractId/documents/:documentId', 
  contractAccess,
  documentController.deleteDocument.bind(documentController)
);

export default router;