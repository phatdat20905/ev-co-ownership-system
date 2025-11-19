'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert a couple of open disputes and pending KYC verifications for demo
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const shortTs = String(Date.now()).slice(-6);
    const disputeRows = [
      {
        id: uuidv4(),
        dispute_number: `DOP${shortTs}1`,
        title: 'Demo open dispute 1',
        description: 'Demo open dispute to show active disputes count',
        dispute_type: 'booking_conflict',
        status: 'open',
        priority: 'high',
        filed_by: uuidv4(),
        against_user: null,
        group_id: uuidv4(),
        assigned_to: null,
        created_at: twoDaysAgo,
        updated_at: now
      },
      {
        id: uuidv4(),
        dispute_number: `DOP${shortTs}2`,
        title: 'Demo open dispute 2',
        description: 'Another demo open dispute',
        dispute_type: 'damage_claim',
        status: 'open',
        priority: 'medium',
        filed_by: uuidv4(),
        against_user: null,
        group_id: uuidv4(),
        assigned_to: null,
        created_at: twoDaysAgo,
        updated_at: now
      }
    ];

    const kycRows = [
      {
        id: uuidv4(),
        user_id: uuidv4(),
        verification_status: 'pending',
        submitted_at: twoDaysAgo,
        created_at: twoDaysAgo,
        updated_at: now
      },
      {
        id: uuidv4(),
        user_id: uuidv4(),
        verification_status: 'pending',
        submitted_at: twoDaysAgo,
        created_at: twoDaysAgo,
        updated_at: now
      }
    ];

    const trx = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('disputes', disputeRows, { transaction: trx });
      await queryInterface.bulkInsert('kyc_verifications', kycRows, { transaction: trx });
      await trx.commit();
      console.log('✅ Inserted demo open disputes and pending KYC');
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query("DELETE FROM disputes WHERE title LIKE 'Demo open dispute %'");
    await queryInterface.sequelize.query("DELETE FROM kyc_verifications WHERE verification_status = 'pending' AND created_at >= NOW() - INTERVAL '7 days'");
  }
};
