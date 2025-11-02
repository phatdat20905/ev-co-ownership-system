import { 
  createEventBus, 
  eventTypes,
  logger 
} from '@ev-coownership/shared';

class EventService {
  constructor() {
    this.eventBus = createEventBus('ai-service');
    this.isConnected = false;
    this.retryAttempts = 3;
    this.retryDelay = 500;
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      logger.info('AI Service event service initialized successfully');
    } catch (error) {
      this.isConnected = false;
      logger.error('Failed to initialize AI Service event service', { error: error.message });
    }
  }

  async publishEvent(eventType, payload) {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping publish', { eventType });
      return;
    }

    if (!payload || Object.keys(payload).length === 0) {
      logger.warn('Empty payload, skipping publish', { eventType });
      return;
    }

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        await this.eventBus.publish(eventType, payload);
        logger.debug(`Event published: ${eventType}`, payload);
        return;
      } catch (error) {
        logger.error(`Failed to publish event [Attempt ${attempt}]`, { eventType, error: error.message });
        if (attempt < this.retryAttempts) {
          await new Promise(res => setTimeout(res, this.retryDelay));
        }
      }
    }
  }

  // Recommendation Events
  async publishRecommendationGenerated(recommendationData) {
    if (!recommendationData?.recommendation_id) return;
    await this.publishEvent(eventTypes.RECOMMENDATION_GENERATED, {
      recommendation_id: recommendationData.recommendation_id,
      group_id: recommendationData.group_id,
      user_id: recommendationData.user_id,
      feature_type: recommendationData.feature_type,
      confidence_score: recommendationData.confidence_score,
      created_at: new Date().toISOString()
    });
  }

  async publishRecommendationAccepted(recommendationData) {
    if (!recommendationData?.recommendation_id) return;
    await this.publishEvent(eventTypes.RECOMMENDATION_ACCEPTED, {
      recommendation_id: recommendationData.recommendation_id,
      user_id: recommendationData.user_id,
      feedback: recommendationData.feedback,
      accepted_at: new Date().toISOString()
    });
  }

  async publishRecommendationRejected(recommendationData) {
    if (!recommendationData?.recommendation_id) return;
    await this.publishEvent(eventTypes.RECOMMENDATION_REJECTED, {
      recommendation_id: recommendationData.recommendation_id,
      user_id: recommendationData.user_id,
      feedback: recommendationData.feedback,
      rejected_at: new Date().toISOString()
    });
  }

  // Analysis Events
  async publishScheduleOptimized(optimizationData) {
    if (!optimizationData?.group_id) return;
    await this.publishEvent(eventTypes.SCHEDULE_OPTIMIZED, {
      group_id: optimizationData.group_id,
      optimized_by: optimizationData.user_id || 'system',
      fairness_score: optimizationData.fairness_score,
      schedule_period: optimizationData.schedule_period,
      optimized_at: new Date().toISOString()
    });
  }

  async publishCostAnomalyDetected(anomalyData) {
    if (!anomalyData?.group_id) return;
    await this.publishEvent(eventTypes.COST_ANOMALY_DETECTED, {
      group_id: anomalyData.group_id,
      cost_id: anomalyData.cost_id,
      anomaly_score: anomalyData.anomaly_score,
      severity: anomalyData.severity,
      detected_at: new Date().toISOString()
    });
  }

  async publishDisputeAnalyzed(disputeData) {
    if (!disputeData?.dispute_id) return;
    await this.publishEvent(eventTypes.DISPUTE_ANALYZED, {
      dispute_id: disputeData.dispute_id,
      group_id: disputeData.group_id,
      severity_level: disputeData.severity_level,
      resolution_suggestions: disputeData.resolution_suggestions?.length || 0,
      analyzed_at: new Date().toISOString()
    });
  }

  // Auto-triggered Events
  async publishAutoScheduleReoptimized(reoptimizationData) {
    if (!reoptimizationData?.group_id) return;
    await this.publishEvent(eventTypes.AUTO_SCHEDULE_REOPTIMIZED, {
      group_id: reoptimizationData.group_id,
      trigger_reason: reoptimizationData.trigger_reason,
      previous_score: reoptimizationData.previous_score,
      new_score: reoptimizationData.new_score,
      reoptimized_at: new Date().toISOString()
    });
  }

  async startEventConsumers() {
    if (!this.isConnected) {
      logger.warn('Event service not connected, skipping event consumers');
      return;
    }

    try {
      // Subscribe to events that should trigger AI analysis
      await this.eventBus.subscribe(eventTypes.BOOKING_CREATED, this.handleBookingCreated.bind(this));
      await this.eventBus.subscribe(eventTypes.COST_CREATED, this.handleCostCreated.bind(this));
      await this.eventBus.subscribe(eventTypes.DISPUTE_CREATED, this.handleDisputeCreated.bind(this));
      
      // Subscribe to user events for analytics
      await this.eventBus.subscribe(eventTypes.USER_UPDATED, this.handleUserUpdated.bind(this));

      logger.info('AI Service event consumers started successfully');
    } catch (error) {
      logger.error('Failed to start AI Service event consumers', { error: error.message });
    }
  }

  // Event handlers for incoming events
  async handleBookingCreated(bookingData) {
    try {
      logger.info('Booking created event received', { 
        bookingId: bookingData.booking_id,
        groupId: bookingData.group_id 
      });

      // Trigger schedule re-optimization if needed
      // This could check if the new booking affects fairness significantly
      
    } catch (error) {
      logger.error('Error handling booking created event', { 
        error: error.message, 
        bookingId: bookingData.booking_id 
      });
    }
  }

  async handleCostCreated(costData) {
    try {
      logger.info('Cost created event received', { 
        costId: costData.cost_id,
        groupId: costData.group_id,
        amount: costData.amount
      });

      // Auto-trigger cost analysis for anomaly detection
      // This would call the cost analysis service
      
    } catch (error) {
      logger.error('Error handling cost created event', { 
        error: error.message, 
        costId: costData.cost_id 
      });
    }
  }

  async handleDisputeCreated(disputeData) {
    try {
      logger.info('Dispute created event received', { 
        disputeId: disputeData.dispute_id,
        groupId: disputeData.group_id,
        type: disputeData.dispute_type
      });

      // Auto-trigger dispute analysis
      // This would call the dispute analysis service
      
    } catch (error) {
      logger.error('Error handling dispute created event', { 
        error: error.message, 
        disputeId: disputeData.dispute_id 
      });
    }
  }

  async handleUserUpdated(userData) {
    try {
      logger.info('User updated event received', { 
        userId: userData.user_id,
        updates: userData.updates
      });

      // Update user behavior models if needed
      
    } catch (error) {
      logger.error('Error handling user updated event', { 
        error: error.message, 
        userId: userData.user_id 
      });
    }
  }

  async healthCheck() {
    return await this.eventBus.healthCheck();
  }
}

export default new EventService();