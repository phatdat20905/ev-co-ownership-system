import db from '../models/index.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
  async register(userData) {
    const transaction = await db.sequelize.transaction();

    try {
      // Check if user already exists
      const existingUser = await db.User.findOne({
        where: { email: userData.email },
        transaction
      });

      if (existingUser) {
        throw {
          code: 'USER_ALREADY_EXISTS',
          message: 'User with this email already exists',
          statusCode: 409
        };
      }

      // Create user
      const user = await db.User.create({
        email: userData.email,
        phone: userData.phone,
        passwordHash: userData.password,
        role: userData.role || 'co_owner'
      }, { transaction });

      // Generate tokens
      const accessToken = generateAccessToken({ 
        userId: user.id, 
        email: user.email,
        role: user.role 
      });

      const refreshToken = generateRefreshToken({ 
        userId: user.id 
      });

      // Store refresh token
      await db.RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }, { transaction });

      await transaction.commit();

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await db.User.findOne({ 
        where: { email } 
      });

      if (!user) {
        throw {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          statusCode: 401
        };
      }

      if (!user.isActive) {
        throw {
          code: 'ACCOUNT_DISABLED',
          message: 'Account is disabled',
          statusCode: 401
        };
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          statusCode: 401
        };
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate tokens
      const accessToken = generateAccessToken({ 
        userId: user.id, 
        email: user.email,
        role: user.role 
      });

      const refreshToken = generateRefreshToken({ 
        userId: user.id 
      });

      // Store refresh token
      await db.RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        user: user.toJSON(),
        accessToken,
        refreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find the refresh token in database
      const storedToken = await db.RefreshToken.findOne({
        where: { 
          token: refreshToken,
          isRevoked: false 
        },
        include: [{
          model: db.User,
          as: 'user',
          attributes: { exclude: ['passwordHash'] }
        }]
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Invalid or expired refresh token',
          statusCode: 401
        };
      }

      // Revoke the old refresh token
      await storedToken.update({ isRevoked: true });

      // Generate new tokens
      const user = storedToken.user;
      const newAccessToken = generateAccessToken({ 
        userId: user.id, 
        email: user.email,
        role: user.role 
      });

      const newRefreshToken = generateRefreshToken({ 
        userId: user.id 
      });

      // Store new refresh token
      await db.RefreshToken.create({
        userId: user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(refreshToken) {
    try {
      const storedToken = await db.RefreshToken.findOne({
        where: { token: refreshToken }
      });

      if (storedToken) {
        await storedToken.update({ isRevoked: true });
      }

      return { message: 'Logged out successfully' };
    } catch (error) {
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const user = await db.User.findOne({ where: { email } });

      if (!user) {
        // Don't reveal if user exists or not
        return { message: 'If the email exists, a reset link has been sent' };
      }

      // Generate reset token
      const resetToken = uuidv4();
      const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

      // Store reset token
      await db.PasswordReset.create({
        userId: user.id,
        resetToken,
        expiresAt
      });

      // In a real application, you would send an email here
      logger.info('Password reset token generated', { 
        userId: user.id, 
        resetToken,
        expiresAt 
      });

      return { 
        message: 'If the email exists, a reset link has been sent',
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined 
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    const transaction = await db.sequelize.transaction();

    try {
      const resetRecord = await db.PasswordReset.findOne({
        where: { 
          resetToken: token,
          used: false,
          expiresAt: { [db.Sequelize.Op.gt]: new Date() }
        },
        transaction
      });

      if (!resetRecord) {
        throw {
          code: 'INVALID_RESET_TOKEN',
          message: 'Invalid or expired reset token',
          statusCode: 400
        };
      }

      // Update user password
      const user = await db.User.findByPk(resetRecord.userId, { transaction });
      await user.update({ passwordHash: newPassword }, { transaction });

      // Mark reset token as used
      await resetRecord.update({ used: true }, { transaction });

      // Revoke all refresh tokens for this user
      await db.RefreshToken.update(
        { isRevoked: true },
        { 
          where: { userId: user.id },
          transaction 
        }
      );

      await transaction.commit();

      logger.info('Password reset successfully', { userId: user.id });

      return { message: 'Password reset successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async verifyEmail(token) {
    const transaction = await db.sequelize.transaction();

    try {
      // Trong thực tế, bạn sẽ có bảng email_verifications
      // Ở đây tôi giả lập logic verify email
      const user = await db.User.findOne({
        where: { 
          isVerified: false 
        },
        transaction
      });

      if (!user) {
        throw {
          code: 'INVALID_VERIFICATION_TOKEN',
          message: 'Invalid or expired verification token',
          statusCode: 400
        };
      }

      // Verify user
      await user.update({ isVerified: true }, { transaction });

      await transaction.commit();

      logger.info('Email verified successfully', { userId: user.id });

      return { message: 'Email verified successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async sendVerificationEmail(userId) {
    try {
      const user = await db.User.findByPk(userId);
      
      if (!user) {
        throw {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
          statusCode: 404
        };
      }

      if (user.isVerified) {
        throw {
          code: 'EMAIL_ALREADY_VERIFIED',
          message: 'Email already verified',
          statusCode: 400
        };
      }

      // Generate verification token
      const verificationToken = uuidv4();
      
      // In production, store this token in database
      logger.info('Verification token generated', { 
        userId, 
        verificationToken 
      });

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken);

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();