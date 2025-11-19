// src/controllers/notificationController.js
import notificationService from '../services/notificationService.js';
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
}

export default new NotificationController();