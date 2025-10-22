// src/seeders/002-demo-co-ownership-groups.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('co_ownership_groups', [
      {
        id: '660e8400-e29b-41d4-a716-446655440000',
        group_name: 'Nhóm Đồng Sở Hữu Tesla Model 3',
        description: 'Nhóm đồng sở hữu xe Tesla Model 3 màu đỏ, sản xuất 2023',
        created_by: '550e8400-e29b-41d4-a716-446655440000',
        group_fund_balance: 15000000.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        group_name: 'Nhóm VinFast VF e34',
        description: 'Nhóm đồng sở hữu xe VinFast VF e34, phiên bản cao cấp',
        created_by: '550e8400-e29b-41d4-a716-446655440001',
        group_fund_balance: 8000000.00,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('co_ownership_groups', null, {});
  }
};