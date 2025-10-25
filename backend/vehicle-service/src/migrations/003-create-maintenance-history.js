// src/migrations/003-create-maintenance-history.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('maintenance_history', {
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
      maintenance_schedule_id: {
        type: DataTypes.UUID,
        references: {
          model: 'maintenance_schedules',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      maintenance_type: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      performed_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      odometer_reading: {
        type: DataTypes.INTEGER
      },
      cost: {
        type: DataTypes.DECIMAL(15, 2)
      },
      service_provider: {
        type: DataTypes.STRING(255)
      },
      description: {
        type: DataTypes.TEXT
      },
      receipt_url: {
        type: DataTypes.STRING(500)
      },
      performed_by: {
        type: DataTypes.UUID,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('maintenance_history', ['vehicle_id']);
    await queryInterface.addIndex('maintenance_history', ['performed_date']);
    await queryInterface.addIndex('maintenance_history', ['maintenance_schedule_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('maintenance_history');
  }
};