// src/migrations/004-create-group-fund-transactions.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_fund_transactions', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'co_ownership_groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transaction_type: {
        type: DataTypes.ENUM('deposit', 'withdrawal', 'allocation'),
        allowNull: false
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('group_fund_transactions', ['group_id'], {
      name: 'idx_fund_transactions_group_id'
    });

    await queryInterface.addIndex('group_fund_transactions', ['created_by'], {
      name: 'idx_fund_transactions_created_by'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_fund_transactions');
  }
};