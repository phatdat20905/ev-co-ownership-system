'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  const insurancePolicies = [
      // Tesla Model 3 - Active insurance
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        insurance_provider: 'Bảo Việt',
        policy_number: 'BV-VCX-2024-001234',
        coverage_type: 'comprehensive',
        premium_amount: 15000000,
        start_date: new Date('2024-02-15T00:00:00Z'),
        end_date: new Date('2025-02-14T23:59:59Z'),
        is_active: true,
        document_url: 'https://storage.evcoownership.com/insurance/BV-VCX-2024-001234.pdf',
        created_at: new Date('2024-02-10T08:00:00Z'),
        updated_at: new Date('2024-02-15T08:00:00Z')
      },
      
      // VinFast VF e34 - Active insurance
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        insurance_provider: 'PTI',
        policy_number: 'PTI-AUTO-2024-005678',
        coverage_type: 'comprehensive',
        premium_amount: 9500000,
        start_date: new Date('2024-03-25T00:00:00Z'),
        end_date: new Date('2025-03-24T23:59:59Z'),
        is_active: true,
        document_url: 'https://storage.evcoownership.com/insurance/PTI-AUTO-2024-005678.pdf',
        created_at: new Date('2024-03-20T08:00:00Z'),
        updated_at: new Date('2024-03-25T08:00:00Z')
      },
      
      // Hyundai Ioniq 5 - Active insurance
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        insurance_provider: 'MIC',
        policy_number: 'MIC-VCX-2024-009012',
        coverage_type: 'comprehensive',
        premium_amount: 18000000,
        start_date: new Date('2024-02-20T00:00:00Z'),
        end_date: new Date('2025-02-19T23:59:59Z'),
        is_active: true,
        document_url: 'https://storage.evcoownership.com/insurance/MIC-VCX-2024-009012.pdf',
        created_at: new Date('2024-02-15T08:00:00Z'),
        updated_at: new Date('2024-02-20T08:00:00Z')
      }
    ];

    // Insert into migration table `vehicle_insurance` and map fields
    const mapped = insurancePolicies.map(p => ({
      id: p.id,
      vehicle_id: p.vehicle_id,
      insurance_provider: p.insurance_provider,
      policy_number: p.policy_number,
      coverage_type: p.coverage_type,
      premium_amount: p.premium_amount,
      start_date: p.start_date,
      end_date: p.end_date,
      is_active: p.is_active,
      document_url: p.document_url,
      created_at: p.created_at,
      updated_at: p.updated_at
    }));

    // Idempotent insert: only insert policies that don't already exist by policy_number
    const policyNumbers = mapped.map(p => p.policy_number);
    const existing = await queryInterface.sequelize.query(
      `SELECT policy_number FROM vehicle_insurance WHERE policy_number IN (:policyNumbers)`,
      { replacements: { policyNumbers }, type: Sequelize.QueryTypes.SELECT }
    );

    const existingNumbers = existing.map(r => r.policy_number);
    const policiesToInsert = mapped.filter(p => !existingNumbers.includes(p.policy_number));

    if (policiesToInsert.length > 0) {
      await queryInterface.bulkInsert('vehicle_insurance', policiesToInsert, {});
      console.log(`✅ Seeded ${policiesToInsert.length} vehicle insurance records`);
      policiesToInsert.forEach(p => console.log(`   - ${p.policy_number} (${p.insurance_provider}) - ${Number(p.premium_amount).toLocaleString('vi-VN')}đ/năm`));
    } else {
      console.log('⏩ Vehicle insurance policies already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('insurance_policies', null, {});
  }
};
