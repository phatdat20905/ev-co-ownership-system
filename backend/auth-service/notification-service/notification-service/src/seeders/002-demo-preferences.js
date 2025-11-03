export default {
  async up(queryInterface) {
    const preferences = [
      {
        id: '660e8400-e29b-41d4-a716-446655440000',
        user_id: '770e8400-e29b-41d4-a716-446655440000',
        preferences: JSON.stringify({
          email: true,
          push: true,
          sms: false,
          in_app: true
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        user_id: '770e8400-e29b-41d4-a716-446655440001',
        preferences: JSON.stringify({
          email: true,
          push: false,
          sms: true,
          in_app: true
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('user_preferences', preferences);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_preferences', null, {});
  }
};
