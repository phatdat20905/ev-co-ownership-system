'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const kycData = [
      // Group 1 members - APPROVED
      {
        id: uuidv4(),
        user_id: '33333333-3333-3333-3333-333333333331',
        id_card_number: '079088001234',
  id_card_front_url: '/uploads/kyc/33333333-3333-3333-3333-333333333331-idCardFront-1763751371436.png',
  id_card_back_url: '/uploads/kyc/33333333-3333-3333-3333-333333333331-idCardBack-1763751371444.png',
  driver_license_number: 'DL079088001234',
  driver_license_url: '/uploads/kyc/33333333-3333-3333-3333-333333333331-driverLicense-1763751371444.png',
  verification_status: 'approved',
  verified_by: '11111111-1111-1111-1111-111111111111',
  verified_at: MASTER_SEED_DATA.dates.group1Created,
  rejection_reason: null,
        created_at: MASTER_SEED_DATA.dates.group1Created,
        updated_at: MASTER_SEED_DATA.dates.group1Created
      },
      {
        id: uuidv4(),
        user_id: '33333333-3333-3333-3333-333333333332',
        id_card_number: '079088005678',
  id_card_front_url: 'https://storage.evcoownership.com/kyc/079088005678_front.jpg',
  id_card_back_url: 'https://storage.evcoownership.com/kyc/079088005678_back.jpg',
  verification_status: 'approved',
  verified_by: '11111111-1111-1111-1111-111111111111',
  verified_at: MASTER_SEED_DATA.dates.group1Created,
  rejection_reason: null,
        created_at: MASTER_SEED_DATA.dates.group1Created,
        updated_at: MASTER_SEED_DATA.dates.group1Created
      },
      
      // Group 2 members - APPROVED
      {
        id: uuidv4(),
        user_id: '44444444-4444-4444-4444-444444444441',
        id_card_number: '001089009876',
  id_card_front_url: 'https://storage.evcoownership.com/kyc/001089009876_front.jpg',
  id_card_back_url: 'https://storage.evcoownership.com/kyc/001089009876_back.jpg',
  verification_status: 'approved',
  verified_by: '11111111-1111-1111-1111-111111111112',
  verified_at: MASTER_SEED_DATA.dates.group2Created,
  rejection_reason: null,
        created_at: MASTER_SEED_DATA.dates.group2Created,
        updated_at: MASTER_SEED_DATA.dates.group2Created
      },
      
      // Group 3 members - APPROVED
      {
        id: uuidv4(),
        user_id: '55555555-5555-5555-5555-555555555551',
        id_card_number: '079086011111',
  id_card_front_url: 'https://storage.evcoownership.com/kyc/079086011111_front.jpg',
  id_card_back_url: 'https://storage.evcoownership.com/kyc/079086011111_back.jpg',
  verification_status: 'approved',
  verified_by: '22222222-2222-2222-2222-222222222221',
  verified_at: MASTER_SEED_DATA.dates.group3Created,
  rejection_reason: null,
        created_at: MASTER_SEED_DATA.dates.group3Created,
        updated_at: MASTER_SEED_DATA.dates.group3Created
      },
      {
        id: uuidv4(),
        user_id: '55555555-5555-5555-5555-555555555552',
        id_card_number: '079093022222',
  id_card_front_url: 'https://storage.evcoownership.com/kyc/079093022222_front.jpg',
  id_card_back_url: 'https://storage.evcoownership.com/kyc/079093022222_back.jpg',
  verification_status: 'approved',
  verified_by: '22222222-2222-2222-2222-222222222221',
  verified_at: MASTER_SEED_DATA.dates.group3Created,
  rejection_reason: null,
        created_at: MASTER_SEED_DATA.dates.group3Created,
        updated_at: MASTER_SEED_DATA.dates.group3Created
      },
      
      // PENDING KYC
      {
        id: uuidv4(),
        user_id: '66666666-6666-6666-6666-666666666661',
        id_card_number: '079094033333',
  id_card_front_url: 'https://storage.evcoownership.com/kyc/079094033333_front.jpg',
  id_card_back_url: 'https://storage.evcoownership.com/kyc/079094033333_back.jpg',
  verification_status: 'pending',
  verified_by: null,
  verified_at: null,
  rejection_reason: null,
        created_at: new Date('2024-11-10T08:00:00Z'),
        updated_at: new Date('2024-11-10T08:00:00Z')
      },
      
      // REJECTED KYC
      {
        id: uuidv4(),
        user_id: '66666666-6666-6666-6666-666666666662',
        id_card_number: '079091044444',
  id_card_front_url: 'https://storage.evcoownership.com/kyc/079091044444_front.jpg',
  id_card_back_url: 'https://storage.evcoownership.com/kyc/079091044444_back.jpg',
  verification_status: 'rejected',
  verified_by: '22222222-2222-2222-2222-222222222222',
  verified_at: new Date('2024-11-11T09:00:00Z'),
  rejection_reason: 'Ảnh mờ, không rõ mặt. Vui lòng chụp lại',
        created_at: new Date('2024-11-09T14:00:00Z'),
        updated_at: new Date('2024-11-11T09:00:00Z')
      }
    ];

    // Idempotent insert: only add verifications for users that don't already have a record
    const userIds = kycData.map(k => `'${k.user_id}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT user_id FROM kyc_verifications WHERE user_id IN (${userIds})`
    );
    const existingSet = new Set(existing.map(r => r.user_id));
    const toInsert = kycData.filter(k => !existingSet.has(k.user_id));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('kyc_verifications', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} KYC verifications`);
      console.log(`   - ${toInsert.filter(k => k.verification_status === 'approved').length} approved`);
      console.log(`   - ${toInsert.filter(k => k.verification_status === 'pending').length} pending`);
      console.log(`   - ${toInsert.filter(k => k.verification_status === 'rejected').length} rejected`);
    } else {
      console.log('⏩ KYC verifications already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('kyc_verifications', null, {});
  }
};
