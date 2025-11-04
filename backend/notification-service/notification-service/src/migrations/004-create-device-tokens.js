// src/migrations/004-create-device-tokens.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_tokens', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      },
      platform: {
        type: DataTypes.ENUM('ios', 'android', 'web'),
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('device_tokens', ['user_id']);
    await queryInterface.addIndex('device_tokens', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('device_tokens');
  }
};