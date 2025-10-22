// src/seeders/001-demo-user-profiles.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('user_profiles', [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: 'Nguyễn Văn A',
        date_of_birth: '1990-01-15',
        address: '123 Đường ABC, Quận 1, TP.HCM',
        avatar_url: 'https://example.com/avatars/user1.jpg',
        bio: 'Chủ xe điện đầu tiên trong nhóm',
        preferences: JSON.stringify({
          notifications: true,
          language: 'vi',
          currency: 'VND'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        full_name: 'Trần Thị B',
        date_of_birth: '1985-08-22',
        address: '456 Đường XYZ, Quận 2, TP.HCM',
        avatar_url: 'https://example.com/avatars/user2.jpg',
        bio: 'Đam mê xe điện và công nghệ xanh',
        preferences: JSON.stringify({
          notifications: true,
          language: 'en',
          currency: 'USD'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_profiles', null, {});
  }
};