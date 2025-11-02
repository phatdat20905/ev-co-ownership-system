import aiService from '../services/aiService.js';
import { 
  successResponse, 
  logger,
  AppError 
} from '@ev-coownership/shared';

export class ScheduleController {
  async optimizeSchedule(req, res, next) {
    try {
      const { group_data } = req.body;
      const userId = req.user.id;

      if (!group_data?.group_id) {
        throw new AppError('Group data is required', 400, 'MISSING_GROUP_DATA');
      }

      if (!group_data.members || !Array.isArray(group_data.members)) {
        throw new AppError('Group members data is required', 400, 'MISSING_MEMBERS_DATA');
      }

      const recommendation = await aiService.generateScheduleOptimization(group_data, userId);

      logger.info('Schedule optimization completed', {
        groupId: group_data.group_id,
        userId,
        recommendationId: recommendation.recommendation_id,
        confidence: recommendation.confidence_score
      });

      return successResponse(res, 'Schedule optimized successfully', {
        recommendation_id: recommendation.recommendation_id,
        schedule: recommendation.ai_response.schedule,
        fairness_metrics: recommendation.ai_response.fairness_metrics,
        confidence: recommendation.confidence_score,
        optimization_notes: recommendation.ai_response.optimization_notes,
        is_fallback: recommendation._metadata?.is_fallback || false
      });

    } catch (error) {
      logger.error('Schedule optimization failed', {
        error: error.message,
        groupId: req.body.group_data?.group_id,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getScheduleRecommendations(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
      const { limit = 10, page = 1 } = req.query;

      const result = await aiService.getGroupRecommendations(groupId, {
        limit: parseInt(limit),
        page: parseInt(page),
        feature_type: 'schedule'
      });

      logger.info('Schedule recommendations retrieved', {
        groupId,
        userId,
        count: result.recommendations.length
      });

      return successResponse(res, 'Schedule recommendations retrieved successfully', result);

    } catch (error) {
      logger.error('Failed to get schedule recommendations', {
        error: error.message,
        groupId: req.params.groupId,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getActiveScheduleRecommendation(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const recommendations = await aiService.getGroupRecommendations(groupId, {
        limit: 1,
        page: 1,
        feature_type: 'schedule'
      });

      const activeRecommendation = recommendations.recommendations.find(rec => 
        rec.status === 'active' || rec.status === 'accepted'
      );

      if (!activeRecommendation) {
        throw new AppError('No active schedule recommendation found', 404, 'NO_ACTIVE_RECOMMENDATION');
      }

      logger.info('Active schedule recommendation retrieved', {
        groupId,
        userId,
        recommendationId: activeRecommendation.recommendation_id
      });

      return successResponse(res, 'Active schedule recommendation retrieved successfully', {
        recommendation: activeRecommendation
      });

    } catch (error) {
      logger.error('Failed to get active schedule recommendation', {
        error: error.message,
        groupId: req.params.groupId,
        userId: req.user?.id
      });
      next(error);
    }
  }
}

export default new ScheduleController();