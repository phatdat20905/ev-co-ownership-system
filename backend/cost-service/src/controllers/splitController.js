// src/controllers/splitController.js
import splitService from '../services/splitService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class SplitController {
  async getUserSplits(req, res, next) {
    try {
      const userId = req.user.id;
      const filters = req.query;

      const result = await splitService.getUserSplits(userId, filters);

      logger.info('User splits retrieved successfully', { 
        userId, 
        count: result.splits.length 
      });

      return successResponse(res, 'Splits retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get user splits', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getCostSplits(req, res, next) {
    try {
      const { costId } = req.params;
      const userId = req.user.id;

      const splits = await splitService.getCostSplits(costId, userId);

      logger.info('Cost splits retrieved successfully', { costId, userId, count: splits.length });

      return successResponse(res, 'Cost splits retrieved successfully', splits);
    } catch (error) {
      logger.error('Failed to get cost splits', { 
        error: error.message, 
        costId: req.params.costId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateSplitStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, paidAmount } = req.body;
      const userId = req.user.id;

      const split = await splitService.updateSplitStatus(id, status, paidAmount, userId);

      logger.info('Split status updated successfully', { splitId: id, status, userId });

      return successResponse(res, 'Split status updated successfully', split);
    } catch (error) {
      logger.error('Failed to update split status', { 
        error: error.message, 
        splitId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getUserSplitSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const { period = 'month' } = req.query;

      const summary = await splitService.getUserSplitSummary(userId, period);

      logger.info('User split summary retrieved successfully', { userId, period });

      return successResponse(res, 'Split summary retrieved successfully', summary);
    } catch (error) {
      logger.error('Failed to get user split summary', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new SplitController();