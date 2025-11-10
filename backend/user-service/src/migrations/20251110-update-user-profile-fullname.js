// migrations/YYYYMMDDHHMMSS-update-user-profile-fullname.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change full_name to allow NULL
    await queryInterface.changeColumn('user_profiles', 'full_name', {
      type: Sequelize.STRING(255),
      allowNull: true, // Changed from false to true
      field: 'full_name'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to NOT NULL
    await queryInterface.changeColumn('user_profiles', 'full_name', {
      type: Sequelize.STRING(255),
      allowNull: false,
      field: 'full_name'
    });
  }
};
