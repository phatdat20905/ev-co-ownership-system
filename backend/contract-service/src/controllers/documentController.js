import db from '../models/index.js';
import { 
  successResponse, 
  logger,
  AppError
} from '@ev-coownership/shared';

export class DocumentController {
  async uploadDocument(req, res, next) {
    try {
      const { contractId } = req.params;
      const userId = req.user.id;
      const { documentName, documentType } = req.body;

      if (!req.file) {
        throw new AppError('No file uploaded', 400, 'NO_FILE_UPLOADED');
      }

      const contract = await db.Contract.findByPk(contractId);
      if (!contract) {
        throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      // In a real implementation, you would upload to cloud storage
      const fileUrl = await this.uploadToStorage(req.file, contractId);

      const document = await db.ContractDocument.create({
        contract_id: contractId,
        document_name: documentName || req.file.originalname,
        document_type: documentType || 'supporting_document',
        file_url: fileUrl,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_by: userId
      });

      logger.info('Document uploaded to contract', { 
        contractId,
        documentId: document.id,
        fileName: document.document_name,
        fileSize: req.file.size 
      });

      return successResponse(res, 'Document uploaded successfully', document, 201);
    } catch (error) {
      logger.error('Failed to upload document', { 
        error: error.message, 
        contractId: req.params.contractId 
      });
      next(error);
    }
  }

  async getDocuments(req, res, next) {
    try {
      const { contractId } = req.params;

      const documents = await db.ContractDocument.findAll({
        where: { contract_id: contractId },
        order: [['uploaded_at', 'DESC']]
      });

      return successResponse(res, 'Documents retrieved successfully', documents);
    } catch (error) {
      logger.error('Failed to get contract documents', { 
        error: error.message, 
        contractId: req.params.contractId 
      });
      next(error);
    }
  }

  async downloadDocument(req, res, next) {
    try {
      const { contractId, documentId } = req.params;

      const document = await db.ContractDocument.findOne({
        where: {
          id: documentId,
          contract_id: contractId
        }
      });

      if (!document) {
        throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
      }

      // In a real implementation, you would stream the file from storage
      // For now, return the document info with download URL
      const downloadInfo = {
        document,
        downloadUrl: document.file_url // This would be a signed URL in production
      };

      logger.info('Document download requested', { 
        contractId,
        documentId 
      });

      return successResponse(res, 'Document download ready', downloadInfo);
    } catch (error) {
      logger.error('Failed to download document', { 
        error: error.message, 
        documentId: req.params.documentId 
      });
      next(error);
    }
  }

  async deleteDocument(req, res, next) {
    try {
      const { contractId, documentId } = req.params;

      const document = await db.ContractDocument.findOne({
        where: {
          id: documentId,
          contract_id: contractId
        }
      });

      if (!document) {
        throw new AppError('Document not found', 404, 'DOCUMENT_NOT_FOUND');
      }

      // In a real implementation, you would delete from storage
      await document.destroy();

      logger.info('Document deleted', { 
        contractId,
        documentId 
      });

      return successResponse(res, 'Document deleted successfully');
    } catch (error) {
      logger.error('Failed to delete document', { 
        error: error.message, 
        documentId: req.params.documentId 
      });
      next(error);
    }
  }

  async uploadToStorage(file, contractId) {
    // Mock implementation - in production, use AWS S3, Google Cloud Storage, etc.
    const mockUrl = `https://storage.evcoownership.com/contracts/${contractId}/documents/${Date.now()}-${file.originalname}`;
    
    logger.debug('File uploaded to storage', { 
      url: mockUrl,
      originalName: file.originalname,
      size: file.size 
    });
    
    return mockUrl;
  }
}

export default new DocumentController();