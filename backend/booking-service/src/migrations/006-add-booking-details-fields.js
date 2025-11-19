// booking-service/src/migrations/006-add-booking-details-fields.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bookings', 'destination', {
      type: Sequelize.STRING(500),
      allowNull: true
    });

    await queryInterface.addColumn('bookings', 'estimated_distance', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Estimated distance in kilometers'
    });

    await queryInterface.addColumn('bookings', 'actual_distance', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Actual distance traveled in kilometers (from check-out)'
    });

    await queryInterface.addColumn('bookings', 'efficiency', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Efficiency in km/kWh (calculated after completion)'
    });

    await queryInterface.addColumn('bookings', 'cost', {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Total cost in VND (calculated after completion)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('bookings', 'destination');
    await queryInterface.removeColumn('bookings', 'estimated_distance');
    await queryInterface.removeColumn('bookings', 'actual_distance');
    await queryInterface.removeColumn('bookings', 'efficiency');
    await queryInterface.removeColumn('bookings', 'cost');
  }
};
