'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get parties for active contracts from contract_parties
    const [rows] = await queryInterface.sequelize.query(
      `SELECT p.contract_id, p.user_id, p.signing_order
       FROM contract_parties p
       JOIN contracts c ON c.id = p.contract_id
       WHERE c.status = 'active'
       ORDER BY p.contract_id, p.signing_order`
    );

    if (!rows || rows.length === 0) {
      console.log('⏩ No contract parties found for active contracts — skipping signatures seeder');
      return;
    }

    // Group parties by contract
    const partiesByContract = rows.reduce((acc, r) => {
      acc[r.contract_id] = acc[r.contract_id] || [];
      acc[r.contract_id].push(r);
      return acc;
    }, {});

    // Avoid duplicating signatures — load existing (contract_id, user_id) from signature_logs
    const contractIds = Object.keys(partiesByContract).map(id => `'${id}'`).join(',');
    const [existingSignatures] = await queryInterface.sequelize.query(
      `SELECT contract_id, user_id FROM signature_logs WHERE contract_id IN (${contractIds})`
    );
    const existingSet = new Set(existingSignatures.map(s => `${s.contract_id}::${s.user_id}`));

    const signatures = [];
    Object.entries(partiesByContract).forEach(([contractId, parties]) => {
      parties.forEach((party, index) => {
        const key = `${contractId}::${party.user_id}`;
        if (existingSet.has(key)) return; // already signed/seeded

        signatures.push({
          id: uuidv4(),
          contract_id: contractId,
          user_id: party.user_id,
          signature_data: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
          ip_address: `192.168.1.${100 + (party.signing_order || index)}`,
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          signed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    });

    if (signatures.length > 0) {
      await queryInterface.bulkInsert('signature_logs', signatures, {});
    }

    console.log(`✅ Seeded ${signatures.length} contract signatures`);
  },

  async down(queryInterface, Sequelize) {
    // remove signature_logs entries created by this seeder (best-effort)
    const contractNumbers = ['CONTRACT-2024-001','CONTRACT-2024-002','CONTRACT-2024-003'];
    const [contracts] = await queryInterface.sequelize.query(
      `SELECT id FROM contracts WHERE contract_number IN (${contractNumbers.map(n => `'${n}'`).join(',')})`
    );
    if (!contracts || contracts.length === 0) return;
    const ids = contracts.map(c => c.id);
    await queryInterface.bulkDelete('signature_logs', { contract_id: ids }, {});
  }
};
