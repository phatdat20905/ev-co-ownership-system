import { logger, AppError } from '@ev-coownership/shared';
import db from '../models/index.js';
import fs from 'fs/promises';
import path from 'path';

export class DocumentCleanupJob {
  constructor() {
    this.name = 'Document Cleanup Job';
    this.schedule = '0 2 * * *'; // Run daily at 2 AM
    this.isRunning = false;
    this.retentionDays = parseInt(process.env.DOCUMENT_RETENTION_DAYS) || 365; // 1 year default
  }

  async execute() {
    if (this.isRunning) {
      logger.warn('Document cleanup job is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting document cleanup job');

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      // Find expired documents (associated with expired/terminated contracts)
      const expiredDocuments = await db.ContractDocument.findAll({
        include: [{
          model: db.Contract,
          as: 'contract',
          where: {
            status: ['expired', 'terminated'],
            updated_at: {
              [db.Sequelize.Op.lt]: cutoffDate
            }
          },
          required: true
        }],
        attributes: ['id', 'file_url', 'document_name', 'contract_id']
      });

      let deletedCount = 0;
      let errorCount = 0;

      for (const document of expiredDocuments) {
        try {
          // Delete from storage
          await this.deleteFromStorage(document.file_url);
          
          // Delete database record
          await document.destroy();
          
          deletedCount++;
          
          logger.debug('Document cleaned up successfully', {
            documentId: document.id,
            documentName: document.document_name,
            contractId: document.contract_id
          });
        } catch (error) {
          errorCount++;
          logger.error('Failed to cleanup document', {
            documentId: document.id,
            error: error.message
          });
        }
      }

      // Clean up orphaned documents (contracts that no longer exist)
      const orphanedDocuments = await db.ContractDocument.findAll({
        where: {
          contract_id: {
            [db.Sequelize.Op.notIn]: db.sequelize.literal('(SELECT id FROM contracts)')
          }
        }
      });

      for (const document of orphanedDocuments) {
        try {
          await this.deleteFromStorage(document.file_url);
          await document.destroy();
          deletedCount++;
        } catch (error) {
          errorCount++;
          logger.error('Failed to cleanup orphaned document', {
            documentId: document.id,
            error: error.message
          });
        }
      }

      logger.info('Document cleanup job completed successfully', {
        expiredDocuments: expiredDocuments.length,
        orphanedDocuments: orphanedDocuments.length,
        deletedCount,
        errorCount,
        retentionDays: this.retentionDays
      });

    } catch (error) {
      logger.error('Document cleanup job failed', { error: error.message });
    } finally {
      this.isRunning = false;
    }
  }

  async deleteFromStorage(fileUrl) {
    // In production, this would delete from cloud storage (S3, Google Cloud Storage, etc.)
    // For local development, we might delete from local storage
    
    if (fileUrl.startsWith('/') || fileUrl.startsWith('.')) {
      // Local file path
      try {
        await fs.unlink(fileUrl);
        logger.debug('Local file deleted', { fileUrl });
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
    } else {
      // Cloud storage URL - log for now, implement cloud deletion in production
      logger.debug('Cloud file marked for deletion', { fileUrl });
      // await cloudStorage.delete(fileUrl); // Implement based on your cloud provider
    }
  }

  start() {
    logger.info(`Scheduled job: ${this.name} - ${this.schedule}`);
    
    // For demo purposes, run immediately
    this.execute();
    
    // Set up interval for demo (in production, use proper scheduler)
    setInterval(() => {
      this.execute();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  // Manual cleanup method for admin purposes
  async cleanupContractDocuments(contractId) {
    try {
      const documents = await db.ContractDocument.findAll({
        where: { contract_id: contractId }
      });

      let deletedCount = 0;
      
      for (const document of documents) {
        await this.deleteFromStorage(document.file_url);
        await document.destroy();
        deletedCount++;
      }

      logger.info('Contract documents cleaned up manually', {
        contractId,
        deletedCount
      });

      return { success: true, deletedCount };
    } catch (error) {
      logger.error('Manual document cleanup failed', {
        contractId,
        error: error.message
      });
      throw new AppError('Failed to cleanup contract documents', 500, 'CLEANUP_FAILED');
    }
  }
}

export default new DocumentCleanupJob();