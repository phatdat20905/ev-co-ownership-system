export default {
  async up(queryInterface, Sequelize) {
    const staffData = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        employee_id: 'ADMIN001',
        position: 'System Administrator',
        department: 'admin',
        // ✅ Phải stringify JSON object vì Sequelize bulkInsert không tự convert object → JSONB
        permissions: JSON.stringify({
          user_management: true,
          dispute_management: true,
          kyc_approval: true,
          system_settings: true,
          reports_view: true,
          analytics_view: true
        }),
        hire_date: '2024-01-01',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        user_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        employee_id: 'SUPPORT001',
        position: 'Support Specialist',
        department: 'support',
        permissions: JSON.stringify({
          user_management: false,
          dispute_management: true,
          kyc_approval: false,
          system_settings: false,
          reports_view: true,
          analytics_view: false
        }),
        hire_date: '2024-02-01',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        user_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        employee_id: 'FINANCE001',
        position: 'Finance Manager',
        department: 'finance',
        permissions: JSON.stringify({
          user_management: false,
          dispute_management: false,
          kyc_approval: true,
          system_settings: false,
          reports_view: true,
          analytics_view: true
        }),
        hire_date: '2024-03-01',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('staff_profiles', staffData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('staff_profiles', null, {});
  }
};
