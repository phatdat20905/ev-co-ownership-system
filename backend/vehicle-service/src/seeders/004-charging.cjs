'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const chargingSessions = [
      // Tesla Model 3 charging sessions
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        user_id: '33333333-3333-3333-3333-333333333331',
        charging_station_location: 'VinFast Charging Station - Landmark 81 - Vinhomes Central Park, Quận Bình Thạnh, TP.HCM',
        start_time: new Date('2024-11-10T08:00:00Z'),
        end_time: new Date('2024-11-10T08:35:00Z'),
        start_battery_level: 25.0,
        end_battery_level: 85.0,
        energy_consumed_kwh: 36.0,
        cost: 180000,
        payment_method: 'fast_dc',
        created_at: new Date('2024-11-10T08:00:00Z'),
        updated_at: new Date('2024-11-10T08:35:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.tesla.id,
        user_id: '33333333-3333-3333-3333-333333333332',
        charging_station_location: 'Sạc chậm tại nhà - Nhà riêng, Quận 1',
        start_time: new Date('2024-11-05T22:00:00Z'),
        end_time: new Date('2024-11-06T06:00:00Z'),
        start_battery_level: 35.0,
        end_battery_level: 100.0,
        energy_consumed_kwh: 39.0,
        cost: 117000,
        payment_method: 'slow_ac',
        created_at: new Date('2024-11-05T22:00:00Z'),
        updated_at: new Date('2024-11-06T06:00:00Z')
      },
      
      // VinFast VF e34 charging sessions
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.vinfast.id,
        user_id: '44444444-4444-4444-4444-444444444441',
        charging_station_location: 'VinFast Green SM Mall - Trung tâm VinFast Green SM, Quận 7',
        start_time: new Date('2024-11-08T14:00:00Z'),
        end_time: new Date('2024-11-08T14:40:00Z'),
        start_battery_level: 18.0,
        end_battery_level: 92.0,
        energy_consumed_kwh: 31.08,
        cost: 155400,
        payment_method: 'fast_dc',
        created_at: new Date('2024-11-08T14:00:00Z'),
        updated_at: new Date('2024-11-08T14:40:00Z')
      },
      
      // Hyundai Ioniq 5 charging sessions
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        user_id: '55555555-5555-5555-5555-555555555551',
        charging_station_location: 'EV Charging Station - AEON Mall - AEON Mall Bình Tân',
        start_time: new Date('2024-11-12T10:00:00Z'),
        end_time: new Date('2024-11-12T10:28:00Z'),
        start_battery_level: 32.0,
        end_battery_level: 78.0,
        energy_consumed_kwh: 33.396,
        cost: 166980,
        payment_method: 'fast_dc',
        created_at: new Date('2024-11-12T10:00:00Z'),
        updated_at: new Date('2024-11-12T10:28:00Z')
      },
      {
        id: uuidv4(),
        vehicle_id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        user_id: '55555555-5555-5555-5555-555555555553',
        charging_station_location: 'Sạc chậm tại nhà xe chung - Nhà xe chung EV Co-ownership',
        start_time: new Date('2024-11-13T00:00:00Z'),
        end_time: null,
        start_battery_level: 22.0,
        end_battery_level: null,
        energy_consumed_kwh: null,
        cost: null,
        payment_method: 'slow_ac',
        created_at: new Date('2024-11-13T00:00:00Z'),
        updated_at: new Date('2024-11-13T00:00:00Z')
      }
    ];

    await queryInterface.bulkInsert('charging_sessions', chargingSessions, {});
    
    console.log(`✅ Seeded ${chargingSessions.length} charging sessions`);
    console.log(`   - ${chargingSessions.filter(c => c.status === 'completed').length} completed`);
    console.log(`   - ${chargingSessions.filter(c => c.status === 'charging').length} in progress`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('charging_sessions', null, {});
  }
};
