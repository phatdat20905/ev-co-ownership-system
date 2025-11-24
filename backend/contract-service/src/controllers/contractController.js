import contractService from '../services/contractService.js';
import pdfService from '../services/pdfService.js';
import { 
  successResponse, 
  logger,
  AppError
} from '@ev-coownership/shared';

export class ContractController {
  async createContract(req, res, next) {
    try {
      const contractData = {
        ...req.body,
        createdBy: req.user.id
      };

      const contract = await contractService.createContract(contractData);

      logger.info('Contract created', { 
        contractId: contract.id,
        userId: req.user.id,
        groupId: contractData.groupId 
      });

      return successResponse(res, 'Contract created successfully', contract, 201);
    } catch (error) {
      logger.error('Failed to create contract', { 
        error: error.message, 
        userId: req.user?.id,
        groupId: req.body?.groupId 
      });
      next(error);
    }
  }

  async getContract(req, res, next) {
    try {
      const { contractId } = req.params;
      const userId = req.user.id;

      const contract = await contractService.getContractById(contractId, userId);

      return successResponse(res, 'Contract retrieved successfully', contract);
    } catch (error) {
      logger.error('Failed to get contract', { 
        error: error.message, 
        contractId: req.params.contractId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getContractsByGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const filters = {
        status: req.query.status,
        contractType: req.query.contractType,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'DESC'
      };

      const result = await contractService.getContractsByGroup(groupId, filters);

      return successResponse(res, 'Contracts retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get contracts by group', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getUserContracts(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const filters = {
        status: req.query.status,
        contractType: req.query.contractType,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'DESC'
      };

      // If user is admin or staff, get all contracts; otherwise filter by user
      let result;
      if (userRole === 'admin' || userRole === 'staff') {
        result = await contractService.getAllContracts(filters);
      } else {
        result = await contractService.getContractsByUser(userId, filters);
      }

      return successResponse(res, 'User contracts retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get user contracts', { 
        error: error.message,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateContract(req, res, next) {
    try {
      const { contractId } = req.params;
      const userId = req.user.id;

      const contract = await contractService.updateContract(contractId, req.body, userId);

      return successResponse(res, 'Contract updated successfully', contract);
    } catch (error) {
      logger.error('Failed to update contract', { 
        error: error.message, 
        contractId: req.params.contractId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async sendForSignature(req, res, next) {
    try {
      const { contractId } = req.params;
      const userId = req.user.id;

      const contract = await contractService.sendForSignature(contractId, userId);

      return successResponse(res, 'Contract sent for signature successfully', contract);
    } catch (error) {
      logger.error('Failed to send contract for signature', { 
        error: error.message, 
        contractId: req.params.contractId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async downloadContractPDF(req, res, next) {
    try {
      const { contractId } = req.params;
      const userId = req.user.id;

      const document = await pdfService.downloadContractPDF(contractId, userId);

      // In a real implementation, you would stream the file from storage
      // For now, we'll return the document info
      return successResponse(res, 'Contract PDF download ready', {
        document,
        downloadUrl: document.file_url // This would be a signed URL in production
      });
    } catch (error) {
      logger.error('Failed to download contract PDF', { 
        error: error.message, 
        contractId: req.params.contractId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deleteContract(req, res, next) {
    try {
      const { contractId } = req.params;
      const userId = req.user.id;

      // Perform deletion
      await contractService.deleteContract(contractId, userId);

      return successResponse(res, 'Contract deleted successfully');
    } catch (error) {
      logger.error('Failed to delete contract', { 
        error: error.message, 
        contractId: req.params.contractId,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new ContractController();