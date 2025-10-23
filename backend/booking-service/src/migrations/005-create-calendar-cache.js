import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('calendar_cache', {
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
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      time_slots: {
        type: DataTypes.JSONB,
        allowNull: false
      },
      cached_at: {
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

    await queryInterface.addIndex('calendar_cache', ['vehicle_id', 'date'], {
      unique: true
    });
    await queryInterface.addIndex('calendar_cache', ['vehicle_id']);
    await queryInterface.addIndex('calendar_cache', ['date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('calendar_cache');
  }
};