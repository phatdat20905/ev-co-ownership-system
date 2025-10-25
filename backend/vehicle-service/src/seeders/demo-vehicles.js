// src/seeders/demo-vehicles.js
export default {
  async up(queryInterface, Sequelize) {
    const demoGroupId = '550e8400-e29b-41d4-a716-446655440000';

    await queryInterface.bulkInsert('vehicles', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        group_id: demoGroupId,
        vehicle_name: 'Tesla Model 3 - Team A',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2023,
        license_plate: 'TSLA123',
        vin: '5YJ3E1EAXPF123456',
        color: 'Midnight Silver',
        battery_capacity_kwh: 60.0,
        current_odometer: 12500,
        status: 'available',
        purchase_date: '2023-01-15',
        purchase_price: 45000.00,
        images: JSON.stringify([
          'https://example.com/tesla1.jpg',
          'https://example.com/tesla2.jpg'
        ]),
        specifications: JSON.stringify({
          range_km: 438,
          acceleration: '5.8s 0-100km/h',
          seating_capacity: 5,
          drive_type: 'RWD',
          charging_time: '8 hours (Level 2)'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        group_id: demoGroupId,
        vehicle_name: 'Hyundai Ioniq 5 - Team B',
        brand: 'Hyundai',
        model: 'Ioniq 5',
        year: 2023,
        license_plate: 'HYUN456',
        vin: 'KM8K73AG4PU789012',
        color: 'Atlas White',
        battery_capacity_kwh: 72.6,
        current_odometer: 8900,
        status: 'in_use',
        purchase_date: '2023-03-20',
        purchase_price: 52000.00,
        images: JSON.stringify(['https://example.com/ioniq1.jpg']),
        specifications: JSON.stringify({
          range_km: 488,
          acceleration: '5.2s 0-100km/h',
          seating_capacity: 5,
          drive_type: 'AWD',
          charging_time: '18 min (10-80% DC Fast)'
        }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        group_id: demoGroupId,
        vehicle_name: 'Ford Mustang Mach-E',
        brand: 'Ford',
        model: 'Mustang Mach-E',
        year: 2023,
        license_plate: 'FORD789',
        vin: '3FMTK3SU1NMA12345',
        color: 'Grabber Blue',
        battery_capacity_kwh: 88.0,
        current_odometer: 15600,
        status: 'maintenance',
        purchase_date: '2023-02-10',
        purchase_price: 58000.00,
        images: JSON.stringify([
          'https://example.com/mach-e1.jpg',
          'https://example.com/mach-e2.jpg'
        ]),
        specifications: JSON.stringify({
          range_km: 491,
          acceleration: '3.8s 0-100km/h',
          seating_capacity: 5,
          drive_type: 'AWD',
          charging_time: '10-80% in 45 min'
        }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    await queryInterface.bulkInsert('maintenance_schedules', [
      {
        id: '44444444-4444-4444-4444-444444444444',
        vehicle_id: '33333333-3333-3333-3333-333333333333',
        maintenance_type: 'Brake System Check',
        scheduled_date: '2024-02-15',
        odometer_at_schedule: 15000,
        status: 'scheduled',
        estimated_cost: 150.00,
        notes: 'Routine brake inspection and pad replacement if needed',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        vehicle_id: '11111111-1111-1111-1111-111111111111',
        maintenance_type: 'Tire Rotation',
        scheduled_date: '2024-03-01',
        odometer_at_schedule: 13000,
        status: 'scheduled',
        estimated_cost: 75.00,
        notes: 'Standard tire rotation and pressure check',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    await queryInterface.bulkInsert('vehicle_insurance', [
      {
        id: '66666666-6666-6666-6666-666666666666',
        vehicle_id: '11111111-1111-1111-1111-111111111111',
        insurance_provider: 'EV Insurance Co.',
        policy_number: 'EVIC-2023-TSLA123',
        coverage_type: 'Comprehensive',
        premium_amount: 1200.00,
        start_date: '2023-01-15',
        end_date: '2024-01-15',
        is_active: true,
        document_url: 'https://example.com/insurance/evic-2023-tsla123.pdf',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    await queryInterface.bulkInsert('charging_sessions', [
      {
        id: '77777777-7777-7777-7777-777777777777',
        vehicle_id: '11111111-1111-1111-1111-111111111111',
        user_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        charging_station_location: 'Supercharger - Downtown',
        start_time: '2024-01-10 14:30:00',
        end_time: '2024-01-10 15:15:00',
        start_battery_level: 15.5,
        end_battery_level: 92.0,
        energy_consumed_kwh: 45.2,
        cost: 18.08,
        payment_method: 'credit_card',
        created_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('charging_sessions', null, {});
    await queryInterface.bulkDelete('vehicle_insurance', null, {});
    await queryInterface.bulkDelete('maintenance_schedules', null, {});
    await queryInterface.bulkDelete('vehicles', null, {});
  }
};
