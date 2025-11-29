// src/events/publishers/notificationEventPublisher.js
import { createEventBus, eventTypes, logger } from '@ev-coownership/shared';

class NotificationEventPublisher {
  constructor() {
    this.eventBus = createEventBus('notification-service');
    this.isConnected = false;
  }

  async initialize() {
    try {
      await this.eventBus.rabbitMQ.connect();
      this.isConnected = true;
      logger.info('Notification event publisher initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize notification event publisher', { error: error.message });
      this.isConnected = false;
    }
  }

  async publishNotificationSent(notificationData) {
    if (!this.isConnected) return;

    try {
      await this.eventBus.publish(eventTypes.NOTIFICATION_SENT, {
        notificationId: notificationData.notificationId,
        userId: notificationData.userId,
        type: notificationData.type,
        channels: notificationData.channels,
        status: notificationData.status,
        sentAt: new Date().toISOString(),
      });

      logger.debug('Notification sent event published', {
        notificationId: notificationData.notificationId,
      });
    } catch (error) {
      logger.error('Failed to publish notification sent event', { error: error.message });
    }
  }

  async publishNotificationFailed(notificationData) {
    if (!this.isConnected) return;

    try {
      await this.eventBus.publish(eventTypes.NOTIFICATION_FAILED, {
        notificationId: notificationData.notificationId,
        userId: notificationData.userId,
        type: notificationData.type,
        channels: notificationData.channels,
        error: notificationData.error,
        failedAt: new Date().toISOString(),
      });

      logger.debug('Notification failed event published', {
        notificationId: notificationData.notificationId,
      });
    } catch (error) {
      logger.error('Failed to publish notification failed event', { error: error.message });
    }
  }

  async publishProviderStatus(providerData) {
    if (!this.isConnected) return;

    try {
      await this.eventBus.publish(eventTypes.NOTIFICATION_PROVIDER_STATUS, {
        provider: providerData.provider,
        status: providerData.status,
        timestamp: new Date().toISOString(),
      });

      logger.debug('Provider status event published', {
        provider: providerData.provider,
        status: providerData.status,
      });
    } catch (error) {
      logger.error('Failed to publish provider status event', { error: error.message });
    }
  }
}

export default new NotificationEventPublisher();