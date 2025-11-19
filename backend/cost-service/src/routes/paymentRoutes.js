// src/routes/paymentRoutes.js
import express from 'express';
import paymentController from '../controllers/paymentController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { paymentValidators } from '../validators/paymentValidators.js';

const router = express.Router();

// Public webhook routes (no authentication)
router.post('/webhook/momo', paymentController.processMoMoWebhook);
router.get('/vnpay/return', paymentController.processVNPayReturn);
router.post('/vnpay/ipn', paymentController.processVNPayIPN);
router.post('/webhook/vietqr', paymentController.processVietQRWebhook);

// Authenticated routes
router.use(authenticate);
router.get('/fees', paymentController.getPaymentFees);
router.post('/create', validate(paymentValidators.createPayment), paymentController.createPayment);
router.post('/schedule', validate(paymentValidators.schedulePayment), paymentController.schedulePayment);
router.post('/auto-setup', validate(paymentValidators.autoSetup), paymentController.setupAutoPayment);
router.get('/user', paymentController.getUserPayments);
router.get('/:id', validate(paymentValidators.getPayment), paymentController.getPayment);
router.get('/group/:groupId/summary', validate(paymentValidators.getPaymentSummary), paymentController.getPaymentSummary);

export default router;