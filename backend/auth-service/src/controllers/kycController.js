import kycService from '../services/kycService.js';
import { 
  successResponse, 
  paginatedResponse, 
  logger,
  AppError 
} from '@ev-coownership/shared';

export class KYCController {
  async submitKYC(req, res, next) {
    try {
      const userId = req.user.id;
      const kycData = req.body;

      const result = await kycService.submitKYC(userId, kycData);

      logger.info('KYC submitted successfully', { userId });

      return successResponse(res, 'KYC submitted successfully', result, 201);
    } catch (error) {
      logger.error('KYC submission failed', { 
        error: error.message, 
        userId: req.user.id 
      });
      next(error);
    }
  }

  async getKYCStatus(req, res, next) {
    try {
      const userId = req.user.id;

      const result = await kycService.getKYCStatus(userId);

      return successResponse(res, 'KYC status retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async verifyKYC(req, res, next) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;
      const verificationData = req.body;

      const result = await kycService.verifyKYC(id, adminId, verificationData);

      logger.info('KYC verification processed', { 
        kycId: id, 
        adminId, 
        status: verificationData.verificationStatus 
      });

      return successResponse(res, 'KYC verification processed successfully', result);
    } catch (error) {
      logger.error('KYC verification failed', { 
        error: error.message, 
        kycId: req.params.id, 
        adminId: req.user.id 
      });
      next(error);
    }
  }

  async getPendingKYCs(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await kycService.getPendingKYCs(parseInt(page), parseInt(limit));

      return paginatedResponse(
        res, 
        'Pending KYCs retrieved successfully', 
        result.kycs, 
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new KYCController();