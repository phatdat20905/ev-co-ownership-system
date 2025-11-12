// src/migrations/006-create-contract-templates.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contract_templates', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      template_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      template_type: {
        type: DataTypes.ENUM('co_ownership', 'amendment', 'termination'),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      variables: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      version: {
        type: DataTypes.STRING(20),
        defaultValue: '1.0'
      },
      created_by: {
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

    await queryInterface.addIndex('contract_templates', ['template_type']);
    await queryInterface.addIndex('contract_templates', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contract_templates');
  }
};