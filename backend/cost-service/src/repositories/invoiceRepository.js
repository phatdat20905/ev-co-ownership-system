// src/repositories/invoiceRepository.js
import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class InvoiceRepository {
  async create(invoiceData) {
    try {
      const invoice = await db.Invoice.create(invoiceData);
      return await this.findById(invoice.id);
    } catch (error) {
      logger.error('InvoiceRepository.create - Error:', error);
      throw new AppError('Failed to create invoice', 500, 'INVOICE_CREATE_ERROR');
    }
  }

  async findById(id) {
    try {
      const invoice = await db.Invoice.findByPk(id, {
        include: [{
          model: db.InvoiceItem,
          as: 'items',
          include: [{
            model: db.Cost,
            as: 'cost',
            include: [{ model: db.CostCategory, as: 'category' }]
          }]
        }]
      });

      if (!invoice) {
        throw new AppError('Invoice not found', 404, 'INVOICE_NOT_FOUND');
      }

      return invoice;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('InvoiceRepository.findById - Error:', error);
      throw new AppError('Failed to find invoice', 500, 'INVOICE_FIND_ERROR');
    }
  }

  async findByGroup(groupId, filters = {}) {
    try {
      const { page = 1, limit = 20, status } = filters;
      const offset = (page - 1) * limit;

      const where = { groupId };
      if (status) where.status = status;

      const { count, rows } = await db.Invoice.findAndCountAll({
        where,
        include: [{
          model: db.InvoiceItem,
          as: 'items'
        }],
        order: [['invoicePeriodStart', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      return {
        invoices: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('InvoiceRepository.findByGroup - Error:', error);
      throw new AppError('Failed to fetch invoices', 500, 'INVOICES_FETCH_ERROR');
    }
  }

  async updateStatus(id, status) {
    try {
      const invoice = await this.findById(id);
      
      const updateData = { status };
      if (status === 'paid') {
        updateData.paidAt = new Date();
      }

      await invoice.update(updateData);
      return await this.findById(id);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('InvoiceRepository.updateStatus - Error:', error);
      throw new AppError('Failed to update invoice status', 500, 'INVOICE_UPDATE_ERROR');
    }
  }

  async findOverdueInvoices() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      return await db.Invoice.findAll({
        where: {
          status: 'unpaid',
          dueDate: { [db.Sequelize.Op.lt]: today }
        },
        include: [{
          model: db.InvoiceItem,
          as: 'items'
        }]
      });
    } catch (error) {
      logger.error('InvoiceRepository.findOverdueInvoices - Error:', error);
      throw new AppError('Failed to fetch overdue invoices', 500, 'OVERDUE_INVOICES_ERROR');
    }
  }

  async getNextInvoiceNumber() {
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `INV-${currentYear}-`;
      
      const lastInvoice = await db.Invoice.findOne({
        where: {
          invoiceNumber: {
            [db.Sequelize.Op.like]: `${prefix}%`
          }
        },
        order: [['invoiceNumber', 'DESC']]
      });

      let nextNumber = 1;
      if (lastInvoice) {
        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop());
        nextNumber = lastNumber + 1;
      }

      return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      logger.error('InvoiceRepository.getNextInvoiceNumber - Error:', error);
      throw new AppError('Failed to generate invoice number', 500, 'INVOICE_NUMBER_ERROR');
    }
  }
}

export default new InvoiceRepository();