'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
  const maintenanceRecords = [
      // Tesla Model 3 - Completed maintenance
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        type: 'scheduled',
        description: 'Bảo dưỡng định kỳ 10,000km',
        scheduled_date: new Date('2024-08-15T08:00:00Z'),
        completed_date: new Date('2024-08-15T11:30:00Z'),
        odometer_reading: 10000,
        cost: 3500000,
        service_provider: 'Tesla Service Center - Hồ Chí Minh',
        notes: 'Kiểm tra hệ thống phanh, lốp xe, điều hòa. Mọi thứ hoạt động tốt.',
        status: 'completed',
        created_by: '33333333-3333-3333-3333-333333333331',
        created_at: new Date('2024-08-10T08:00:00Z'),
        updated_at: new Date('2024-08-15T11:30:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        type: 'repair',
        description: 'Thay lốp xe trước trái do bị đinh',
        scheduled_date: new Date('2024-09-20T09:00:00Z'),
        completed_date: new Date('2024-09-20T10:15:00Z'),
        odometer_reading: 11200,
        cost: 4500000,
        service_provider: 'Lốp xe Michelin - Quận 1',
        notes: 'Thay lốp Michelin Pilot Sport EV mới',
        status: 'completed',
        created_by: '33333333-3333-3333-3333-333333333332',
        created_at: new Date('2024-09-19T14:00:00Z'),
        updated_at: new Date('2024-09-20T10:15:00Z')
      },
      
      // VinFast VF e34 - Scheduled maintenance
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        type: 'scheduled',
        description: 'Bảo dưỡng định kỳ 5,000km',
        scheduled_date: new Date('2024-11-20T08:00:00Z'),
        completed_date: null,
        odometer_reading: null,
        cost: null,
        service_provider: 'VinFast Service - Quận 7',
        notes: 'Đã đặt lịch hẹn',
        status: 'scheduled',
        created_by: '44444444-4444-4444-4444-444444444441',
        created_at: new Date('2024-11-10T09:00:00Z'),
        updated_at: new Date('2024-11-10T09:00:00Z')
      },
      
      // Hyundai Ioniq 5 - Completed maintenance
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        type: 'scheduled',
        description: 'Bảo dưỡng định kỳ 15,000km',
        scheduled_date: new Date('2024-10-18T08:00:00Z'),
        completed_date: new Date('2024-10-18T12:00:00Z'),
        odometer_reading: 15000,
        cost: 8500000,
        service_provider: 'Hyundai Thành Công - Quận 2',
        notes: 'Thay dầu phanh, kiểm tra pin, cân bằng lốp, kiểm tra hệ thống điện',
        status: 'completed',
        created_by: '55555555-5555-5555-5555-555555555551',
        created_at: new Date('2024-10-15T08:00:00Z'),
        updated_at: new Date('2024-10-18T12:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        type: 'inspection',
        description: 'Kiểm tra đăng kiểm định kỳ',
        scheduled_date: new Date('2024-11-25T08:00:00Z'),
        completed_date: null,
        odometer_reading: null,
        cost: null,
        service_provider: 'Trung tâm Đăng kiểm Xe cơ giới 50-03D',
        notes: 'Chuẩn bị hồ sơ đăng kiểm',
        status: 'scheduled',
        created_by: '55555555-5555-5555-5555-555555555552',
        created_at: new Date('2024-11-08T10:00:00Z'),
        updated_at: new Date('2024-11-08T10:00:00Z')
      }
    ];

    // Split into maintenance_schedules and maintenance_history based on whether completed_date exists
    const maintenanceSchedules = maintenanceRecords
      .filter(r => !r.completed_date)
      .map(r => ({
        id: r.id,
        vehicle_id: r.vehicle_id,
        maintenance_type: r.type,
        scheduled_date: r.scheduled_date,
        odometer_at_schedule: r.odometer_reading,
        status: r.status || 'scheduled',
        estimated_cost: r.cost || null,
        notes: r.notes || null,
        created_at: r.created_at || new Date(),
        updated_at: r.updated_at || new Date()
      }));

    const maintenanceHistory = maintenanceRecords
      .filter(r => r.completed_date)
      .map(r => ({
        id: r.id,
        vehicle_id: r.vehicle_id,
        maintenance_schedule_id: null,
        maintenance_type: r.type,
        performed_date: r.completed_date,
        odometer_reading: r.odometer_reading,
        cost: r.cost || null,
        service_provider: r.service_provider || null,
        description: r.notes || r.description || null,
        receipt_url: null,
        performed_by: r.created_by || null,
        created_at: r.created_at || new Date(),
        updated_at: r.updated_at || r.completed_date || new Date()
      }));

    if (maintenanceSchedules.length) {
      await queryInterface.bulkInsert('maintenance_schedules', maintenanceSchedules, {});
    }

    if (maintenanceHistory.length) {
      await queryInterface.bulkInsert('maintenance_history', maintenanceHistory, {});
    }

    console.log(`✅ Seeded ${maintenanceSchedules.length + maintenanceHistory.length} maintenance entries`);
    console.log(`   - ${maintenanceHistory.length} history records`);
    console.log(`   - ${maintenanceSchedules.length} schedule records`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('maintenance_records', null, {});
  }
};
