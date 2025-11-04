export default {
  async up(queryInterface, Sequelize) {
    const templates = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'welcome_email',
        type: 'auth',
        subject: 'Chào mừng đến với EV Co-ownership!',
        body: `Xin chào {{user_name}},

Chào mừng bạn đến với hệ thống đồng sở hữu xe điện EV Co-ownership!

Tài khoản của bạn đã được tạo thành công. Bạn có thể bắt đầu:
- Tham gia nhóm đồng sở hữu
- Đặt lịch sử dụng xe
- Quản lý chi phí

Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.

Trân trọng,
Đội ngũ EV Co-ownership`,
        channels: ['email', 'in_app'],
        variables: JSON.stringify([
          { key: 'user_name', required: true },
          { key: 'user_email', required: true }
        ]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'booking_confirmed',
        type: 'booking',
        subject: 'Đặt lịch thành công - {{vehicle_name}}',
        body: `Chào {{user_name}},

Đặt lịch của bạn cho {{vehicle_name}} đã được xác nhận.

📅 Thông tin đặt lịch:
- Xe: {{vehicle_name}}
- Thời gian: {{start_time}} đến {{end_time}}
- Biển số: {{license_plate}}

Vui lòng có mặt đúng giờ để nhận xe.

Trân trọng,
Đội ngũ EV Co-ownership`,
        channels: ['email', 'push', 'in_app'],
        variables: JSON.stringify([
          { key: 'user_name', required: true },
          { key: 'vehicle_name', required: true },
          { key: 'license_plate', required: true },
          { key: 'start_time', required: true },
          { key: 'end_time', required: true }
        ]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'payment_success',
        type: 'payment',
        subject: 'Thanh toán thành công - {{amount}} VND',
        body: `Chào {{user_name}},

Thanh toán của bạn đã được xử lý thành công.

💳 Thông tin thanh toán:
- Số tiền: {{amount}} VND
- Mục đích: {{purpose}}
- Ngày thanh toán: {{payment_date}}

Cảm ơn bạn đã sử dụng dịch vụ.

Trân trọng,
Đội ngũ EV Co-ownership`,
        channels: ['email', 'in_app'],
        variables: JSON.stringify([
          { key: 'user_name', required: true },
          { key: 'amount', required: true },
          { key: 'purpose', required: true },
          { key: 'payment_date', required: true }
        ]),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('notification_templates', templates);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('notification_templates', null, {});
  }
};
