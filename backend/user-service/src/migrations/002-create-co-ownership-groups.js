// src/migrations/002-create-co-ownership-groups.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('co_ownership_groups', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      group_name: {
        type: DataTypes.STRING(255),
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
      group_fund_balance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex('co_ownership_groups', ['created_by'], {
      name: 'idx_groups_created_by'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('co_ownership_groups');
  }
};