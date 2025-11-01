// src/routes/invoiceRoutes.js
import express from 'express';
import invoiceController from '../controllers/invoiceController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { invoiceValidators } from '../validators/invoiceValidators.js';

const router = express.Router();

router.use(authenticate);

router.post('/generate', validate(invoiceValidators.generateInvoice), invoiceController.generateInvoice);
router.get('/group/:groupId', validate(invoiceValidators.getInvoices), invoiceController.getInvoices);
router.get('/:id', validate(invoiceValidators.getInvoice), invoiceController.getInvoice);
router.put('/:id/mark-paid', validate(invoiceValidators.markPaid), invoiceController.markPaid);
router.get('/:id/download', validate(invoiceValidators.getInvoice), invoiceController.downloadInvoice);

export default router;