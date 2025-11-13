// src/migrations/002-create-disputes.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('disputes', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      dispute_number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      dispute_type: {
        type: DataTypes.ENUM('booking_conflict', 'cost_dispute', 'damage_claim', 'other'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('open', 'investigating', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'open'
      },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'medium'
      },
      filed_by: {
        type: DataTypes.UUID,
        allowNull: false
      },
      against_user: {
        type: DataTypes.UUID
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      assigned_to: {
        type: DataTypes.UUID,
        references: {
          model: 'staff_profiles',
          key: 'id'
        }
      },
      resolution: {
        type: DataTypes.TEXT
      },
      resolved_at: {
        type: DataTypes.DATE
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

    await queryInterface.addIndex('disputes', ['status']);
    await queryInterface.addIndex('disputes', ['priority']);
    await queryInterface.addIndex('disputes', ['assigned_to']);
    await queryInterface.addIndex('disputes', ['filed_by']);
    await queryInterface.addIndex('disputes', ['group_id']);
    await queryInterface.addIndex('disputes', ['created_at']);
    await queryInterface.addIndex('disputes', ['dispute_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('disputes');
  }
};