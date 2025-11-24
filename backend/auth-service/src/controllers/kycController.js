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
      
      // Handle uploaded files
      if (req.files) {
        if (req.files.idCardFront) {
          kycData.idCardFrontUrl = `/uploads/kyc/${req.files.idCardFront[0].filename}`;
        }
        if (req.files.idCardBack) {
          kycData.idCardBackUrl = `/uploads/kyc/${req.files.idCardBack[0].filename}`;
        }
        if (req.files.driverLicense) {
          kycData.driverLicenseUrl = `/uploads/kyc/${req.files.driverLicense[0].filename}`;
        }
        if (req.files.selfie) {
          kycData.selfieUrl = `/uploads/kyc/${req.files.selfie[0].filename}`;
        }
      }

      const result = await kycService.submitKYC(userId, kycData);

      // kycService returns { existing: boolean, kyc }
      if (result && result.existing) {
        logger.info('KYC submission attempted but already exists', { userId, kycId: result.kyc?.id, status: result.kyc?.verificationStatus });
        return successResponse(res, 'KYC already submitted', result.kyc, 200);
      }

      logger.info('KYC submitted successfully', { userId, kycId: result.kyc?.id });

      return successResponse(res, 'KYC submitted successfully', result.kyc, 201);
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

      // Handle null result (KYC not submitted yet)
      if (!result) {
        return successResponse(res, 'KYC not submitted yet', {
          status: 'not_submitted',
          verificationStatus: null,
          idCardNumber: null,
          driverLicenseNumber: null,
          idCardFrontUrl: null,
          idCardBackUrl: null,
          driverLicenseUrl: null,
          selfieUrl: null,
          rejectionReason: null,
          submittedAt: null,
          reviewedAt: null
        });
      }

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