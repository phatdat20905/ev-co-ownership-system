'use strict';

const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const vehicles = Object.values(MASTER_SEED_DATA.vehicles).map(vehicle => ({
      id: vehicle.id,
      group_id: vehicle.group_id,
      vehicle_name: vehicle.name,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      license_plate: vehicle.license_plate,
      vin: vehicle.vin,
      color: vehicle.color,
      battery_capacity_kwh: vehicle.battery_capacity,
      current_odometer: vehicle.odometer || 0,
      status: 'available',
      purchase_date: vehicle.id.includes('tesla')
        ? MASTER_SEED_DATA.dates.teslaPurchased
        : vehicle.id.includes('vinfast')
        ? MASTER_SEED_DATA.dates.vinfastPurchased
        : MASTER_SEED_DATA.dates.ioniq5Purchased,
      purchase_price: vehicle.purchase_price,
      images: JSON.stringify([
        `https://storage.evcoownership.com/vehicles/${vehicle.id}/front.jpg`,
        `https://storage.evcoownership.com/vehicles/${vehicle.id}/side.jpg`,
        `https://storage.evcoownership.com/vehicles/${vehicle.id}/interior.jpg`,
        `https://storage.evcoownership.com/vehicles/${vehicle.id}/dashboard.jpg`
      ]),
      specifications: JSON.stringify({
        seats: 5,
        doors: 4,
        transmission: 'Automatic',
        drive_type: vehicle.brand === 'Tesla' ? 'AWD' : 'FWD',
        charging_time_fast: '30-40 phút (80%)',
        charging_time_standard: '6-8 giờ (100%)',
        max_speed: 200,
        acceleration_0_100: vehicle.brand === 'Tesla' ? '3.1s' : '7.5s',
        range_km: vehicle.range,
        current_battery_percent: vehicle.current_battery || 80
      }),
      created_at: vehicle.id.includes('tesla')
        ? MASTER_SEED_DATA.dates.teslaPurchased
        : vehicle.id.includes('vinfast')
        ? MASTER_SEED_DATA.dates.vinfastPurchased
        : MASTER_SEED_DATA.dates.ioniq5Purchased,
      updated_at: MASTER_SEED_DATA.dates.now
    }));

    // Idempotent insert: only insert vehicles that don't already exist
    const vehicleIds = vehicles.map(v => v.id);
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM vehicles WHERE id IN (:vehicleIds)`,
      { replacements: { vehicleIds }, type: Sequelize.QueryTypes.SELECT }
    );

    const existingIds = existing.map(r => r.id);
    const vehiclesToInsert = vehicles.filter(v => !existingIds.includes(v.id));

    if (vehiclesToInsert.length > 0) {
      await queryInterface.bulkInsert('vehicles', vehiclesToInsert, {});
      console.log(`✅ Seeded ${vehiclesToInsert.length} vehicles`);
      vehiclesToInsert.forEach(v => console.log(`   - ${v.vehicle_name} (${v.license_plate})`));
    } else {
      console.log('⏩ Vehicles already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('vehicles', null, {});
  }
};
