import crypto from 'crypto';
import { logger, AppError } from '@ev-coownership/shared';

export class SignatureValidator {
  static validateDigitalSignature(signatureData, publicKey) {
    try {
      if (!signatureData?.signature || !signatureData?.timestamp) {
        throw new AppError('Invalid signature data', 400, 'INVALID_SIGNATURE_DATA');
      }

      // Basic validation - in production, use proper cryptographic validation
      const isValid = this.verifySignatureHash(signatureData, publicKey);
      
      if (!isValid) {
        throw new AppError('Digital signature verification failed', 400, 'SIGNATURE_VERIFICATION_FAILED');
      }

      logger.debug('Digital signature validated successfully', { 
        timestamp: signatureData.timestamp 
      });

      return true;
    } catch (error) {
      logger.error('Digital signature validation failed', { error: error.message });
      throw error;
    }
  }

  static verifySignatureHash(signatureData, publicKey) {
    // Simple hash verification for demo purposes
    // In production, use proper cryptographic libraries
    const dataToVerify = `${signatureData.timestamp}${publicKey}`;
    const expectedHash = crypto
      .createHash('sha256')
      .update(dataToVerify)
      .digest('hex')
      .substring(0, 32);

    return signatureData.signature === expectedHash;
  }

  static generateSignatureHash(userId, timestamp) {
    const data = `${userId}${timestamp}${process.env.CONTRACT_SIGNATURE_SECRET}`;
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 32);
  }
}

export default SignatureValidator;