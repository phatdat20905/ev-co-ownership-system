import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from './errorClasses.js';
import logger from './logger.js';

export class CryptoUtils {
  static async hashPassword(password) {
    try {
      return await bcrypt.hash(password, 12);
    } catch (error) {
      logger.error('Password hashing failed', { error: error.message });
      throw new AppError('Password processing failed', 500, 'PASSWORD_HASH_ERROR');
    }
  }

  static async comparePassword(password, hashedPassword) {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Password comparison failed', { error: error.message });
      throw new AppError('Password verification failed', 500, 'PASSWORD_COMPARE_ERROR');
    }
  }

  static generateAccessToken(payload) {
    try {
      return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        issuer: 'ev-coownership-auth',
        audience: 'ev-coownership-app'
      });
    } catch (error) {
      logger.error('Access token generation failed', { error: error.message });
      throw new AppError('Token generation failed', 500, 'TOKEN_GENERATION_ERROR');
    }
  }

  static generateRefreshToken(payload) {
    try {
      return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'ev-coownership-auth',
        audience: 'ev-coownership-app'
      });
    } catch (error) {
      logger.error('Refresh token generation failed', { error: error.message });
      throw new AppError('Token generation failed', 500, 'TOKEN_GENERATION_ERROR');
    }
  }

  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Access token expired', 401, 'TOKEN_EXPIRED');
      }
      throw new AppError('Invalid access token', 401, 'INVALID_TOKEN');
    }
  }

  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
      }
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  static generateUUID() {
    return uuidv4();
  }

  static generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateNumericCode(length = 6) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }
}

export default CryptoUtils;