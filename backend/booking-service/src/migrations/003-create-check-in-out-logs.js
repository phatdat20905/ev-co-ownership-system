import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('check_in_out_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      booking_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id'
        }
      },
      action_type: {
        type: DataTypes.ENUM('check_in', 'check_out'),
        allowNull: false
      },
      odometer_reading: {
        type: DataTypes.INTEGER
      },
      fuel_level: {
        type: DataTypes.DECIMAL(5, 2)
      },
      images: {
        type: DataTypes.JSONB
      },
      notes: {
        type: DataTypes.TEXT
      },
      qr_code: {
        type: DataTypes.STRING(255)
      },
      digital_signature: {
        type: DataTypes.TEXT
      },
      performed_by: {
        type: DataTypes.UUID,
        allowNull: false
      },
      location: {
        type: DataTypes.JSONB
      },
      performed_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
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

    await queryInterface.addIndex('check_in_out_logs', ['booking_id']);
    await queryInterface.addIndex('check_in_out_logs', ['action_type']);
    await queryInterface.addIndex('check_in_out_logs', ['performed_by']);
    await queryInterface.addIndex('check_in_out_logs', ['qr_code']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('check_in_out_logs');
  }
};