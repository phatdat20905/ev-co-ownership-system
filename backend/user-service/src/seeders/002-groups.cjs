'use strict';

const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const groups = Object.values(MASTER_SEED_DATA.groups).map((group, idx) => ({
      id: group.id,
      group_name: group.name,
      description: group.description,
      created_by: group.created_by,
      group_fund_balance: group.fund_balance,
      vehicle_id: idx === 0
        ? MASTER_SEED_DATA.vehicles.tesla.id
        : idx === 1
        ? MASTER_SEED_DATA.vehicles.vinfast.id
        : MASTER_SEED_DATA.vehicles.ioniq5.id, // Fixed: ioniq5 not hyundai
      is_active: true,
      created_at: idx === 0
        ? MASTER_SEED_DATA.dates.group1Created
        : idx === 1
        ? MASTER_SEED_DATA.dates.group2Created
        : MASTER_SEED_DATA.dates.group3Created,
      updated_at: MASTER_SEED_DATA.dates.now
    }));

    // Idempotent insert: only insert groups that don't already exist
    const groupIds = groups.map(g => g.id);
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM co_ownership_groups WHERE id IN (:groupIds)`,
      { replacements: { groupIds }, type: Sequelize.QueryTypes.SELECT }
    );

    const existingIds = existing.map(r => r.id);
    const groupsToInsert = groups.filter(g => !existingIds.includes(g.id));

    if (groupsToInsert.length > 0) {
      await queryInterface.bulkInsert('co_ownership_groups', groupsToInsert, {});
      console.log(`✅ Seeded ${groupsToInsert.length} co-ownership groups`);
    } else {
      console.log('⏩ Co-ownership groups already exist — nothing to do');
    }

    // Also ensure existing groups have vehicle_id set (idempotent update)
    try {
      for (const g of groups) {
        if (!g.vehicle_id) continue;
        await queryInterface.sequelize.query(
          `UPDATE co_ownership_groups SET vehicle_id = :vehicleId, updated_at = :updatedAt
           WHERE id = :id AND (vehicle_id IS NULL OR vehicle_id::text = '')`,
          { replacements: { vehicleId: g.vehicle_id, id: g.id, updatedAt: MASTER_SEED_DATA.dates.now }, type: Sequelize.QueryTypes.UPDATE }
        );
      }
      console.log('🔁 Ensured vehicle_id assigned for existing groups where missing');
    } catch (updateError) {
      console.error('Failed to update existing groups vehicle_id:', updateError.message || updateError);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('co_ownership_groups', null, {});
  }
};
