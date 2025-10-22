// src/migrations/005-create-group-votes.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_votes', {
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
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      vote_type: {
        type: DataTypes.ENUM('upgrade', 'maintenance', 'insurance', 'sell_vehicle', 'other'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('open', 'closed', 'executed'),
        defaultValue: 'open',
        allowNull: false
      },
      deadline: {
        type: DataTypes.DATE,
        allowNull: false
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false
      },
      closed_at: {
        type: DataTypes.DATE,
        allowNull: true
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

    await queryInterface.addIndex('group_votes', ['group_id'], {
      name: 'idx_group_votes_group_id'
    });

    await queryInterface.addIndex('group_votes', ['status'], {
      name: 'idx_group_votes_status'
    });

    await queryInterface.addIndex('group_votes', ['deadline'], {
      name: 'idx_group_votes_deadline'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_votes');
  }
};