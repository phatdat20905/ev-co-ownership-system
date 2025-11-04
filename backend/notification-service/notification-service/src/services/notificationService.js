// src/services/notificationService.js
import db from '../models/index.js';
import {
  emailProvider,
  pushProvider,
  smsProvider,
  inAppProvider,
} from '../providers/index.js';
import { logger, AppError } from '@ev-coownership/shared';
import { NOTIFICATION_STATUS, DEFAULT_PREFERENCES } from '../utils/constants.js';

class NotificationService {
  constructor() {
    this.providers = {
      email: emailProvider,
      push: pushProvider,
      sms: smsProvider,
      in_app: inAppProvider,
    };
  }

  async sendNotification(notificationData) {
    const transaction = await db.sequelize.transaction();

    try {
      // Create notification record
      const notification = await db.Notification.create({
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        channels: notificationData.channels,
        metadata: notificationData.metadata || {},
        status: NOTIFICATION_STATUS.PENDING,
      }, { transaction });

      // Get user preferences
      const userPreferences = await db.UserPreference.findOne({
        where: { userId: notificationData.userId },
        transaction,
      });

      const preferences = userPreferences?.preferences || DEFAULT_PREFERENCES;

      // Filter channels based on user preferences
      const enabledChannels = notificationData.channels.filter(
        channel => preferences[channel] !== false
      );

      if (enabledChannels.length === 0) {
        logger.warn('All notification channels disabled by user preferences', {
          userId: notificationData.userId,
          notificationId: notification.id,
        });

        await notification.update(
          { status: NOTIFICATION_STATUS.SENT },
          { transaction }
        );
        await transaction.commit();

        return {
          notificationId: notification.id,
          status: 'sent',
          reason: 'All channels disabled by user preferences',
          channels: [],
        };
      }

      // Update status to queued
      await notification.update(
        { status: NOTIFICATION_STATUS.QUEUED },
        { transaction }
      );

      await transaction.commit();

      // Send notifications through enabled channels
      const sendResults = await this.sendThroughChannels(
        notification,
        enabledChannels
      );

      // Update notification status based on results
      const anySuccess = sendResults.some(result => result.success);
      const finalStatus = anySuccess ? NOTIFICATION_STATUS.SENT : NOTIFICATION_STATUS.FAILED;

      await notification.update({
        status: finalStatus,
        sentAt: anySuccess ? new Date() : null,
      });

      logger.info('Notification processing completed', {
        notificationId: notification.id,
        status: finalStatus,
        channels: enabledChannels,
        results: sendResults,
      });

      return {
        notificationId: notification.id,
        status: finalStatus,
        channels: enabledChannels,
        results: sendResults,
      };

    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to send notification', {
        error: error.message,
        notificationData,
      });
      throw error;
    }
  }

  async sendThroughChannels(notification, channels) {
    const results = [];

    for (const channel of channels) {
      try {
        const provider = this.providers[channel];
        if (!provider) {
          logger.warn(`No provider found for channel: ${channel}`);
          continue;
        }

        let result;
        
        if (channel === 'push') {
          // Get device tokens for push notifications
          const deviceTokens = await this.getUserDeviceTokens(notification.userId);
          result = await provider.send(notification, deviceTokens);
          
          // Handle invalid tokens
          if (result.invalidTokens && result.invalidTokens.length > 0) {
            await this.deactivateInvalidTokens(result.invalidTokens);
          }
        } else {
          result = await provider.send(notification);
        }

        results.push({
          channel,
          ...result,
        });

        logger.debug(`Notification sent via ${channel}`, {
          notificationId: notification.id,
          success: result.success,
        });

      } catch (error) {
        logger.error(`Failed to send notification via ${channel}`, {
          notificationId: notification.id,
          error: error.message,
        });

        results.push({
          channel,
          success: false,
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  async getUserDeviceTokens(userId) {
    const deviceTokens = await db.DeviceToken.findAll({
      where: {
        userId,
        isActive: true,
      },
      attributes: ['token'],
    });

    return deviceTokens.map(dt => dt.token);
  }

  async deactivateInvalidTokens(tokens) {
    try {
      await db.DeviceToken.update(
        { isActive: false },
        {
          where: {
            token: tokens,
          },
        }
      );

      logger.info('Deactivated invalid device tokens', {
        count: tokens.length,
      });
    } catch (error) {
      logger.error('Failed to deactivate invalid tokens', {
        error: error.message,
      });
    }
  }

  async sendTemplateNotification(templateName, userId, variables = {}) {
    try {
      const template = await db.NotificationTemplate.findOne({
        where: { name: templateName, isActive: true },
      });

      if (!template) {
        throw new AppError(`Template not found: ${templateName}`, 404, 'TEMPLATE_NOT_FOUND');
      }

      // Parse template with variables
      const TemplateParser = (await import('../utils/templateParser.js')).default;
      const parsedBody = TemplateParser.parse(template.body, variables);
      const parsedSubject = template.subject ? 
        TemplateParser.parse(template.subject, variables) : undefined;

      const notificationData = {
        userId,
        type: template.type,
        title: parsedSubject || template.name,
        message: parsedBody,
        channels: template.channels,
        metadata: {
          ...variables,
          templateName: template.name,
        },
      };

      return await this.sendNotification(notificationData);

    } catch (error) {
      logger.error('Failed to send template notification', {
        templateName,
        userId,
        error: error.message,
      });
      throw error;
    }
  }

  async getUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      type,
    } = options;

    const where = { userId };
    
    if (status) where.status = status;
    if (type) where.type = type;

    const notifications = await db.Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return {
      notifications: notifications.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: notifications.count,
        totalPages: Math.ceil(notifications.count / parseInt(limit)),
      },
    };
  }

  async markAsRead(notificationId, userId) {
    const notification = await db.Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    await notification.update({
      status: NOTIFICATION_STATUS.READ,
      readAt: new Date(),
    });

    return notification;
  }

  async deleteNotification(notificationId, userId) {
    const notification = await db.Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    }

    await notification.destroy();
    
    return { success: true };
  }
}

export default new NotificationService();