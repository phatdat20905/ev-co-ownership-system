'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get disputes to add messages
    const [disputes] = await queryInterface.sequelize.query(
      "SELECT id, filed_by, against_user, assigned_to FROM disputes WHERE status IN ('resolved', 'investigating')"
    );

    // Skip disputes that already have messages (idempotent)
    const disputeIds = disputes.map(d => `'${d.id}'`).join(',') || "''";
    const [existingMessages] = await queryInterface.sequelize.query(
      `SELECT dispute_id FROM dispute_messages WHERE dispute_id IN (${disputeIds})`
    );
    const disputesWithMessages = new Set(existingMessages.map(r => r.dispute_id));

    const messages = [];

    disputes.forEach(dispute => {
      if (disputesWithMessages.has(dispute.id)) return; // skip if messages already exist for this dispute
      // Initial complaint
      messages.push({
        id: uuidv4(),
        dispute_id: dispute.id,
        sender_id: dispute.filed_by,
        message: 'Tôi gửi khiếu nại này với đầy đủ bằng chứng. Mong admin xem xét và giải quyết sớm.',
        attachments: JSON.stringify([]),
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      });
      
      // Staff response
      if (dispute.assigned_to) {
        messages.push({
          id: uuidv4(),
          dispute_id: dispute.id,
          sender_id: dispute.assigned_to,
          message: 'Chúng tôi đã nhận được khiếu nại của bạn. Đang xem xét và sẽ phản hồi trong 24h.',
          attachments: JSON.stringify([]),
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        });
      }
      
      // Respondent reply (if exists)
      if (dispute.against_user) {
        messages.push({
          id: uuidv4(),
          dispute_id: dispute.id,
          sender_id: dispute.against_user,
          message: 'Tôi không đồng ý với khiếu nại này. Xe đã được tôi trả trong tình trạng tốt.',
          attachments: JSON.stringify([]),
          created_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000)
        });
      }
      
      // Final staff resolution (for resolved disputes)
      if (dispute.assigned_to) {
        messages.push({
          id: uuidv4(),
          dispute_id: dispute.id,
          sender_id: dispute.assigned_to,
          message: 'Sau khi xem xét kỹ lưỡng, chúng tôi đã đưa ra quyết định cuối cùng. Vui lòng xem phần Resolution.',
          attachments: JSON.stringify([]),
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        });
      }
    });
    
    if (messages.length > 0) {
      await queryInterface.bulkInsert('dispute_messages', messages, {});
    }

    console.log(`✅ Seeded ${messages.length} dispute messages (inserted)`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dispute_messages', null, {});
  }
};
