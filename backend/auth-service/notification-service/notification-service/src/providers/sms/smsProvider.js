// src/providers/sms/smsProvider.js
import twilioService from './twilioService.js';
import { logger } from '@ev-coownership/shared';

class SMSProvider {
  constructor() {
    this.name = 'sms';
  }

  async send(notification) {
    if (!twilioService.isInitialized) {
      logger.warn('SMS provider not available - Twilio not initialized');
      return {
        success: false,
        provider: this.name,
        error: 'SMS provider not available',
        timestamp: new Date(),
      };
    }

    const phoneNumber = notification.metadata?.phoneNumber;
    if (!phoneNumber) {
      return {
        success: false,
        provider: this.name,
        error: 'No phone number provided',
        timestamp: new Date(),
      };
    }

    try {
      const result = await twilioService.sendSMS(phoneNumber, notification.message);
      return {
        success: result.success,
        provider: this.name,
        messageId: result.messageId,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('SMS provider failed to send notification', {
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
    return await twilioService.healthCheck();
  }
}

export default new SMSProvider();