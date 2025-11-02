import { logger } from '@ev-coownership/shared';
import aiService from '../../services/aiService.js';
import EventService from '../../services/eventService.js';

export class CostConsumer {
  async handleCostCreated(costData) {
    try {
      logger.info('Processing cost created event', {
        costId: costData.cost_id,
        groupId: costData.group_id,
        amount: costData.amount,
        category: costData.category
      });

      // Check if this cost might be an anomaly
      const shouldAnalyze = await this.shouldAnalyzeCost(costData);
      
      if (shouldAnalyze) {
        await this.triggerCostAnalysis(costData);
      }

      // Invalidate cost-related caches
      // Cache invalidation would happen in the service layer

      logger.info('Cost event processed successfully', {
        costId: costData.cost_id,
        analyzed: shouldAnalyze
      });

    } catch (error) {
      logger.error('Error processing cost created event', {
        error: error.message,
        costId: costData.cost_id
      });
    }
  }

  async shouldAnalyzeCost(costData) {
    try {
      // Analyze costs that are significantly higher than average
      // or belong to certain categories
      const highValueCategories = ['maintenance', 'repair', 'insurance', 'charging'];
      
      if (highValueCategories.includes(costData.category)) {
        return true;
      }

      // Analyze costs above a certain threshold
      const highValueThreshold = 1000000; // 1 million VND
      if (costData.amount > highValueThreshold) {
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Error checking cost analysis need', {
        error: error.message,
        costId: costData.cost_id
      });
      return false;
    }
  }

  async triggerCostAnalysis(costData) {
    try {
      // Prepare cost data for analysis
      const analysisData = {
        group_id: costData.group_id,
        current: {
          cost_id: costData.cost_id,
          amount: costData.amount,
          category: costData.category,
          date: costData.created_at || new Date().toISOString()
        },
        history: [], // This would be fetched from cost service
        category: costData.category
      };

      // Use system user for auto-triggered analysis
      const systemUserId = 'system-auto';

      logger.info('Cost analysis triggered', {
        groupId: costData.group_id,
        costId: costData.cost_id,
        amount: costData.amount,
        category: costData.category
      });

      // Uncomment to actually trigger analysis:
      // await aiService.generateCostAnalysis(analysisData, systemUserId);

    } catch (error) {
      logger.error('Error triggering cost analysis', {
        error: error.message,
        costId: costData.cost_id
      });
    }
  }

  async handleCostAnomalyDetected(anomalyData) {
    try {
      logger.info('Processing cost anomaly event', {
        groupId: anomalyData.group_id,
        costId: anomalyData.cost_id,
        anomalyScore: anomalyData.anomaly_score,
        severity: anomalyData.severity
      });

      // Here you could trigger notifications, alerts, or other actions
      // based on the detected anomaly

      if (anomalyData.severity === 'high' || anomalyData.severity === 'critical') {
        await this.handleHighSeverityAnomaly(anomalyData);
      }

    } catch (error) {
      logger.error('Error processing cost anomaly event', {
        error: error.message,
        costId: anomalyData.cost_id
      });
    }
  }

  async handleHighSeverityAnomaly(anomalyData) {
    // Implement high-severity anomaly handling
    // This could include:
    // - Sending alerts to group admins
    // - Creating admin notifications
    // - Triggering additional analysis
    
    logger.warn('High severity cost anomaly detected', {
      groupId: anomalyData.group_id,
      costId: anomalyData.cost_id,
      severity: anomalyData.severity,
      score: anomalyData.anomaly_score
    });

    // Example: Publish an alert event
    await EventService.publishEvent('ai.cost.high_anomaly_alert', {
      group_id: anomalyData.group_id,
      cost_id: anomalyData.cost_id,
      anomaly_score: anomalyData.anomaly_score,
      severity: anomalyData.severity,
      detected_at: new Date().toISOString()
    });
  }
}

export default new CostConsumer();