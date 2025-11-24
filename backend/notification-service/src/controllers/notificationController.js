// src/controllers/notificationController.js
import notificationService from '../services/notificationService.js';
import fcmService from '../services/fcmService.js';
import db from '../models/index.js';
import { successResponse, logger, AppError } from '@ev-coownership/shared';
import { validateNotification } from '../utils/notificationValidator.js';

class NotificationController {
  async sendNotification(req, res, next) {
    try {
      const validatedData = validateNotification(req.body);
      
      const result = await notificationService.sendNotification(validatedData);

      logger.info('Notification sent successfully', {
        notificationId: result.notificationId,
        userId: validatedData.userId,
        channels: result.channels,
      });

      return successResponse(res, 'Notification sent successfully', result, 201);
    } catch (error) {
      logger.error('Failed to send notification', {
        error: error.message,
        userId: req.body?.userId,
      });
      next(error);
    }
  }

  async sendBulkNotification(req, res, next) {
    try {
      const { recipients, title, message, type, metadata } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        throw new AppError('Recipients array is required', 400, 'MISSING_REQUIRED_FIELDS');
      }

      if (!title || !message) {
        throw new AppError('Title and message are required', 400, 'MISSING_REQUIRED_FIELDS');
      }

      const results = await notificationService.sendBulkNotification({
        recipients,
        title,
        message,
        type: type || 'group_announcement',
        metadata: metadata || {},
        channels: ['in_app', 'push'] // Default channels for group notifications
      });

      logger.info('Bulk notifications sent', {
        recipientCount: recipients.length,
        sentCount: results.sent,
        failedCount: results.failed,
      });

      return successResponse(res, 'Notifications sent successfully', {
        sent: results.sent,
        failed: results.failed,
        total: recipients.length
      }, 201);
    } catch (error) {
      logger.error('Failed to send bulk notifications', {
        error: error.message,
        recipientCount: req.body?.recipients?.length,
      });
      next(error);
    }
  }

  async sendTemplateNotification(req, res, next) {
    try {
      const { templateName, userId, variables = {} } = req.body;

      if (!templateName || !userId) {
        throw new AppError('Template name and user ID are required', 400, 'MISSING_REQUIRED_FIELDS');
      }

      const result = await notificationService.sendTemplateNotification(
        templateName,
        userId,
        variables
      );

      logger.info('Template notification sent successfully', {
        templateName,
        userId,
        notificationId: result.notificationId,
      });

      return successResponse(res, 'Template notification sent successfully', result, 201);
    } catch (error) {
      logger.error('Failed to send template notification', {
        error: error.message,
        templateName: req.body?.templateName,
        userId: req.body?.userId,
      });
      next(error);
    }
  }

  async getUserNotifications(req, res, next) {
    try {
      const { userId } = req.params;
      const { page, limit, status, type } = req.query;

      const result = await notificationService.getUserNotifications(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        type,
      });

      logger.debug('User notifications retrieved', {
        userId,
        count: result.notifications.length,
      });

      return successResponse(res, 'Notifications retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get user notifications', {
        error: error.message,
        userId: req.params?.userId,
      });
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id; // From authentication middleware

      const notification = await notificationService.markAsRead(id, userId);

      logger.info('Notification marked as read', {
        notificationId: id,
        userId,
      });

      return successResponse(res, 'Notification marked as read', notification);
    } catch (error) {
      logger.error('Failed to mark notification as read', {
        error: error.message,
        notificationId: req.params?.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }

  async deleteNotification(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user?.id; // From authentication middleware

      const result = await notificationService.deleteNotification(id, userId);

      logger.info('Notification deleted', {
        notificationId: id,
        userId,
      });

      return successResponse(res, 'Notification deleted successfully', result);
    } catch (error) {
      logger.error('Failed to delete notification', {
        error: error.message,
        notificationId: req.params?.id,
        userId: req.user?.id,
      });
      next(error);
    }
  }

  async getNotificationStats(req, res, next) {
    try {
      const { userId } = req.params;

      // This would typically aggregate stats from the database
      const stats = {
        total: 100, // Example data
        unread: 15,
        read: 85,
        byType: {
          booking: 40,
          payment: 25,
          system: 20,
          other: 15,
        },
      };

      logger.debug('Notification stats retrieved', { userId });

      return successResponse(res, 'Notification stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get notification stats', {
        error: error.message,
        userId: req.params?.userId,
      });
      next(error);
    }
  }

  async getCurrentUserNotifications(req, res, next) {
    try {
      const userId = req.user?.id; // From authentication middleware
      const { page, limit, status, type } = req.query;

      const result = await notificationService.getUserNotifications(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        type,
      });

      logger.debug('Current user notifications retrieved', {
        userId,
        count: result.notifications.length,
      });

      return successResponse(res, 'Notifications retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get current user notifications', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      const userId = req.user?.id; // From authentication middleware

      const result = await notificationService.markAllAsRead(userId);

      logger.info('All notifications marked as read', {
        userId,
        count: result.count || 0,
      });

      return successResponse(res, 'All notifications marked as read', result);
    } catch (error) {
      logger.error('Failed to mark all notifications as read', {
        error: error.message,
        userId: req.user?.id,
      });
      next(error);
    }
  }

  // ========== FCM Token Management ==========

  /**
   * Register a device token for push notifications
   * POST /notifications/register-token
   */
  async registerToken(req, res, next) {
    try {
      const { userId, token, platform } = req.body;

      if (!userId || !token || !platform) {
        throw new AppError('userId, token, and platform are required', 400, 'MISSING_REQUIRED_FIELDS');
      }

      if (!['ios', 'android', 'web'].includes(platform)) {
        throw new AppError('Platform must be one of: ios, android, web', 400, 'INVALID_PLATFORM');
      }

      // Check if token already exists
      let deviceToken = await db.DeviceToken.findOne({
        where: { token }
      });

      if (deviceToken) {
        // Update existing token
        await deviceToken.update({
          userId,
          platform,
          isActive: true
        });

        logger.info('Device token updated', {
          userId,
          platform,
          tokenId: deviceToken.id
        });
      } else {
        // Create new token
        deviceToken = await db.DeviceToken.create({
          userId,
          token,
          platform,
          isActive: true
        });

        logger.info('Device token registered', {
          userId,
          platform,
          tokenId: deviceToken.id
        });
      }

      return successResponse(res, 'Device token registered successfully', {
        tokenId: deviceToken.id,
        platform: deviceToken.platform
      }, 201);
    } catch (error) {
      logger.error('Failed to register device token', {
        error: error.message,
        userId: req.body?.userId
      });
      next(error);
    }
  }

  /**
   * Remove a device token
   * DELETE /notifications/token/:token
   */
  async removeToken(req, res, next) {
    try {
      const { token } = req.params;

      const result = await db.DeviceToken.destroy({
        where: { token }
      });

      if (result === 0) {
        throw new AppError('Token not found', 404, 'TOKEN_NOT_FOUND');
      }

      logger.info('Device token removed', { token: token.substring(0, 20) + '...' });

      return successResponse(res, 'Device token removed successfully');
    } catch (error) {
      logger.error('Failed to remove device token', {
        error: error.message
      });
      next(error);
    }
  }

  /**
   * Get user's device tokens
   * GET /notifications/tokens/:userId
   */
  async getUserTokens(req, res, next) {
    try {
      const { userId } = req.params;

      const tokens = await db.DeviceToken.findAll({
        where: { userId, isActive: true },
        attributes: ['id', 'platform', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      logger.debug('User tokens retrieved', {
        userId,
        count: tokens.length
      });

      return successResponse(res, 'User tokens retrieved successfully', {
        tokens,
        count: tokens.length
      });
    } catch (error) {
      logger.error('Failed to get user tokens', {
        error: error.message,
        userId: req.params?.userId
      });
      next(error);
    }
  }

  /**
   * Send push notification to specific user(s)
   * POST /notifications/send
   */
  async sendPushNotification(req, res, next) {
    try {
      const { userId, userIds, title, body, data, imageUrl } = req.body;

      if (!title || !body) {
        throw new AppError('Title and body are required', 400, 'MISSING_REQUIRED_FIELDS');
      }

      const payload = {
        title,
        body,
        data: data || {},
        imageUrl
      };

      let result;

      if (userId) {
        // Send to single user
        result = await fcmService.sendToUser(userId, payload);
        logger.info('Push notification sent to user', { userId, result });
      } else if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        // Send to multiple users
        result = await fcmService.sendToUsers(userIds, payload);
        logger.info('Push notifications sent to multiple users', { 
          userCount: userIds.length, 
          result 
        });
      } else {
        throw new AppError('Either userId or userIds array is required', 400, 'MISSING_REQUIRED_FIELDS');
      }

      return successResponse(res, 'Push notification sent successfully', result, 201);
    } catch (error) {
      logger.error('Failed to send push notification', {
        error: error.message
      });
      next(error);
    }
  }

  /**
   * Send push notification to a topic
   * POST /notifications/topic/send
   */
  async sendTopicNotification(req, res, next) {
    try {
      const { topic, title, body, data, imageUrl } = req.body;

      if (!topic || !title || !body) {
        throw new AppError('Topic, title, and body are required', 400, 'MISSING_REQUIRED_FIELDS');
      }

      const payload = {
        title,
        body,
        data: data || {},
        imageUrl
      };

      const result = await fcmService.sendToTopic(topic, payload);

      logger.info('Push notification sent to topic', { topic, messageId: result });

      return successResponse(res, 'Topic notification sent successfully', {
        messageId: result,
        topic
      }, 201);
    } catch (error) {
      logger.error('Failed to send topic notification', {
        error: error.message,
        topic: req.body?.topic
      });
      next(error);
    }
  }

  /**
   * Subscribe user tokens to a topic
   * POST /notifications/topic/subscribe
   */
  async subscribeToTopic(req, res, next) {
    try {
      const { userId, topic } = req.body;

      if (!userId || !topic) {
        throw new AppError('userId and topic are required', 400, 'MISSING_REQUIRED_FIELDS');
      }

      // Get user's active tokens
      const deviceTokens = await db.DeviceToken.findAll({
        where: { userId, isActive: true },
        attributes: ['token']
      });

      if (deviceTokens.length === 0) {
        throw new AppError('No active tokens found for user', 404, 'NO_TOKENS_FOUND');
      }

      const tokens = deviceTokens.map(dt => dt.token);
      const result = await fcmService.subscribeToTopic(tokens, topic);

      logger.info('User subscribed to topic', {
        userId,
        topic,
        tokenCount: tokens.length,
        successCount: result.successCount
      });

      return successResponse(res, 'Subscribed to topic successfully', result);
    } catch (error) {
      logger.error('Failed to subscribe to topic', {
        error: error.message,
        userId: req.body?.userId,
        topic: req.body?.topic
      });
      next(error);
    }
  }

  /**
   * Unsubscribe user tokens from a topic
   * POST /notifications/topic/unsubscribe
   */
  async unsubscribeFromTopic(req, res, next) {
    try {
      const { userId, topic } = req.body;

      if (!userId || !topic) {
        throw new AppError('userId and topic are required', 400, 'MISSING_REQUIRED_FIELDS');
      }

      // Get user's active tokens
      const deviceTokens = await db.DeviceToken.findAll({
        where: { userId, isActive: true },
        attributes: ['token']
      });

      if (deviceTokens.length === 0) {
        throw new AppError('No active tokens found for user', 404, 'NO_TOKENS_FOUND');
      }

      const tokens = deviceTokens.map(dt => dt.token);
      const result = await fcmService.unsubscribeFromTopic(tokens, topic);

      logger.info('User unsubscribed from topic', {
        userId,
        topic,
        tokenCount: tokens.length,
        successCount: result.successCount
      });

      return successResponse(res, 'Unsubscribed from topic successfully', result);
    } catch (error) {
      logger.error('Failed to unsubscribe from topic', {
        error: error.message,
        userId: req.body?.userId,
        topic: req.body?.topic
      });
      next(error);
    }
  }
}

export default new NotificationController();