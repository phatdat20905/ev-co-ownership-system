import conflictService from '../services/conflictService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class ConflictController {
  async getUserConflicts(req, res, next) {
    try {
      const userId = req.user.id;
      const { resolved, page = 1, limit = 10 } = req.query;

      logger.debug('Getting user conflicts', { userId, resolved });

      const conflicts = await conflictService.getUserConflicts(userId, resolved, parseInt(page), parseInt(limit));

      return successResponse(res, 'User conflicts retrieved successfully', conflicts);
    } catch (error) {
      logger.error('Failed to get user conflicts', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async resolveConflict(req, res, next) {
    try {
      const { conflictId } = req.params;
      const userId = req.user.id;
      const { resolution } = req.body;

      logger.info('Resolving conflict', { conflictId, userId, resolution });

      const resolvedConflict = await conflictService.resolveConflict(conflictId, userId, resolution);

      return successResponse(res, 'Conflict resolved successfully', resolvedConflict);
    } catch (error) {
      logger.error('Failed to resolve conflict', { 
        error: error.message, 
        conflictId: req.params.conflictId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getAllConflicts(req, res, next) {
    try {
      const { resolved, conflictType, page = 1, limit = 20 } = req.query;

      logger.debug('Getting all conflicts', { resolved, conflictType });

      const conflicts = await conflictService.getAllConflicts(resolved, conflictType, parseInt(page), parseInt(limit));

      return successResponse(res, 'All conflicts retrieved successfully', conflicts);
    } catch (error) {
      logger.error('Failed to get all conflicts', { 
        error: error.message 
      });
      next(error);
    }
  }

  async getConflict(req, res, next) {
    try {
      const { conflictId } = req.params;

      logger.debug('Getting conflict details', { conflictId });

      const conflict = await conflictService.getConflict(conflictId);

      return successResponse(res, 'Conflict retrieved successfully', conflict);
    } catch (error) {
      logger.error('Failed to get conflict', { 
        error: error.message, 
        conflictId: req.params.conflictId
      });
      next(error);
    }
  }

  async adminResolveConflict(req, res, next) {
    try {
      const { conflictId } = req.params;
      const userId = req.user.id;
      const { resolution, action } = req.body;

      logger.info('Admin resolving conflict', { conflictId, userId, resolution, action });

      const resolvedConflict = await conflictService.adminResolveConflict(conflictId, userId, resolution, action);

      return successResponse(res, 'Conflict resolved by admin successfully', resolvedConflict);
    } catch (error) {
      logger.error('Failed to resolve conflict as admin', { 
        error: error.message, 
        conflictId: req.params.conflictId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new ConflictController();