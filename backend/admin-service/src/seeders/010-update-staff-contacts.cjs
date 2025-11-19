'use strict';

const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Update existing staff_profiles rows with email/phone from MASTER_SEED_DATA
    const staffUsers = Object.keys(MASTER_SEED_DATA.users)
      .filter(key => MASTER_SEED_DATA.users[key].role === 'staff')
      .map(key => ({ key, ...MASTER_SEED_DATA.users[key] }));

    if (!staffUsers || staffUsers.length === 0) {
      console.log('No staff entries in MASTER_SEED_DATA — skipping update seeder');
      return;
    }

    // Describe table to ensure columns exist
    const tableDesc = await queryInterface.describeTable('staff_profiles');
    const hasEmail = !!tableDesc.email;
    const hasPhone = !!tableDesc.phone;

    if (!hasEmail && !hasPhone) {
      console.log('staff_profiles has no email/phone columns — skipping update');
      return;
    }

    const trx = await queryInterface.sequelize.transaction();
    try {
      for (const staff of staffUsers) {
        const updates = [];
        const params = [];
        if (hasEmail && staff.email) {
          updates.push('email = ?');
          params.push(staff.email);
        }
        if (hasPhone && staff.phone) {
          updates.push('phone = ?');
          params.push(staff.phone);
        }

        if (updates.length === 0) continue;

        params.push(staff.id);
        const sql = `UPDATE staff_profiles SET ${updates.join(', ')} WHERE user_id = ?`;
        await queryInterface.sequelize.query(sql, { replacements: params, transaction: trx });
      }

      await trx.commit();
      console.log('✅ Updated staff_profiles with contact fields where available');
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    // no-op (do not remove contact data on rollback)
    console.log('010-update-staff-contacts: down() - no action');
  }
};
