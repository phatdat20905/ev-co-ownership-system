// src/seeders/003-demo-user-wallets.js
export default {
  async up(queryInterface, Sequelize) {
    // Create demo wallets for some test users
    await queryInterface.bulkInsert('user_wallets', [
      {
        id: 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa',
        user_id: '11111111-1111-1111-1111-111111111111', // Demo user 1
        balance: 1000000.00, // 1,000,000 VND
        currency: 'VND',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb',
        user_id: '22222222-2222-2222-2222-222222222222', // Demo user 2
        balance: 1500000.00, // 1,500,000 VND
        currency: 'VND',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'cccccccc-3333-3333-3333-cccccccccccc',
        user_id: '33333333-3333-3333-3333-333333333333', // Demo user 3
        balance: 800000.00, // 800,000 VND
        currency: 'VND',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_wallets', null, {});
  }
};