import signatureService from '../services/signatureService.js';
import { 
  successResponse, 
  logger
} from '@ev-coownership/shared';

export class SignatureController {
  async signContract(req, res, next) {
    try {
      const { contractId } = req.params;
      const userId = req.user.id;
      const signatureData = req.body;

      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      const result = await signatureService.signContract(contractId, userId, signatureData, clientInfo);

      logger.info('Contract signed', { 
        contractId,
        userId,
        allSigned: result.allSigned 
      });

      return successResponse(res, 'Contract signed successfully', result);
    } catch (error) {
      logger.error('Failed to sign contract', { 
        error: error.message, 
        contractId: req.params.contractId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getSignatureStatus(req, res, next) {
    try {
      const { contractId } = req.params;

      const status = await signatureService.getSignatureStatus(contractId);

      return successResponse(res, 'Signature status retrieved successfully', status);
    } catch (error) {
      logger.error('Failed to get signature status', { 
        error: error.message, 
        contractId: req.params.contractId 
      });
      next(error);
    }
  }

  async getSignatureLogs(req, res, next) {
    try {
      const { contractId } = req.params;

      const logs = await signatureService.getSignatureLogs(contractId);

      return successResponse(res, 'Signature logs retrieved successfully', logs);
    } catch (error) {
      logger.error('Failed to get signature logs', { 
        error: error.message, 
        contractId: req.params.contractId 
      });
      next(error);
    }
  }

  async sendSignatureReminder(req, res, next) {
    try {
      const { contractId } = req.params;
      const userId = req.user.id;
      const { reminderType = 'general' } = req.body;

      const result = await signatureService.sendSignatureReminder(contractId, userId, reminderType);

      return successResponse(res, 'Signature reminders sent successfully', result);
    } catch (error) {
      logger.error('Failed to send signature reminders', { 
        error: error.message, 
        contractId: req.params.contractId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async verifySignature(req, res, next) {
    try {
      const { contractId } = req.params;
      const signatureData = req.body;

      const result = await signatureService.verifySignature(contractId, signatureData);

      return successResponse(res, 'Signature verified successfully', result);
    } catch (error) {
      logger.error('Failed to verify signature', { 
        error: error.message, 
        contractId: req.params.contractId 
      });
      next(error);
    }
  }
}

export default new SignatureController();