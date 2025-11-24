'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get cost splits from 2025 costs to create payments
    const [splits] = await queryInterface.sequelize.query(
      `SELECT cs.id, cs.cost_id, cs.user_id, cs.split_amount as amount, c.cost_date 
       FROM cost_splits cs
       JOIN costs c ON cs.cost_id = c.id
       WHERE c.cost_date >= '2025-01-01' AND c.cost_date < '2026-01-01'
       ORDER BY c.cost_date DESC`
    );
    
    if (!splits || splits.length === 0) {
      console.log('⏩ No 2025 cost splits found - run cost seeders first');
      return;
    }

    const paymentMethods = ['e_wallet', 'bank_transfer', 'vnpay', 'internal_wallet'];
    const payments = [];
    
    // Create payments for each split with varied statuses
    splits.forEach((split, index) => {
      const costDate = new Date(split.cost_date);
      const monthsDiff = Math.floor((new Date('2025-11-21') - costDate) / (1000 * 60 * 60 * 24 * 30));
      
      // Determine payment status based on how old the cost is
      let paymentStatus;
      if (monthsDiff > 1) {
        // Older than 1 month: 80% paid, 15% pending, 5% failed
        const rand = Math.random();
        if (rand < 0.80) paymentStatus = 'completed';
        else if (rand < 0.95) paymentStatus = 'pending';
        else paymentStatus = 'failed';
      } else if (monthsDiff === 1) {
        // Last month: 60% paid, 30% pending, 10% failed
        const rand = Math.random();
        if (rand < 0.60) paymentStatus = 'completed';
        else if (rand < 0.90) paymentStatus = 'pending';
        else paymentStatus = 'failed';
      } else {
        // Current month: 30% paid, 60% pending, 10% failed
        const rand = Math.random();
        if (rand < 0.30) paymentStatus = 'completed';
        else if (rand < 0.90) paymentStatus = 'pending';
        else paymentStatus = 'failed';
      }
      
      const paymentDate = paymentStatus === 'completed' 
        ? new Date(costDate.getTime() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
        : null;
      
      const method = paymentMethods[index % 4];
      const gatewayResponse = method === 'vnpay' 
        ? { paymentUrl: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?txn=${Date.now()}${index}` }
        : method === 'bank_transfer'
        ? { qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PAY-${Date.now()}-${index}` }
        : {};
      
      payments.push({
        id: uuidv4(),
        cost_split_id: split.id,
        user_id: split.user_id,
        amount: split.amount || 0,
        payment_method: method,
        transaction_id: `TXN-2025-${Date.now()}-${index}`,
        payment_status: paymentStatus,
        payment_date: paymentDate,
        payment_url: method === 'vnpay' ? gatewayResponse.paymentUrl : null,
        gateway_response: Object.keys(gatewayResponse).length > 0 ? JSON.stringify(gatewayResponse) : null,
        created_at: new Date(costDate.getTime() + Math.floor(Math.random() * 24) * 60 * 60 * 1000),
        updated_at: paymentDate || new Date()
      });
    });
    
    // Check existing payments (prevent duplicates based on transaction_id)
    const txnIds = payments.map(p => `'${p.transaction_id}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT transaction_id FROM payments WHERE transaction_id IN (${txnIds})`
    );
    const existingSet = new Set(existing.map(r => r.transaction_id));
    const toInsert = payments.filter(p => !existingSet.has(p.transaction_id));
    
    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('payments', toInsert, {});
      
      // Update split statuses for completed payments
      const completedPayments = toInsert.filter(p => p.payment_status === 'completed');
      for (const payment of completedPayments) {
        const paidAmount = Number(payment.amount) || 0;
        await queryInterface.sequelize.query(
          `UPDATE cost_splits 
           SET payment_status = 'paid', paid_amount = ${paidAmount}, paid_at = CURRENT_TIMESTAMP 
           WHERE id = '${payment.cost_split_id}'`
        );
      }
      
      console.log(`✅ Seeded ${toInsert.length} payments for 2025`);
      console.log(`   - Completed: ${toInsert.filter(p => p.payment_status === 'completed').length}`);
      console.log(`   - Pending: ${toInsert.filter(p => p.payment_status === 'pending').length}`);
      console.log(`   - Failed: ${toInsert.filter(p => p.payment_status === 'failed').length}`);
      const totalAmount = toInsert.reduce((sum, p) => sum + p.amount, 0);
      console.log(`   - Total amount: ${totalAmount.toLocaleString('vi-VN')} VND`);
    } else {
      console.log('⏩ 2025 payments already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `DELETE FROM payments WHERE transaction_id LIKE 'TXN-2025-%'`
    );
  }
};
