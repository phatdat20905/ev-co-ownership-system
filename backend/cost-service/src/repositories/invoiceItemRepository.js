// src/repositories/invoiceItemRepository.js
import db from '../models/index.js';
import { AppError, logger } from '@ev-coownership/shared';

export class InvoiceItemRepository {
  async createItems(invoiceId, itemsData) {
    const transaction = await db.sequelize.transaction();
    
    try {
      const items = await db.InvoiceItem.bulkCreate(
        itemsData.map(item => ({
          ...item,
          invoiceId
        })),
        { transaction }
      );

      await transaction.commit();
      return items;
    } catch (error) {
      await transaction.rollback();
      logger.error('InvoiceItemRepository.createItems - Error:', error);
      throw new AppError('Failed to create invoice items', 500, 'INVOICE_ITEMS_CREATE_ERROR');
    }
  }

  async findByInvoiceId(invoiceId) {
    try {
      return await db.InvoiceItem.findAll({
        where: { invoiceId },
        include: [{
          model: db.Cost,
          as: 'cost',
          include: [{ model: db.CostCategory, as: 'category' }]
        }],
        order: [['createdAt', 'ASC']]
      });
    } catch (error) {
      logger.error('InvoiceItemRepository.findByInvoiceId - Error:', error);
      throw new AppError('Failed to fetch invoice items', 500, 'INVOICE_ITEMS_FETCH_ERROR');
    }
  }

  async deleteByInvoiceId(invoiceId) {
    try {
      return await db.InvoiceItem.destroy({
        where: { invoiceId }
      });
    } catch (error) {
      logger.error('InvoiceItemRepository.deleteByInvoiceId - Error:', error);
      throw new AppError('Failed to delete invoice items', 500, 'INVOICE_ITEMS_DELETE_ERROR');
    }
  }
}

export default new InvoiceItemRepository();