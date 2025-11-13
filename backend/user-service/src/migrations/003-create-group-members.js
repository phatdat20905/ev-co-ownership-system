// src/migrations/003-create-group-members.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_members', {
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      ownership_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('admin', 'member'),
        defaultValue: 'member',
        allowNull: false
      },
      joined_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      left_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      }
    });

    await queryInterface.addIndex('group_members', ['group_id', 'user_id'], {
      unique: true,
      name: 'idx_group_members_unique'
    });

    await queryInterface.addIndex('group_members', ['user_id'], {
      name: 'idx_group_members_user_id'
    });

    await queryInterface.addIndex('group_members', ['group_id'], {
      name: 'idx_group_members_group_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_members');
  }
};