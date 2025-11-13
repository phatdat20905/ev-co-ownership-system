import db from '../models/index.js';
import { logger } from '@ev-coownership/shared';

class AuthEventHandler {
  /**
   * Handle UserRegistered event from Auth Service
   * Auto-create empty UserProfile for new users
   */
  async handleUserRegistered(eventData) {
    try {
      const { userId, email, phone } = eventData;

      logger.info('📨 Received UserRegistered event', { userId, email });

      // Check if profile already exists
      const existingProfile = await db.UserProfile.findOne({ where: { userId } });
      
      if (existingProfile) {
        logger.warn('UserProfile already exists', { userId });
        return;
      }

      // Create empty profile
      const profile = await db.UserProfile.create({
        userId,
        email,
        phone,
        fullName: '',
        dateOfBirth: null,
        gender: null,
        address: null,
        avatarUrl: null,
        isProfileComplete: false
      });

      logger.info('✅ UserProfile auto-created', { userId, profileId: profile.id });
    } catch (error) {
      logger.error('❌ Failed to handle UserRegistered event', {
        error: error.message,
        stack: error.stack,
        eventData
      });
    }
  }

  /**
   * Handle KYCVerified event from Auth Service
   * Update user profile verification status
   */
  async handleKYCVerified(eventData) {
    try {
      const { userId, verificationStatus } = eventData;

      logger.info('📨 Received KYCVerified event', { userId, verificationStatus });

      const profile = await db.UserProfile.findOne({ where: { userId } });
      
      if (!profile) {
        logger.warn('UserProfile not found for KYC update', { userId });
        return;
      }

      // Update verification status (if you have such field)
      // await profile.update({ isKYCVerified: verificationStatus === 'approved' });

      logger.info('✅ UserProfile KYC status updated', { userId, verificationStatus });
    } catch (error) {
      logger.error('❌ Failed to handle KYCVerified event', {
        error: error.message,
        userId: eventData.userId
      });
    }
  }
}

export default new AuthEventHandler();
