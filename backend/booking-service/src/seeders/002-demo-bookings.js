import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    // Get vehicle IDs first
    const vehicles = await queryInterface.sequelize.query(
      'SELECT id FROM vehicles;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (vehicles.length === 0) return;

    const demoBookings = [
      {
        id: uuidv4(),
        vehicle_id: vehicles[0].id,
        user_id: '110e8400-e29b-41d4-a716-446655440001', // Sample user ID
        group_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        end_time: new Date(Date.now() + 26 * 60 * 60 * 1000), // Tomorrow + 2 hours
        status: 'confirmed',
        priority_score: 85,
        purpose: 'Công việc',
        notes: 'Đi họp khách hàng',
        auto_confirmed: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        vehicle_id: vehicles[1].id,
        user_id: '110e8400-e29b-41d4-a716-446655440002',
        group_id: '550e8400-e29b-41d4-a716-446655440000',
        start_time: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
        end_time: new Date(Date.now() + 52 * 60 * 60 * 1000), // + 4 hours
        status: 'pending',
        priority_score: 72,
        purpose: 'Gia đình',
        notes: 'Đi chơi cuối tuần',
        auto_confirmed: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('bookings', demoBookings);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bookings', null, {});
  }
};