import voteService from '../services/voteService.js';
import { 
  successResponse, 
  logger 
} from '@ev-coownership/shared';

export class VoteController {
  async createVote(req, res, next) {
    try {
      const createdBy = req.user.id;
      const voteData = { ...req.body, createdBy };

      const vote = await voteService.createVote(voteData);

      logger.info('Vote created successfully', { 
        voteId: vote.id, 
        groupId: voteData.groupId,
        createdBy 
      });

      return successResponse(res, 'Vote created successfully', vote, 201);
    } catch (error) {
      logger.error('Failed to create vote', { 
        error: error.message, 
        userId: req.user?.id,
        groupId: req.body.groupId 
      });
      next(error);
    }
  }

  async getGroupVotes(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const votes = await voteService.getGroupVotes(groupId, userId);

      logger.info('Group votes retrieved successfully', { groupId, userId });

      return successResponse(res, 'Votes retrieved successfully', votes);
    } catch (error) {
      logger.error('Failed to get group votes', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getVoteById(req, res, next) {
    try {
      const { voteId } = req.params;
      const userId = req.user.id;

      const vote = await voteService.getVoteById(voteId, userId);

      logger.info('Vote retrieved successfully', { voteId, userId });

      return successResponse(res, 'Vote retrieved successfully', vote);
    } catch (error) {
      logger.error('Failed to get vote by ID', { 
        error: error.message, 
        voteId: req.params.voteId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async castVote(req, res, next) {
    try {
      const { voteId } = req.params;
      const userId = req.user.id;
      const { optionId } = req.body;

      const result = await voteService.castVote(voteId, userId, optionId);

      logger.info('Vote cast successfully', { voteId, userId, optionId });

      return successResponse(res, 'Vote cast successfully', result);
    } catch (error) {
      logger.error('Failed to cast vote', { 
        error: error.message, 
        voteId: req.params.voteId,
        userId: req.user?.id,
        optionId: req.body.optionId 
      });
      next(error);
    }
  }

  async closeVote(req, res, next) {
    try {
      const { voteId } = req.params;
      const userId = req.user.id;

      const vote = await voteService.closeVote(voteId, userId);

      logger.info('Vote closed successfully', { voteId, userId });

      return successResponse(res, 'Vote closed successfully', vote);
    } catch (error) {
      logger.error('Failed to close vote', { 
        error: error.message, 
        voteId: req.params.voteId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new VoteController();