'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Pick a few existing disputes and assign them to staff and mark resolved recently
    const staffRows = await queryInterface.sequelize.query(
      `SELECT id FROM staff_profiles ORDER BY created_at LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!Array.isArray(staffRows) || staffRows.length === 0) {
      console.log('No staff_profiles found — skipping dispute assignment seeder');
      return;
    }

    const disputeRows = await queryInterface.sequelize.query(
      `SELECT id FROM disputes ORDER BY created_at DESC LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!Array.isArray(disputeRows) || disputeRows.length === 0) {
      console.log('No disputes found to update — skipping');
      return;
    }

    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const trx = await queryInterface.sequelize.transaction();
    try {
      for (let i = 0; i < Math.min(staffRows.length, disputeRows.length); i++) {
        const staffId = staffRows[i].id;
        const disputeId = disputeRows[i].id;

        await queryInterface.sequelize.query(
          `UPDATE disputes SET assigned_to = ?, status = 'resolved', created_at = ?, resolved_at = ?, updated_at = ? WHERE id = ?`,
          { replacements: [staffId, fiveDaysAgo, threeDaysAgo, now, disputeId], transaction: trx }
        );
      }

      await trx.commit();
      console.log('✅ Assigned existing disputes to staff and marked resolved (demo)');
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    // no-op for down; undoing assignments may be destructive
    console.log('012-assign-existing-disputes-to-staff: down() - no action');
  }
};
