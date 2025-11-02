import { logger } from '@ev-coownership/shared';
import EventService from '../../services/eventService.js';

export class AIEventPublisher {
  // Recommendation events are already handled in the main EventService
  // This class provides additional specialized publishing methods

  async publishModelPerformanceUpdate(performanceData) {
    try {
      await EventService.publishEvent('ai.model.performance_updated', {
        model_name: performanceData.model_name,
        average_response_time: performanceData.average_response_time,
        success_rate: performanceData.success_rate,
        token_usage: performanceData.token_usage,
        updated_at: new Date().toISOString()
      });

      logger.info('Model performance update published', {
        model: performanceData.model_name,
        successRate: performanceData.success_rate
      });

    } catch (error) {
      logger.error('Error publishing model performance update', {
        error: error.message
      });
    }
  }

  async publishAIServiceHealthUpdate(healthData) {
    try {
      await EventService.publishEvent('ai.service.health_updated', {
        service: 'ai-service',
        healthy: healthData.healthy,
        checks: healthData.checks,
        timestamp: new Date().toISOString()
      });

      if (!healthData.healthy) {
        logger.warn('AI service health issue published', {
          unhealthy_services: Object.entries(healthData.checks)
            .filter(([_, check]) => !check.healthy)
            .map(([service, _]) => service)
        });
      }

    } catch (error) {
      logger.error('Error publishing AI service health update', {
        error: error.message
      });
    }
  }

  async publishUsageThresholdAlert(alertData) {
    try {
      await EventService.publishEvent('ai.usage.threshold_alert', {
        threshold_type: alertData.threshold_type,
        current_usage: alertData.current_usage,
        threshold_limit: alertData.threshold_limit,
        period: alertData.period,
        alert_level: alertData.alert_level,
        triggered_at: new Date().toISOString()
      });

      logger.warn('Usage threshold alert published', {
        thresholdType: alertData.threshold_type,
        currentUsage: alertData.current_usage,
        limit: alertData.threshold_limit
      });

    } catch (error) {
      logger.error('Error publishing usage threshold alert', {
        error: error.message
      });
    }
  }

  async publishTrainingDataUpdated(updateData) {
    try {
      await EventService.publishEvent('ai.training.data_updated', {
        data_type: updateData.data_type,
        records_added: updateData.records_added,
        records_updated: updateData.records_updated,
        total_records: updateData.total_records,
        updated_at: new Date().toISOString()
      });

      logger.info('Training data update published', {
        dataType: updateData.data_type,
        recordsAdded: updateData.records_added
      });

    } catch (error) {
      logger.error('Error publishing training data update', {
        error: error.message
      });
    }
  }
}

export default new AIEventPublisher();