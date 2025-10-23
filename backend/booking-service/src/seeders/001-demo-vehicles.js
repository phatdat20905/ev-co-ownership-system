import { v4 as uuidv4 } from 'uuid';

export default {
  async up(queryInterface, Sequelize) {
    const demoVehicles = [
      {
        id: uuidv4(),
        group_id: '550e8400-e29b-41d4-a716-446655440000', // Sample group ID
        vehicle_name: 'Tesla Model 3 - Xanh',
        license_plate: '29A-12345',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2023,
        color: 'Xanh',
        battery_capacity_kwh: 60.0,
        current_odometer: 12500,
        status: 'available',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        group_id: '550e8400-e29b-41d4-a716-446655440000',
        vehicle_name: 'VinFast VF e34 - Đỏ',
        license_plate: '30A-67890',
        brand: 'VinFast',
        model: 'VF e34',
        year: 2023,
        color: 'Đỏ',
        battery_capacity_kwh: 42.0,
        current_odometer: 8500,
        status: 'available',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        group_id: '550e8400-e29b-41d4-a716-446655440001', // Another group
        vehicle_name: 'Hyundai Kona Electric - Trắng',
        license_plate: '29B-54321',
        brand: 'Hyundai',
        model: 'Kona Electric',
        year: 2023,
        color: 'Trắng',
        battery_capacity_kwh: 64.0,
        current_odometer: 3200,
        status: 'maintenance',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('vehicles', demoVehicles);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('vehicles', null, {});
  }
};