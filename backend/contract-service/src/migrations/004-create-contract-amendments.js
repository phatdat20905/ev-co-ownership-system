// src/migrations/004-create-contract-amendments.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contract_amendments', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      original_contract_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'contracts',
          key: 'id'
        }
      },
      amendment_contract_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'contracts',
          key: 'id'
        }
      },
      amendment_reason: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      changes_summary: {
        type: DataTypes.TEXT
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('contract_amendments', ['original_contract_id']);
    await queryInterface.addIndex('contract_amendments', ['amendment_contract_id'], {
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contract_amendments');
  }
};