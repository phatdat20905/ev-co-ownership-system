// src/migrations/006-add-service-provider-to-schedules.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('maintenance_schedules', 'service_provider', {
      type: DataTypes.STRING(255),
      allowNull: true,
      after: 'actual_cost'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('maintenance_schedules', 'service_provider');
  }
};
