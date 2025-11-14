'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get some cost splits to create payments
    const [splits] = await queryInterface.sequelize.query(
      "SELECT id, cost_id, user_id, split_amount as amount FROM cost_splits LIMIT 15"
    );
    
    const payments = splits.map((split, index) => ({
      id: uuidv4(),
      cost_split_id: split.id,
      user_id: split.user_id,
      amount: split.amount,
      payment_method: ['e_wallet', 'bank_transfer', 'vnpay', 'internal_wallet'][index % 4],
      transaction_id: `TXN${Date.now()}${index}`,
      payment_status: index < 10 ? 'completed' : 'pending',
      // migration column is payment_date (not paid_at)
      payment_date: index < 10 ? new Date() : null,
      created_at: new Date(),
      updated_at: new Date()
    }));
    
    await queryInterface.bulkInsert('payments', payments, {});
    
    // Update split statuses
    const completedPayments = payments.filter(p => p.payment_status === 'completed');
    for (const payment of completedPayments) {
      // mark split as paid and set paid_amount/paid_at
      const paidAmount = Number(payment.amount) || 0;
      await queryInterface.sequelize.query(
        `UPDATE cost_splits SET payment_status = 'paid', paid_amount = ${paidAmount}, paid_at = CURRENT_TIMESTAMP WHERE id = '${payment.cost_split_id}'`
      );
    }
    
  console.log(`✅ Seeded ${payments.length} payments`);
  console.log(`   - ${payments.filter(p => p.payment_status === 'completed').length} completed`);
  console.log(`   - ${payments.filter(p => p.payment_status === 'pending').length} pending`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('payments', null, {});
  }
};
