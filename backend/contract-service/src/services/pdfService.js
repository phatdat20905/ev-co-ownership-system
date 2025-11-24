import db from '../models/index.js';
import { 
  logger, 
  AppError 
} from '@ev-coownership/shared';
import PDFGenerator from '../utils/pdfGenerator.js';
import eventService from './eventService.js';

export class PDFService {
  async generateContractPDF(contractId, userId) {
    try {
      const contract = await db.Contract.findByPk(contractId, {
        include: [
          {
            model: db.ContractParty,
            as: 'parties'
          }
        ]
      });

      if (!contract) {
        throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
      }

      // Generate PDF
      const pdfBuffer = await PDFGenerator.generateContractPDF(contract);

      // Store PDF as document
      const document = await db.ContractDocument.create({
        contract_id: contractId,
        document_name: `${contract.contract_number}.pdf`,
        document_type: 'contract_pdf',
        file_url: await this.uploadToStorage(pdfBuffer, contract.contract_number),
        file_size: pdfBuffer.length,
        mime_type: 'application/pdf',
        uploaded_by: userId
      });

      // Publish download event
      await eventService.publishContractDownloaded({
        contractId,
        userId,
        documentId: document.id
      });

      logger.info('Contract PDF generated successfully', { 
        contractId,
        documentId: document.id,
        fileSize: pdfBuffer.length 
      });

      return {
        document,
        pdfBuffer
      };
    } catch (error) {
      logger.error('Failed to generate contract PDF', { error: error.message, contractId });
      throw error;
    }
  }

  async uploadToStorage(pdfBuffer, contractNumber) {
    // In a real implementation, this would upload to cloud storage (S3, Google Cloud Storage, etc.)
    // For now, we'll simulate by returning a mock URL
    const mockUrl = `https://storage.evcoownership.com/contracts/${contractNumber}-${Date.now()}.pdf`;
    
    logger.debug('PDF uploaded to storage', { url: mockUrl });
    return mockUrl;
  }

  async downloadContractPDF(contractId, userId) {
    try {
      // Find the latest PDF document for this contract
      const document = await db.ContractDocument.findOne({
        where: { 
          contract_id: contractId,
          document_type: 'contract_pdf'
        },
        order: [['created_at', 'DESC']]
      });

      if (!document) {
        // Generate new PDF if not exists
        const { document: newDocument } = await this.generateContractPDF(contractId, userId);
        return newDocument;
      }

      // Publish download event
      await eventService.publishContractDownloaded({
        contractId,
        userId,
        documentId: document.id
      });

      logger.info('Contract PDF downloaded', { 
        contractId,
        documentId: document.id,
        userId 
      });

      return document;
    } catch (error) {
      logger.error('Failed to download contract PDF', { error: error.message, contractId });
      throw error;
    }
  }
}

export default new PDFService();