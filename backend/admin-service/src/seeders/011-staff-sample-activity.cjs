'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create a few recent resolved disputes and KYC verifications assigned to staff
    // Also set a small sample managed_vehicles_count for demo purposes
    const staffRows = await queryInterface.sequelize.query(
      `SELECT id, user_id FROM staff_profiles`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!Array.isArray(staffRows) || staffRows.length === 0) {
      console.log('No staff_profiles found — skipping sample activity seeder');
      return;
    }

    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const disputeRows = [];
    const kycRows = [];
    const updates = [];

    // For demo, populate samples for up to first 3 staff
    const demoStaff = staffRows.slice(0, 3);
    demoStaff.forEach((s, idx) => {
      // Choose fallback values when user_id not present on staff row
      const filedBy = s.user_id || uuidv4();
      const kycUserId = s.user_id || uuidv4();
      const groupId = uuidv4();

      // Add one resolved dispute within the monthly window
      disputeRows.push({
        id: uuidv4(),
        dispute_number: `D-${Date.now()}-${idx + 1}`,
        title: `Demo resolved dispute ${idx + 1}`,
        description: 'Automatically inserted demo resolved dispute for dashboard demo',
        dispute_type: 'booking_conflict',
        priority: 'medium',
        filed_by: filedBy,
        against_user: null,
        group_id: groupId,
        assigned_to: s.id,
        status: 'resolved',
        resolution: 'Resolved by demo seeder',
        resolved_at: threeDaysAgo,
        created_at: fiveDaysAgo,
        updated_at: threeDaysAgo
      });

      // Add one KYC verification completed by staff
      kycRows.push({
        id: uuidv4(),
        user_id: kycUserId,
        id_card_number: `ID-${Math.floor(Math.random() * 1000000)}`,
        verification_status: 'approved',
        verified_by: s.id,
        verified_at: threeDaysAgo,
        submitted_at: threeDaysAgo,
        created_at: threeDaysAgo,
        updated_at: threeDaysAgo
      });

      // Set a sample managed_vehicles_count (1..3)
      updates.push({ id: s.id, count: (idx % 3) + 1 });
    });

    const trx = await queryInterface.sequelize.transaction();
    try {
      // Avoid inserting duplicate KYC records: check existing user_ids first
      if (kycRows.length > 0) {
        const kycUserIds = kycRows.map(k => k.user_id);
        const existingKyc = await queryInterface.sequelize.query(
          `SELECT user_id FROM kyc_verifications WHERE user_id IN (:ids)`,
          { replacements: { ids: kycUserIds }, type: Sequelize.QueryTypes.SELECT, transaction: trx }
        );

        const existingIds = new Set(existingKyc.map(r => r.user_id));
        const kycToInsert = kycRows.filter(k => !existingIds.has(k.user_id));

        if (kycToInsert.length > 0) {
          await queryInterface.bulkInsert('kyc_verifications', kycToInsert, { transaction: trx });
        }
      }

      // Disputes are typically non-unique by user; insert all demo disputes if not present
      if (disputeRows.length > 0) {
        // to be safe, only insert disputes that don't already have the same dispute_number
        const disputeNumbers = disputeRows.map(d => d.dispute_number);
        const existingDisputes = await queryInterface.sequelize.query(
          `SELECT dispute_number FROM disputes WHERE dispute_number IN (:nums)`,
          { replacements: { nums: disputeNumbers }, type: Sequelize.QueryTypes.SELECT, transaction: trx }
        );

        const existingNums = new Set(existingDisputes.map(r => r.dispute_number));
        const disputesToInsert = disputeRows.filter(d => !existingNums.has(d.dispute_number));

        if (disputesToInsert.length > 0) {
          await queryInterface.bulkInsert('disputes', disputesToInsert, { transaction: trx });
        }
      }

      for (const u of updates) {
        await queryInterface.sequelize.query(
          `UPDATE staff_profiles SET managed_vehicles_count = ? WHERE id = ?`,
          { replacements: [u.count, u.id], transaction: trx }
        );
      }

      await trx.commit();
      console.log('✅ Inserted demo disputes/kyc and updated managed_vehicles_count for sample staff');
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    // Best-effort cleanup: remove demo disputes/kyc rows inserted by this seeder
    await queryInterface.sequelize.query("DELETE FROM disputes WHERE title LIKE 'Demo resolved dispute %'");
    await queryInterface.sequelize.query("DELETE FROM kyc_verifications WHERE result = 'approved' AND created_at >= NOW() - INTERVAL '7 days'");
  }
};
