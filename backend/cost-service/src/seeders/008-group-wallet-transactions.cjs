"use strict";

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create a couple of group wallet transactions per group (deposit + expense referencing invoice)
    const groupIds = Object.values(MASTER_SEED_DATA.groups).map(g => g.id);

    // Get group_wallet ids
    const [groupRows] = await queryInterface.sequelize.query(
      `SELECT id, group_id FROM group_wallets WHERE group_id IN (${groupIds.map(g => `'${g}'`).join(',')})`
    );
    const groupWalletMap = groupRows.reduce((acc, r) => { acc[r.group_id] = r.id; return acc; }, {});

    // Get invoice ids so we can reference them for expenses
    const [invoiceRows] = await queryInterface.sequelize.query(`SELECT id, invoice_number, group_id FROM invoices`);
    const invoicesByGroup = invoiceRows.reduce((acc, r) => {
      acc[r.group_id] = acc[r.group_id] || [];
      acc[r.group_id].push(r);
      return acc;
    }, {});

    const toInsert = [];

    for (const group of Object.values(MASTER_SEED_DATA.groups)) {
      const walletId = groupWalletMap[group.id];
      if (!walletId) continue;

      // Skip if there are already recent transactions for this wallet
      const [[existingCount]] = await queryInterface.sequelize.query(
        `SELECT COUNT(*)::int as count FROM group_wallet_transactions WHERE wallet_id = '${walletId}'`
      );
      if (existingCount.count > 0) continue;

      // Deposit (initial funding)
      toInsert.push({
        id: uuidv4(),
        wallet_id: walletId,
        type: 'deposit',
        amount: group.fund_balance || 0,
        description: 'Initial group fund (seed)',
        reference_id: null,
        created_by: group.created_by,
        created_at: MASTER_SEED_DATA.dates.systemStart,
        updated_at: MASTER_SEED_DATA.dates.systemStart
      });

      // If this group has invoices, create an expense referencing the latest invoice
      const groupInvoices = invoicesByGroup[group.id] || [];
      if (groupInvoices.length > 0) {
        const latestInvoice = groupInvoices[0];
        toInsert.push({
          id: uuidv4(),
          wallet_id: walletId,
          type: 'expense',
          amount: latestInvoice.total_amount || 0,
          description: `Auto expense for invoice ${latestInvoice.invoice_number}`,
          reference_id: latestInvoice.id,
          created_by: group.created_by,
          created_at: MASTER_SEED_DATA.dates.now,
          updated_at: MASTER_SEED_DATA.dates.now
        });
      }
    }

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('group_wallet_transactions', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} group wallet transactions`);
    } else {
      console.log('⏩ Group wallet transactions already exist or wallets missing');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('group_wallet_transactions', null, {});
  }
};
