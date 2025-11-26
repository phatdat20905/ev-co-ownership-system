import db from '../models/index.js';
import { 
  successResponse, 
  logger,
  AppError
} from '@ev-coownership/shared';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        order: [['created_at', 'DESC']]
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

      // Construct file path from file_url
      // file_url format: /uploads/documents/:contractId/:filename
      const relativePath = document.file_url.replace('/uploads/', '');
      const filepath = path.join(__dirname, '../../uploads', relativePath);

      // Check if file exists
      if (!fs.existsSync(filepath)) {
        logger.error('File not found on disk', { filepath, fileUrl: document.file_url });
        throw new AppError('File not found on disk', 404, 'FILE_NOT_FOUND');
      }

      // Set headers for download
      res.setHeader('Content-Type', document.mime_type || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.document_name)}"`);
      res.setHeader('Content-Length', document.file_size);

      // Stream file to response
      const fileStream = fs.createReadStream(filepath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        logger.error('Error streaming file', { error: error.message, filepath });
        if (!res.headersSent) {
          next(new AppError('Error streaming file', 500, 'STREAM_ERROR'));
        }
      });

      fileStream.on('end', () => {
        logger.info('Document downloaded successfully', { 
          contractId,
          documentId,
          fileName: document.document_name
        });
      });

    } catch (error) {
      logger.error('Failed to download document', { 
        error: error.message, 
        documentId: req.params.documentId 
      });
      next(error);
    }
  }

  async viewDocument(req, res, next) {
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

      // Construct file path from file_url
      const relativePath = document.file_url.replace('/uploads/', '');
      const filepath = path.join(__dirname, '../../uploads', relativePath);

      // Check if file exists
      if (!fs.existsSync(filepath)) {
        logger.error('File not found on disk', { filepath, fileUrl: document.file_url });
        throw new AppError('File not found on disk', 404, 'FILE_NOT_FOUND');
      }

      // Set headers for inline viewing (not download)
      res.setHeader('Content-Type', document.mime_type || 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Length', document.file_size);

      // Stream file to response
      const fileStream = fs.createReadStream(filepath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        logger.error('Error streaming file for view', { error: error.message, filepath });
        if (!res.headersSent) {
          next(new AppError('Error streaming file', 500, 'STREAM_ERROR'));
        }
      });

      fileStream.on('end', () => {
        logger.info('Document viewed successfully', { 
          contractId,
          documentId,
          fileName: document.document_name
        });
      });

    } catch (error) {
      logger.error('Failed to view document', { 
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
    try {
      // Create uploads directory structure: uploads/documents/{contractId}/
      const uploadsDir = path.join(__dirname, '../../uploads/documents', contractId);
      
      // Create directory if it doesn't exist (recursive)
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      // Write file to disk
      fs.writeFileSync(filepath, file.buffer);

      // Return relative URL path (will be served by express.static middleware)
      const relativeUrl = `/uploads/documents/${contractId}/${filename}`;
      
      logger.info('File saved to local storage', { 
        url: relativeUrl,
        filepath,
        originalName: file.originalname,
        size: file.size 
      });
      
      return relativeUrl;
    } catch (error) {
      logger.error('Failed to save file to storage', {
        error: error.message,
        contractId,
        filename: file.originalname
      });
      throw new AppError('Failed to save file to storage', 500, 'STORAGE_ERROR');
    }
  }
}

export default new DocumentController();