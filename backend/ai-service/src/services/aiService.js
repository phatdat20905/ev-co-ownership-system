import { logger, AppError } from '@ev-coownership/shared';
import { Recommendation, UsageLog } from '../models/index.js';
import geminiCoreService from './geminiCoreService.js';
import PromptTemplates from './promptTemplates.js';
import CacheService from './cacheService.js';
import EventService from './eventService.js';
import FallbackService from './fallbackService.js';
import { idGenerator } from '../utils/idGenerator.js';
import { FEATURE_TYPES, CONFIDENCE_THRESHOLDS } from '../utils/constants.js';

export class AIService {
  constructor() {
    this.userRateLimits = new Map();
  }

  async generateScheduleOptimization(groupData, userId) {
    const startTime = Date.now();
    
    try {
      this.checkRateLimit(userId, 'schedule');

      // Check cache first
      const cacheKey = `ai:schedule:${groupData.group_id}`;
      const cached = await CacheService.getCachedScheduleOptimization(groupData.group_id);
      
      if (cached && this.isCacheValid(cached)) {
        await this.logUsage(userId, groupData.group_id, 'schedule', '/ai/schedule/optimize', startTime, true, true);
        return cached;
      }

      // Generate new optimization
      const prompt = PromptTemplates.getScheduleOptimizationPrompt(groupData);
      const aiResponse = await geminiCoreService.generateAIResponse(prompt, groupData, 'schedule');

      const recommendation = await Recommendation.create({
        recommendation_id: idGenerator.generateRecommendationId(),
        group_id: groupData.group_id,
        user_id: userId,
        feature_type: 'schedule',
        input_summary: {
          member_count: groupData.members?.length || 0,
          date_range: groupData.date_range,
          constraints: groupData.constraints
        },
        ai_response: aiResponse,
        confidence_score: aiResponse.fairness_metrics?.overall_score || 0.8,
        cost_estimate: {
          estimated_savings: this.calculatePotentialSavings(aiResponse),
          currency: 'VND'
        },
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      // Cache the result
      await CacheService.cacheScheduleOptimization(groupData.group_id, recommendation);

      // Publish event
      await EventService.publishRecommendationGenerated({
        recommendation_id: recommendation.recommendation_id,
        group_id: groupData.group_id,
        user_id: userId,
        feature_type: 'schedule',
        confidence_score: recommendation.confidence_score
      });

      await this.logUsage(userId, groupData.group_id, 'schedule', '/ai/schedule/optimize', startTime, true);

      return recommendation;

    } catch (error) {
      await this.logUsage(userId, groupData.group_id, 'schedule', '/ai/schedule/optimize', startTime, false, false, error.message);
      
      logger.error('Schedule optimization failed', { 
        error: error.message, 
        groupId: groupData.group_id,
        userId 
      });

      // Return fallback
      const fallbackResponse = FallbackService.getScheduleFallback(groupData);
      return {
        recommendation_id: idGenerator.generateRecommendationId(),
        group_id: groupData.group_id,
        user_id: userId,
        feature_type: 'schedule',
        input_summary: groupData,
        ai_response: fallbackResponse,
        confidence_score: 0.5,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        _metadata: { is_fallback: true }
      };
    }
  }

  async generateCostAnalysis(costData, userId) {
    const startTime = Date.now();
    
    try {
      this.checkRateLimit(userId, 'cost');

      const cacheKey = `ai:cost:${costData.group_id}`;
      const cached = await CacheService.getCachedCostAnalysis(costData.group_id);
      
      if (cached && this.isCacheValid(cached)) {
        await this.logUsage(userId, costData.group_id, 'cost', '/ai/cost/analyze', startTime, true, true);
        return cached;
      }

      const prompt = PromptTemplates.getCostAnalysisPrompt(costData);
      const aiResponse = await geminiCoreService.generateAIResponse(prompt, costData, 'cost');

      const recommendation = await Recommendation.create({
        recommendation_id: idGenerator.generateRecommendationId(),
        group_id: costData.group_id,
        user_id: userId,
        feature_type: 'cost',
        input_summary: {
          cost_count: costData.history?.length || 0,
          total_amount: costData.history?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0,
          category: costData.category
        },
        ai_response: aiResponse,
        confidence_score: aiResponse.anomaly_detection?.confidence || 0.7,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      await CacheService.cacheCostAnalysis(costData.group_id, recommendation);

      // Publish anomaly event if detected
      if (aiResponse.anomaly_detection?.is_anomaly && 
          aiResponse.anomaly_detection.confidence > CONFIDENCE_THRESHOLDS.HIGH) {
        await EventService.publishCostAnomalyDetected({
          group_id: costData.group_id,
          cost_id: costData.current?.cost_id,
          anomaly_score: aiResponse.anomaly_detection.confidence,
          severity: aiResponse.anomaly_detection.severity
        });
      }

      await EventService.publishRecommendationGenerated({
        recommendation_id: recommendation.recommendation_id,
        group_id: costData.group_id,
        user_id: userId,
        feature_type: 'cost',
        confidence_score: recommendation.confidence_score
      });

      await this.logUsage(userId, costData.group_id, 'cost', '/ai/cost/analyze', startTime, true);

      return recommendation;

    } catch (error) {
      await this.logUsage(userId, costData.group_id, 'cost', '/ai/cost/analyze', startTime, false, false, error.message);
      
      const fallbackResponse = FallbackService.getCostAnalysisFallback(costData);
      return {
        recommendation_id: idGenerator.generateRecommendationId(),
        group_id: costData.group_id,
        user_id: userId,
        feature_type: 'cost',
        input_summary: costData,
        ai_response: fallbackResponse,
        confidence_score: 0.5,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        _metadata: { is_fallback: true }
      };
    }
  }

  async generateDisputeAnalysis(disputeData, userId) {
    const startTime = Date.now();
    
    try {
      this.checkRateLimit(userId, 'dispute');

      const prompt = PromptTemplates.getDisputeAnalysisPrompt(disputeData);
      const aiResponse = await geminiCoreService.generateAIResponse(prompt, disputeData, 'dispute');

      const recommendation = await Recommendation.create({
        recommendation_id: idGenerator.generateRecommendationId(),
        group_id: disputeData.group_id,
        user_id: userId,
        feature_type: 'dispute',
        input_summary: {
          dispute_type: disputeData.type,
          message_count: disputeData.messages?.length || 0,
          parties_involved: disputeData.parties?.length || 0
        },
        ai_response: aiResponse,
        confidence_score: aiResponse.dispute_assessment?.urgency_score || 0.7,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      await EventService.publishDisputeAnalyzed({
        dispute_id: disputeData.dispute_id,
        group_id: disputeData.group_id,
        severity_level: aiResponse.dispute_assessment?.severity_level,
        resolution_suggestions: aiResponse.resolution_suggestions
      });

      await EventService.publishRecommendationGenerated({
        recommendation_id: recommendation.recommendation_id,
        group_id: disputeData.group_id,
        user_id: userId,
        feature_type: 'dispute',
        confidence_score: recommendation.confidence_score
      });

      await this.logUsage(userId, disputeData.group_id, 'dispute', '/ai/dispute/analyze', startTime, true);

      return recommendation;

    } catch (error) {
      await this.logUsage(userId, disputeData.group_id, 'dispute', '/ai/dispute/analyze', startTime, false, false, error.message);
      
      const fallbackResponse = FallbackService.getDisputeAnalysisFallback(disputeData);
      return {
        recommendation_id: idGenerator.generateRecommendationId(),
        group_id: disputeData.group_id,
        user_id: userId,
        feature_type: 'dispute',
        input_summary: disputeData,
        ai_response: fallbackResponse,
        confidence_score: 0.5,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        _metadata: { is_fallback: true }
      };
    }
  }

  async generateUsageAnalytics(usageData, userId) {
    const startTime = Date.now();
    
    try {
      this.checkRateLimit(userId, 'analytics');

      const cacheKey = `ai:usage:${usageData.group_id}`;
      const cached = await CacheService.getCachedRecommendation(cacheKey);
      
      if (cached && this.isCacheValid(cached)) {
        await this.logUsage(userId, usageData.group_id, 'analytics', '/ai/analytics/generate', startTime, true, true);
        return cached;
      }

      const prompt = PromptTemplates.getUsageAnalyticsPrompt(usageData);
      const aiResponse = await geminiCoreService.generateAIResponse(prompt, usageData, 'analytics');

      const recommendation = await Recommendation.create({
        recommendation_id: idGenerator.generateRecommendationId(),
        group_id: usageData.group_id,
        user_id: userId,
        feature_type: 'analytics',
        input_summary: {
          period: usageData.period,
          booking_count: usageData.booking_history?.length || 0,
          analysis_scope: usageData.scope
        },
        ai_response: aiResponse,
        confidence_score: 0.8, // Analytics typically have high confidence
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      });

      await CacheService.cacheRecommendation(cacheKey, recommendation, 1800); // 30 minutes cache

      await EventService.publishRecommendationGenerated({
        recommendation_id: recommendation.recommendation_id,
        group_id: usageData.group_id,
        user_id: userId,
        feature_type: 'analytics',
        confidence_score: recommendation.confidence_score
      });

      await this.logUsage(userId, usageData.group_id, 'analytics', '/ai/analytics/generate', startTime, true);

      return recommendation;

    } catch (error) {
      await this.logUsage(userId, usageData.group_id, 'analytics', '/ai/analytics/generate', startTime, false, false, error.message);
      
      const fallbackResponse = FallbackService.getUsageAnalyticsFallback(usageData);
      return {
        recommendation_id: idGenerator.generateRecommendationId(),
        group_id: usageData.group_id,
        user_id: userId,
        feature_type: 'analytics',
        input_summary: usageData,
        ai_response: fallbackResponse,
        confidence_score: 0.5,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date(),
        _metadata: { is_fallback: true }
      };
    }
  }

  async recordFeedback(recommendationId, userId, feedback) {
    try {
      const recommendation = await Recommendation.findOne({ recommendation_id: recommendationId });
      
      if (!recommendation) {
        throw new AppError('Recommendation not found', 404, 'RECOMMENDATION_NOT_FOUND');
      }

      if (recommendation.user_id !== userId) {
        throw new AppError('Not authorized to provide feedback for this recommendation', 403, 'UNAUTHORIZED_FEEDBACK');
      }

      const updatedRecommendation = await Recommendation.findOneAndUpdate(
        { recommendation_id: recommendationId },
        { 
          $set: { 
            'user_feedback': {
              rating: feedback.rating,
              comment: feedback.comment,
              provided_at: new Date()
            },
            status: feedback.accepted ? 'accepted' : 'rejected',
            updated_at: new Date()
          }
        },
        { new: true }
      );

      // Publish feedback event
      const eventType = feedback.accepted 
        ? eventTypes.RECOMMENDATION_ACCEPTED 
        : eventTypes.RECOMMENDATION_REJECTED;

      await EventService.publishEvent(eventType, {
        recommendation_id: recommendationId,
        user_id: userId,
        feedback: {
          rating: feedback.rating,
          comment: feedback.comment,
          accepted: feedback.accepted
        }
      });

      logger.info('Feedback recorded successfully', { 
        recommendationId, 
        userId, 
        accepted: feedback.accepted 
      });

      return updatedRecommendation;

    } catch (error) {
      logger.error('Failed to record feedback', { 
        error: error.message, 
        recommendationId, 
        userId 
      });
      throw error;
    }
  }

  async getGroupRecommendations(groupId, options = {}) {
    try {
      const { limit = 10, page = 1, feature_type } = options;
      
      const recommendations = await Recommendation.findByGroupId(groupId, {
        limit: parseInt(limit),
        page: parseInt(page),
        feature_type
      });

      const total = await Recommendation.countDocuments({ group_id: groupId });

      return {
        recommendations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      logger.error('Failed to get group recommendations', { 
        error: error.message, 
        groupId 
      });
      throw error;
    }
  }

  // Utility methods
  checkRateLimit(userId, featureType) {
    const key = `${userId}_${featureType}`;
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    if (!this.userRateLimits.has(key)) {
      this.userRateLimits.set(key, []);
    }
    
    const requests = this.userRateLimits.get(key).filter(time => time > windowStart);
    
    const limits = {
      schedule: 10,
      cost: 15,
      dispute: 20,
      analytics: 10
    };

    if (requests.length >= (limits[featureType] || 10)) {
      throw new AppError('Rate limit exceeded for this feature', 429, 'RATE_LIMIT_EXCEEDED');
    }
    
    requests.push(now);
    this.userRateLimits.set(key, requests);
  }

  async logUsage(userId, groupId, featureType, endpoint, startTime, success, cacheHit = false, errorMessage = null) {
    const responseTime = Date.now() - startTime;
    
    await UsageLog.create({
      user_id: userId,
      group_id: groupId,
      feature_type: featureType,
      endpoint: endpoint,
      response_time: responseTime,
      token_usage: 0, // Would need actual token count from Gemini response
      cache_hit: cacheHit,
      success: success,
      error_message: errorMessage,
      created_at: new Date()
    });
  }

  isCacheValid(cachedData) {
    if (!cachedData.created_at) return false;
    
    const cacheAge = Date.now() - new Date(cachedData.created_at).getTime();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    return cacheAge < maxAge;
  }

  calculatePotentialSavings(optimization) {
    // Simple calculation based on fairness improvement
    const baseScore = 0.7; // Assume base fairness without optimization
    const optimizedScore = optimization.fairness_metrics?.overall_score || 0.7;
    const improvement = Math.max(0, optimizedScore - baseScore);
    
    // Rough estimate: 10% potential cost savings per 0.1 fairness improvement
    return Math.round(improvement * 1000000); // Example: 1M VND max potential
  }

  async getServiceHealth() {
    const healthChecks = {
      database: await this.checkDatabaseHealth(),
      gemini: await geminiCoreService.healthCheck(),
      cache: await CacheService.getCacheStats(),
      events: await EventService.healthCheck()
    };

    const allHealthy = Object.values(healthChecks).every(check => check.healthy !== false);

    return {
      healthy: allHealthy,
      checks: healthChecks,
      timestamp: new Date().toISOString()
    };
  }

  async checkDatabaseHealth() {
    try {
      await Recommendation.findOne().limit(1);
      return { healthy: true, service: 'mongodb' };
    } catch (error) {
      return { healthy: false, service: 'mongodb', error: error.message };
    }
  }
}

export default new AIService();