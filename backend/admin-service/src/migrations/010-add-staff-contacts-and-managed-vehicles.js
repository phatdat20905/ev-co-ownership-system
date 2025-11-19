'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Add optional contact fields and a managed vehicles count to staff_profiles
    await queryInterface.addColumn('staff_profiles', 'email', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('staff_profiles', 'phone', {
      type: Sequelize.STRING(50),
      allowNull: true
    });

    await queryInterface.addColumn('staff_profiles', 'managed_vehicles_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // add indexes for email and phone to make lookups faster (optional)
    await queryInterface.addIndex('staff_profiles', ['email']);
    await queryInterface.addIndex('staff_profiles', ['phone']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('staff_profiles', ['phone']);
    await queryInterface.removeIndex('staff_profiles', ['email']);

    await queryInterface.removeColumn('staff_profiles', 'managed_vehicles_count');
    await queryInterface.removeColumn('staff_profiles', 'phone');
    await queryInterface.removeColumn('staff_profiles', 'email');
  }
};
