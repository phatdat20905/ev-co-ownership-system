import aiService from '../services/aiService.js';
import { 
  successResponse, 
  logger,
  AppError 
} from '@ev-coownership/shared';

export class CostController {
  async analyzeCosts(req, res, next) {
    try {
      const { cost_data } = req.body;
      const userId = req.user.id;

      if (!cost_data?.group_id) {
        throw new AppError('Cost data with group_id is required', 400, 'MISSING_COST_DATA');
      }

      const recommendation = await aiService.generateCostAnalysis(cost_data, userId);

      logger.info('Cost analysis completed', {
        groupId: cost_data.group_id,
        userId,
        recommendationId: recommendation.recommendation_id,
        has_anomaly: recommendation.ai_response.anomaly_detection?.is_anomaly || false
      });

      return successResponse(res, 'Cost analysis completed successfully', {
        recommendation_id: recommendation.recommendation_id,
        predictions: recommendation.ai_response.predictions,
        anomaly_detection: recommendation.ai_response.anomaly_detection,
        trend_analysis: recommendation.ai_response.trend_analysis,
        cost_optimization: recommendation.ai_response.cost_optimization,
        confidence: recommendation.confidence_score,
        is_fallback: recommendation._metadata?.is_fallback || false
      });

    } catch (error) {
      logger.error('Cost analysis failed', {
        error: error.message,
        groupId: req.body.cost_data?.group_id,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getCostRecommendations(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
      const { limit = 10, page = 1 } = req.query;

      const result = await aiService.getGroupRecommendations(groupId, {
        limit: parseInt(limit),
        page: parseInt(page),
        feature_type: 'cost'
      });

      logger.info('Cost recommendations retrieved', {
        groupId,
        userId,
        count: result.recommendations.length
      });

      return successResponse(res, 'Cost recommendations retrieved successfully', result);

    } catch (error) {
      logger.error('Failed to get cost recommendations', {
        error: error.message,
        groupId: req.params.groupId,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getCostInsights(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const recommendations = await aiService.getGroupRecommendations(groupId, {
        limit: 5,
        page: 1,
        feature_type: 'cost'
      });

      // Aggregate insights from recent cost analyses
      const insights = {
        total_analyses: recommendations.pagination.total,
        recent_anomalies: recommendations.recommendations.filter(rec => 
          rec.ai_response.anomaly_detection?.is_anomaly
        ).length,
        average_confidence: recommendations.recommendations.reduce(
          (sum, rec) => sum + rec.confidence_score, 0
        ) / Math.max(recommendations.recommendations.length, 1),
        cost_trend: this.analyzeCostTrend(recommendations.recommendations)
      };

      logger.info('Cost insights retrieved', {
        groupId,
        userId,
        insights
      });

      return successResponse(res, 'Cost insights retrieved successfully', insights);

    } catch (error) {
      logger.error('Failed to get cost insights', {
        error: error.message,
        groupId: req.params.groupId,
        userId: req.user?.id
      });
      next(error);
    }
  }

  analyzeCostTrend(recommendations) {
    if (recommendations.length < 2) {
      return { direction: 'stable', confidence: 0.5 };
    }

    const recent = recommendations.slice(0, 2);
    const currentPrediction = recent[0].ai_response.predictions?.next_month || 0;
    const previousPrediction = recent[1].ai_response.predictions?.next_month || 0;

    if (currentPrediction > previousPrediction * 1.1) {
      return { direction: 'increasing', confidence: 0.7 };
    } else if (currentPrediction < previousPrediction * 0.9) {
      return { direction: 'decreasing', confidence: 0.7 };
    } else {
      return { direction: 'stable', confidence: 0.8 };
    }
  }
}

export default new CostController();