'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const invoices = [];
    
    // Helper to create monthly invoices for 2025
    const createMonthlyInvoices = (groupKey, months) => {
      const group = MASTER_SEED_DATA.groups[groupKey];
      const groupNum = groupKey === 'group1' ? '001' : groupKey === 'group2' ? '002' : '003';
      const baseAmount = groupKey === 'group1' ? 3500000 : groupKey === 'group2' ? 2200000 : 2800000;
      
      months.forEach(month => {
        const monthStr = month.toString().padStart(2, '0');
        const year = 2025;
        const amount = baseAmount + Math.floor(Math.random() * 500000);
        const isPaid = month < 11; // November not paid yet
        const isOverdue = month === 10; // October is overdue
        
        const status = isPaid ? 'paid' : isOverdue ? 'overdue' : 'unpaid';
        
        // Calculate last day of month properly (month is 1-based, Date constructor month is 0-based)
        const lastDay = new Date(year, month, 0).getDate();
        const payDay = Math.min(Math.floor(Math.random() * 10) + 3, lastDay);
        const payDayStr = payDay.toString().padStart(2, '0');
        
        invoices.push({
          id: uuidv4(),
          group_id: group.id,
          invoice_number: `INV-${year}-${monthStr}-${groupNum}`,
          invoice_period_start: new Date(`${year}-${monthStr}-01T00:00:00Z`),
          invoice_period_end: new Date(`${year}-${monthStr}-${lastDay.toString().padStart(2, '0')}T23:59:59Z`),
          total_amount: amount,
          status: status,
          generated_at: new Date(`${year}-${monthStr}-01T08:00:00Z`),
          due_date: new Date(`${year}-${monthStr}-15T23:59:59Z`),
          paid_at: isPaid ? new Date(`${year}-${monthStr}-${payDayStr}T10:00:00Z`) : null,
          pdf_url: null,
          created_at: new Date(`${year}-${monthStr}-01T08:00:00Z`),
          updated_at: isPaid ? new Date(`${year}-${monthStr}-${payDayStr}T10:00:00Z`) : new Date(`${year}-${monthStr}-01T08:00:00Z`)
        });
      });
    };
    
    // Create invoices for all groups for months 1-11 of 2025
    createMonthlyInvoices('group1', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    createMonthlyInvoices('group2', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    createMonthlyInvoices('group3', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    // Idempotent insert: only add invoices with invoice_number not already present
    const numbers = invoices.map(i => `'${i.invoice_number}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT invoice_number FROM invoices WHERE invoice_number IN (${numbers})`
    );
    const existingSet = new Set(existing.map(r => r.invoice_number));
    const toInsert = invoices.filter(i => !existingSet.has(i.invoice_number));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('invoices', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} invoices for 2025`);
      console.log(`   - Paid: ${toInsert.filter(i => i.status === 'paid').length}`);
      console.log(`   - Overdue: ${toInsert.filter(i => i.status === 'overdue').length}`);
      console.log(`   - Unpaid: ${toInsert.filter(i => i.status === 'unpaid').length}`);
      const totalAmount = toInsert.reduce((sum, i) => sum + i.total_amount, 0);
      console.log(`   - Total amount: ${totalAmount.toLocaleString('vi-VN')} VND`);
    } else {
      console.log('⏩ 2025 invoices already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DELETE FROM invoices WHERE invoice_number LIKE 'INV-2025-%'`
    );
  }
};
