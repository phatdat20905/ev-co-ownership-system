// src/events/consumers/disputeEventConsumer.js
import notificationService from '../../services/notificationService.js';
import { logger } from '@ev-coownership/shared';

class DisputeEventConsumer {
  async handleDisputeCreated(disputeData) {
    try {
      logger.info('Processing dispute created event', { 
        disputeId: disputeData.disputeId,
        filedBy: disputeData.filedBy,
      });

      // Notify the user who filed the dispute
      await notificationService.sendTemplateNotification('dispute_created', disputeData.filedBy, {
        user_name: disputeData.userName || 'there',
        dispute_id: disputeData.disputeId,
        dispute_type: disputeData.disputeType,
      });

      // Notify admin/staff about new dispute
      // This would typically involve getting admin users from user service
      // For now, we'll log it
      logger.info('New dispute requires admin attention', { 
        disputeId: disputeData.disputeId,
        type: disputeData.disputeType,
      });

      logger.info('Dispute created notifications sent', { 
        disputeId: disputeData.disputeId,
      });
    } catch (error) {
      logger.error('Failed to process dispute created event', {
        disputeId: disputeData.disputeId,
        error: error.message,
      });
    }
  }

  async handleDisputeResolved(disputeData) {
    try {
      logger.info('Processing dispute resolved event', { 
        disputeId: disputeData.disputeId,
        filedBy: disputeData.filedBy,
      });

      await notificationService.sendTemplateNotification('dispute_resolved', disputeData.filedBy, {
        user_name: disputeData.userName || 'there',
        dispute_id: disputeData.disputeId,
        resolution: disputeData.resolution || 'The dispute has been resolved.',
      });

      logger.info('Dispute resolved notification sent', { 
        disputeId: disputeData.disputeId,
        userId: disputeData.filedBy,
      });
    } catch (error) {
      logger.error('Failed to process dispute resolved event', {
        disputeId: disputeData.disputeId,
        error: error.message,
      });
    }
  }

  async handleDisputeMessageAdded(messageData) {
    try {
      logger.info('Processing dispute message added event', { 
        disputeId: messageData.disputeId,
        senderId: messageData.senderId,
      });

      // Notify other parties in the dispute about new message
      // This would typically involve getting all participants from dispute service
      // For now, we'll log it
      logger.info('New message in dispute', { 
        disputeId: messageData.disputeId,
        senderId: messageData.senderId,
      });

    } catch (error) {
      logger.error('Failed to process dispute message added event', {
        disputeId: messageData.disputeId,
        error: error.message,
      });
    }
  }
}

export default new DisputeEventConsumer();