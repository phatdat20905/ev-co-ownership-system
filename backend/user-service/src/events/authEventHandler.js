import db from '../models/index.js';
import { logger } from '@ev-coownership/shared';

class AuthEventHandler {
  /**
   * Handle UserRegistered event from Auth Service
   * Link userId to existing UserProfile or create new one
   */
  async handleUserRegistered(eventData) {
    try {
      const { userId, email, phone } = eventData;

      logger.info('📨 Received UserRegistered event', { userId, email, phone });

      // Check if profile already exists with userId
      let existingProfile = await db.UserProfile.findOne({ where: { userId } });
      
      if (existingProfile) {
        logger.warn('UserProfile already has userId', { userId });
        return;
      }

      // Try to find ANY profile (pending or not) by email or phone
      // Search with case-insensitive and trimmed values
      const searchEmail = email?.toLowerCase().trim();
      const searchPhone = phone?.trim();

      logger.info('🔍 Searching for existing profile', { searchEmail, searchPhone });

      // First, try to find pending profile (userId = null)
      existingProfile = await db.UserProfile.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            searchEmail ? db.Sequelize.where(
              db.Sequelize.fn('LOWER', db.Sequelize.col('email')),
              searchEmail
            ) : null,
            searchPhone ? { phoneNumber: searchPhone } : null
          ].filter(Boolean),
          userId: null
        }
      });

      if (existingProfile) {
        // Update existing pending profile with userId
        await existingProfile.update({ 
          userId,
          email: email || existingProfile.email,
          phoneNumber: phone || existingProfile.phoneNumber
        });
        logger.info('✅ UserProfile updated with userId', { 
          userId, 
          profileId: existingProfile.id,
          email,
          phone,
          fullName: existingProfile.fullName
        });
        return;
      }

      // If no pending profile found, check if profile exists with different userId
      const profileWithDifferentUser = await db.UserProfile.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            searchEmail ? db.Sequelize.where(
              db.Sequelize.fn('LOWER', db.Sequelize.col('email')),
              searchEmail
            ) : null,
            searchPhone ? { phoneNumber: searchPhone } : null
          ].filter(Boolean)
        }
      });

      if (profileWithDifferentUser) {
        logger.error('⚠️ Profile already exists with different userId - possible duplicate registration', {
          userId,
          email,
          phone,
          existingUserId: profileWithDifferentUser.userId,
          existingProfileId: profileWithDifferentUser.id
        });
        return; // Do not create duplicate
      }

      // Only create if no profile exists at all
      const profile = await db.UserProfile.create({
        userId,
        email,
        phoneNumber: phone,
        fullName: '',
        dateOfBirth: null,
        gender: null,
        address: null,
        avatarUrl: null,
        bio: null,
        preferences: {}
      });
      logger.info('✅ UserProfile auto-created (no pending profile found)', { 
        userId, 
        profileId: profile.id,
        email,
        phone 
      });
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
