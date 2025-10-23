import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking_conflicts', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      booking_id_1: {
        type: DataTypes.UUID,
        references: {
          model: 'bookings',
          key: 'id'
        }
      },
      booking_id_2: {
        type: DataTypes.UUID,
        references: {
          model: 'bookings',
          key: 'id'
        }
      },
      conflict_type: {
        type: DataTypes.ENUM('TIME_OVERLAP', 'VEHICLE_UNAVAILABLE', 'USER_QUOTA_EXCEEDED', 'MAINTENANCE_SCHEDULE', 'GROUP_RESTRICTION'),
        allowNull: false
      },
      resolved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      resolution_note: {
        type: DataTypes.TEXT
      },
      resolved_by: {
        type: DataTypes.UUID
      },
      resolved_at: {
        type: DataTypes.DATE
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

    await queryInterface.addIndex('booking_conflicts', ['booking_id_1']);
    await queryInterface.addIndex('booking_conflicts', ['booking_id_2']);
    await queryInterface.addIndex('booking_conflicts', ['conflict_type']);
    await queryInterface.addIndex('booking_conflicts', ['resolved']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('booking_conflicts');
  }
};