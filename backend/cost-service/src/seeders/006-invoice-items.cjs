"use strict";

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Define invoice items keyed by invoice_number (these invoice_numbers come from 005-invoices.cjs)
    const itemsByInvoiceNumber = {
      'INV-2024-11-001': [
        { item_description: 'Charging session (Nov)', amount: 1200000 },
        { item_description: 'Maintenance reserve', amount: 1980000 }
      ],
      'INV-2024-11-002': [
        { item_description: 'Battery health check', amount: 155400 },
        { item_description: 'Parking fee', amount: 2000000 }
      ],
      'INV-2024-11-003': [
        { item_description: 'Charging session (Nov)', amount: 116980 },
        { item_description: 'Toll & fees', amount: 200000 }
      ],
      'INV-2024-10-001': [
        { item_description: 'Previous month adjustments', amount: 3500000 }
      ]
    };

    // Get invoice ids for the invoice_numbers we plan to seed
    const invoiceNumbers = Object.keys(itemsByInvoiceNumber).map(n => `'${n}'`).join(',');
    const [rows] = await queryInterface.sequelize.query(`SELECT id, invoice_number FROM invoices WHERE invoice_number IN (${invoiceNumbers})`);
    const invoiceMap = rows.reduce((acc, r) => { acc[r.invoice_number] = r.id; return acc; }, {});

    const toInsert = [];

    for (const [invoiceNumber, items] of Object.entries(itemsByInvoiceNumber)) {
      const invoiceId = invoiceMap[invoiceNumber];
      if (!invoiceId) continue; // invoice might not exist

      // Skip if invoice_items already present for this invoice
      const [[existingCountResult]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*)::int as count FROM invoice_items WHERE invoice_id = '${invoiceId}'`
      );
      if (existingCountResult.count > 0) {
        // already seeded for this invoice
        continue;
      }

      items.forEach(it => {
        toInsert.push({
          id: uuidv4(),
          invoice_id: invoiceId,
          cost_id: null,
          item_description: it.item_description,
          amount: it.amount,
          created_at: MASTER_SEED_DATA.dates.now,
          updated_at: MASTER_SEED_DATA.dates.now
        });
      });
    }

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('invoice_items', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} invoice items`);
    } else {
      console.log('⏩ Invoice items already exist or invoices missing — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('invoice_items', null, {});
  }
};
