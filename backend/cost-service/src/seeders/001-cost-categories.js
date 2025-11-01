// src/seeders/001-cost-categories.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('cost_categories', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        category_name: 'Charging',
        description: 'Electric vehicle charging costs including electricity fees and charging station costs',
        is_recurring: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        category_name: 'Maintenance',
        description: 'Regular vehicle maintenance, repairs, and part replacements',
        is_recurring: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        category_name: 'Insurance',
        description: 'Vehicle insurance premiums and coverage costs',
        is_recurring: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        category_name: 'Parking',
        description: 'Parking fees, permits, and garage costs',
        is_recurring: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        category_name: 'Cleaning',
        description: 'Vehicle cleaning, detailing, and interior maintenance',
        is_recurring: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        category_name: 'Tolls',
        description: 'Road, bridge, and highway toll fees',
        is_recurring: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '77777777-7777-7777-7777-777777777777',
        category_name: 'Registration',
        description: 'Vehicle registration, inspection, and certification fees',
        is_recurring: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        category_name: 'Usage',
        description: 'Usage-based costs calculated by distance traveled or time used',
        is_recurring: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '99999999-9999-9999-9999-999999999999',
        category_name: 'Battery Replacement',
        description: 'EV battery replacement and maintenance costs',
        is_recurring: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        category_name: 'Software Updates',
        description: 'Vehicle software and firmware update costs',
        is_recurring: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cost_categories', null, {});
  }
};