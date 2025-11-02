import aiService from '../services/aiService.js';
import { UsageLog } from '../models/index.js';
import { 
  successResponse, 
  logger,
  AppError 
} from '@ev-coownership/shared';

export class AnalyticsController {
  async generateUsageAnalytics(req, res, next) {
    try {
      const { analytics_data } = req.body;
      const userId = req.user.id;

      if (!analytics_data?.group_id) {
        throw new AppError('Analytics data with group_id is required', 400, 'MISSING_ANALYTICS_DATA');
      }

      const recommendation = await aiService.generateUsageAnalytics(analytics_data, userId);

      logger.info('Usage analytics generated', {
        groupId: analytics_data.group_id,
        userId,
        recommendationId: recommendation.recommendation_id
      });

      return successResponse(res, 'Usage analytics generated successfully', {
        recommendation_id: recommendation.recommendation_id,
        usage_patterns: recommendation.ai_response.usage_patterns,
        efficiency_metrics: recommendation.ai_response.efficiency_metrics,
        optimization_opportunities: recommendation.ai_response.optimization_opportunities,
        user_behavior_insights: recommendation.ai_response.user_behavior_insights,
        confidence: recommendation.confidence_score,
        is_fallback: recommendation._metadata?.is_fallback || false
      });

    } catch (error) {
      logger.error('Usage analytics generation failed', {
        error: error.message,
        groupId: req.body.analytics_data?.group_id,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getAnalyticsRecommendations(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
      const { limit = 10, page = 1 } = req.query;

      const result = await aiService.getGroupRecommendations(groupId, {
        limit: parseInt(limit),
        page: parseInt(page),
        feature_type: 'analytics'
      });

      logger.info('Analytics recommendations retrieved', {
        groupId,
        userId,
        count: result.recommendations.length
      });

      return successResponse(res, 'Analytics recommendations retrieved successfully', result);

    } catch (error) {
      logger.error('Failed to get analytics recommendations', {
        error: error.message,
        groupId: req.params.groupId,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getAIServiceMetrics(req, res, next) {
    try {
      const userId = req.user.id;
      const { days = 30 } = req.query;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Get usage statistics
      const usageStats = await UsageLog.getDailyUsage(startDate, new Date());

      // Get feature usage distribution
      const featureDistribution = await UsageLog.aggregate([
        {
          $match: {
            created_at: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$feature_type',
            total_requests: { $sum: 1 },
            average_response_time: { $avg: '$response_time' },
            success_rate: {
              $avg: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
            }
          }
        }
      ]);

      // Get user-specific stats
      const userStats = await UsageLog.getUserUsageStats(userId, parseInt(days));

      const metrics = {
        period: {
          start_date: startDate,
          end_date: new Date(),
          days: parseInt(days)
        },
        usage_overview: {
          total_requests: usageStats.reduce((sum, day) => sum + day.total_requests, 0),
          average_response_time: usageStats.reduce((sum, day) => sum + day.average_response_time, 0) / usageStats.length,
          overall_success_rate: usageStats.reduce((sum, day) => sum + day.success_rate, 0) / usageStats.length
        },
        feature_distribution: featureDistribution,
        user_usage: userStats,
        daily_breakdown: usageStats
      };

      logger.info('AI service metrics retrieved', {
        userId,
        days,
        total_requests: metrics.usage_overview.total_requests
      });

      return successResponse(res, 'AI service metrics retrieved successfully', metrics);

    } catch (error) {
      logger.error('Failed to get AI service metrics', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getOptimizationSummary(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      // Get all types of recommendations for the group
      const [scheduleRecs, costRecs, disputeRecs, analyticsRecs] = await Promise.all([
        aiService.getGroupRecommendations(groupId, { limit: 5, feature_type: 'schedule' }),
        aiService.getGroupRecommendations(groupId, { limit: 5, feature_type: 'cost' }),
        aiService.getGroupRecommendations(groupId, { limit: 5, feature_type: 'dispute' }),
        aiService.getGroupRecommendations(groupId, { limit: 5, feature_type: 'analytics' })
      ]);

      const summary = {
        schedule_optimization: this.summarizeRecommendations(scheduleRecs.recommendations),
        cost_analysis: this.summarizeRecommendations(costRecs.recommendations),
        dispute_resolution: this.summarizeRecommendations(disputeRecs.recommendations),
        usage_analytics: this.summarizeRecommendations(analyticsRecs.recommendations),
        overall_health: this.calculateOverallHealth([
          scheduleRecs, costRecs, disputeRecs, analyticsRecs
        ])
      };

      logger.info('Optimization summary generated', {
        groupId,
        userId,
        summary: summary.overall_health
      });

      return successResponse(res, 'Optimization summary retrieved successfully', summary);

    } catch (error) {
      logger.error('Failed to get optimization summary', {
        error: error.message,
        groupId: req.params.groupId,
        userId: req.user?.id
      });
      next(error);
    }
  }

  summarizeRecommendations(recommendations) {
    if (recommendations.length === 0) {
      return { status: 'no_data', message: 'No recommendations available' };
    }

    const latest = recommendations[0];
    const acceptedCount = recommendations.filter(rec => rec.status === 'accepted').length;
    const averageConfidence = recommendations.reduce((sum, rec) => sum + rec.confidence_score, 0) / recommendations.length;

    return {
      status: 'active',
      latest_recommendation: {
        id: latest.recommendation_id,
        confidence: latest.confidence_score,
        created_at: latest.created_at
      },
      statistics: {
        total_recommendations: recommendations.length,
        accepted_count: acceptedCount,
        acceptance_rate: (acceptedCount / recommendations.length) * 100,
        average_confidence: averageConfidence
      }
    };
  }

  calculateOverallHealth(categoryResults) {
    const scores = categoryResults.map(category => {
      if (category.recommendations.length === 0) return 0.3; // Low score for no data
      
      const latest = category.recommendations[0];
      const confidence = latest.confidence_score || 0.5;
      const isRecent = new Date() - new Date(latest.created_at) < 7 * 24 * 60 * 60 * 1000; // Within 7 days
      
      return confidence * (isRecent ? 1 : 0.7);
    });

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    if (averageScore >= 0.8) return 'excellent';
    if (averageScore >= 0.6) return 'good';
    if (averageScore >= 0.4) return 'fair';
    return 'needs_improvement';
  }
}

export default new AnalyticsController();