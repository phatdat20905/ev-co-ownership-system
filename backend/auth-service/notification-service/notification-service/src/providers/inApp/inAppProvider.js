// src/providers/inApp/inAppProvider.js
import socketService from './socketService.js';
import { logger } from '@ev-coownership/shared';

class InAppProvider {
  constructor() {
    this.name = 'in_app';
  }

  async send(notification) {
    try {
      const sent = socketService.sendToUser(notification.userId, 'notification', {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
        timestamp: new Date(),
      });

      return {
        success: sent,
        provider: this.name,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('In-app provider failed to send notification', {
        notificationId: notification.id,
        error: error.message,
      });
      
      return {
        success: false,
        provider: this.name,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async healthCheck() {
    return await socketService.healthCheck();
  }
}

export default new InAppProvider();