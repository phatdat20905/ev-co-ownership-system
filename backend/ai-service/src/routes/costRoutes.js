import express from 'express';
import costController from '../controllers/costController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { costValidators } from '../validators/index.js';

const router = express.Router();

router.use(authenticate);

// Cost analysis
router.post('/analyze', 
  validate(costValidators.analyzeCosts), 
  costController.analyzeCosts
);

// Get cost recommendations for a group
router.get('/group/:groupId/recommendations',
  validate(costValidators.getRecommendations),
  costController.getCostRecommendations
);

// Get cost insights and patterns
router.get('/group/:groupId/insights',
  validate(costValidators.getInsights),
  costController.getCostInsights
);

export default router;