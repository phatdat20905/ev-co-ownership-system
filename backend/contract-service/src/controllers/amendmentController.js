import amendmentService from '../services/amendmentService.js';
import { 
  successResponse, 
  logger
} from '@ev-coownership/shared';

export class AmendmentController {
  async createAmendment(req, res, next) {
    try {
      const { contractId } = req.params;
      const amendmentData = {
        ...req.body,
        createdBy: req.user.id
      };

      const amendment = await amendmentService.createAmendment(contractId, amendmentData);

      logger.info('Contract amendment created', { 
        originalContractId: contractId,
        amendmentContractId: amendment.id,
        userId: req.user.id 
      });

      return successResponse(res, 'Contract amendment created successfully', amendment, 201);
    } catch (error) {
      logger.error('Failed to create contract amendment', { 
        error: error.message, 
        contractId: req.params.contractId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getAmendments(req, res, next) {
    try {
      const { contractId } = req.params;

      const amendments = await amendmentService.getAmendments(contractId);

      return successResponse(res, 'Contract amendments retrieved successfully', amendments);
    } catch (error) {
      logger.error('Failed to get contract amendments', { 
        error: error.message, 
        contractId: req.params.contractId 
      });
      next(error);
    }
  }

  async approveAmendment(req, res, next) {
    try {
      const { contractId, amendmentId } = req.params;
      const userId = req.user.id;

      const amendment = await amendmentService.approveAmendment(amendmentId, userId);

      return successResponse(res, 'Contract amendment approved successfully', amendment);
    } catch (error) {
      logger.error('Failed to approve amendment', { 
        error: error.message, 
        amendmentId: req.params.amendmentId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new AmendmentController();