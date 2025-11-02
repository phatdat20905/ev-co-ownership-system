import express from 'express';
import feedbackController from '../controllers/feedbackController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { feedbackValidators } from '../validators/feedbackValidators.js';

const router = express.Router();

router.use(authenticate);

// Submit feedback for a recommendation
router.post('/recommendations/:recommendationId/feedback',
  validate(feedbackValidators.submitFeedback),
  feedbackController.submitFeedback
);

// Get feedback statistics for a group
router.get('/group/:groupId/stats',
  validate(feedbackValidators.getStats),
  feedbackController.getFeedbackStats
);

// Get user's feedback history
router.get('/history',
  validate(feedbackValidators.getHistory),
  feedbackController.getUserFeedbackHistory
);

export default router;