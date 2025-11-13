import db from '../models/index.js';
import { 
  logger, 
  AppError,
  CryptoUtils 
} from '@ev-coownership/shared';
import emailService from './emailService.js';
import eventService from './eventService.js';

export class AuthService {
  async register(userData) {
    const transaction = await db.sequelize.transaction();

    try {
      const existingUser = await db.User.findOne({
        where: { email: userData.email },
        transaction
      });

      if (existingUser) {
        throw new AppError('User with this email already exists', 409, 'USER_ALREADY_EXISTS');
      }

      const user = await db.User.create({
        email: userData.email,
        phone: userData.phone,
        passwordHash: userData.password,
        role: userData.role || 'co_owner'
      }, { transaction });

      const verificationToken = CryptoUtils.generateUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await db.EmailVerification.create({
        userId: user.id,
        verificationToken,
        expiresAt
      }, { transaction });

      const accessToken = CryptoUtils.generateAccessToken({ 
        userId: user.id, 
        email: user.email,
        role: user.role 
      });

      const refreshToken = CryptoUtils.generateRefreshToken({ userId: user.id });

      await db.RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }, { transaction });

      await transaction.commit();

      // Send verification email non-blocking
      emailService.sendVerificationEmail(user.email, verificationToken)
        .catch(error => logger.error('Failed to send verification email', { error: error.message, userId: user.id }));

      // Publish safe payload with phone
      eventService.publishUserRegistered({
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
        registeredAt: user.createdAt
      }).catch(error => logger.error('Failed to publish user registered event', { error: error.message, userId: user.id }));

      logger.info('User registered successfully', { userId: user.id, email: user.email, role: user.role });

