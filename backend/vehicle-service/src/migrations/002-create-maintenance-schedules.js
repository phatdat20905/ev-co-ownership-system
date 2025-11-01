// src/migrations/002-create-maintenance-schedules.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('maintenance_schedules', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      maintenance_type: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      scheduled_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      odometer_at_schedule: {
        type: DataTypes.INTEGER
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'scheduled'
      },
      estimated_cost: {
        type: DataTypes.DECIMAL(15, 2)
      },
      actual_cost: {
        type: DataTypes.DECIMAL(15, 2)
      },
      notes: {
        type: DataTypes.TEXT
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('maintenance_schedules', ['vehicle_id']);
    await queryInterface.addIndex('maintenance_schedules', ['status']);
    await queryInterface.addIndex('maintenance_schedules', ['scheduled_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('maintenance_schedules');
  }
};