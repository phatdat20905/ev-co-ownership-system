'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('co_ownership_groups', 'group_rules', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Group rules and guidelines for members'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('co_ownership_groups', 'group_rules');
  }
};
