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
      license_plate: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
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
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('vehicles', ['group_id']);
    await queryInterface.addIndex('vehicles', ['status']);
    await queryInterface.addIndex('vehicles', ['license_plate']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vehicles');
  }
};