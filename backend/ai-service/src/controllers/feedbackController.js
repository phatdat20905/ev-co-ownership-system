import aiService from '../services/aiService.js';
import { 
  successResponse, 
  logger,
  AppError 
} from '@ev-coownership/shared';

export class FeedbackController {
  async submitFeedback(req, res, next) {
    try {
      const { recommendationId } = req.params;
      const { rating, comment, accepted } = req.body;
      const userId = req.user.id;

      if (!recommendationId) {
        throw new AppError('Recommendation ID is required', 400, 'MISSING_RECOMMENDATION_ID');
      }

      if (rating && (rating < 1 || rating > 5)) {
        throw new AppError('Rating must be between 1 and 5', 400, 'INVALID_RATING');
      }

      const feedback = {
        rating: parseInt(rating) || null,
        comment: comment || '',
        accepted: Boolean(accepted)
      };

      const updatedRecommendation = await aiService.recordFeedback(recommendationId, userId, feedback);

      logger.info('Feedback submitted successfully', {
        recommendationId,
        userId,
        rating: feedback.rating,
        accepted: feedback.accepted
      });

      return successResponse(res, 'Feedback submitted successfully', {
        recommendation_id: updatedRecommendation.recommendation_id,
        status: updatedRecommendation.status,
        feedback: updatedRecommendation.user_feedback
      });

    } catch (error) {
      logger.error('Failed to submit feedback', {
        error: error.message,
        recommendationId: req.params.recommendationId,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getFeedbackStats(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const recommendations = await aiService.getGroupRecommendations(groupId, {
        limit: 100, // Get more for accurate stats
        page: 1
      });

      const stats = this.calculateFeedbackStats(recommendations.recommendations);

      logger.info('Feedback statistics retrieved', {
        groupId,
        userId,
        total_recommendations: stats.total_recommendations
      });

      return successResponse(res, 'Feedback statistics retrieved successfully', stats);

    } catch (error) {
      logger.error('Failed to get feedback statistics', {
        error: error.message,
        groupId: req.params.groupId,
        userId: req.user?.id
      });
      next(error);
    }
  }

  async getUserFeedbackHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit = 20, page = 1 } = req.query;

      // Get recommendations where user provided feedback
      const recommendations = await aiService.getGroupRecommendations('*', {
        limit: parseInt(limit),
        page: parseInt(page)
      });

      const userFeedback = recommendations.recommendations.filter(rec => 
        rec.user_id === userId && rec.user_feedback
      );

      const feedbackHistory = userFeedback.map(rec => ({
        recommendation_id: rec.recommendation_id,
        group_id: rec.group_id,
        feature_type: rec.feature_type,
        feedback: rec.user_feedback,
        created_at: rec.created_at,
        ai_response_preview: this.getResponsePreview(rec.ai_response)
      }));

      logger.info('User feedback history retrieved', {
        userId,
        count: feedbackHistory.length
      });

      return successResponse(res, 'User feedback history retrieved successfully', {
        feedback_history: feedbackHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: userFeedback.length
        }
      });

    } catch (error) {
      logger.error('Failed to get user feedback history', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }

  calculateFeedbackStats(recommendations) {
    const total = recommendations.length;
    const withFeedback = recommendations.filter(rec => rec.user_feedback).length;
    const accepted = recommendations.filter(rec => rec.status === 'accepted').length;
    const rejected = recommendations.filter(rec => rec.status === 'rejected').length;
    
    const ratings = recommendations
      .filter(rec => rec.user_feedback?.rating)
      .map(rec => rec.user_feedback.rating);
    
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    const featureTypeStats = {};
    recommendations.forEach(rec => {
      if (!featureTypeStats[rec.feature_type]) {
        featureTypeStats[rec.feature_type] = {
          total: 0,
          accepted: 0,
          with_feedback: 0,
          average_rating: 0
        };
      }
      
      featureTypeStats[rec.feature_type].total++;
      if (rec.status === 'accepted') featureTypeStats[rec.feature_type].accepted++;
      if (rec.user_feedback) featureTypeStats[rec.feature_type].with_feedback++;
    });

    // Calculate average rating per feature type
    Object.keys(featureTypeStats).forEach(featureType => {
      const featureRatings = recommendations
        .filter(rec => rec.feature_type === featureType && rec.user_feedback?.rating)
        .map(rec => rec.user_feedback.rating);
      
      featureTypeStats[featureType].average_rating = featureRatings.length > 0
        ? featureRatings.reduce((sum, rating) => sum + rating, 0) / featureRatings.length
        : 0;
    });

    return {
      overall: {
        total_recommendations: total,
        feedback_rate: total > 0 ? (withFeedback / total) * 100 : 0,
        acceptance_rate: total > 0 ? (accepted / total) * 100 : 0,
        rejection_rate: total > 0 ? (rejected / total) * 100 : 0,
        average_rating: averageRating
      },
      by_feature_type: featureTypeStats,
      feedback_quality: {
        excellent_ratings: ratings.filter(r => r >= 4.5).length,
        good_ratings: ratings.filter(r => r >= 3.5 && r < 4.5).length,
        average_ratings: ratings.filter(r => r >= 2.5 && r < 3.5).length,
        poor_ratings: ratings.filter(r => r < 2.5).length
      }
    };
  }

  getResponsePreview(aiResponse) {
    if (!aiResponse) return null;
    
    // Create a preview of the AI response
    const preview = {};
    
    if (aiResponse.schedule) {
      preview.schedule_summary = `Schedule with ${aiResponse.schedule.length} days`;
    }
    
    if (aiResponse.predictions) {
      preview.cost_prediction = aiResponse.predictions.next_month;
    }
    
    if (aiResponse.dispute_assessment) {
      preview.dispute_severity = aiResponse.dispute_assessment.severity_level;
    }
    
    if (aiResponse.usage_patterns) {
      preview.peak_hours = aiResponse.usage_patterns.peak_hours;
    }
    
    return preview;
  }
}

export default new FeedbackController();