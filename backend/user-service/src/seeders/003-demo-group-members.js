// src/seeders/003-demo-group-members.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('group_members', [
      // Tesla Group Members
      {
        id: '770e8400-e29b-41d4-a716-446655440000',
        group_id: '660e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        ownership_percentage: 40.00,
        role: 'admin',
        joined_at: new Date(),
        is_active: true
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440001',
        group_id: '660e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        ownership_percentage: 35.00,
        role: 'member',
        joined_at: new Date(),
        is_active: true
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440002',
        group_id: '660e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        ownership_percentage: 25.00,
        role: 'member',
        joined_at: new Date(),
        is_active: true
      },
      // VinFast Group Members
      {
        id: '770e8400-e29b-41d4-a716-446655440003',
        group_id: '660e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        ownership_percentage: 50.00,
        role: 'admin',
        joined_at: new Date(),
        is_active: true
      },
      {
        id: '770e8400-e29b-41d4-a716-446655440004',
        group_id: '660e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440003',
        ownership_percentage: 50.00,
        role: 'member',
        joined_at: new Date(),
        is_active: true
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('group_members', null, {});
  }
};