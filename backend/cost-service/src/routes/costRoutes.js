// src/routes/costRoutes.js
import express from 'express';
import costController from '../controllers/costController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { costValidators } from '../validators/costValidators.js';

const router = express.Router();

router.use(authenticate);

// Admin overview (total revenue)
router.get('/admin/overview', costController.getAdminOverview);

router.post('/', validate(costValidators.createCost), costController.createCost);

// Export routes (specific routes before generic ones)
router.get('/group/:groupId/breakdown/export/pdf', validate(costValidators.getCostSummary), costController.exportCostBreakdownPDF);
router.get('/group/:groupId/expense-tracking/export/excel', validate(costValidators.getCostsByGroup), costController.exportExpenseTrackingExcel);
router.get('/group/:groupId/payment-history/export/pdf', validate(costValidators.getCostsByGroup), costController.exportPaymentHistoryPDF);

// Data routes
router.get('/group/:groupId/payment-history', validate(costValidators.getCostsByGroup), costController.getPaymentHistory);
router.get('/group/:groupId/expense-tracking', validate(costValidators.getCostsByGroup), costController.getExpenseTracking);
router.get('/group/:groupId/breakdown', validate(costValidators.getCostSummary), costController.getCostBreakdown);
router.get('/group/:groupId/summary', validate(costValidators.getCostSummary), costController.getCostSummary);
router.get('/group/:groupId', validate(costValidators.getCostsByGroup), costController.getCostsByGroup);
router.get('/:id', validate(costValidators.getCost), costController.getCost);
router.put('/:id', validate(costValidators.updateCost), costController.updateCost);
router.delete('/:id', validate(costValidators.deleteCost), costController.deleteCost);
router.get('/:id/splits', validate(costValidators.getCost), costController.calculateSplits);

export default router;