import kycService from '../services/kycService.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';

class KYCController {
  async submitKYC(req, res, next) {
    try {
      const userId = req.user.userId; // From auth middleware
      const result = await kycService.submitKYC(userId, req.body);
      return successResponse(res, 'KYC submitted successfully', result, 201);
    } catch (error) {
      next(error);
    }
  }

  async getKYCStatus(req, res, next) {
    try {
      const userId = req.user.userId;
      const result = await kycService.getKYCStatus(userId);
      return successResponse(res, 'KYC status retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  async verifyKYC(req, res, next) {
    try {
      const adminId = req.user.userId;
      const { kycId } = req.params;
      const { status, rejectionReason } = req.body;

      const result = await kycService.verifyKYC(kycId, adminId, status, rejectionReason);
      return successResponse(res, `KYC ${status} successfully`, result);
    } catch (error) {
      next(error);
    }
  }

  async getPendingKYC(req, res, next) {
    try {
      const result = await kycService.getPendingKYC();
      return successResponse(res, 'Pending KYC retrieved', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new KYCController();