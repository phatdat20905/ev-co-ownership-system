// src/seeders/004-demo-group-wallets.js
export default {
  async up(queryInterface, Sequelize) {
    // Create demo group wallets
    await queryInterface.bulkInsert('group_wallets', [
      {
        id: 'dddddddd-4444-4444-4444-dddddddddddd',
        group_id: '44444444-4444-4444-4444-444444444444', // Demo group 1
        balance: 5000000.00, // 5,000,000 VND
        currency: 'VND',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'eeeeeeee-5555-5555-5555-eeeeeeeeeeee',
        group_id: '55555555-5555-5555-5555-555555555555', // Demo group 2
        balance: 3000000.00, // 3,000,000 VND
        currency: 'VND',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('group_wallets', null, {});
  }
};