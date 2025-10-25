import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('charging_sessions', {
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      charging_station_location: {
        type: DataTypes.STRING(255)
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      end_time: {
        type: DataTypes.DATE
      },
      start_battery_level: {
        type: DataTypes.DECIMAL(5, 2)
      },
      end_battery_level: {
        type: DataTypes.DECIMAL(5, 2)
      },
      energy_consumed_kwh: {
        type: DataTypes.DECIMAL(8, 2)
      },
      cost: {
        type: DataTypes.DECIMAL(10, 2)
      },
      payment_method: {
        type: DataTypes.STRING(50)
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

    await queryInterface.addIndex('charging_sessions', ['vehicle_id']);
    await queryInterface.addIndex('charging_sessions', ['user_id']);
    await queryInterface.addIndex('charging_sessions', ['start_time']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('charging_sessions');
  }
};
