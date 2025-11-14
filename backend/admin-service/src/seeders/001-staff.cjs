'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const staffRecords = [];
    
    // Get staff users
    const staffUsers = Object.keys(MASTER_SEED_DATA.users)
      .filter(key => MASTER_SEED_DATA.users[key].role === 'staff')
      .map(key => ({
        key,
        ...MASTER_SEED_DATA.users[key]
      }));
    
    staffUsers.forEach((staff, index) => {
      const permissions = {
        user_management: index === 0,
        dispute_management: true,
        kyc_approval: true,
        system_settings: false,
        reports_view: index === 0,
        analytics_view: index === 0
      };

      staffRecords.push({
        id: uuidv4(),
        user_id: staff.id,
        employee_id: `EMP${2024}${String(index + 1).padStart(3, '0')}`,
        position: index === 0 ? 'Customer Support Lead' : 'Customer Support Officer',
        department: index === 0 ? 'support' : 'operations',
        hire_date: MASTER_SEED_DATA.dates.staffCreated,
        is_active: true,
        permissions: JSON.stringify(permissions),
        created_at: MASTER_SEED_DATA.dates.staffCreated,
        updated_at: MASTER_SEED_DATA.dates.now
      });
    });

    // Idempotent insert: avoid duplicate staff_profiles for the same user
    const userIds = staffRecords.map(s => `'${s.user_id}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT user_id FROM staff_profiles WHERE user_id IN (${userIds})`
    );
    const existingUserIds = existing.map(r => r.user_id);
    const toInsert = staffRecords.filter(s => !existingUserIds.includes(s.user_id));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('staff_profiles', toInsert, {});
    }

    console.log(`✅ Seeded ${toInsert.length} staff profiles (inserted), ${staffRecords.length - toInsert.length} already existed`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('staff_profiles', null, {});
  }
};
