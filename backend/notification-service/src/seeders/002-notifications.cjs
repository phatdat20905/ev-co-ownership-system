'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get templates
    const [templates] = await queryInterface.sequelize.query(
      "SELECT id, name, type FROM notification_templates"
    );
    
    if (templates.length === 0) {
      console.log('⚠️ No templates found. Run template seeder first.');
      return;
    }
    
    const bookingTemplate = templates.find(t => t.name === 'booking_confirmed');
    const paymentTemplate = templates.find(t => t.name === 'payment_due');
    const smsTemplate = templates.find(t => t.name === 'booking_confirmed_sms');
    
    const notifications = [];

    // Booking notifications
    const coowners = Object.values(MASTER_SEED_DATA.users).filter(u => u.role === 'co_owner');

    coowners.slice(0, 5).forEach((user, index) => {
      if (bookingTemplate) {
        notifications.push({
          id: uuidv4(),
          user_id: user.id,
          type: 'email',
          title: 'Xác nhận đặt xe thành công',
          message: 'Xin chào, Đặt xe của bạn đã được xác nhận.',
          metadata: { 
            user_name: MASTER_SEED_DATA.profiles[`coowner${index + 1}`].full_name,
            vehicle_name: 'Tesla Model 3',
            start_time: '2024-11-15 08:00',
            end_time: '2024-11-15 18:00',
            pickup_location: 'Nhà xe chung',
            purpose: 'Công tác'
          },
          channels: ['email'],
          status: index < 3 ? 'sent' : 'pending',
          sent_at: index < 3 ? new Date() : null,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      if (smsTemplate) {
        notifications.push({
          id: uuidv4(),
          user_id: user.id,
          type: 'sms',
          title: '[EV Co-ownership] Thông báo',
          message: `[EV Co-ownership] Dat xe thanh cong.`,
          metadata: {
            vehicle_name: 'Tesla',
            start_time: '15/11 08:00'
          },
          channels: ['sms'],
          status: 'sent',
          sent_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    });

    // Payment notifications
    if (paymentTemplate) {
      coowners.slice(0, 3).forEach(user => {
        notifications.push({
          id: uuidv4(),
          user_id: user.id,
          type: 'email',
          title: 'Thông báo thanh toán chi phí',
          message: 'Bạn có khoản thanh toán cần hoàn tất.',
          metadata: {
            user_name: user.email.split('@')[0],
            amount: '500,000',
            description: 'Chi phí bảo trì tháng 11',
            due_date: '15/11/2024'
          },
          channels: ['email'],
          status: 'sent',
          sent_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    }

    // Idempotent insertion: check for existing rows with same user_id + title + message
  const checks = notifications.map(n => `('${n.user_id}', ${n.title ? `'${String(n.title).replace(/'/g, "''")}'` : 'NULL'}, '${String(n.message).replace(/'/g, "''")}')`).join(',');
    const existingQuery = `SELECT user_id, title, message FROM notifications WHERE (user_id, title, message) IN (${checks})`;
    const [existing] = await queryInterface.sequelize.query(existingQuery);
    const existingSet = new Set(existing.map(r => `${r.user_id}||${r.title}||${r.message}`));
    const toInsert = notifications.filter(n => !existingSet.has(`${n.user_id}||${n.title}||${n.message}`));

    if (toInsert.length > 0) {
      // convert metadata and channels to JSONB literals
      toInsert.forEach(n => {
        if (n.metadata) n.metadata = Sequelize.literal(`'${JSON.stringify(n.metadata)}'::jsonb`);
        if (n.channels) {
          const arr = n.channels.map(c => `'${String(c).replace(/'/g, "''")}'`).join(',');
          n.channels = Sequelize.literal(`ARRAY[${arr}]::varchar[]`);
        }
      });
      await queryInterface.bulkInsert('notifications', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} notifications`);
      console.log(`   - ${toInsert.filter(n => n.status === 'sent').length} sent`);
      console.log(`   - ${toInsert.filter(n => n.status === 'pending').length} pending`);
    } else {
      console.log('⏩ Notifications already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('notifications', null, {});
  }
};
