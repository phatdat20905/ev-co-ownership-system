// src/controllers/invoiceController.js
import invoiceService from '../services/invoiceService.js';
import { successResponse, logger } from '@ev-coownership/shared';

export class InvoiceController {
  async generateInvoice(req, res, next) {
    try {
      const invoiceData = req.body;
      const userId = req.user.id;

      const invoice = await invoiceService.generateInvoice(invoiceData, userId);

      logger.info('Invoice generated successfully', { 
        invoiceId: invoice.id, 
        invoiceNumber: invoice.invoiceNumber,
        userId 
      });

      return successResponse(res, 'Invoice generated successfully', invoice, 201);
    } catch (error) {
      logger.error('Failed to generate invoice', { 
        error: error.message, 
        userId: req.user?.id,
        invoiceData: req.body 
      });
      next(error);
    }
  }

  async getInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const invoice = await invoiceService.getInvoiceById(id, userId);

      logger.info('Invoice retrieved successfully', { invoiceId: id, userId });

      return successResponse(res, 'Invoice retrieved successfully', invoice);
    } catch (error) {
      logger.error('Failed to get invoice', { 
        error: error.message, 
        invoiceId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getInvoices(req, res, next) {
    try {
      const { groupId } = req.params;
      const filters = req.query;
      const userId = req.user.id;

      const result = await invoiceService.getInvoicesByGroup(groupId, filters, userId);

      logger.info('Invoices retrieved successfully', { 
        groupId, 
        userId, 
        count: result.invoices.length 
      });

      return successResponse(res, 'Invoices retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get invoices', { 
        error: error.message, 
        groupId: req.params.groupId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async markPaid(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const invoice = await invoiceService.markInvoiceAsPaid(id, userId);

      logger.info('Invoice marked as paid', { invoiceId: id, userId });

      return successResponse(res, 'Invoice marked as paid successfully', invoice);
    } catch (error) {
      logger.error('Failed to mark invoice as paid', { 
        error: error.message, 
        invoiceId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async downloadInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await invoiceService.downloadInvoice(id, userId);

      // If service returned a buffer (file), stream it directly
      if (result && result.buffer) {
        const fileName = result.fileName || `invoice-${id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        logger.info('Invoice file streaming', { invoiceId: id, userId, fileName });
        return res.send(result.buffer);
      }

      // Otherwise fallback to returning URL metadata
      const pdfUrl = result?.pdfUrl ?? null;
      logger.info('Invoice download URL generated', { invoiceId: id, userId });
      return successResponse(res, 'Download URL generated successfully', { pdfUrl });
    } catch (error) {
      logger.error('Failed to generate invoice download URL', { 
        error: error.message, 
        invoiceId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async sendReminder(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await invoiceService.sendInvoiceReminder(id, userId);

      logger.info('Invoice reminder sent', { invoiceId: id, userId });

      return successResponse(res, 'Invoice reminder sent successfully', result);
    } catch (error) {
      logger.error('Failed to send invoice reminder', { 
        error: error.message, 
        invoiceId: req.params.id,
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new InvoiceController();