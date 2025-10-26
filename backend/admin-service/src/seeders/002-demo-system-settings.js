// src/seeders/002-demo-system-settings.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('system_settings', [
      {
        id: '44444444-4444-4444-4444-444444444444',
        setting_key: 'system_name',
        setting_value: 'EV Co-ownership System',
        data_type: 'string',
        category: 'general',
        description: 'Tên hệ thống',
        is_public: true,
        updated_by: '11111111-1111-1111-1111-111111111111',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        setting_key: 'max_login_attempts',
        setting_value: '5',
        data_type: 'number',
        category: 'security',
        description: 'Số lần đăng nhập thất bại tối đa trước khi khóa tài khoản',
        is_public: false,
        updated_by: '11111111-1111-1111-1111-111111111111',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        setting_key: 'session_timeout',
        setting_value: '3600',
        data_type: 'number',
        category: 'security',
        description: 'Thời gian timeout session (giây)',
        is_public: false,
        updated_by: '11111111-1111-1111-1111-111111111111',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        setting_key: 'email_notifications_enabled',
        setting_value: 'true',
        data_type: 'boolean',
        category: 'notifications',
        description: 'Bật/tắt thông báo email',
        is_public: false,
        updated_by: '11111111-1111-1111-1111-111111111111',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        setting_key: 'auto_kyc_approval',
        setting_value: 'false',
        data_type: 'boolean',
        category: 'security',
        description: 'Tự động duyệt KYC (true/false)',
        is_public: false,
        updated_by: '11111111-1111-1111-1111-111111111111',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('system_settings', null, {});
  }
};