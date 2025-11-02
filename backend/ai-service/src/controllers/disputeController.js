import aiService from '../services/aiService.js';
import { 
  successResponse, 
  logger,
  AppError 
} from '@ev-coownership/shared';

export class DisputeController {
  async analyzeDispute(req, res, next) {
    try {
      const { dispute_data } = req.body;
      const userId = req.user.id;

      if (!dispute_data?.group_id || !dispute_data?.type) {
        throw new AppError('Dispute data with group_id and type is required', 400, 'MISSING_DISPUTE_DATA');
      }

      const recommendation = await aiService.generateDisputeAnalysis(dispute_data, userId);

      logger.info('Dispute analysis completed', {
        groupId: dispute_data.group_id,
        userId,
        recommendationId: recommendation.recommendation_id,
        severity: recommendation.ai_response.dispute_assessment?.severity_level
      });

      return successResponse(res, 'Dispute analysis completed successfully', {
        recommendation_id: recommendation.recommendation_id,
        dispute_assessment: recommendation.ai_response.dispute_assessment,
        sentiment_analysis: recommendation.ai_response.sentiment_analysis,
        resolution_suggestions: recommendation.ai_response.resolution_suggestions,
        confidence: recommendation.confidence_score,
        is_fallback: recommendation._metadata?.is_fallback || false
      });

    } catch (error) {
      logger.error('Dispute analysis failed', {
        error: error.message,
        groupId: req.body.dispute_data?.group_id,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getDisputeRecommendations(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;
      const { limit = 10, page = 1 } = req.query;

      const result = await aiService.getGroupRecommendations(groupId, {
        limit: parseInt(limit),
        page: parseInt(page),
        feature_type: 'dispute'
      });

      logger.info('Dispute recommendations retrieved', {
        groupId,
        userId,
        count: result.recommendations.length
      });

      return successResponse(res, 'Dispute recommendations retrieved successfully', result);

    } catch (error) {
      logger.error('Failed to get dispute recommendations', {
        error: error.message,
        groupId: req.params.groupId,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getDisputePatterns(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const recommendations = await aiService.getGroupRecommendations(groupId, {
        limit: 20,
        page: 1,
        feature_type: 'dispute'
      });

      const patterns = this.analyzeDisputePatterns(recommendations.recommendations);

      logger.info('Dispute patterns analyzed', {
        groupId,
        userId,
        pattern_count: patterns.length
      });

      return successResponse(res, 'Dispute patterns retrieved successfully', {
        patterns,
        total_analyses: recommendations.pagination.total
      });

    } catch (error) {
      logger.error('Failed to get dispute patterns', {
        error: error.message,
        groupId: req.params.groupId,
        userId: req.user?.id
      });
      next(error);
    }
  }

  analyzeDisputePatterns(recommendations) {
    const patterns = {};
    
    recommendations.forEach(rec => {
      const assessment = rec.ai_response.dispute_assessment;
      const category = assessment?.category || 'unknown';
      
      if (!patterns[category]) {
        patterns[category] = {
          category,
          count: 0,
          average_severity: 0,
          common_resolutions: new Set(),
          recent_occurrences: []
        };
      }
      
      patterns[category].count++;
      patterns[category].average_severity += this.getSeverityScore(assessment?.severity_level);
      
      // Track common resolutions
      const resolutions = rec.ai_response.resolution_suggestions || [];
      resolutions.forEach(resolution => {
        if (resolution.suggestion) {
          patterns[category].common_resolutions.add(resolution.suggestion);
        }
      });
      
      patterns[category].recent_occurrences.push({
        recommendation_id: rec.recommendation_id,
        severity: assessment?.severity_level,
        created_at: rec.created_at
      });
    });
    
    // Convert to array and calculate averages
    return Object.values(patterns).map(pattern => ({
      ...pattern,
      average_severity: pattern.average_severity / pattern.count,
      common_resolutions: Array.from(pattern.common_resolutions).slice(0, 5),
      recent_occurrences: pattern.recent_occurrences
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
    }));
  }

  getSeverityScore(severity) {
    const scores = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    return scores[severity] || 1;
  }
}

export default new DisputeController();