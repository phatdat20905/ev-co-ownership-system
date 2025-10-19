import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import kycService from '../../src/services/kycService.js';
import db from '../../src/models/index.js';

jest.mock('../../src/models/index.js');

describe('KYCService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitKYC', () => {
    it('should submit KYC successfully', async () => {
      const userId = '123';
      const kycData = {
        idCardNumber: '123456789',
        idCardFrontUrl: 'https://example.com/front.jpg'
      };

      db.KYCVerification.findOne.mockResolvedValue(null);
      db.KYCVerification.create.mockResolvedValue({
        id: 'kyc-123',
        userId,
        ...kycData
      });

      const result = await kycService.submitKYC(userId, kycData);

      expect(result).toHaveProperty('id');
      expect(result.userId).toBe(userId);
      expect(db.KYCVerification.create).toHaveBeenCalled();
    });

    it('should throw error if KYC already submitted', async () => {
      const userId = '123';
      const kycData = {
        idCardNumber: '123456789'
      };

      db.KYCVerification.findOne.mockResolvedValue({ id: 'existing-kyc' });

      await expect(kycService.submitKYC(userId, kycData)).rejects.toThrow('KYC verification already submitted');
    });
  });
});