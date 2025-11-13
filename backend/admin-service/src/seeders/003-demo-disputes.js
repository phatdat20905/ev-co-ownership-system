export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('disputes', [
      {
        id: '99999999-9999-9999-9999-999999999999',
        dispute_number: 'DP2024100001',
        title: 'Xe bị trầy xước sau khi sử dụng',
        description:
          'Xe bị trầy xước ở cửa bên trái sau khi user A sử dụng. User B phát hiện khi nhận xe.',
        dispute_type: 'damage_claim',
        status: 'open',
        priority: 'high',
        filed_by: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        against_user: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        group_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        assigned_to: '22222222-2222-2222-2222-222222222222',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        dispute_number: 'DP2024100002',
        title: 'Tranh chấp chi phí sạc điện',
        description:
          'User C không đồng ý với chi phí sạc điện được phân bổ trong tháng 10/2024.',
        dispute_type: 'cost_dispute',
        status: 'investigating',
        priority: 'medium',
        // ✅ Dùng UUID hợp lệ thay vì gggg...
        filed_by: '44444444-4444-4444-4444-444444444444',
        against_user: null,
        group_id: '55555555-5555-5555-5555-555555555555',
        assigned_to: '33333333-3333-3333-3333-333333333333',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // ✅ Thêm dispute messages hợp lệ
    await queryInterface.bulkInsert('dispute_messages', [
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        dispute_id: '99999999-9999-9999-9999-999999999999',
        sender_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        message_type: 'text',
        message:
          'Tôi phát hiện vết trầy dài khoảng 20cm ở cửa bên trái khi nhận xe từ user A.',
        attachments: null,
        is_internal: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        dispute_id: '99999999-9999-9999-9999-999999999999',
        sender_id: '22222222-2222-2222-2222-222222222222',
        message_type: 'text',
        message:
          'Đã tiếp nhận tranh chấp. Tôi sẽ liên hệ với cả hai bên để xác minh thông tin.',
        attachments: null,
        is_internal: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('dispute_messages', null, {});
    await queryInterface.bulkDelete('disputes', null, {});
  }
};
