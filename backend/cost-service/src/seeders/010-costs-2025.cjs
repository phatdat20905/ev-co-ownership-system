'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const costs = [];
    
    // ========== 2025 DATA - Full year costs for comprehensive testing ==========
    
    // Helper function to create monthly charging costs
    const createMonthlyCharging = (vehicleKey, groupKey, months) => {
      const vehicle = MASTER_SEED_DATA.vehicles[vehicleKey];
      const group = MASTER_SEED_DATA.groups[groupKey];
      const baseAmount = vehicleKey === 'tesla' ? 200000 : vehicleKey === 'vinfast' ? 170000 : 185000;
      
      months.forEach(month => {
        const amount = baseAmount + Math.floor(Math.random() * 60000);
        costs.push({
          id: uuidv4(),
          vehicle_id: vehicle.id,
          group_id: group.id,
          category_id: null,
          cost_name: `Sạc điện tháng ${month}/2025`,
          total_amount: amount,
          split_type: 'ownership_ratio',
          cost_date: new Date(`2025-${month.toString().padStart(2, '0')}-15T08:00:00Z`),
          description: `Chi phí sạc điện định kỳ tháng ${month}/2025`,
          created_by: group.created_by,
          invoiced: month < 11,
          created_at: new Date(`2025-${month.toString().padStart(2, '0')}-15T08:00:00Z`),
          updated_at: new Date(`2025-${month.toString().padStart(2, '0')}-15T08:00:00Z`)
        });
      });
    };
    
    // Create charging costs for all groups across all months of 2025
    createMonthlyCharging('tesla', 'group1', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    createMonthlyCharging('vinfast', 'group2', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    createMonthlyCharging('ioniq5', 'group3', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    
    // Tesla Model 3 - Additional 2025 costs
    costs.push(
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Bảo hiểm VCX năm 2025-2026',
        total_amount: 16500000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-02-15T08:00:00Z'),
        description: 'Bảo hiểm vật chất và trách nhiệm dân sự',
        created_by: MASTER_SEED_DATA.groups.group1.created_by,
        invoiced: true,
        created_at: new Date('2025-02-15T08:00:00Z'),
        updated_at: new Date('2025-02-15T08:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Bảo dưỡng định kỳ 20,000km',
        total_amount: 4200000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-05-20T10:00:00Z'),
        description: 'Bảo dưỡng định kỳ - thay dầu phanh, kiểm tra hệ thống',
        created_by: MASTER_SEED_DATA.groups.group1.created_by,
        invoiced: true,
        created_at: new Date('2025-05-20T10:00:00Z'),
        updated_at: new Date('2025-05-20T10:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Thay lốp xe Michelin',
        total_amount: 5200000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-08-10T11:00:00Z'),
        description: 'Thay bộ lốp Michelin Pilot Sport EV 4 bánh',
        created_by: MASTER_SEED_DATA.groups.group1.created_by,
        invoiced: true,
        created_at: new Date('2025-08-10T11:00:00Z'),
        updated_at: new Date('2025-08-10T11:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Phí đường cao tốc quý 3/2025',
        total_amount: 1250000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-09-30T00:00:00Z'),
        description: 'Tổng phí đường cao tốc sử dụng trong quý 3',
        created_by: MASTER_SEED_DATA.groups.group1.created_by,
        invoiced: true,
        created_at: new Date('2025-09-30T08:00:00Z'),
        updated_at: new Date('2025-09-30T08:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Phí giữ xe tháng 11/2025',
        total_amount: 3000000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-11-01T00:00:00Z'),
        description: 'Phí giữ xe tầng hầm tháng 11/2025',
        created_by: MASTER_SEED_DATA.groups.group1.created_by,
        invoiced: false,
        created_at: new Date('2025-11-01T08:00:00Z'),
        updated_at: new Date('2025-11-01T08:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.groups.group1.id,
        category_id: null,
        cost_name: 'Rửa xe và chăm sóc nội thất',
        total_amount: 350000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-11-18T14:00:00Z'),
        description: 'Rửa xe cao cấp + vệ sinh nội thất',
        created_by: MASTER_SEED_DATA.groups.group1.created_by,
        invoiced: false,
        created_at: new Date('2025-11-18T14:00:00Z'),
        updated_at: new Date('2025-11-18T14:00:00Z')
      }
    );
    
    // VinFast VF e34 - Additional 2025 costs
    costs.push(
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        group_id: MASTER_SEED_DATA.groups.group2.id,
        category_id: null,
        cost_name: 'Bảo hiểm PTI năm 2025-2026',
        total_amount: 10500000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-03-25T08:00:00Z'),
        description: 'Bảo hiểm PTI toàn diện',
        created_by: MASTER_SEED_DATA.groups.group2.created_by,
        invoiced: true,
        created_at: new Date('2025-03-25T08:00:00Z'),
        updated_at: new Date('2025-03-25T08:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        group_id: MASTER_SEED_DATA.groups.group2.id,
        category_id: null,
        cost_name: 'Bảo dưỡng 12 tháng',
        total_amount: 2800000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-06-15T09:00:00Z'),
        description: 'Bảo dưỡng định kỳ 12 tháng tại VinFast Service',
        created_by: MASTER_SEED_DATA.groups.group2.created_by,
        invoiced: true,
        created_at: new Date('2025-06-15T09:00:00Z'),
        updated_at: new Date('2025-06-15T09:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        group_id: MASTER_SEED_DATA.groups.group2.id,
        category_id: null,
        cost_name: 'Phí giữ xe tháng 10-11/2025',
        total_amount: 4000000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-10-01T00:00:00Z'),
        description: 'Phí giữ xe 2 tháng',
        created_by: MASTER_SEED_DATA.groups.group2.created_by,
        invoiced: true,
        created_at: new Date('2025-10-01T08:00:00Z'),
        updated_at: new Date('2025-10-01T08:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        group_id: MASTER_SEED_DATA.groups.group2.id,
        category_id: null,
        cost_name: 'Thay pin remote và kiểm tra hệ thống',
        total_amount: 450000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-11-10T10:00:00Z'),
        description: 'Thay pin remote + kiểm tra cảm biến',
        created_by: MASTER_SEED_DATA.groups.group2.created_by,
        invoiced: false,
        created_at: new Date('2025-11-10T10:00:00Z'),
        updated_at: new Date('2025-11-10T10:00:00Z')
      }
    );
    
    // Hyundai Ioniq 5 - Additional 2025 costs
    costs.push(
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.groups.group3.id,
        category_id: null,
        cost_name: 'Bảo hiểm MIC năm 2025-2026',
        total_amount: 19500000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-02-20T08:00:00Z'),
        description: 'Bảo hiểm MIC vật chất xe',
        created_by: MASTER_SEED_DATA.groups.group3.created_by,
        invoiced: true,
        created_at: new Date('2025-02-20T08:00:00Z'),
        updated_at: new Date('2025-02-20T08:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.groups.group3.id,
        category_id: null,
        cost_name: 'Bảo dưỡng định kỳ 25,000km',
        total_amount: 9200000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-07-18T11:00:00Z'),
        description: 'Bảo dưỡng 25,000km - toàn diện',
        created_by: MASTER_SEED_DATA.groups.group3.created_by,
        invoiced: true,
        created_at: new Date('2025-07-18T11:00:00Z'),
        updated_at: new Date('2025-07-18T11:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.groups.group3.id,
        category_id: null,
        cost_name: 'Phủ ceramic + dán PPF đầu xe',
        total_amount: 8500000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-04-10T09:00:00Z'),
        description: 'Phủ ceramic toàn xe + dán PPF bảo vệ đầu xe',
        created_by: MASTER_SEED_DATA.groups.group3.created_by,
        invoiced: true,
        created_at: new Date('2025-04-10T09:00:00Z'),
        updated_at: new Date('2025-04-10T09:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.groups.group3.id,
        category_id: null,
        cost_name: 'Phí đường cao tốc tháng 11/2025',
        total_amount: 580000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-11-15T00:00:00Z'),
        description: 'Phí đường cao tốc các chuyến đi tháng 11',
        created_by: MASTER_SEED_DATA.groups.group3.created_by,
        invoiced: false,
        created_at: new Date('2025-11-15T08:00:00Z'),
        updated_at: new Date('2025-11-15T08:00:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.groups.group3.id,
        category_id: null,
        cost_name: 'Vệ sinh điều hòa + khử trùng nội thất',
        total_amount: 650000,
        split_type: 'ownership_ratio',
        cost_date: new Date('2025-11-20T13:00:00Z'),
        description: 'Vệ sinh điều hòa + khử trùng cabin',
        created_by: MASTER_SEED_DATA.groups.group3.created_by,
        invoiced: false,
        created_at: new Date('2025-11-20T13:00:00Z'),
        updated_at: new Date('2025-11-20T13:00:00Z')
      }
    );

    // Idempotent: only insert costs that don't exist
    let insertedCount = 0;
    for (const cost of costs) {
      const [[existing]] = await queryInterface.sequelize.query(
        `SELECT id FROM costs WHERE vehicle_id = '${cost.vehicle_id}' 
         AND cost_name = '${cost.cost_name.replace(/'/g, "''")}' 
         AND cost_date = '${cost.cost_date.toISOString()}'
         LIMIT 1`
      );
      
      if (!existing) {
        await queryInterface.bulkInsert('costs', [cost], {});
        insertedCount++;
      }
    }
    
    console.log(`✅ Seeded ${insertedCount} new costs for 2025`);
    console.log(`   - Total generated: ${costs.length}`);
    console.log(`   - Invoiced: ${costs.filter(c => c.invoiced).length}`);
    console.log(`   - Pending: ${costs.filter(c => !c.invoiced).length}`);
    const totalAmount = costs.reduce((sum, c) => sum + c.total_amount, 0);
    console.log(`   - Total amount: ${totalAmount.toLocaleString('vi-VN')} VND`);
  },

  async down(queryInterface, Sequelize) {
    // Delete only 2025 costs
    await queryInterface.sequelize.query(
      `DELETE FROM costs WHERE cost_date >= '2025-01-01' AND cost_date < '2026-01-01'`
    );
  }
};
