import { logger } from '@ev-coownership/shared';
import aiService from '../../services/aiService.js';

export class DisputeConsumer {
  async handleDisputeCreated(disputeData) {
    try {
      logger.info('Processing dispute created event', {
        disputeId: disputeData.dispute_id,
        groupId: disputeData.group_id,
        type: disputeData.dispute_type,
        filedBy: disputeData.filed_by
      });

      // Always analyze new disputes for severity assessment
      await this.triggerDisputeAnalysis(disputeData);

      logger.info('Dispute event processed successfully', {
        disputeId: disputeData.dispute_id
      });

    } catch (error) {
      logger.error('Error processing dispute created event', {
        error: error.message,
        disputeId: disputeData.dispute_id
      });
    }
  }

  async triggerDisputeAnalysis(disputeData) {
    try {
      // Prepare dispute data for analysis
      const analysisData = {
        group_id: disputeData.group_id,
        dispute_id: disputeData.dispute_id,
        type: disputeData.dispute_type,
        messages: disputeData.messages || [],
        context: {
          involved_parties: disputeData.involved_parties || [],
          dispute_start: disputeData.created_at,
          previous_issues: disputeData.previous_issues || []
        },
        user_history: disputeData.user_history || []
      };

      // Use system user for auto-triggered analysis
      const systemUserId = 'system-auto';

      logger.info('Dispute analysis triggered', {
        disputeId: disputeData.dispute_id,
        groupId: disputeData.group_id,
        type: disputeData.dispute_type
      });

      // Uncomment to actually trigger analysis:
      // await aiService.generateDisputeAnalysis(analysisData, systemUserId);

    } catch (error) {
      logger.error('Error triggering dispute analysis', {
        error: error.message,
        disputeId: disputeData.dispute_id
      });
    }
  }

  async handleDisputeMessageAdded(messageData) {
    try {
      logger.info('Processing dispute message event', {
        disputeId: messageData.dispute_id,
        messageId: messageData.message_id,
        senderId: messageData.sender_id
      });

      // Re-analyze dispute when new messages are added
      // to update sentiment and resolution suggestions
      await this.triggerDisputeReanalysis(messageData);

    } catch (error) {
      logger.error('Error processing dispute message event', {
        error: error.message,
        disputeId: messageData.dispute_id
      });
    }
  }

  async triggerDisputeReanalysis(messageData) {
    try {
      // In production, this would fetch the updated dispute data
      // and trigger a new analysis
      
      logger.info('Dispute reanalysis triggered by new message', {
        disputeId: messageData.dispute_id,
        messageId: messageData.message_id
      });

      // Implementation would be similar to triggerDisputeAnalysis
      // but with updated message data

    } catch (error) {
      logger.error('Error triggering dispute reanalysis', {
        error: error.message,
        disputeId: messageData.dispute_id
      });
    }
  }
}

export default new DisputeConsumer();