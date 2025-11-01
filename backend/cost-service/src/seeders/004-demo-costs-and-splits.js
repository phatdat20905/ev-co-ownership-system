// src/seeders/005-demo-costs-and-splits.js
export default {
  async up(queryInterface, Sequelize) {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // ✅ Dùng UUID hợp lệ (hexadecimal)
    const cost1Id = 'aaaaaaa1-1111-4111-8111-aaaaaaaaaaaa';
    const cost2Id = 'bbbbbbb2-2222-4222-8222-bbbbbbbbbbbb';

    // Insert demo costs
    await queryInterface.bulkInsert('costs', [
      {
        id: cost1Id,
        group_id: '44444444-4444-4444-4444-444444444444',
        vehicle_id: '66666666-6666-6666-6666-666666666666',
        category_id: '11111111-1111-1111-1111-111111111111', // Charging
        cost_name: 'Monthly Charging Cost - November 2024',
        total_amount: 850000.00,
        split_type: 'ownership_ratio',
        cost_date: lastMonth,
        description: 'Total charging costs for November 2024 across all charging stations',
        created_by: '11111111-1111-1111-1111-111111111111',
        invoiced: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: cost2Id,
        group_id: '44444444-4444-4444-4444-444444444444',
        vehicle_id: '66666666-6666-6666-6666-666666666666',
        category_id: '22222222-2222-2222-2222-222222222222', // Maintenance
        cost_name: 'Quarterly Maintenance',
        total_amount: 1200000.00,
        split_type: 'ownership_ratio',
        cost_date: today,
        description: 'Regular quarterly maintenance including tire rotation and brake check',
        created_by: '22222222-2222-2222-2222-222222222222',
        invoiced: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: ['id'] });

    // Insert demo cost splits
    await queryInterface.bulkInsert('cost_splits', [
      // 🔹 Cost 1 splits
      {
        cost_id: cost1Id,
        user_id: '11111111-1111-1111-1111-111111111111',
        split_amount: 340000.00,
        paid_amount: 0,
        payment_status: 'pending',
        due_date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        cost_id: cost1Id,
        user_id: '22222222-2222-2222-2222-222222222222',
        split_amount: 255000.00,
        paid_amount: 0,
        payment_status: 'pending',
        due_date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        cost_id: cost1Id,
        user_id: '33333333-3333-3333-3333-333333333333',
        split_amount: 255000.00,
        paid_amount: 0,
        payment_status: 'pending',
        due_date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        created_at: new Date(),
        updated_at: new Date()
      },

      // 🔹 Cost 2 splits
      {
        cost_id: cost2Id,
        user_id: '11111111-1111-1111-1111-111111111111',
        split_amount: 480000.00,
        paid_amount: 0,
        payment_status: 'pending',
        due_date: new Date(today.getFullYear(), today.getMonth() + 1, 20),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        cost_id: cost2Id,
        user_id: '22222222-2222-2222-2222-222222222222',
        split_amount: 360000.00,
        paid_amount: 0,
        payment_status: 'pending',
        due_date: new Date(today.getFullYear(), today.getMonth() + 1, 20),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        cost_id: cost2Id,
        user_id: '33333333-3333-3333-3333-333333333333',
        split_amount: 360000.00,
        paid_amount: 0,
        payment_status: 'pending',
        due_date: new Date(today.getFullYear(), today.getMonth() + 1, 20),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('cost_splits', null, {});
    await queryInterface.bulkDelete('costs', null, {});
  }
};
