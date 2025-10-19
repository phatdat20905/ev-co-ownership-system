import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { User, RefreshToken, PasswordReset } from '../models/index.js';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js';

class AuthService {
  async register(userData) {
    const { email, phone, password, role = 'co_owner' } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    // Create user
    const user = await User.create({
      email,
      phone,
      passwordHash: password,
      role
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Send verification email
    await sendVerificationEmail(user);

    logger.info(`New user registered: ${user.email}`);

    return {
      user: user.toJSON(),
      ...tokens
    };
  }

  async login(email, password) {
    const user = await User.findOne({
      where: { email, isActive: true }
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    logger.info(`User logged in: ${user.email}`);

    return {
      user: user.toJSON(),
      ...tokens
    };
  }

  async generateTokens(user) {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        tokenId: uuidv4()
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Store refresh token in database
    await RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      
      // Check if token exists and is not revoked
      const refreshToken = await RefreshToken.findOne({
        where: {
          token,
          isRevoked: false,
          expiresAt: { [Op.gt]: new Date() }
        },
        include: [{ model: User, as: 'user' }]
      });

      if (!refreshToken) {
        throw new Error('INVALID_REFRESH_TOKEN');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(refreshToken.user);

      // Revoke old refresh token
      await refreshToken.update({ isRevoked: true });

      return tokens;
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }
  }

  async logout(refreshToken) {
    // Revoke the refresh token
    await RefreshToken.update(
      { isRevoked: true },
      { where: { token: refreshToken } }
    );

    // Also remove from Redis if you're storing sessions there
    await redisClient.del(`session:${userId}`);

    return true;
  }

  async forgotPassword(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal that user doesn't exist
      return true;
    }

    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Store reset token
    await PasswordReset.create({
      userId: user.id,
      resetToken,
      expiresAt
    });

    // Send email
    await sendPasswordResetEmail(user, resetToken);

    logger.info(`Password reset requested for: ${email}`);

    return true;
  }

  async resetPassword(resetToken, newPassword) {
    const passwordReset = await PasswordReset.findOne({
      where: {
        resetToken,
        used: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [{ model: User, as: 'user' }]
    });

    if (!passwordReset) {
      throw new Error('INVALID_RESET_TOKEN');
    }

    // Update user password
    await passwordReset.user.update({
      passwordHash: newPassword
    });

    // Mark token as used
    await passwordReset.update({ used: true });

    // Revoke all refresh tokens for security
    await RefreshToken.update(
      { isRevoked: true },
      { where: { userId: passwordReset.userId } }
    );

    logger.info(`Password reset successful for: ${passwordReset.user.email}`);

    return true;
  }

  async verifyEmail(token) {
    // Implementation for email verification
    // This would typically decode a JWT token and mark user as verified
    throw new Error('Not implemented');
  }
}

export default new AuthService();