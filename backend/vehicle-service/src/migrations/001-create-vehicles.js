// src/migrations/001-create-vehicles.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      vehicle_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      brand: {
        type: DataTypes.STRING(100)
      },
      model: {
        type: DataTypes.STRING(100)
      },
      year: {
        type: DataTypes.INTEGER
      },
      license_plate: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      vin: {
        type: DataTypes.STRING(17),
        unique: true
      },
      color: {
        type: DataTypes.STRING(50)
      },
      battery_capacity_kwh: {
        type: DataTypes.DECIMAL(6, 2)
      },
      current_odometer: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      status: {
        type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'unavailable'),
        defaultValue: 'available'
      },
      purchase_date: {
        type: DataTypes.DATEONLY
      },
      purchase_price: {
        type: DataTypes.DECIMAL(15, 2)
      },
      images: {
        type: DataTypes.JSONB,
        defaultValue: []
      },
      specifications: {
        type: DataTypes.JSONB,
        defaultValue: {}
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

    await queryInterface.addIndex('vehicles', ['group_id']);
    await queryInterface.addIndex('vehicles', ['status']);
    await queryInterface.addIndex('vehicles', ['license_plate']);
    await queryInterface.addIndex('vehicles', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vehicles');
  }
};