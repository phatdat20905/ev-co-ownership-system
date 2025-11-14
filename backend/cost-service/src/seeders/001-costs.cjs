'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const costs = [
      // Tesla Model 3 costs
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Sạc nhanh tại Landmark 81',
        total_amount: 180000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-11-10T08:35:00Z'),
        description: 'Sạc nhanh tại Landmark 81',
        created_by: '33333333-3333-3333-3333-333333333331',
        invoiced: false,
        created_at: new Date('2024-11-10T08:35:00Z'),
        updated_at: new Date('2024-11-10T08:35:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Bảo dưỡng định kỳ 10,000km',
        total_amount: 3500000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-08-15T11:30:00Z'),
        description: 'Bảo dưỡng định kỳ 10,000km',
        created_by: '33333333-3333-3333-3333-333333333331',
        invoiced: false,
        created_at: new Date('2024-08-15T11:30:00Z'),
        updated_at: new Date('2024-08-15T11:30:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Thay lốp xe Michelin Pilot Sport EV',
        total_amount: 4500000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-09-20T10:15:00Z'),
        description: 'Thay lốp xe Michelin Pilot Sport EV',
        created_by: '33333333-3333-3333-3333-333333333332',
        invoiced: false,
        created_at: new Date('2024-09-20T10:15:00Z'),
        updated_at: new Date('2024-09-20T10:15:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Bảo hiểm VCX năm 2024-2025',
        total_amount: 15000000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-02-15T08:00:00Z'),
        description: 'Bảo hiểm VCX năm 2024-2025',
        created_by: '33333333-3333-3333-3333-333333333331',
        invoiced: false,
        created_at: new Date('2024-02-15T08:00:00Z'),
        updated_at: new Date('2024-02-15T08:00:00Z')
      },
      
      // VinFast VF e34 costs
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        group_id: MASTER_SEED_DATA.groups.group2.id,
        category_id: null,
        cost_name: 'Sạc nhanh tại VinFast Green SM',
        total_amount: 155400,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-11-08T14:40:00Z'),
        description: 'Sạc nhanh tại VinFast Green SM',
        created_by: '44444444-4444-4444-4444-444444444441',
        invoiced: false,
        created_at: new Date('2024-11-08T14:40:00Z'),
        updated_at: new Date('2024-11-08T14:40:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        group_id: MASTER_SEED_DATA.groups.group2.id,
        category_id: null,
        cost_name: 'Bảo hiểm PTI năm 2024-2025',
        total_amount: 9500000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-03-25T08:00:00Z'),
        description: 'Bảo hiểm PTI năm 2024-2025',
        created_by: '44444444-4444-4444-4444-444444444441',
        invoiced: false,
        created_at: new Date('2024-03-25T08:00:00Z'),
        updated_at: new Date('2024-03-25T08:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        group_id: MASTER_SEED_DATA.groups.group2.id,
        category_id: null,
        cost_name: 'Phí giữ xe tháng 11/2024',
        total_amount: 2000000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-11-01T00:00:00Z'),
        description: 'Phí giữ xe tháng 11/2024',
        created_by: '44444444-4444-4444-4444-444444444442',
        invoiced: false,
        created_at: new Date('2024-11-01T08:00:00Z'),
        updated_at: new Date('2024-11-01T08:00:00Z')
      },
      
      // Hyundai Ioniq 5 costs
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.groups.group3.id,
        category_id: null,
        cost_name: 'Sạc nhanh tại AEON Mall',
        total_amount: 166980,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-11-12T10:28:00Z'),
        description: 'Sạc nhanh tại AEON Mall',
        created_by: '55555555-5555-5555-5555-555555555551',
        invoiced: false,
        created_at: new Date('2024-11-12T10:28:00Z'),
        updated_at: new Date('2024-11-12T10:28:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.groups.group3.id,
        category_id: null,
        cost_name: 'Bảo dưỡng định kỳ 15,000km',
        total_amount: 8500000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-10-18T12:00:00Z'),
        description: 'Bảo dưỡng định kỳ 15,000km',
        created_by: '55555555-5555-5555-5555-555555555551',
        invoiced: false,
        created_at: new Date('2024-10-18T12:00:00Z'),
        updated_at: new Date('2024-10-18T12:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.groups.group3.id,
        category_id: null,
        cost_name: 'Bảo hiểm MIC năm 2024-2025',
        total_amount: 18000000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-02-20T08:00:00Z'),
        description: 'Bảo hiểm MIC năm 2024-2025',
        created_by: '55555555-5555-5555-5555-555555555552',
        invoiced: false,
        created_at: new Date('2024-02-20T08:00:00Z'),
        updated_at: new Date('2024-02-20T08:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.groups.group3.id,
        category_id: null,
        cost_name: 'Rửa xe cao cấp + đánh bóng',
        total_amount: 150000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-11-11T15:00:00Z'),
        description: 'Rửa xe cao cấp + đánh bóng',
        created_by: '55555555-5555-5555-5555-555555555553',
        invoiced: false,
        created_at: new Date('2024-11-11T15:00:00Z'),
        updated_at: new Date('2024-11-11T15:00:00Z')
      },
      
      // Pending cost
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Phí giữ xe tháng 11/2024',
        total_amount: 3000000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2024-11-01T00:00:00Z'),
        description: 'Phí giữ xe tháng 11/2024',
  created_by: MASTER_SEED_DATA.groups.group1.created_by,
        invoiced: false,
        created_at: new Date('2024-11-01T08:00:00Z'),
        updated_at: new Date('2024-11-01T08:00:00Z')
      }
    ];

    await queryInterface.bulkInsert('costs', costs, {});
    
    console.log(`✅ Seeded ${costs.length} costs`);
    console.log(`   - ${costs.filter(c => c.status === 'paid').length} paid`);
    console.log(`   - ${costs.filter(c => c.status === 'pending').length} pending`);
    console.log(`   - Total amount: ${costs.reduce((sum, c) => sum + c.amount, 0).toLocaleString('vi-VN')}đ`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('costs', null, {});
  }
};
