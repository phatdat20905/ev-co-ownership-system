'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get bookings and vehicle odometer to create check-in/out logs
    const [bookings] = await queryInterface.sequelize.query(
      "SELECT b.id, b.user_id, b.start_time, b.end_time, b.status, v.current_odometer FROM bookings b JOIN vehicles v ON b.vehicle_id = v.id WHERE b.status IN ('completed', 'in_progress')"
    );

    const logs = [];

    bookings.forEach(booking => {
      const performedAt = booking.start_time ? new Date(booking.start_time) : new Date();
      // Check-in log (action_type, performed_at)
      logs.push({
        id: uuidv4(),
        booking_id: booking.id,
        action_type: 'check_in',
        odometer_reading: booking.current_odometer || null,
        fuel_level: null,
        images: JSON.stringify([
          `https://storage.evcoownership.com/checkin/${booking.id}/front.jpg`,
          `https://storage.evcoownership.com/checkin/${booking.id}/dashboard.jpg`
        ]),
        notes: 'Xe trong tình trạng tốt',
        qr_code: null,
        digital_signature: null,
        performed_by: booking.user_id,
        location: JSON.stringify({ address: 'Nhà xe chung EV Co-ownership, Quận 1' }),
        created_at: performedAt,
        updated_at: performedAt
      });

      // If booking completed, add a check-out log with a small odometer delta
      if (booking.status === 'completed' && booking.end_time) {
        const endAt = new Date(booking.end_time);
        const endOdo = (booking.current_odometer || 0) + 50; // simple delta for seed data
        logs.push({
          id: uuidv4(),
          booking_id: booking.id,
          action_type: 'check_out',
          odometer_reading: endOdo,
          fuel_level: null,
          images: JSON.stringify([
            `https://storage.evcoownership.com/checkout/${booking.id}/front.jpg`,
            `https://storage.evcoownership.com/checkout/${booking.id}/dashboard.jpg`,
            `https://storage.evcoownership.com/checkout/${booking.id}/left_scratch.jpg`
          ]),
          notes: 'Trầy nhẹ cửa trái khi đỗ xe, đã chụp ảnh',
          qr_code: null,
          digital_signature: null,
          performed_by: booking.user_id,
          location: JSON.stringify({ address: 'Nhà xe chung EV Co-ownership, Quận 1' }),
          created_at: endAt,
          updated_at: endAt
        });
      }
    });

    if (logs.length > 0) {
      await queryInterface.bulkInsert('check_in_out_logs', logs, {});
    }

    console.log(`✅ Seeded ${logs.length} check-in/out logs`);
    console.log(`   - ${logs.filter(l => l.action_type === 'check_in').length} check-ins`);
    console.log(`   - ${logs.filter(l => l.action_type === 'check_out').length} check-outs`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('check_in_out_logs', null, {});
  }
};
