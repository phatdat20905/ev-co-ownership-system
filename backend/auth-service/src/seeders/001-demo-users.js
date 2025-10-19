import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('123456', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        email: 'admin@evcoownership.com',
        phone: '+84123456789',
        password_hash: passwordHash,
        role: 'admin',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'staff@evcoownership.com',
        phone: '+84123456780',
        password_hash: passwordHash,
        role: 'staff',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        email: 'user1@example.com',
        phone: '+84123456781',
        password_hash: passwordHash,
        role: 'co_owner',
        is_verified: true,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};