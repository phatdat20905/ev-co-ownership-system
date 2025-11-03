import express from 'express';
import scheduleController from '../controllers/scheduleController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { scheduleValidators } from '../validators/index.js';

const router = express.Router();

router.use(authenticate);

// Schedule optimization
router.post('/optimize', 
  validate(scheduleValidators.optimizeSchedule), 
  scheduleController.optimizeSchedule
);

// Get schedule recommendations for a group
router.get('/group/:groupId/recommendations',
  validate(scheduleValidators.getRecommendations),
  scheduleController.getScheduleRecommendations
);

// Get active schedule recommendation
router.get('/group/:groupId/active',
  validate(scheduleValidators.getActiveRecommendation),
  scheduleController.getActiveScheduleRecommendation
);

export default router;