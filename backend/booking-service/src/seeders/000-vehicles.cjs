'use strict';

const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const vehicles = [
      {
        id: MASTER_SEED_DATA.vehicles.tesla.id,
        group_id: MASTER_SEED_DATA.vehicles.tesla.group_id,
        vehicle_name: MASTER_SEED_DATA.vehicles.tesla.name,
        license_plate: MASTER_SEED_DATA.vehicles.tesla.license_plate,
        brand: MASTER_SEED_DATA.vehicles.tesla.brand,
        model: MASTER_SEED_DATA.vehicles.tesla.model,
        year: MASTER_SEED_DATA.vehicles.tesla.year,
        color: MASTER_SEED_DATA.vehicles.tesla.color,
        battery_capacity_kwh: MASTER_SEED_DATA.vehicles.tesla.battery_capacity,
        current_odometer: MASTER_SEED_DATA.vehicles.tesla.odometer,
        status: 'available',
        created_at: MASTER_SEED_DATA.dates.teslaPurchased,
        updated_at: MASTER_SEED_DATA.dates.teslaPurchased
      },
      {
        id: MASTER_SEED_DATA.vehicles.vinfast.id,
        group_id: MASTER_SEED_DATA.vehicles.vinfast.group_id,
        vehicle_name: MASTER_SEED_DATA.vehicles.vinfast.name,
        license_plate: MASTER_SEED_DATA.vehicles.vinfast.license_plate,
        brand: MASTER_SEED_DATA.vehicles.vinfast.brand,
        model: MASTER_SEED_DATA.vehicles.vinfast.model,
        year: MASTER_SEED_DATA.vehicles.vinfast.year,
        color: MASTER_SEED_DATA.vehicles.vinfast.color,
        battery_capacity_kwh: MASTER_SEED_DATA.vehicles.vinfast.battery_capacity,
        current_odometer: MASTER_SEED_DATA.vehicles.vinfast.odometer,
        status: 'available',
        created_at: MASTER_SEED_DATA.dates.vinfastPurchased,
        updated_at: MASTER_SEED_DATA.dates.vinfastPurchased
      },
      {
        id: MASTER_SEED_DATA.vehicles.ioniq5.id,
        group_id: MASTER_SEED_DATA.vehicles.ioniq5.group_id,
        vehicle_name: MASTER_SEED_DATA.vehicles.ioniq5.name,
        license_plate: MASTER_SEED_DATA.vehicles.ioniq5.license_plate,
        brand: MASTER_SEED_DATA.vehicles.ioniq5.brand,
        model: MASTER_SEED_DATA.vehicles.ioniq5.model,
        year: MASTER_SEED_DATA.vehicles.ioniq5.year,
        color: MASTER_SEED_DATA.vehicles.ioniq5.color,
        battery_capacity_kwh: MASTER_SEED_DATA.vehicles.ioniq5.battery_capacity,
        current_odometer: MASTER_SEED_DATA.vehicles.ioniq5.odometer,
        status: 'available',
        created_at: MASTER_SEED_DATA.dates.ioniq5Purchased,
        updated_at: MASTER_SEED_DATA.dates.ioniq5Purchased
      }
    ];

    // Insert only vehicles that don't already exist (idempotent)
    const ids = vehicles.map(v => `'${v.id}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT id FROM vehicles WHERE id IN (${ids})`
    );
    const existingIds = existing.map(r => r.id);
    const toInsert = vehicles.filter(v => !existingIds.includes(v.id));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('vehicles', toInsert, {});
    }

    console.log(`✅ Seeded ${toInsert.length} vehicles into booking-service (skipped ${vehicles.length - toInsert.length} already-present)`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('vehicles', null, {});
  }
};
