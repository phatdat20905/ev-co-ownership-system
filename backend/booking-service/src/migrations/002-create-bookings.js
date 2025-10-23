import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
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
        }
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'conflict'),
        defaultValue: 'pending'
      },
      priority_score: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      purpose: {
        type: DataTypes.STRING(500)
      },
      notes: {
        type: DataTypes.TEXT
      },
      cancellation_reason: {
        type: DataTypes.TEXT
      },
      auto_confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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

    await queryInterface.addIndex('bookings', ['vehicle_id']);
    await queryInterface.addIndex('bookings', ['user_id']);
    await queryInterface.addIndex('bookings', ['group_id']);
    await queryInterface.addIndex('bookings', ['start_time']);
    await queryInterface.addIndex('bookings', ['status']);
    await queryInterface.addIndex('bookings', ['user_id', 'start_time']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bookings');
  }
};