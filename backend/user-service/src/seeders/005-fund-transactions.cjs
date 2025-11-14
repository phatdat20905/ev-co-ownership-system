'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transactions = [
      // Group 1 - Monthly contributions (deposits)
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group1.id,
        transaction_type: 'deposit',
        amount: 2000000,
        description: 'Đóng góp quỹ tháng 11/2024',
        created_by: '33333333-3333-3333-3333-333333333331',
        created_at: new Date('2024-11-01T08:00:00Z')
      },
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group1.id,
        transaction_type: 'deposit',
        amount: 2000000,
        description: 'Đóng góp quỹ tháng 11/2024',
        created_by: '33333333-3333-3333-3333-333333333332',
        created_at: new Date('2024-11-01T08:00:00Z')
      },

      // Group 1 - Expense: Insurance payment (withdrawal)
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group1.id,
        transaction_type: 'withdrawal',
        amount: 15000000,
        description: 'Thanh toán bảo hiểm VCX Tesla Model 3',
        created_by: MASTER_SEED_DATA.groups.group1.created_by,
        created_at: new Date('2024-02-10T10:00:00Z')
      },

      // Group 2 - Monthly contributions (deposits)
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group2.id,
        transaction_type: 'deposit',
        amount: 1500000,
        description: 'Đóng góp quỹ tháng 11/2024',
        created_by: '44444444-4444-4444-4444-444444444441',
        created_at: new Date('2024-11-01T08:00:00Z')
      },
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group2.id,
        transaction_type: 'deposit',
        amount: 1500000,
        description: 'Đóng góp quỹ tháng 11/2024',
        created_by: '44444444-4444-4444-4444-444444444442',
        created_at: new Date('2024-11-01T08:00:00Z')
      },

      // Group 3 - Monthly contributions (deposits)
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group3.id,
        transaction_type: 'deposit',
        amount: 2500000,
        description: 'Đóng góp quỹ tháng 11/2024',
        created_by: '55555555-5555-5555-5555-555555555551',
        created_at: new Date('2024-11-01T08:00:00Z')
      },
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group3.id,
        transaction_type: 'deposit',
        amount: 2500000,
        description: 'Đóng góp quỹ tháng 11/2024',
        created_by: '55555555-5555-5555-5555-555555555552',
        created_at: new Date('2024-11-01T08:00:00Z')
      },

      // Group 3 - Expense: Maintenance (withdrawal)
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group3.id,
        transaction_type: 'withdrawal',
        amount: 8500000,
        description: 'Bảo dưỡng định kỳ 15,000km',
        created_by: MASTER_SEED_DATA.groups.group3.created_by,
        created_at: new Date('2024-10-20T09:00:00Z')
      }
    ];

    await queryInterface.bulkInsert('group_fund_transactions', transactions, {});
    
    console.log(`✅ Seeded ${transactions.length} group fund transactions`);
    console.log(`   - ${transactions.filter(t => t.transaction_type === 'deposit').length} deposits`);
    console.log(`   - ${transactions.filter(t => t.transaction_type === 'withdrawal').length} withdrawals`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('fund_transactions', null, {});
  }
};
