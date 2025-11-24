'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  const templates = [
      // Booking templates (multi-channel)
      {
        id: uuidv4(),
        name: 'booking_created',
        type: 'booking',
        subject: 'Đặt lịch xe thành công',
        body: `Xin chào {{user_name}}! Bạn đã đặt xe {{vehicle_name}} thành công. Thời gian: {{start_time}} đến {{end_time}}. Mã đặt lịch: {{booking_id}}`,
        variables: ['user_name', 'booking_id', 'vehicle_name', 'start_time', 'end_time'],
        channels: ['push', 'in_app', 'email'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Email templates
      {
        id: uuidv4(),
  name: 'booking_confirmed',
  type: 'email',
  subject: 'Xác nhận đặt xe thành công',
  body: `
Xin chào {{user_name}},

Đặt xe của bạn đã được xác nhận:

🚗 Xe: {{vehicle_name}}
📅 Thời gian: {{start_time}} - {{end_time}}
📍 Địa điểm nhận: {{pickup_location}}
🎯 Mục đích: {{purpose}}

Vui lòng check-in đúng giờ.

Trân trọng,
EV Co-ownership System
`,
        variables: ['user_name', 'vehicle_name', 'start_time', 'end_time', 'pickup_location', 'purpose'],
        channels: ['email'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'booking_cancelled',
        type: 'booking',
        subject: 'Đặt lịch đã bị hủy',
        body: `Xin chào {{user_name}}! Đặt lịch xe {{vehicle_name}} của bạn đã bị hủy. Lý do: {{cancellation_reason}}`,
        variables: ['user_name', 'vehicle_name', 'cancellation_reason'],
        channels: ['push', 'in_app', 'email'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'booking_reminder',
        type: 'booking',
        subject: 'Nhắc nhở: Chuyến đi sắp bắt đầu',
        body: `Xin chào {{user_name}}! Xe {{vehicle_name}} sẽ sẵn sàng lúc {{start_time}}. Hãy chuẩn bị nhé!`,
        variables: ['user_name', 'vehicle_name', 'start_time'],
        channels: ['push', 'in_app'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'booking_confirmed',
        type: 'booking',
        subject: 'Xác nhận đặt xe thành công',
        body: `Xin chào {{user_name}}! Đặt xe {{vehicle_name}} đã được xác nhận. Biển số: {{license_plate}}. Thời gian: {{start_time}} - {{end_time}}`,
        variables: ['user_name', 'vehicle_name', 'license_plate', 'start_time', 'end_time'],
        channels: ['push', 'in_app', 'email'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Legacy Email templates (for backward compatibility)
      {
        id: uuidv4(),
  name: 'booking_confirmed_email',
  type: 'email',
  subject: 'Xác nhận đặt xe thành công',
  body: `
Xin chào {{user_name}},

Đặt xe của bạn đã được xác nhận:

🚗 Xe: {{vehicle_name}}
📅 Thời gian: {{start_time}} - {{end_time}}
📍 Địa điểm nhận: {{pickup_location}}
🎯 Mục đích: {{purpose}}

Vui lòng check-in đúng giờ.

Trân trọng,
EV Co-ownership System
`,
        variables: ['user_name', 'vehicle_name', 'start_time', 'end_time', 'pickup_location', 'purpose'],
        channels: ['email'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'booking_reminder_email',
        type: 'email',
        subject: 'Nhắc nhở: Chuyến đi sắp bắt đầu',
         body: `
Xin chào {{user_name}},

Chuyến đi của bạn sẽ bắt đầu trong {{hours_until}} giờ nữa.

🚗 Xe: {{vehicle_name}}
📅 Thời gian bắt đầu: {{start_time}}
🔋 Pin hiện tại: {{battery_level}}%

Hãy chuẩn bị sẵn sàng!

Trân trọng,
EV Co-ownership System
`,
        variables: ['user_name', 'vehicle_name', 'hours_until', 'start_time', 'battery_level'],
        channels: ['email'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'payment_due',
        type: 'email',
        subject: 'Thông báo thanh toán chi phí',
         body: `
Xin chào {{user_name}},

Bạn có khoản thanh toán cần hoàn tất:

💰 Số tiền: {{amount}} VNĐ
📋 Mô tả: {{description}}
📅 Hạn thanh toán: {{due_date}}

Vui lòng thanh toán đúng hạn để tránh phí phạt.

Trân trọng,
EV Co-ownership System
`,
        variables: ['user_name', 'amount', 'description', 'due_date'],
        channels: ['email'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // SMS templates
      {
        id: uuidv4(),
        name: 'booking_confirmed_sms',
        type: 'sms',
        subject: null,
         body: `[EV Co-ownership] Dat xe {{vehicle_name}} thanh cong. Thoi gian: {{start_time}}. Check-in dung gio!`,
        variables: ['vehicle_name', 'start_time'],
        channels: ['sms'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'low_battery_warning',
        type: 'sms',
        subject: null,
         body: `[EV Co-ownership] CANH BAO: Pin {{vehicle_name}} chi con {{battery_level}}%. Vui long sac xe!`,
        variables: ['vehicle_name', 'battery_level'],
        channels: ['sms'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      
      // Push notification templates
      {
        id: uuidv4(),
        name: 'maintenance_reminder',
        type: 'push',
        subject: 'Nhắc bảo dưỡng xe',
         body: `Xe {{vehicle_name}} sắp đến lịch bảo dưỡng. Đã chạy {{odometer}}km.`,
        variables: ['vehicle_name', 'odometer'],
        channels: ['push'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'new_vote',
        type: 'push',
        subject: 'Biểu quyết mới',
         body: `Nhóm {{group_name}} có biểu quyết mới: "{{vote_title}}". Hãy tham gia vote!`,
        variables: ['group_name', 'vote_title'],
        channels: ['push'],
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Idempotent insert: only add templates whose name doesn't exist
    const names = templates.map(t => `'${t.name}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT name FROM notification_templates WHERE name IN (${names})`
    );
    const existingSet = new Set(existing.map(r => r.name));
    const toInsert = templates.filter(t => !existingSet.has(t.name));

    if (toInsert.length > 0) {
      // Convert variables/channels to JSONB literals
      toInsert.forEach(t => {
        if (t.variables) t.variables = Sequelize.literal(`'${JSON.stringify(t.variables)}'::jsonb`);
        if (t.channels) {
          const arr = t.channels.map(c => `'${String(c).replace(/'/g, "''")}'`).join(',');
          t.channels = Sequelize.literal(`ARRAY[${arr}]::varchar[]`);
        }
      });

      await queryInterface.bulkInsert('notification_templates', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} notification templates`);
    } else {
      console.log('⏩ Notification templates already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    const names = ['booking_created','booking_cancelled','booking_reminder','booking_confirmed','booking_confirmed_email','booking_reminder_email','payment_due','booking_confirmed_sms','low_battery_warning','maintenance_reminder','new_vote'];
    await queryInterface.bulkDelete('notification_templates', { name: names }, {});
  }
};
