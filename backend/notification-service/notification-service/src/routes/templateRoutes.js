// src/routes/templateRoutes.js
import express from 'express';
import templateController from '../controllers/templateController.js';
import { authenticate, authorize } from '@ev-coownership/shared';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorize(['admin', 'staff']));

// Template CRUD operations
router.post('/', templateController.createTemplate);
router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplate);
router.put('/:id', templateController.updateTemplate);
router.delete('/:id', templateController.deleteTemplate);

// Template management
router.put('/:id/disable', templateController.disableTemplate);
router.put('/:id/enable', templateController.enableTemplate);
router.post('/:id/preview', templateController.previewTemplate);

export default router;