// src/utils/notificationHelper.js
import axios from 'axios';
import { logger } from '@ev-coownership/shared';
import { NOTIFICATION_TYPES, getNotificationTemplate, replaceTemplateVariables } from './notificationTypes.js';

const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service-dev:3008';

class NotificationHelper {
  /**
   * Send notification to user(s)
   * @param {Object} options - Notification options
   * @param {string|string[]} options.userId - Single user ID or array of user IDs
   * @param {string} options.type - Notification type from NOTIFICATION_TYPES
   * @param {Object} options.variables - Variables to replace in template
   * @param {Object} options.data - Additional data to include
   * @param {string[]} options.channels - Override default channels
   */
  async sendNotification(options) {
    try {
      const { userId, userIds, type, variables = {}, data = {}, channels } = options;
      
      // Get template for notification type
      const template = getNotificationTemplate(type);
      
      // Replace variables in template
      const title = replaceTemplateVariables(template.title, variables);
      const body = replaceTemplateVariables(template.body, variables);
      
      // Prepare request payload
      const payload = {
        title,
        body,
        data: {
          ...data,
          type,
          timestamp: new Date().toISOString()
        }
      };

      let response;

      if (userId) {
        // Send to single user
        payload.userId = userId;
        response = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/send`, payload);
      } else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        // Send to multiple users
        payload.userIds = userIds;
        response = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/send`, payload);
      } else {
        throw new Error('Either userId or userIds must be provided');
      }

      logger.info('Notification sent via helper', {
        type,
        userId: userId || `${userIds.length} users`,
        success: response.data.success
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to send notification via helper', {
        error: error.message,
        type: options.type,
        userId: options.userId
      });
      // Don't throw - notifications shouldn't break the main flow
      return { success: false, error: error.message };
    }
  }

  /**
   * Send booking notification
   */
  async sendBookingNotification(type, booking, userId) {
    return await this.sendNotification({
      userId,
      type,
      variables: {
        vehicleName: booking.vehicleName || 'xe',
        startTime: new Date(booking.startTime).toLocaleString('vi-VN'),
        endTime: new Date(booking.endTime).toLocaleString('vi-VN')
      },
      data: {
        bookingId: booking.id,
        vehicleId: booking.vehicleId,
        startTime: booking.startTime,
        endTime: booking.endTime
      }
    });
  }

  /**
   * Send cost notification to group members
   */
  async sendCostNotification(type, cost, userIds) {
    return await this.sendNotification({
      userIds,
      type,
      variables: {
        costType: cost.type,
        amount: new Intl.NumberFormat('vi-VN', { 
          style: 'currency', 
          currency: 'VND' 
        }).format(cost.amount),
        description: cost.description || ''
      },
      data: {
        costId: cost.id,
        groupId: cost.groupId,
        amount: cost.amount,
        type: cost.type
      }
    });
  }

  /**
   * Send contract notification
   */
  async sendContractNotification(type, contract, userId) {
    return await this.sendNotification({
      userId,
      type,
      variables: {
        contractName: contract.title || 'Hợp đồng',
        status: contract.status
      },
      data: {
        contractId: contract.id,
        groupId: contract.groupId,
        status: contract.status
      }
    });
  }

  /**
   * Send vote notification to group members
   */
  async sendVoteNotification(type, vote, userIds, result = null) {
    return await this.sendNotification({
      userIds,
      type,
      variables: {
        voteTitle: vote.title,
        result: result || ''
      },
      data: {
        voteId: vote.id,
        groupId: vote.groupId,
        endDate: vote.endDate
      }
    });
  }

  /**
   * Send AI fairness analysis notification
   */
  async sendAIFairnessNotification(analysis, userIds) {
    return await this.sendNotification({
      userIds,
      type: NOTIFICATION_TYPES.AI_FAIRNESS_ANALYSIS,
      variables: {
        fairnessScore: analysis.overallFairnessScore,
        fairnessLevel: analysis.fairnessLevel
      },
      data: {
        analysisId: analysis.id,
        groupId: analysis.groupId,
        fairnessScore: analysis.overallFairnessScore,
        fairnessLevel: analysis.fairnessLevel
      }
    });
  }

  /**
   * Send AI recommendation notification
   */
  async sendAIRecommendation(userId, recommendation) {
    return await this.sendNotification({
      userId,
      type: NOTIFICATION_TYPES.AI_RECOMMENDATION,
      variables: {
        recommendation: recommendation.message
      },
      data: {
        recommendationId: recommendation.id,
        priority: recommendation.priority,
        category: recommendation.category
      }
    });
  }

  /**
   * Send dispute notification
   */
  async sendDisputeNotification(type, dispute, userId) {
    return await this.sendNotification({
      userId,
      type,
      variables: {
        disputeId: dispute.id,
        status: dispute.status
      },
      data: {
        disputeId: dispute.id,
        groupId: dispute.groupId,
        status: dispute.status
      }
    });
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(type, payment, userId) {
    return await this.sendNotification({
      userId,
      type,
      variables: {
        amount: new Intl.NumberFormat('vi-VN', { 
          style: 'currency', 
          currency: 'VND' 
        }).format(payment.amount),
        description: payment.description || 'Chi phí'
      },
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        dueDate: payment.dueDate
      }
    });
  }

  /**
   * Send group invitation notification
   */
  async sendGroupInvitation(userId, group) {
    return await this.sendNotification({
      userId,
      type: NOTIFICATION_TYPES.GROUP_INVITATION,
      variables: {
        groupName: group.groupName || group.name
      },
      data: {
        groupId: group.id,
        inviterId: group.inviterId
      }
    });
  }

  /**
   * Send notification to topic (for group announcements)
   */
  async sendTopicNotification(topic, title, body, data = {}) {
    try {
      const response = await axios.post(`${NOTIFICATION_SERVICE_URL}/api/v1/notifications/topic/send`, {
        topic,
        title,
        body,
        data: {
          ...data,
          timestamp: new Date().toISOString()
        }
      });

      logger.info('Topic notification sent', { topic, title });
      return response.data;
    } catch (error) {
      logger.error('Failed to send topic notification', {
        error: error.message,
        topic
      });
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationHelper();
