'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_profiles', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'other'),
      allowNull: true,
      after: 'date_of_birth'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_profiles', 'gender');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_user_profiles_gender";');
  }
};
