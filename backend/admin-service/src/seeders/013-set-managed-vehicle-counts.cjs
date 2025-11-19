'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const staffRows = await queryInterface.sequelize.query(
      `SELECT id FROM staff_profiles ORDER BY created_at ASC`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!Array.isArray(staffRows) || staffRows.length === 0) {
      console.log('No staff_profiles found — skipping managed vehicle counts seeder');
      return;
    }

    const trx = await queryInterface.sequelize.transaction();
    try {
      for (let idx = 0; idx < staffRows.length; idx++) {
        const s = staffRows[idx];
        const count = (idx % 3) + 1; // sample 1..3
        await queryInterface.sequelize.query(
          `UPDATE staff_profiles SET managed_vehicles_count = ? WHERE id = ?`,
          { replacements: [count, s.id], transaction: trx }
        );
      }

      await trx.commit();
      console.log('✅ Set sample managed_vehicles_count values for staff_profiles');
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('013-set-managed-vehicle-counts: down() - no action');
  }
};
