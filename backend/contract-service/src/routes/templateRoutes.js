import express from 'express';
import templateController from '../controllers/templateController.js';
import { 
  authenticate, 
  validate,
  authorize 
} from '@ev-coownership/shared';
import { templateValidators } from '../validators/templateValidators.js';

const router = express.Router();

router.use(authenticate);

// Template CRUD operations (Admin only)
router.post('/', 
  authorize('admin', 'staff'),
  validate(templateValidators.createTemplate), 
  templateController.createTemplate
);

router.get('/', 
  validate(templateValidators.getTemplates), 
  templateController.getTemplates
);

router.get('/files', 
  templateController.getAvailableFiles
);

router.get('/:templateId', 
  templateController.getTemplate
);

router.put('/:templateId', 
  authorize('admin', 'staff'),
  validate(templateValidators.updateTemplate), 
  templateController.updateTemplate
);

router.delete('/:templateId', 
  authorize('admin', 'staff'),
  templateController.deleteTemplate
);

// Contract generation from template
router.post('/:templateId/generate', 
  validate(templateValidators.generateContract), 
  templateController.generateContract
);

export default router;