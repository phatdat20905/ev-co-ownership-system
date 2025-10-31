// src/providers/push/pushProvider.js
import fcmService from './fcmService.js';
import { logger } from '@ev-coownership/shared';

class PushProvider {
  constructor() {
    this.name = 'push';
  }

  async send(notification, deviceTokens = []) {
    if (deviceTokens.length === 0) {
      logger.warn('No device tokens provided for push notification', {
        notificationId: notification.id,
      });
      return {
        success: false,
        provider: this.name,
        error: 'No device tokens available',
        timestamp: new Date(),
      };
    }

    const results = [];
    const invalidTokens = [];

    for (const token of deviceTokens) {
      try {
        const result = await fcmService.sendPush(token, notification);
        
        if (result.tokenInvalid) {
          invalidTokens.push(token);
        }
        
        results.push({
          token: token.substring(0, 10) + '...',
          ...result,
        });
      } catch (error) {
        logger.error('Failed to send push notification to token', {
          token: token.substring(0, 10) + '...',
          error: error.message,
        });
        
        results.push({
          token: token.substring(0, 10) + '...',
          success: false,
          error: error.message,
          timestamp: new Date(),
        });
      }
    }

    return {
      success: results.some(r => r.success),
      provider: this.name,
      results,
      invalidTokens,
      timestamp: new Date(),
    };
  }

  async healthCheck() {
    return await fcmService.healthCheck();
  }
}

export default new PushProvider();