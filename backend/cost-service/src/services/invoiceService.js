// src/services/invoiceService.js
import { 
  invoiceRepository, 
  invoiceItemRepository,
  costRepository,
} from '../repositories/index.js';
import { AppError, logger } from '@ev-coownership/shared';
import pdfInvoiceGenerator from '../utils/pdfInvoiceGenerator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import eventService from './eventService.js';

// __dirname shim for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class InvoiceService {
  async generateInvoice(invoiceData, userId) {
    try {
      const { groupId, periodStart, periodEnd, costIds } = invoiceData;

      // Get next invoice number
      const invoiceNumber = await invoiceRepository.getNextInvoiceNumber();

      // Get costs for the period
      const costs = await costRepository.findByGroup(groupId, {
        startDate: periodStart,
        endDate: periodEnd
      });

      if (costs.costs.length === 0) {
        throw new AppError('No costs found for the specified period', 404, 'NO_COSTS_FOUND');
      }

      // Filter costs if specific costIds are provided
      let filteredCosts = costs.costs;
      if (costIds && costIds.length > 0) {
        filteredCosts = costs.costs.filter(cost => costIds.includes(cost.id));
      }

      // Calculate total amount
      const totalAmount = filteredCosts.reduce((sum, cost) => sum + parseFloat(cost.totalAmount), 0);

      // Create invoice
      const invoice = await invoiceRepository.create({
        groupId,
        invoiceNumber,
        invoicePeriodStart: periodStart,
        invoicePeriodEnd: periodEnd,
        totalAmount,
        dueDate: new Date(new Date(periodEnd).setDate(new Date(periodEnd).getDate() + 30)), // 30 days after period end
        status: 'unpaid'
      });

      // Create invoice items
      const invoiceItems = filteredCosts.map(cost => ({
        invoiceId: invoice.id,
        costId: cost.id,
        itemDescription: `${cost.costName} - ${cost.category?.categoryName || 'Uncategorized'}`,
        amount: cost.totalAmount
      }));

      await invoiceItemRepository.createItems(invoice.id, invoiceItems);

      // Generate PDF (returns { pdfUrl, filePath, fileName })
      const pdfResult = await pdfInvoiceGenerator.generate(invoice, filteredCosts);

      // Update invoice with PDF URL (keep filePath local)
      const pdfUrl = pdfResult?.pdfUrl ?? null;
      if (pdfUrl) {
        await invoiceRepository.update(invoice.id, { pdfUrl });
      }

      // Mark costs as invoiced
      await Promise.all(
        filteredCosts.map(cost => 
          costRepository.update(cost.id, { invoiced: true })
        )
      );

      // Publish event
      await eventService.publishInvoiceGenerated({
        invoiceId: invoice.id,
        groupId,
        invoiceNumber,
        totalAmount,
        periodStart,
        periodEnd,
        generatedBy: userId
      });

      logger.info('Invoice generated successfully', { 
        invoiceId: invoice.id, 
        invoiceNumber,
        groupId,
        totalAmount 
      });

      return await invoiceRepository.findById(invoice.id);
    } catch (error) {
      logger.error('InvoiceService.generateInvoice - Error:', error);
      throw error;
    }
  }

  async getInvoiceById(id, userId) {
    try {
      const invoice = await invoiceRepository.findById(id);
      return invoice;
    } catch (error) {
      logger.error('InvoiceService.getInvoiceById - Error:', error);
      throw error;
    }
  }

  async getInvoicesByGroup(groupId, filters, userId) {
    try {
      return await invoiceRepository.findByGroup(groupId, filters);
    } catch (error) {
      logger.error('InvoiceService.getInvoicesByGroup - Error:', error);
      throw error;
    }
  }

  async markInvoiceAsPaid(id, userId) {
    try {
      const invoice = await invoiceRepository.updateStatus(id, 'paid');

      // Publish event
      await eventService.publishInvoicePaid({
        invoiceId: invoice.id,
        groupId: invoice.groupId,
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        paidBy: userId
      });

      logger.info('Invoice marked as paid', { invoiceId: id, userId });
      return invoice;
    } catch (error) {
      logger.error('InvoiceService.markInvoiceAsPaid - Error:', error);
      throw error;
    }
  }

  async downloadInvoice(id, userId) {
    try {
      const invoice = await invoiceRepository.findById(id);

      // If PDF not generated yet, attempt to generate on-demand and persist
      let filePath = null;
      let fileName = null;
      if (!invoice.pdfUrl) {
        try {
          const costs = (invoice.items || []).map(i => i.cost).filter(Boolean);
          const pdfResult = await pdfInvoiceGenerator.generate(invoice, costs);
          const pdfUrl = pdfResult?.pdfUrl ?? null;
          filePath = pdfResult?.filePath ?? null;
          fileName = pdfResult?.fileName ?? null;

          // Persist pdfUrl on the invoice instance
          if (pdfUrl) {
            if (invoice.update && typeof invoice.update === 'function') {
              await invoice.update({ pdfUrl });
            } else if (typeof invoiceRepository.update === 'function') {
              await invoiceRepository.update(invoice.id, { pdfUrl });
            }
            invoice.pdfUrl = pdfUrl;
          }
        } catch (genErr) {
          logger.error('InvoiceService.downloadInvoice - PDF generation failed:', genErr);
          throw new AppError('PDF not generated for this invoice', 404, 'PDF_NOT_GENERATED');
        }
      }

      // If we didn't get filePath earlier, try to resolve it from invoice.pdfUrl
      if (!filePath && invoice.pdfUrl) {
        // invoice.pdfUrl might be like '/costs/data/invoices/invoice_x.pdf' or '/data/invoices/invoice_x.pdf'
        const url = invoice.pdfUrl;
        // Strip possible '/costs' prefix
        let rel = url.replace(/^\/costs/, '');
        // Ensure leading slash removed
        rel = rel.replace(/^\//, '');
        const parts = rel.split('/');
        const file = parts.pop();
        const folder = parts.join('/');
        const absFolder = path.join(__dirname, '..', folder);
        filePath = path.join(absFolder, file);
        fileName = file;
      }

      // Read file buffer and return
      if (filePath && fs.existsSync(filePath)) {
        const buffer = await fs.promises.readFile(filePath);

        // Publish event
        await eventService.publishInvoiceDownloaded({
          invoiceId: invoice.id,
          groupId: invoice.groupId,
          downloadedBy: userId
        });

        logger.info('Invoice download requested', { invoiceId: id, userId, filePath });
        return { buffer, fileName: fileName || (`invoice_${invoice.invoiceNumber}.pdf`) };
      }

      // If we reach here, we couldn't locate the file
      throw new AppError('PDF not generated for this invoice', 404, 'PDF_NOT_GENERATED');
    } catch (error) {
      logger.error('InvoiceService.downloadInvoice - Error:', error);
      throw error;
    }
  }

  async getOverdueInvoices() {
    try {
      return await invoiceRepository.findOverdueInvoices();
    } catch (error) {
      logger.error('InvoiceService.getOverdueInvoices - Error:', error);
      throw error;
    }
  }

  async sendInvoiceReminder(invoiceId, userId) {
    try {
      const invoice = await invoiceRepository.findById(invoiceId);

      // Publish reminder event (Notification service will handle email/SMS)
      await eventService.publishInvoiceReminder({
        invoiceId: invoice.id,
        groupId: invoice.groupId,
        invoiceNumber: invoice.invoiceNumber,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        sentBy: userId
      });

      logger.info('Invoice reminder sent', { invoiceId, userId });
      return { success: true, message: 'Invoice reminder sent successfully' };
    } catch (error) {
      logger.error('InvoiceService.sendInvoiceReminder - Error:', error);
      throw error;
    }
  }
}

export default new InvoiceService();