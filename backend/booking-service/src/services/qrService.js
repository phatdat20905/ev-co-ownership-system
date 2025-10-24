// booking-service/src/services/qrService.js
import { logger, AppError, redisClient } from '@ev-coownership/shared';
import crypto from 'crypto';
import QRCode from 'qrcode';

export class QRService {
  constructor() {
    this.secret = process.env.QR_CODE_SECRET || 'your_qr_secret_here';
    this.expiry = parseInt(process.env.QR_CODE_EXPIRY) || 30 * 60 * 1000; // 30 minutes
    this.algorithm = 'sha256';
  }

  async generateBookingQR(bookingId, userId, vehicleInfo = {}) {
    try {
      const qrData = {
        bookingId,
        userId,
        vehicleId: vehicleInfo.id,
        timestamp: Date.now(),
        action: 'check_in_out',
        type: 'booking'
      };

      // Generate digital signature
      const signature = this.generateSignature(qrData);
      
      const fullData = {
        ...qrData,
        signature,
        expiresAt: Date.now() + this.expiry,
        vehicleInfo: {
          name: vehicleInfo.vehicleName,
          licensePlate: vehicleInfo.licensePlate
        }
      };

      // Generate QR code image
      const qrCodeImage = await this.generateQRCodeImage(fullData);

      // Store in cache for validation
      const cacheKey = this.getCacheKey(bookingId, signature);
      await redisClient.set(cacheKey, JSON.stringify(fullData), this.expiry / 1000);

      logger.info('QR code generated successfully', {
        bookingId,
        userId,
        signature: signature.substring(0, 8) + '...' // Log partial signature for security
      });

      return {
        qrCode: qrCodeImage,
        data: fullData,
        expiresAt: fullData.expiresAt
      };
    } catch (error) {
      logger.error('Failed to generate QR code', {
        error: error.message,
        bookingId,
        userId
      });
      throw new AppError('Failed to generate QR code', 500, 'QR_GENERATION_FAILED');
    }
  }

