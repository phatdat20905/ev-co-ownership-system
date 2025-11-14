'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Build disputes using current migrations (title, dispute_type, filed_by, against_user, group_id)
    const raw = [
      {
        subject: 'Xe bị trầy xước sau chuyến đi',
        filed_by: '33333333-3333-3333-3333-333333333332',
        against_user: '33333333-3333-3333-3333-333333333333',
        dispute_type: 'damage_claim',
        title: 'Xe bị trầy xước sau chuyến đi',
        description: 'Tôi phát hiện cửa xe bên trái bị trầy xước sau khi người dùng trước trả xe. Đã có ảnh check-out chứng minh.',
        priority: 'medium',
        status: 'resolved',
        assigned_to_user: '22222222-2222-2222-2222-222222222221',
        resolution: 'Đã xác nhận trầy xước do người dùng trước gây ra. Chi phí sửa chữa 500,000đ sẽ được trừ từ deposit.',
        group_id: MASTER_SEED_DATA.vehicles.tesla.group_id,
        created_at: new Date('2024-11-08T10:00:00Z'),
        updated_at: new Date('2024-11-09T15:00:00Z'),
        resolved_at: new Date('2024-11-09T15:00:00Z')
      },
      {
        subject: 'Tranh chấp về ưu tiên đặt xe',
        filed_by: '44444444-4444-4444-4444-444444444442',
        against_user: '44444444-4444-4444-4444-444444444441',
        dispute_type: 'booking_conflict',
        title: 'Tranh chấp về ưu tiên đặt xe',
        description: 'Tôi đã đặt xe trước nhưng lịch của tôi bị hủy và xe được giao cho người khác có priority cao hơn. Tôi cho rằng điều này không công bằng.',
        priority: 'high',
        status: 'investigating',
        assigned_to_user: '22222222-2222-2222-2222-222222222222',
        resolution: null,
        group_id: MASTER_SEED_DATA.vehicles.vinfast.group_id,
        created_at: new Date('2024-11-11T14:00:00Z'),
        updated_at: new Date('2024-11-12T09:00:00Z'),
        resolved_at: null
      },
      {
        subject: 'Chi phí bảo dưỡng quá cao',
        filed_by: '55555555-5555-5555-5555-555555555553',
        against_user: null,
        dispute_type: 'cost_dispute',
        title: 'Chi phí bảo dưỡng quá cao',
        description: 'Chi phí bảo dưỡng 8,500,000đ là quá cao so với quy định. Tôi yêu cầu được kiểm tra lại hóa đơn.',
        priority: 'low',
        status: 'open',
        assigned_to_user: null,
        resolution: null,
        group_id: MASTER_SEED_DATA.vehicles.ioniq5.group_id,
        created_at: new Date('2024-11-13T08:00:00Z'),
        updated_at: new Date('2024-11-13T08:00:00Z'),
        resolved_at: null
      },
      {
        subject: 'Khiếu nại về tiếng ồn xe',
        filed_by: '33333333-3333-3333-3333-333333333334',
        against_user: '33333333-3333-3333-3333-333333333331',
        dispute_type: 'other',
        title: 'Khiếu nại về tiếng ồn xe',
        description: 'Xe có tiếng kêu lạ khi chạy.',
        priority: 'low',
        status: 'closed',
        assigned_to_user: '22222222-2222-2222-2222-222222222221',
        resolution: 'Người khiếu nại đã rút lại khiếu nại sau khi kiểm tra kỹ thuật.',
        group_id: MASTER_SEED_DATA.vehicles.tesla.group_id,
        created_at: new Date('2024-11-05T10:00:00Z'),
        updated_at: new Date('2024-11-06T11:00:00Z'),
        resolved_at: new Date('2024-11-06T11:00:00Z')
      }
    ];

    // Map assigned_to_user (user_id) to staff_profiles.id
    const staffUserIds = raw
      .map(r => r.assigned_to_user)
      .filter(Boolean)
      .map(id => `'${id}'`)
      .join(',') || "''";
    const staffMap = {};
    if (staffUserIds !== "''") {
      const [rows] = await queryInterface.sequelize.query(
        `SELECT id, user_id FROM staff_profiles WHERE user_id IN (${staffUserIds})`
      );
      rows.forEach(r => { staffMap[r.user_id] = r.id; });
    }

    // Build final disputes rows with migration column names
    const disputes = raw.map((r, idx) => ({
      id: uuidv4(),
      dispute_number: `DSP-2024-${String(idx + 1).padStart(3, '0')}`,
      title: r.title,
      description: r.description,
      dispute_type: r.dispute_type,
      status: r.status,
      priority: r.priority,
      filed_by: r.filed_by,
      against_user: r.against_user,
      group_id: r.group_id,
      assigned_to: r.assigned_to_user ? staffMap[r.assigned_to_user] || null : null,
      resolution: r.resolution,
      resolved_at: r.resolved_at,
      created_at: r.created_at,
      updated_at: r.updated_at
    }));

    // Idempotent insert: skip disputes with the same title already present
    const titles = disputes.map(d => `'${d.title.replace(/'/g, "''")}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT title FROM disputes WHERE title IN (${titles})`
    );
    const existingTitles = existing.map(r => r.title);
    const toInsert = disputes.filter(d => !existingTitles.includes(d.title));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('disputes', toInsert, {});
    }

    console.log(`✅ Seeded ${toInsert.length} disputes (inserted), ${disputes.length - toInsert.length} already existed`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('disputes', null, {});
  }
};
