'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bookings = [
      // COMPLETED bookings (past)
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        user_id: '33333333-3333-3333-3333-333333333331',
        group_id: MASTER_SEED_DATA.groups.group1.id,
        start_time: new Date('2024-11-05T08:00:00Z'),
        end_time: new Date('2024-11-05T18:00:00Z'),
        purpose: 'Đi công tác Vũng Tàu',
        priority_score: 85,
        status: 'completed',
        notes: 'Chuyến đi suôn sẻ',
        created_at: new Date('2024-11-01T09:00:00Z'),
        updated_at: new Date('2024-11-05T18:15:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        user_id: '44444444-4444-4444-4444-444444444442',
        group_id: MASTER_SEED_DATA.groups.group2.id,
        start_time: new Date('2024-11-07T06:00:00Z'),
        end_time: new Date('2024-11-07T12:00:00Z'),
        purpose: 'Đưa gia đình đi chơi Củ Chi',
        priority_score: 72,
        status: 'completed',
        notes: null,
        created_at: new Date('2024-11-05T10:00:00Z'),
        updated_at: new Date('2024-11-07T12:10:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        user_id: '55555555-5555-5555-5555-555555555552',
        group_id: MASTER_SEED_DATA.groups.group3.id,
        start_time: new Date('2024-11-08T14:00:00Z'),
        end_time: new Date('2024-11-08T20:00:00Z'),
        purpose: 'Đi shopping Quận 2',
        priority_score: 65,
        status: 'completed',
        notes: null,
        created_at: new Date('2024-11-06T08:00:00Z'),
        updated_at: new Date('2024-11-08T20:05:00Z')
      },
      
      // CONFIRMED bookings (upcoming)
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        user_id: '33333333-3333-3333-3333-333333333332',
        group_id: MASTER_SEED_DATA.groups.group1.id,
        start_time: new Date('2024-11-15T07:00:00Z'),
        end_time: new Date('2024-11-15T19:00:00Z'),
        purpose: 'Đi họp khách hàng ở Bình Dương',
        priority_score: 90,
        status: 'confirmed',
        notes: 'Cần xe sạch sẽ, gặp khách VIP',
        created_at: new Date('2024-11-10T14:00:00Z'),
        updated_at: new Date('2024-11-10T14:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        user_id: '44444444-4444-4444-4444-444444444441',
        group_id: MASTER_SEED_DATA.groups.group2.id,
        start_time: new Date('2024-11-14T08:00:00Z'),
        end_time: new Date('2024-11-14T17:00:00Z'),
        purpose: 'Đưa con đi dự sinh nhật',
        priority_score: 78,
        status: 'confirmed',
        notes: null,
        created_at: new Date('2024-11-12T09:00:00Z'),
        updated_at: new Date('2024-11-12T09:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        user_id: '55555555-5555-5555-5555-555555555551',
        group_id: MASTER_SEED_DATA.groups.group3.id,
        start_time: new Date('2024-11-16T06:00:00Z'),
        end_time: new Date('2024-11-16T22:00:00.000Z'),
        purpose: 'Đi Đà Lạt cuối tuần',
        priority_score: 68,
        status: 'confirmed',
        notes: 'Lộ trình dài, cần kiểm tra pin trước khi đi',
        created_at: new Date('2024-11-09T16:00:00Z'),
        updated_at: new Date('2024-11-09T16:00:00Z')
      },
      
      // IN_USE booking (current)
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        user_id: '33333333-3333-3333-3333-333333333333',
        group_id: MASTER_SEED_DATA.groups.group1.id,
        start_time: new Date('2024-11-13T08:00:00Z'),
        end_time: new Date('2024-11-13T20:00:00Z'),
        purpose: 'Đi công tác Đồng Nai',
        priority_score: 82,
        status: 'in_progress',
        notes: null,
        created_at: new Date('2024-11-11T10:00:00Z'),
        updated_at: new Date('2024-11-13T08:05:00Z')
      },
      
      // PENDING bookings (awaiting approval)
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        user_id: '44444444-4444-4444-4444-444444444443',
        group_id: MASTER_SEED_DATA.groups.group2.id,
        start_time: new Date('2024-11-18T10:00:00Z'),
        end_time: new Date('2024-11-18T16:00:00Z'),
        purpose: 'Đi khám sức khỏe',
        priority_score: 55,
        status: 'pending',
        notes: null,
        created_at: new Date('2024-11-13T09:00:00Z'),
        updated_at: new Date('2024-11-13T09:00:00Z')
      },
      
      // CANCELLED booking
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        user_id: '55555555-5555-5555-5555-555555555553',
        group_id: MASTER_SEED_DATA.groups.group3.id,
        start_time: new Date('2024-11-14T09:00:00Z'),
        end_time: new Date('2024-11-14T18:00:00Z'),
        purpose: 'Đi du lịch Phan Thiết',
        priority_score: 60,
        status: 'cancelled',
        notes: 'Hủy vì thay đổi kế hoạch',
        cancellation_reason: 'Hủy vì thay đổi kế hoạch',
        created_at: new Date('2024-11-08T11:00:00Z'),
        updated_at: new Date('2024-11-11T15:00:00Z')
      },
      
      // REJECTED booking
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        user_id: '33333333-3333-3333-3333-333333333334',
        group_id: MASTER_SEED_DATA.groups.group1.id,
        start_time: new Date('2024-11-15T08:00:00Z'),
        end_time: new Date('2024-11-15T20:00:00Z'),
  purpose: 'Đi chơi',
  priority_score: 45,
  status: 'conflict',
        notes: 'Trùng lịch với booking ưu tiên cao hơn',
        created_at: new Date('2024-11-10T13:00:00Z'),
        updated_at: new Date('2024-11-10T14:05:00Z')
      }
    ];

    await queryInterface.bulkInsert('bookings', bookings, {});
    
    console.log(`✅ Seeded ${bookings.length} bookings`);
    console.log(`   - ${bookings.filter(b => b.status === 'completed').length} completed`);
    console.log(`   - ${bookings.filter(b => b.status === 'confirmed').length} confirmed`);
    console.log(`   - ${bookings.filter(b => b.status === 'in_use').length} in use`);
    console.log(`   - ${bookings.filter(b => b.status === 'pending').length} pending`);
    console.log(`   - ${bookings.filter(b => b.status === 'cancelled').length} cancelled`);
    console.log(`   - ${bookings.filter(b => b.status === 'rejected').length} rejected`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('bookings', null, {});
  }
};
