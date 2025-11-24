// src/services/fcmService.js
import initializeFirebase from '../config/firebase.js';
import { logger } from '@ev-coownership/shared';
import db from '../models/index.js';

class FCMService {
  constructor() {
    this.admin = initializeFirebase();
    this.messaging = this.admin?.messaging();
  }

  /**
   * Send notification to a single device
   * @param {string} token - Device FCM token
   * @param {Object} payload - Notification payload
   * @returns {Promise<string>} Message ID
   */
  async sendToDevice(token, payload) {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized');
    }

    const message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl })
      },
      data: payload.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'ev_coownership'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png'
        }
      }
    };

    try {
      const response = await this.messaging.send(message);
      logger.info('FCM message sent successfully', { messageId: response, token: token.substring(0, 20) + '...' });
      return response;
    } catch (error) {
      logger.error('Failed to send FCM message', { error: error.message, token: token.substring(0, 20) + '...' });
      
      // If token is invalid, mark it as inactive
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        await this.deactivateToken(token);
      }
      
      throw error;
    }
  }

  /**
   * Send notification to multiple devices
   * @param {string[]} tokens - Array of device FCM tokens
   * @param {Object} payload - Notification payload
   * @returns {Promise<Object>} Batch response with success and failure counts
   */
  async sendToMultiple(tokens, payload) {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized');
    }

    if (!tokens || tokens.length === 0) {
      throw new Error('No tokens provided');
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl })
      },
      data: payload.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'ev_coownership'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png'
        }
      }
    };

    try {
      const response = await this.messaging.sendEachForMulticast({
        tokens,
        ...message
      });

      logger.info('FCM multicast sent', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: tokens.length
      });

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (errorCode === 'messaging/invalid-registration-token' ||
                errorCode === 'messaging/registration-token-not-registered') {
              failedTokens.push(tokens[idx]);
            }
          }
        });

        // Deactivate invalid tokens
        if (failedTokens.length > 0) {
          await this.deactivateTokens(failedTokens);
        }
      }

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      };
    } catch (error) {
      logger.error('Failed to send FCM multicast', { error: error.message });
      throw error;
    }
  }

  /**
   * Send notification to a topic
   * @param {string} topic - Topic name
   * @param {Object} payload - Notification payload
   * @returns {Promise<string>} Message ID
   */
  async sendToTopic(topic, payload) {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized');
    }

    const message = {
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl })
      },
      data: payload.data || {},
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'ev_coownership'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      webpush: {
        notification: {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png'
        }
      }
    };

    try {
      const response = await this.messaging.send(message);
      logger.info('FCM topic message sent successfully', { messageId: response, topic });
      return response;
    } catch (error) {
      logger.error('Failed to send FCM topic message', { error: error.message, topic });
      throw error;
    }
  }

  /**
   * Subscribe tokens to a topic
   * @param {string[]} tokens - Array of device tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} Subscription response
   */
  async subscribeToTopic(tokens, topic) {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized');
    }

    try {
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      logger.info('Tokens subscribed to topic', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        topic
      });
      return response;
    } catch (error) {
      logger.error('Failed to subscribe to topic', { error: error.message, topic });
      throw error;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   * @param {string[]} tokens - Array of device tokens
   * @param {string} topic - Topic name
   * @returns {Promise<Object>} Unsubscription response
   */
  async unsubscribeFromTopic(tokens, topic) {
    if (!this.messaging) {
      throw new Error('Firebase messaging not initialized');
    }

    try {
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      logger.info('Tokens unsubscribed from topic', {
        successCount: response.successCount,
        failureCount: response.failureCount,
        topic
      });
      return response;
    } catch (error) {
      logger.error('Failed to unsubscribe from topic', { error: error.message, topic });
      throw error;
    }
  }

  /**
   * Send notification to user by userId
   * @param {string} userId - User ID
   * @param {Object} payload - Notification payload
   * @returns {Promise<Object>} Send result
   */
  async sendToUser(userId, payload) {
    // Get all active tokens for user
    const tokens = await db.DeviceToken.findAll({
      where: {
        userId,
        isActive: true
      },
      attributes: ['token']
    });

    if (tokens.length === 0) {
      logger.warn('No active tokens found for user', { userId });
      return { successCount: 0, failureCount: 0, message: 'No active tokens' };
    }

    const tokenStrings = tokens.map(t => t.token);
    return await this.sendToMultiple(tokenStrings, payload);
  }

  /**
   * Send notification to multiple users
   * @param {string[]} userIds - Array of user IDs
   * @param {Object} payload - Notification payload
   * @returns {Promise<Object>} Send result
   */
  async sendToUsers(userIds, payload) {
    // Get all active tokens for users
    const tokens = await db.DeviceToken.findAll({
      where: {
        userId: userIds,
        isActive: true
      },
      attributes: ['token']
    });

    if (tokens.length === 0) {
      logger.warn('No active tokens found for users', { userCount: userIds.length });
      return { successCount: 0, failureCount: 0, message: 'No active tokens' };
    }

    const tokenStrings = tokens.map(t => t.token);
    return await this.sendToMultiple(tokenStrings, payload);
  }

  /**
   * Deactivate a single invalid token
   * @param {string} token - Device token to deactivate
   */
  async deactivateToken(token) {
    try {
      await db.DeviceToken.update(
        { isActive: false },
        { where: { token } }
      );
      logger.info('Token deactivated', { token: token.substring(0, 20) + '...' });
    } catch (error) {
      logger.error('Failed to deactivate token', { error: error.message });
    }
  }

  /**
   * Deactivate multiple invalid tokens
   * @param {string[]} tokens - Array of device tokens to deactivate
   */
  async deactivateTokens(tokens) {
    try {
      await db.DeviceToken.update(
        { isActive: false },
        { where: { token: tokens } }
      );
      logger.info('Tokens deactivated', { count: tokens.length });
    } catch (error) {
      logger.error('Failed to deactivate tokens', { error: error.message });
    }
  }
}

export default new FCMService();
