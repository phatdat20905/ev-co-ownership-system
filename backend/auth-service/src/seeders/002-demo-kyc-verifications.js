export default {
  async up(queryInterface, Sequelize) {
    const kycVerifications = [
      {
        id: '55555555-5555-5555-5555-555555555555',
        user_id: '33333333-3333-3333-3333-333333333333',
        id_card_number: '123456789',
        id_card_front_url: 'https://example.com/id_front.jpg',
        id_card_back_url: 'https://example.com/id_back.jpg',
        driver_license_number: 'DL12345678',
        driver_license_url: 'https://example.com/dl.jpg',
        verification_status: 'approved',
        verified_by: '11111111-1111-1111-1111-111111111111',
        verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        user_id: '44444444-4444-4444-4444-444444444444',
        id_card_number: '987654321',
        id_card_front_url: 'https://example.com/id_front2.jpg',
        id_card_back_url: 'https://example.com/id_back2.jpg',
        verification_status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('kyc_verifications', kycVerifications, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('kyc_verifications', null, {});
  }
};