// src/migrations/005-create-system-settings.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('system_settings', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      setting_key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      setting_value: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      data_type: {
        type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
        allowNull: false,
        defaultValue: 'string'
      },
      category: {
        type: DataTypes.ENUM('general', 'notifications', 'billing', 'security', 'analytics'),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT
      },
      is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('system_settings', ['category']);
    await queryInterface.addIndex('system_settings', ['is_public']);
    await queryInterface.addIndex('system_settings', ['setting_key']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('system_settings');
  }
};