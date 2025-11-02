import express from 'express';
import analyticsController from '../controllers/analyticsController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { analyticsValidators } from '../validators/analyticsValidators.js';

const router = express.Router();

router.use(authenticate);

// Generate usage analytics
router.post('/generate', 
  validate(analyticsValidators.generateAnalytics), 
  analyticsController.generateUsageAnalytics
);

// Get analytics recommendations for a group
router.get('/group/:groupId/recommendations',
  validate(analyticsValidators.getRecommendations),
  analyticsController.getAnalyticsRecommendations
);

// Get AI service metrics
router.get('/metrics',
  validate(analyticsValidators.getMetrics),
  analyticsController.getAIServiceMetrics
);

// Get optimization summary for a group
router.get('/group/:groupId/summary',
  validate(analyticsValidators.getSummary),
  analyticsController.getOptimizationSummary
);

export default router;