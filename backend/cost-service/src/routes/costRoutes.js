// src/routes/costRoutes.js
import express from 'express';
import costController from '../controllers/costController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { costValidators } from '../validators/costValidators.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(costValidators.createCost), costController.createCost);
router.get('/group/:groupId', validate(costValidators.getCostsByGroup), costController.getCostsByGroup);
router.get('/:id', validate(costValidators.getCost), costController.getCost);
router.put('/:id', validate(costValidators.updateCost), costController.updateCost);
router.delete('/:id', validate(costValidators.deleteCost), costController.deleteCost);
router.get('/:id/splits', validate(costValidators.getCost), costController.calculateSplits);
router.get('/group/:groupId/summary', validate(costValidators.getCostSummary), costController.getCostSummary);

export default router;