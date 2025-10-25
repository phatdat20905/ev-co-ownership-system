import db from '../models/index.js';
import { 
  AppError, 
  logger 
} from '@ev-coownership/shared';
import multer from 'multer';
import path from 'path';

export const contractAccess = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.id;

    if (!contractId) {
      return next(new AppError('Contract ID is required', 400, 'MISSING_CONTRACT_ID'));
    }

    const contract = await db.Contract.findByPk(contractId);
    
    if (!contract) {
      return next(new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND'));
    }

    // Check if user is a party in the contract
    const isParty = await db.ContractParty.findOne({
      where: {
        contract_id: contractId,
        user_id: userId
      }
    });

    if (!isParty) {
      // TODO: Check if user is in the same group (need integration with user service)
      // For now, we'll allow access for demo purposes
      logger.warn('User accessing contract without explicit party membership', { 
        userId, 
        contractId 
      });
    }

    // Attach contract to request for use in controllers
    req.contract = contract;
    next();
  } catch (error) {
    logger.error('Contract access middleware error', { error: error.message });
    next(error);
  }
};

export const signatureValidation = async (req, res, next) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.id;

    const party = await db.ContractParty.findOne({
      where: {
        contract_id: contractId,
        user_id: userId
      }
    });

    if (!party) {
      return next(new AppError('User is not authorized to sign this contract', 403, 'SIGNATURE_ACCESS_DENIED'));
    }

    if (party.has_signed) {
      return next(new AppError('User has already signed this contract', 400, 'ALREADY_SIGNED'));
    }

    const contract = await db.Contract.findByPk(contractId);
    if (contract.status !== 'pending_signatures') {
      return next(new AppError('Contract is not in signature pending status', 400, 'INVALID_CONTRACT_STATUS'));
    }

    next();
  } catch (error) {
    logger.error('Signature validation middleware error', { error: error.message });
    next(error);
  }
};

// Multer configuration for document uploads
export const documentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.DOCUMENT_UPLOAD_MAX_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(
        `Invalid file type. Allowed types: ${allowedMimes.join(', ')}`,
        400,
        'INVALID_FILE_TYPE'
      ), false);
    }
  }
});