      return { user: user.toJSON(), accessToken, refreshToken };
    } catch (error) {
      await transaction.rollback();
      logger.error('User registration failed', { error: error.message, email: userData.email });
      throw error;
    }
  }

  async login(identifier, password) {
    try {
      // Support both email and phone login
      const isEmail = identifier.includes('@');
      const whereClause = isEmail 
        ? { email: identifier }
        : { phone: identifier };

      const user = await db.User.findOne({ where: whereClause });

      if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      if (!user.isActive) throw new AppError('Account is disabled', 401, 'ACCOUNT_DISABLED');

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

      await user.update({ lastLoginAt: new Date() });

      const accessToken = CryptoUtils.generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const refreshToken = CryptoUtils.generateRefreshToken({ userId: user.id });

      await db.RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      eventService.publishUserLoggedIn({
        userId: user.id,
        email: user.email,
        role: user.role,
        loginTime: new Date().toISOString()
      }).catch(error => logger.error('Failed to publish user logged in event', { error: error.message, userId: user.id }));

      logger.info('User logged in successfully', { userId: user.id, identifier: isEmail ? 'email' : 'phone' });

      return { user: user.toJSON(), accessToken, refreshToken };
    } catch (error) {
      logger.error('User login failed', { error: error.message, identifier });
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const storedToken = await db.RefreshToken.findOne({
        where: { token: refreshToken, isRevoked: false },
        include: [{ model: db.User, as: 'user', attributes: { exclude: ['passwordHash'] } }]
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      await storedToken.update({ isRevoked: true });

      const user = storedToken.user;
      const newAccessToken = CryptoUtils.generateAccessToken({ userId: user.id, email: user.email, role: user.role });
      const newRefreshToken = CryptoUtils.generateRefreshToken({ userId: user.id });

      await db.RefreshToken.create({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      logger.info('Token refreshed successfully', { userId: user.id });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw error;
    }
  }

  async logout(refreshToken) {
    try {
      const storedToken = await db.RefreshToken.findOne({ where: { token: refreshToken } });
      if (storedToken) await storedToken.update({ isRevoked: true });

      logger.info('User logged out successfully', { tokenExists: !!storedToken });
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout failed', { error: error.message });
      throw error;
    }
  }

  async forgotPassword(email) {
    const transaction = await db.sequelize.transaction();
    try {
      const user = await db.User.findOne({ where: { email }, transaction });
      if (!user) return { message: 'If the email exists, a reset link has been sent' };

      const resetToken = CryptoUtils.generateUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.PasswordReset.update({ used: true }, { where: { userId: user.id, used: false }, transaction });
      await db.PasswordReset.create({ userId: user.id, resetToken, expiresAt }, { transaction });

      await transaction.commit();

      await emailService.sendPasswordResetEmail(user.email, resetToken);

      eventService.publishPasswordResetRequested({ userId: user.id, email: user.email })
        .catch(err => logger.error('Failed to publish password reset requested event', { error: err.message, userId: user.id }));

      logger.info('Password reset email sent', { userId: user.id, email: user.email });
      return { message: 'If the email exists, a reset link has been sent' };
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to process forgot password', { error: error.message, email });
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    const transaction = await db.sequelize.transaction();
    try {
      const resetRecord = await db.PasswordReset.findOne({
        where: { resetToken: token, used: false, expiresAt: { [db.Sequelize.Op.gt]: new Date() } },
        transaction
      });

      if (!resetRecord) throw new AppError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');

      const user = await db.User.findByPk(resetRecord.userId, { transaction });
      await user.update({ passwordHash: newPassword }, { transaction });
      await resetRecord.update({ used: true }, { transaction });
      await db.RefreshToken.update({ isRevoked: true }, { where: { userId: user.id }, transaction });

      await transaction.commit();

      eventService.publishPasswordReset(user.id).catch(err => logger.error('Failed to publish password reset event', { error: err.message, userId: user.id }));

      logger.info('Password reset successfully', { userId: user.id });
      return { message: 'Password reset successfully' };
    } catch (error) {
      await transaction.rollback();
      logger.error('Password reset failed', { error: error.message });
      throw error;
    }
  }

  async verifyEmail(token) {
    const transaction = await db.sequelize.transaction();
    try {
      const verification = await db.EmailVerification.findOne({
        where: { verificationToken: token, used: false, expiresAt: { [db.Sequelize.Op.gt]: new Date() } },
        include: [{ model: db.User, as: 'user' }],
        transaction
      });

      if (!verification) throw new AppError('Invalid or expired verification token', 400, 'INVALID_VERIFICATION_TOKEN');

      await db.User.update({ isVerified: true }, { where: { id: verification.userId }, transaction });
      await verification.update({ used: true }, { transaction });
      await transaction.commit();

      eventService.publishUserVerified(verification.userId)
        .catch(err => logger.error('Failed to publish user verified event', { error: err.message, userId: verification.userId }));

      logger.info('Email verified successfully', { userId: verification.userId, verificationId: verification.id });
      
      // Return userId so frontend can create profile
      return { 
        message: 'Email verified successfully',
        userId: verification.userId,
        email: verification.user.email
      };
    } catch (error) {
      await transaction.rollback();
      logger.error('Email verification failed', { error: error.message });
      throw error;
    }
  }

  async sendVerificationEmail(userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const user = await db.User.findByPk(userId, { transaction });
      
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (user.isVerified) {
        throw new AppError('Email already verified', 400, 'EMAIL_ALREADY_VERIFIED');
      }

      // Invalidate previous verification tokens
      await db.EmailVerification.update(
        { used: true },
        { 
          where: { userId: user.id, used: false },
          transaction 
        }
      );

      // Generate new verification token
      const verificationToken = CryptoUtils.generateUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      // Store verification token
      await db.EmailVerification.create({
        userId: user.id,
        verificationToken,
        expiresAt
      }, { transaction });

      await transaction.commit();

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken);

      logger.info('Verification email sent successfully', { 
        userId 
      });

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to send verification email', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const user = await db.User.findByPk(userId, { transaction });
      
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Verify current password
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
      }

      // Update password
      await user.update({ passwordHash: newPassword }, { transaction });

      // Revoke all refresh tokens (logout from all devices)
      await db.RefreshToken.update(
        { isRevoked: true },
        { where: { userId: user.id }, transaction }
      );

      await transaction.commit();

      eventService.publishPasswordChanged(user.id)
        .catch(err => logger.error('Failed to publish password changed event', { 
          error: err.message, 
          userId: user.id 
        }));

      logger.info('Password changed successfully', { userId: user.id });

      return { message: 'Password changed successfully. Please login again.' };
    } catch (error) {
      await transaction.rollback();
      logger.error('Password change failed', { error: error.message, userId });
      throw error;
    }
  }
}

export default new AuthService();