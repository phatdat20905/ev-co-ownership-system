"use strict";

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Dev-only seeder: insert a couple of payment records with qrCodeUrl/paymentUrl for frontend testing
    // Pick a few existing cost_splits to attach to
    const [splits] = await queryInterface.sequelize.query(
      `SELECT id, user_id, cost_id, split_amount as amount FROM cost_splits LIMIT 3`
    );

    if (!splits || splits.length === 0) {
      console.log('⏩ No cost_splits found - skipping dev payment seed');
      return;
    }

    const toInsert = [];

    for (let i = 0; i < splits.length; i++) {
      const s = splits[i];
      const id = uuidv4();
      const isQr = i % 2 === 0;
      const txn = `DEV-TXN-${Date.now()}-${i}`;
      const gatewayResponse = isQr ? { qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=DEV-QR' } : { paymentUrl: 'https://example.com/dev-pay-link' };

      toInsert.push({
        id,
        cost_split_id: s.id,
        user_id: s.user_id,
        amount: s.amount || 10000,
        payment_method: isQr ? 'bank_transfer' : 'vnpay',
        transaction_id: txn,
        payment_status: 'pending',
        payment_date: null,
        payment_url: !isQr ? gatewayResponse.paymentUrl : null,
        gateway_response: JSON.stringify(gatewayResponse),
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // Insert if not already present (check by transaction_id)
    const txnIds = toInsert.map(p => `'${p.transaction_id}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT transaction_id FROM payments WHERE transaction_id IN (${txnIds})`
    );
    const existingSet = new Set(existing.map(r => r.transaction_id));
    const filtered = toInsert.filter(p => !existingSet.has(p.transaction_id));

    if (filtered.length > 0) {
      await queryInterface.bulkInsert('payments', filtered, {});
      console.log(`✅ Seeded ${filtered.length} dev payment samples`);
    } else {
      console.log('⏩ Dev payment samples already exist - nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove dev payments by transaction_id prefix
    await queryInterface.sequelize.query(`DELETE FROM payments WHERE transaction_id LIKE 'DEV-TXN-%'`);
    console.log('✅ Removed dev payment samples');
  }
};
