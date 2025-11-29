// src/providers/sms/twilioService.js
import twilio from 'twilio';
import { logger } from '@ev-coownership/shared';

class TwilioService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.initialize();
  }

  initialize() {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (accountSid && authToken) {
        this.client = twilio(accountSid, authToken);
        this.isInitialized = true;
        logger.info('Twilio service initialized successfully');
      } else {
        logger.warn('Twilio credentials not provided, SMS service disabled');
      }
    } catch (error) {
      logger.error('Failed to initialize Twilio service', { error: error.message });
      this.isInitialized = false;
    }
  }

  async sendSMS(phoneNumber, message) {
    if (!this.isInitialized || !this.client) {
      throw new Error('Twilio service not initialized');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      logger.info('SMS sent successfully', {
        to: phoneNumber,
        messageId: result.sid,
      });

      return {
        success: true,
        messageId: result.sid,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to send SMS', {
        to: phoneNumber,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async healthCheck() {
    return {
      healthy: this.isInitialized,
      provider: 'twilio',
    };
  }
}

export default new TwilioService();