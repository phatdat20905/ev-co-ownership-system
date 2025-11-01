// src/controllers/costController.js
import costService from '../services/costService.js';
import { successResponse, logger, AppError } from '@ev-coownership/shared';

export class CostController {
  async createCost(req, res, next) {
    try {
      const costData = req.body;
      const userId = req.user.id;

      const cost = await costService.createCost(costData, userId);

      logger.info('Cost created successfully', { 
        costId: cost.id, 
        groupId: cost.groupId,
        userId 
      });

      return successResponse(res, 'Cost created successfully', cost, 201);
    } catch (error) {
      logger.error('Failed to create cost', { 
        error: error.message, 
        userId: req.user?.id,
        costData: req.body 
      });
      next(error);
    }
  }

  async getCost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const cost = await costService.getCostById(id, userId);

      logger.info('Cost retrieved successfully', { costId: id, userId });

      return successResponse(res, 'Cost retrieved successfully', cost);
    } catch (error) {
      logger.error('Failed to get cost', { 
        error: error.message, 
        costId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getCostsByGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const filters = req.query;
      const userId = req.user.id;

      const result = await costService.getCostsByGroup(groupId, filters, userId);

      logger.info('Costs retrieved successfully', { groupId, userId, count: result.costs.length });

      return successResponse(res, 'Costs retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get costs by group', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateCost(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userId = req.user.id;

      const cost = await costService.updateCost(id, updateData, userId);

      logger.info('Cost updated successfully', { costId: id, userId });

      return successResponse(res, 'Cost updated successfully', cost);
    } catch (error) {
      logger.error('Failed to update cost', { 
        error: error.message, 
        costId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deleteCost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await costService.deleteCost(id, userId);

      logger.info('Cost deleted successfully', { costId: id, userId });

      return successResponse(res, 'Cost deleted successfully', result);
    } catch (error) {
      logger.error('Failed to delete cost', { 
        error: error.message, 
        costId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getCostSummary(req, res, next) {
    try {
      const { groupId } = req.params;
      const { period = 'month' } = req.query;
      const userId = req.user.id;

      const summary = await costService.getCostSummary(groupId, period, userId);

      logger.info('Cost summary retrieved successfully', { groupId, period, userId });

      return successResponse(res, 'Cost summary retrieved successfully', summary);
    } catch (error) {
      logger.error('Failed to get cost summary', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async calculateSplits(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await costService.calculateSplits(id, userId);

      logger.info('Cost splits calculated successfully', { costId: id, userId });

      return successResponse(res, 'Cost splits calculated successfully', result);
    } catch (error) {
      logger.error('Failed to calculate cost splits', { 
        error: error.message, 
        costId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new CostController();