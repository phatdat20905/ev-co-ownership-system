// src/controllers/insuranceController.js
import insuranceService from '../services/insuranceService.js';
import { 
  successResponse, 
  logger 
} from '@ev-coownership/shared';

export class InsuranceController {
  async createInsurance(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const insuranceData = { ...req.body, vehicleId };
      const userId = req.user.id;

      const insurance = await insuranceService.createInsurance(insuranceData, userId);

      logger.info('Insurance policy created successfully', { 
        insuranceId: insurance.id, 
        vehicleId,
        userId 
      });

      return successResponse(res, 'Insurance policy created successfully', insurance, 201);
    } catch (error) {
      logger.error('Failed to create insurance policy', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getInsurancePolicies(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.id;

      const policies = await insuranceService.getInsurancePolicies(vehicleId, userId);

      logger.debug('Insurance policies retrieved successfully', { 
        vehicleId, 
        count: policies.length,
        userId 
      });

      return successResponse(res, 'Insurance policies retrieved successfully', policies);
    } catch (error) {
      logger.error('Failed to get insurance policies', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getCurrentInsurance(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.id;

      const insurance = await insuranceService.getCurrentInsurance(vehicleId, userId);

      logger.debug('Current insurance retrieved successfully', { vehicleId, userId });

      return successResponse(res, 'Current insurance retrieved successfully', insurance);
    } catch (error) {
      logger.error('Failed to get current insurance', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async updateInsurance(req, res, next) {
    try {
      const { insuranceId } = req.params;
      const updateData = req.body;
      const userId = req.user.id;

      const insurance = await insuranceService.updateInsurance(insuranceId, updateData, userId);

      logger.info('Insurance policy updated successfully', { insuranceId, userId });

      return successResponse(res, 'Insurance policy updated successfully', insurance);
    } catch (error) {
      logger.error('Failed to update insurance policy', { 
        error: error.message, 
        insuranceId: req.params.insuranceId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateInsuranceStatus(req, res, next) {
    try {
      const { insuranceId } = req.params;
      const { isActive } = req.body;
      const userId = req.user.id;

      const insurance = await insuranceService.updateInsuranceStatus(insuranceId, isActive, userId);

      logger.info('Insurance status updated successfully', { 
        insuranceId, 
        status: isActive ? 'activated' : 'deactivated',
        userId 
      });

      return successResponse(res, 'Insurance status updated successfully', insurance);
    } catch (error) {
      logger.error('Failed to update insurance status', { 
        error: error.message, 
        insuranceId: req.params.insuranceId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new InsuranceController();