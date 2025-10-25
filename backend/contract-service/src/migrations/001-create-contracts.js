// src/migrations/001-create-contracts.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contracts', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      contract_type: {
        type: DataTypes.ENUM('co_ownership', 'amendment', 'termination', 'renewal'),
        allowNull: false
      },
      contract_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('draft', 'pending_signatures', 'active', 'expired', 'terminated', 'executed'),
        defaultValue: 'draft'
      },
      effective_date: {
        type: DataTypes.DATEONLY
      },
      expiry_date: {
        type: DataTypes.DATEONLY
      },
      auto_renew: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      parent_contract_id: {
        type: DataTypes.UUID,
        references: {
          model: 'contracts',
          key: 'id'
        }
      },
      activated_at: {
        type: DataTypes.DATE
      },
      terminated_at: {
        type: DataTypes.DATE
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

    await queryInterface.addIndex('contracts', ['group_id']);
    await queryInterface.addIndex('contracts', ['status']);
    await queryInterface.addIndex('contracts', ['expiry_date']);
    await queryInterface.addIndex('contracts', ['contract_number']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contracts');
  }
};