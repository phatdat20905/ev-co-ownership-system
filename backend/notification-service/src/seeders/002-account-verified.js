export default {
  async up(queryInterface, Sequelize) {
    const template = {
      id: '550e8400-e29b-41d4-a716-446655440010',
      name: 'account_verified',
      type: 'auth',
      subject: 'Tài khoản đã được xác thực',
      body: `Xin chào {{user_name}},\n\nTài khoản của bạn đã được xác thực thành công vào {{verified_at}}.\nBạn có thể đăng nhập và bắt đầu sử dụng các tính năng của hệ thống.\n\nTrân trọng,\nĐội ngũ EV Co-ownership`,
      channels: ['email', 'in_app'],
      variables: JSON.stringify([
        { key: 'user_name', required: true },
        { key: 'verified_at', required: true }
      ]),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await queryInterface.bulkInsert('notification_templates', [template]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('notification_templates', { name: 'account_verified' }, {});
  }
};
