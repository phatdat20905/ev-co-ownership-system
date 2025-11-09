import { hashPassword } from '../utils/bcrypt.js';

export default {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await hashPassword('123456');
    
    const users = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@evcoownership.com',
        phone: '+84123456789',
        password_hash: hashedPassword,
        role: 'admin',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'staff@evcoownership.com',
        phone: '+84123456780',
        password_hash: hashedPassword,
        role: 'staff',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        email: 'coowner1@example.com',
        phone: '+84123456781',
        password_hash: hashedPassword,
        role: 'co_owner',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        email: 'coowner2@example.com',
        phone: '+84123456782',
        password_hash: hashedPassword,
        role: 'co_owner',
        is_verified: false,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};