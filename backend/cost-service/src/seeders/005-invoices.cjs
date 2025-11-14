'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const invoices = [
      // Group 1 - Tesla monthly invoice
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group1.id,
        invoice_number: 'INV-2024-11-001',
        invoice_period_start: new Date('2024-11-01T00:00:00Z'),
        invoice_period_end: new Date('2024-11-30T23:59:59Z'),
        total_amount: 3180000,
        status: 'paid',
        generated_at: new Date('2024-11-01T08:00:00Z'),
        due_date: new Date('2024-11-15T23:59:59Z'),
        paid_at: new Date('2024-11-02T10:00:00Z'),
        pdf_url: null,
        created_at: new Date('2024-11-01T08:00:00Z'),
        updated_at: new Date('2024-11-02T10:00:00Z')
      },
      
      // Group 2 - VinFast monthly invoice
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group2.id,
        invoice_number: 'INV-2024-11-002',
        invoice_period_start: new Date('2024-11-01T00:00:00Z'),
        invoice_period_end: new Date('2024-11-30T23:59:59Z'),
  total_amount: 2155400,
  status: 'unpaid',
        generated_at: new Date('2024-11-01T08:00:00Z'),
        due_date: new Date('2024-11-15T23:59:59Z'),
        paid_at: null,
        pdf_url: null,
        created_at: new Date('2024-11-01T08:00:00Z'),
        updated_at: new Date('2024-11-01T08:00:00Z')
      },
      
      // Group 3 - Ioniq 5 monthly invoice
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group3.id,
        invoice_number: 'INV-2024-11-003',
        invoice_period_start: new Date('2024-11-01T00:00:00Z'),
        invoice_period_end: new Date('2024-11-30T23:59:59Z'),
        total_amount: 316980,
        status: 'paid',
        generated_at: new Date('2024-11-01T08:00:00Z'),
        due_date: new Date('2024-11-15T23:59:59Z'),
        paid_at: new Date('2024-11-05T14:00:00Z'),
        pdf_url: null,
        created_at: new Date('2024-11-01T08:00:00Z'),
        updated_at: new Date('2024-11-05T14:00:00Z')
      },
      
      // Group 1 - Previous month
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group1.id,
        invoice_number: 'INV-2024-10-001',
        invoice_period_start: new Date('2024-10-01T00:00:00Z'),
        invoice_period_end: new Date('2024-10-31T23:59:59Z'),
        total_amount: 3500000,
        status: 'paid',
        generated_at: new Date('2024-10-01T08:00:00Z'),
        due_date: new Date('2024-10-15T23:59:59Z'),
        paid_at: new Date('2024-10-08T10:00:00Z'),
        pdf_url: null,
        created_at: new Date('2024-10-01T08:00:00Z'),
        updated_at: new Date('2024-10-08T10:00:00Z')
      }
    ];

    // Idempotent insert: only add invoices with invoice_number not already present
    const numbers = invoices.map(i => `'${i.invoice_number}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT invoice_number FROM invoices WHERE invoice_number IN (${numbers})`
    );
    const existingSet = new Set(existing.map(r => r.invoice_number));
    const toInsert = invoices.filter(i => !existingSet.has(i.invoice_number));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('invoices', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} invoices`);
      console.log(`   - ${toInsert.filter(i => i.status === 'paid').length} paid`);
      console.log(`   - ${toInsert.filter(i => i.status === 'pending').length} pending`);
    } else {
      console.log('⏩ Invoices already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('invoices', null, {});
  }
};
