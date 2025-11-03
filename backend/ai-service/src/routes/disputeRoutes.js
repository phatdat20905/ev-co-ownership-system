import express from 'express';
import disputeController from '../controllers/disputeController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { disputeValidators } from '../validators/index.js';

const router = express.Router();

router.use(authenticate);

// Dispute analysis
router.post('/analyze', 
  validate(disputeValidators.analyzeDispute), 
  disputeController.analyzeDispute
);

// Get dispute recommendations for a group
router.get('/group/:groupId/recommendations',
  validate(disputeValidators.getRecommendations),
  disputeController.getDisputeRecommendations
);

// Get dispute patterns and trends
router.get('/group/:groupId/patterns',
  validate(disputeValidators.getPatterns),
  disputeController.getDisputePatterns
);

export default router;