"use strict";

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Find the contracts we seeded earlier
    const contractNumbers = ['CONTRACT-2024-001','CONTRACT-2024-002','CONTRACT-2024-003'];
    const [contracts] = await queryInterface.sequelize.query(
      `SELECT id, group_id, contract_number, created_at FROM contracts WHERE contract_number IN (${contractNumbers.map(n => `'${n}'`).join(',')})`
    );

    if (!contracts || contracts.length === 0) {
      console.log('⏩ No contracts found to create parties for — skipping contract_parties seeder');
      return;
    }

    // Load existing contract_parties to ensure idempotency (unique contract_id + user_id)
    const contractIds = contracts.map(c => `'${c.id}'`).join(',');
    const [existingRows] = await queryInterface.sequelize.query(
      `SELECT contract_id, user_id FROM contract_parties WHERE contract_id IN (${contractIds})`
    );
    const existingSet = new Set(existingRows.map(r => `${r.contract_id}::${r.user_id}`));

    const toInsert = [];

    // Helper to find group key in MASTER_SEED_DATA by id
    function findGroupKeyById(id) {
      return Object.entries(MASTER_SEED_DATA.groups).find(([, g]) => g.id === id)?.[0];
    }

    for (const contract of contracts) {
      const groupKey = findGroupKeyById(contract.group_id);
      if (!groupKey) {
        console.warn(`No MASTER_SEED_DATA group found for group_id=${contract.group_id} — skipping`);
        continue;
      }

      const members = MASTER_SEED_DATA.groupMembers[groupKey];
      if (!members || members.length === 0) {
        console.warn(`No groupMembers defined for ${groupKey} — skipping`);
        continue;
      }

      // determine owner as member with highest ownership
      const maxOwnership = Math.max(...members.map(m => m.ownership || 0));

      members.forEach((m, idx) => {
        const key = `${contract.id}::${m.user_id}`;
        if (existingSet.has(key)) return; // already exists

        const partyRole = (m.ownership >= maxOwnership) ? 'owner' : 'co_owner';

        toInsert.push({
          id: uuidv4(),
          contract_id: contract.id,
          user_id: m.user_id,
          party_role: partyRole,
          ownership_percentage: m.ownership,
          signing_order: idx + 1,
          has_signed: false,
          signed_at: null,
          signature_data: null,
          created_at: contract.created_at || MASTER_SEED_DATA.dates.now,
          updated_at: contract.created_at || MASTER_SEED_DATA.dates.now
        });
      });
    }

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('contract_parties', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} contract parties`);
    } else {
      console.log('⏩ Contract parties already present — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    // remove only parties for our seeded contracts
    const contractNumbers = ['CONTRACT-2024-001','CONTRACT-2024-002','CONTRACT-2024-003'];
    const [contracts] = await queryInterface.sequelize.query(
      `SELECT id FROM contracts WHERE contract_number IN (${contractNumbers.map(n => `'${n}'`).join(',')})`
    );
    if (!contracts || contracts.length === 0) return;
    const ids = contracts.map(c => c.id);
    await queryInterface.bulkDelete('contract_parties', { contract_id: ids }, {});
  }
};
