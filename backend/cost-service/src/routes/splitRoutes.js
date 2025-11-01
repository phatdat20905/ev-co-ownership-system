// src/routes/splitRoutes.js
import express from 'express';
import splitController from '../controllers/splitController.js';
import { authenticate, validate } from '@ev-coownership/shared';
import { splitValidators } from '../validators/splitValidators.js';

const router = express.Router();

router.use(authenticate);

router.get('/user', splitController.getUserSplits);
router.get('/cost/:costId', validate(splitValidators.getCostSplits), splitController.getCostSplits);
router.put('/:id/status', validate(splitValidators.updateSplitStatus), splitController.updateSplitStatus);
router.get('/user/summary', splitController.getUserSplitSummary);

export default router;