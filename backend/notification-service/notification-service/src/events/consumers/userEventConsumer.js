// src/events/consumers/userEventConsumer.js
import notificationService from '../../services/notificationService.js';
import { logger } from '@ev-coownership/shared';

class UserEventConsumer {
  async handleUserRegistered(userData) {
    try {
      logger.info('Processing user registered event', { userId: userData.userId });

      // Send welcome notification
      await notificationService.sendTemplateNotification('welcome_email', userData.userId, {
        user_name: userData.name || 'there',
        user_email: userData.email,
      });

      logger.info('Welcome notification sent for new user', { userId: userData.userId });
    } catch (error) {
      logger.error('Failed to process user registered event', {
        userId: userData.userId,
        error: error.message,
      });
    }
  }

  async handleUserVerified(userData) {
    try {
      logger.info('Processing user verified event', { userId: userData.userId });

      await notificationService.sendTemplateNotification('account_verified', userData.userId, {
        user_name: userData.name || 'there',
      });

      logger.info('Account verified notification sent', { userId: userData.userId });
    } catch (error) {
      logger.error('Failed to process user verified event', {
        userId: userData.userId,
        error: error.message,
      });
    }
  }

  async handleKYCApproved(kycData) {
    try {
      logger.info('Processing KYC approved event', { userId: kycData.userId });

      await notificationService.sendTemplateNotification('kyc_approved', kycData.userId, {
        user_name: kycData.name || 'there',
      });

      logger.info('KYC approved notification sent', { userId: kycData.userId });
    } catch (error) {
      logger.error('Failed to process KYC approved event', {
        userId: kycData.userId,
        error: error.message,
      });
    }
  }

  async handleKYCRejected(kycData) {
    try {
      logger.info('Processing KYC rejected event', { userId: kycData.userId });

      await notificationService.sendTemplateNotification('kyc_rejected', kycData.userId, {
        user_name: kycData.name || 'there',
        rejection_reason: kycData.rejectionReason || 'Please contact support for more information.',
      });

      logger.info('KYC rejected notification sent', { userId: kycData.userId });
    } catch (error) {
      logger.error('Failed to process KYC rejected event', {
        userId: kycData.userId,
        error: error.message,
      });
    }
  }
}

export default new UserEventConsumer();