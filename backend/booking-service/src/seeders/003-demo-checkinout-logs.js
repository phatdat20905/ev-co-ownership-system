// src/seeders/003-demo-checkinout-logs.js
import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    const bookings = await queryInterface.sequelize.query(
      "SELECT id, user_id FROM bookings WHERE status = 'confirmed';",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!bookings.length) return;

    const demoLogs = [
      {
        id: uuidv4(),
        booking_id: bookings[0].id,
        action_type: 'check_in',
        odometer_reading: 12500,
        fuel_level: 85.5,
        images: JSON.stringify([
          'https://example.com/checkin1.jpg',
          'https://example.com/checkin2.jpg'
        ]),
        notes: 'Xe sạch sẽ, đầy đủ phụ kiện',
        qr_code: `QR_${bookings[0].id}_${Date.now()}`,
        digital_signature: `SIGN_${bookings[0].id}_${Date.now()}`,
        performed_by: bookings[0].user_id,
        location: JSON.stringify({
          lat: 21.0278,
          lng: 105.8342,
          address: 'Hà Nội'
        }),
        performed_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h trước
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('check_in_out_logs', demoLogs, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('check_in_out_logs', null, {});
  }
};
