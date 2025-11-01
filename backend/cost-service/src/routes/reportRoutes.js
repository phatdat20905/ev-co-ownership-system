// src/routes/reportRoutes.js
import express from 'express';
import reportController from '../controllers/reportController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { reportValidators } from '../validators/reportValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', validate(reportValidators.getSummary), reportController.getSummary);
router.get('/user-usage', validate(reportValidators.getUserUsage), reportController.getUserUsage);
router.get('/cost-analysis', validate(reportValidators.getCostAnalysis), reportController.getCostAnalysis);
router.get('/payment-analysis', validate(reportValidators.getPaymentAnalysis), reportController.getPaymentAnalysis);

export default router;