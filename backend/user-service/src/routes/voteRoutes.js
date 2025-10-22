// src/routes/voteRoutes.js
import express from 'express';
import voteController from '../controllers/voteController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { voteValidators } from '../validators/voteValidators.js';
import { groupAccess } from '../middleware/groupAccess.js';

const router = express.Router();

router.use(authenticate);


router.post('/', validate(voteValidators.createVote), voteController.createVote);
router.get('/group/:groupId', groupAccess, voteController.getGroupVotes);

// Các route vote cụ thể
router.get('/:voteId', voteController.getVoteById);
router.post('/:voteId/cast', validate(voteValidators.castVote), voteController.castVote);
router.put('/:voteId/close', voteController.closeVote);

export default router;