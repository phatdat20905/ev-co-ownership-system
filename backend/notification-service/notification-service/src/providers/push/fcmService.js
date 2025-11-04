// src/providers/push/fcmService.js
import admin from 'firebase-admin';
import { logger } from '@ev-coownership/shared';

class FCMService {
  constructor() {
    this.isInitialized = false;
    this.initialize();
  }

  initialize() {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      }
      this.isInitialized = true;
      logger.info('FCM service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize FCM service', { error: error.message });
      this.isInitialized = false;
    }
  }

  async sendPush(deviceToken, notification) {
    if (!this.isInitialized) {
      throw new Error('FCM service not initialized');
    }

    try {
      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: {
          type: notification.type,
          notificationId: notification.id,
          ...notification.metadata,
        },
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const result = await admin.messaging().send(message);
      logger.info('FCM push notification sent successfully', {
        deviceToken: deviceToken.substring(0, 10) + '...',
        messageId: result,
      });

      return {
        success: true,
        messageId: result,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('FCM push notification failed', {
        deviceToken: deviceToken.substring(0, 10) + '...',
        error: error.message,
      });

      // Mark token as invalid if error indicates so
      if (this.isTokenInvalid(error)) {
        return {
          success: false,
          error: error.message,
          tokenInvalid: true,
          timestamp: new Date(),
        };
      }

      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  isTokenInvalid(error) {
    const invalidTokenErrors = [
      'registration-token-not-registered',
      'invalid-registration-token',
      'mismatched-credential',
    ];
    
    return invalidTokenErrors.some(invalidError => 
      error.message?.includes(invalidError)
    );
  }

  async healthCheck() {
    return {
      healthy: this.isInitialized,
      provider: 'fcm',
    };
  }
}

export default new FCMService();