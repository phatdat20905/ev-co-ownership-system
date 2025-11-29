// src/migrations/005-add-indexes.js
export default {
  async up(queryInterface, Sequelize) {
    // Additional indexes for performance
    await queryInterface.addIndex('notifications', ['user_id', 'status']);
    await queryInterface.addIndex('notifications', ['created_at', 'status']);
    await queryInterface.addIndex('device_tokens', ['user_id', 'is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('notifications', ['user_id', 'status']);
    await queryInterface.removeIndex('notifications', ['created_at', 'status']);
    await queryInterface.removeIndex('device_tokens', ['user_id', 'is_active']);
  }
};