  async generateQRCodeImage(data) {
    try {
      const dataString = JSON.stringify(data);
      const qrCode = await QRCode.toDataURL(dataString, {
        width: 300,
        height: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return qrCode;
    } catch (error) {
      logger.error('Failed to generate QR code image', {
        error: error.message
      });
      throw new AppError('Failed to generate QR code image', 500, 'QR_IMAGE_GENERATION_FAILED');
    }
  }

  async validateQR(qrCodeData, secret = null) {
    try {
      let qrData;
      
      // Parse QR code data
      try {
        qrData = typeof qrCodeData === 'string' ? 
          JSON.parse(qrCodeData) : qrCodeData;
      } catch (error) {
        return {
          valid: false,
          error: 'Invalid QR code format',
          code: 'INVALID_FORMAT'
        };
      }

      // Check required fields
      if (!qrData.bookingId || !qrData.signature || !qrData.timestamp) {
        return {
          valid: false,
          error: 'Missing required QR code data',
          code: 'MISSING_DATA'
        };
      }

      // Check expiration
      if (Date.now() > qrData.expiresAt) {
        return {
          valid: false,
          error: 'QR code has expired',
          code: 'EXPIRED'
        };
      }

      // Verify signature
      const expectedSignature = this.generateSignature(qrData);
      if (qrData.signature !== expectedSignature) {
        return {
          valid: false,
          error: 'Invalid QR code signature',
          code: 'INVALID_SIGNATURE'
        };
      }

      // Verify secret if provided
      if (secret && secret !== this.secret) {
        return {
          valid: false,
          error: 'Invalid secret',
          code: 'INVALID_SECRET'
        };
      }

      // Check cache for one-time use
      const cacheKey = this.getCacheKey(qrData.bookingId, qrData.signature);
      const cached = await redisClient.get(cacheKey);
      
      if (!cached) {
        return {
          valid: false,
          error: 'QR code not found or already used',
          code: 'NOT_FOUND_OR_USED'
        };
      }

      // Parse cached data
      let cachedData;
      try {
        cachedData = JSON.parse(cached);
      } catch (error) {
        return {
          valid: false,
          error: 'Invalid cached QR code data',
          code: 'INVALID_CACHED_DATA'
        };
      }

      // Remove from cache after successful validation (one-time use)
      await redisClient.del(cacheKey);

      logger.info('QR code validated successfully', {
        bookingId: qrData.bookingId,
        userId: qrData.userId,
        signature: qrData.signature.substring(0, 8) + '...'
      });

      return {
        valid: true,
        data: cachedData,
        bookingId: qrData.bookingId,
        userId: qrData.userId,
        vehicleId: qrData.vehicleId
      };
    } catch (error) {
      logger.error('QR code validation failed', {
        error: error.message,
        qrCodeData: typeof qrCodeData === 'string' ? 
          qrCodeData.substring(0, 100) + '...' : 'object'
      });
      
      return {
        valid: false,
        error: 'QR code validation failed',
        code: 'VALIDATION_FAILED'
      };
    }
  }

  async validateQRCodeString(qrCodeString, secret = null) {
    try {
      // Decode base64 if needed
      let decodedData;
      try {
        decodedData = Buffer.from(qrCodeString, 'base64').toString();
      } catch (error) {
        return {
          valid: false,
          error: 'Invalid QR code encoding',
          code: 'INVALID_ENCODING'
        };
      }

      // Parse JSON
      let qrData;
      try {
        qrData = JSON.parse(decodedData);
      } catch (error) {
        return {
          valid: false,
          error: 'Invalid QR code data format',
          code: 'INVALID_FORMAT'
        };
      }

      return await this.validateQR(qrData, secret);
    } catch (error) {
      logger.error('QR code string validation failed', {
        error: error.message
      });
      
      return {
        valid: false,
        error: 'QR code validation failed',
        code: 'VALIDATION_FAILED'
      };
    }
  }

  async generateAdminQR(adminUserId, action, data = {}) {
    try {
      const qrData = {
        adminUserId,
        action,
        timestamp: Date.now(),
        type: 'admin',
        data
      };

      const signature = this.generateSignature(qrData);
      
      const fullData = {
        ...qrData,
        signature,
        expiresAt: Date.now() + (10 * 60 * 1000) // 10 minutes for admin QR
      };

      const qrCodeImage = await this.generateQRCodeImage(fullData);

      // Store in cache
      const cacheKey = `admin_qr:${adminUserId}:${signature}`;
      await redisClient.set(cacheKey, JSON.stringify(fullData), 600); // 10 minutes

      logger.info('Admin QR code generated', {
        adminUserId,
        action,
        signature: signature.substring(0, 8) + '...'
      });

      return {
        qrCode: qrCodeImage,
        data: fullData,
        expiresAt: fullData.expiresAt
      };
    } catch (error) {
      logger.error('Failed to generate admin QR code', {
        error: error.message,
        adminUserId,
        action
      });
      throw new AppError('Failed to generate admin QR code', 500, 'ADMIN_QR_GENERATION_FAILED');
    }
  }

  async validateAdminQR(qrCodeData, requiredPermissions = []) {
    try {
      const validationResult = await this.validateQR(qrCodeData);
      
      if (!validationResult.valid) {
        return validationResult;
      }

      const { data } = validationResult;

      // Check if it's an admin QR code
      if (data.type !== 'admin') {
        return {
          valid: false,
          error: 'Not an admin QR code',
          code: 'NOT_ADMIN_QR'
        };
      }

      // Verify admin permissions (this would integrate with Auth Service)
      // For now, we'll assume the QR code is valid for admin actions
      
      logger.info('Admin QR code validated', {
        adminUserId: data.adminUserId,
        action: data.action
      });

      return {
        valid: true,
        isAdmin: true,
        adminUserId: data.adminUserId,
        action: data.action,
        data: data.data
      };
    } catch (error) {
      logger.error('Admin QR code validation failed', {
        error: error.message
      });
      
      return {
        valid: false,
        error: 'Admin QR code validation failed',
        code: 'ADMIN_VALIDATION_FAILED'
      };
    }
  }

  async revokeQRCode(bookingId, signature) {
    try {
      const cacheKey = this.getCacheKey(bookingId, signature);
      await redisClient.del(cacheKey);
      
      logger.info('QR code revoked', {
        bookingId,
        signature: signature.substring(0, 8) + '...'
      });

      return { success: true, message: 'QR code revoked successfully' };
    } catch (error) {
      logger.error('Failed to revoke QR code', {
        error: error.message,
        bookingId
      });
      throw new AppError('Failed to revoke QR code', 500, 'QR_REVOCATION_FAILED');
    }
  }

  async getQRCodeStatus(bookingId, signature) {
    try {
      const cacheKey = this.getCacheKey(bookingId, signature);
      const cached = await redisClient.get(cacheKey);

      if (!cached) {
        return {
          exists: false,
          status: 'not_found_or_expired'
        };
      }

      const qrData = JSON.parse(cached);
      const now = Date.now();

      return {
        exists: true,
        status: now > qrData.expiresAt ? 'expired' : 'active',
        expiresAt: qrData.expiresAt,
        timeRemaining: Math.max(0, qrData.expiresAt - now)
      };
    } catch (error) {
      logger.error('Failed to get QR code status', {
        error: error.message,
        bookingId
      });
      throw new AppError('Failed to get QR code status', 500, 'QR_STATUS_CHECK_FAILED');
    }
  }

  // Utility methods
  generateSignature(data) {
    const { signature, ...dataToSign } = data;
    const message = JSON.stringify(dataToSign, Object.keys(dataToSign).sort());
    return crypto
      .createHmac(this.algorithm, this.secret)
      .update(message)
      .digest('hex');
  }

  getCacheKey(bookingId, signature) {
    return `qr_code:${bookingId}:${signature}`;
  }

  async cleanupExpiredQRCodes() {
    try {
      // This would typically be run as a background job
      // For now, we rely on Redis TTL to automatically expire QR codes
      logger.debug('QR code cleanup completed (handled by Redis TTL)');
    } catch (error) {
      logger.error('Failed to cleanup expired QR codes', {
        error: error.message
      });
    }
  }

  // Security methods
  rotateSecret() {
    // In production, this should be called periodically
    this.secret = crypto.randomBytes(32).toString('hex');
    logger.info('QR code secret rotated');
  }

  validateSecretStrength(secret) {
    if (!secret || secret.length < 32) {
      return false;
    }
    
    // Check for sufficient entropy
    const entropy = this.calculateEntropy(secret);
    return entropy >= 3.5; // Minimum entropy threshold
  }

  calculateEntropy(str) {
    const charCount = {};
    for (const char of str) {
      charCount[char] = (charCount[char] || 0) + 1;
    }

    let entropy = 0;
    const length = str.length;
    
    for (const count of Object.values(charCount)) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }
}

export default new QRService();