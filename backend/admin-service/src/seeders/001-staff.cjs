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

    // If there are no staff users in master data, nothing to seed
    if (!Array.isArray(staffUsers) || staffUsers.length === 0) {
      console.log('No staff users found in MASTER_SEED_DATA — skipping staff seeder');
      return;
    }
    
    staffUsers.forEach((staff, index) => {
      const permissions = {
        user_management: index === 0,
        dispute_management: true,
        kyc_approval: true,
        system_settings: false,
        reports_view: index === 0,
        analytics_view: index === 0
      };

      // include optional contact fields (if master-data has them)
      const contact = MASTER_SEED_DATA.users[staff.key] || {};
      staffRecords.push({
        id: uuidv4(),
        user_id: staff.id,
        employee_id: `EMP${2024}${String(index + 1).padStart(3, '0')}`,
        position: index === 0 ? 'Customer Support Lead' : 'Customer Support Officer',
        department: index === 0 ? 'support' : 'operations',
        hire_date: MASTER_SEED_DATA.dates.staffCreated,
        is_active: true,
        permissions: JSON.stringify(permissions),
        // optional denormalized contact fields; will only be inserted if the DB table has these columns
        email: contact.email || null,
        phone: contact.phone || null,
        created_at: MASTER_SEED_DATA.dates.staffCreated,
        updated_at: MASTER_SEED_DATA.dates.now
      });
    });

    // Idempotent insert: avoid duplicate staff_profiles for the same user
    if (staffRecords.length === 0) {
      console.log('No staff records to insert');
      return;
    }

    const userIds = staffRecords.map(s => `'${s.user_id}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT user_id FROM staff_profiles WHERE user_id IN (${userIds})`
    );
    const existingUserIds = existing.map(r => r.user_id);
    const toInsert = staffRecords.filter(s => !existingUserIds.includes(s.user_id));

    if (toInsert.length > 0) {
      // Describe table to check whether optional contact columns exist (safe: won't fail on older schemas)
      const tableDesc = await queryInterface.describeTable('staff_profiles');
      const tableCols = Object.keys(tableDesc || {});

      // Only keep keys that exist in the DB table to avoid insertion errors
      const safeRows = toInsert.map((row) => {
        const safeRow = {};
        Object.keys(row).forEach((k) => {
          // keep only columns that exist in the table
          if (tableCols.includes(k)) {
            safeRow[k] = row[k];
          }
        });
        return safeRow;
      });

      // Filter out any completely-empty rows (defensive)
      const finalRows = safeRows.filter(r => Object.keys(r).length > 0);
      if (finalRows.length > 0) {
        await queryInterface.bulkInsert('staff_profiles', finalRows, {});
      }
    }

    console.log(`✅ Seeded ${toInsert.length} staff profiles (inserted), ${staffRecords.length - toInsert.length} already existed`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('staff_profiles', null, {});
  }
};
