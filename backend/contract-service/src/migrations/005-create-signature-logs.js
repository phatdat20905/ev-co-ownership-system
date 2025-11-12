// src/migrations/005-create-signature-logs.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('signature_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      contract_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'contracts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      signature_data: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      signed_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      ip_address: {
        type: DataTypes.STRING(45)
      },
      user_agent: {
        type: DataTypes.TEXT
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('signature_logs', ['contract_id']);
    await queryInterface.addIndex('signature_logs', ['user_id']);
    await queryInterface.addIndex('signature_logs', ['signed_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('signature_logs');
  }
};