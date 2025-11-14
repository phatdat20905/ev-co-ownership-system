"use strict";

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // We'll create wallet transactions that reference payments already seeded
    // Strategy: select recent payments, find corresponding user_wallet id by payment.user_id,
    // then insert transactions with related_payment_id = payment.id (idempotent: skip existing related_payment_id)

    const [payments] = await queryInterface.sequelize.query(
      `SELECT id, user_id, amount, payment_method, payment_status FROM payments ORDER BY created_at DESC LIMIT 20`
    );

    if (!payments || payments.length === 0) {
      console.log('⏩ No payments found to create wallet transactions');
      return;
    }

    // Get existing related_payment_ids to avoid duplicates
    const paymentIds = payments.map(p => `'${p.id}'`).join(',');
    const [existingRows] = await queryInterface.sequelize.query(
      `SELECT related_payment_id FROM wallet_transactions WHERE related_payment_id IN (${paymentIds})`
    );
    const existingSet = new Set(existingRows.map(r => r.related_payment_id).filter(Boolean));

    const toInsert = [];

    for (const p of payments) {
      if (existingSet.has(p.id)) continue;

      // find user wallet id for the payment.user_id
      const [[walletRow]] = await queryInterface.sequelize.query(
        `SELECT id FROM user_wallets WHERE user_id = '${p.user_id}' LIMIT 1`
      );
      if (!walletRow || !walletRow.id) continue; // no wallet for this user

      // Decide type: if payment used internal/e_wallet -> withdraw from user's wallet, else deposit
      const withdrawMethods = ['e_wallet', 'internal_wallet'];
      const type = withdrawMethods.includes(p.payment_method) ? 'withdraw' : 'deposit';

      toInsert.push({
        id: uuidv4(),
        wallet_id: walletRow.id,
        type,
        amount: p.amount || 0,
        related_payment_id: p.id,
        description: `Auto-seed txn for payment ${p.id}`,
        created_at: MASTER_SEED_DATA.dates.now,
        updated_at: MASTER_SEED_DATA.dates.now
      });
    }

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('wallet_transactions', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} wallet transactions`);
    } else {
      console.log('⏩ Wallet transactions already exist for found payments or no eligible wallets');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('wallet_transactions', null, {});
  }
};
