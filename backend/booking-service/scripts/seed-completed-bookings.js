// Seed completed bookings for testing revenue calculation
import db from '../src/models/index.js';
import { v4 as uuidv4 } from 'uuid';

const VEHICLE_IDS = [
  '88888888-8888-8888-8888-888888888881', // Tesla Model 3
  '88888888-8888-8888-8888-888888888882', // VinFast VF e34
  '88888888-8888-8888-8888-888888888883'  // Hyundai Ioniq 5
];

const USER_IDS = [
  '33333333-3333-3333-3333-333333333331',
  '33333333-3333-3333-3333-333333333332',
  '44444444-4444-4444-4444-444444444441',
  '44444444-4444-4444-4444-444444444442',
  '55555555-5555-5555-5555-555555555551'
];

const GROUP_IDS = [
  '77777777-7777-7777-7777-777777777771', // Tesla group
  '77777777-7777-7777-7777-777777777772', // VinFast group
  '77777777-7777-7777-7777-777777777773'  // Hyundai group
];

async function seedCompletedBookings() {
  console.log('🌱 Seeding completed bookings...');

  const bookings = [];

  // Tesla Model 3 - 5 completed bookings
  for (let i = 0; i < 5; i++) {
    const startDate = new Date(2024, 10 - i, 10 + i, 8, 0);
    const endDate = new Date(2024, 10 - i, 10 + i, 18, 0);
    const duration = 10; // 10 hours
    const actualDistance = 50 + (i * 10); // 50-90 km
    const cost = (duration * 60000) + (actualDistance * 5000); // 60k/hour + 5k/km

    bookings.push({
      id: uuidv4(),
      vehicleId: VEHICLE_IDS[0],
      userId: USER_IDS[i % 2],
      groupId: GROUP_IDS[0],
      startTime: startDate,
      endTime: endDate,
      purpose: `Business trip ${i + 1}`,
      destination: 'TP. Hồ Chí Minh',
      estimatedDistance: actualDistance,
      status: 'completed',
      checkInTime: startDate,
      checkInOdometer: 12000 + (i * 100),
      checkInBatteryPercent: 90,
      checkOutTime: endDate,
      checkOutOdometer: 12000 + (i * 100) + actualDistance,
      checkOutBatteryPercent: 70,
      actualDistance: actualDistance,
      cost: cost,
      createdAt: new Date(2024, 10 - i, 5),
      updatedAt: endDate
    });
  }

  // VinFast VF e34 - 3 completed bookings
  for (let i = 0; i < 3; i++) {
    const startDate = new Date(2024, 9 - i, 15 + i, 9, 0);
    const endDate = new Date(2024, 9 - i, 15 + i, 15, 0);
    const duration = 6;
    const actualDistance = 30 + (i * 15);
    const cost = (duration * 50000) + (actualDistance * 4500); // 50k/hour + 4.5k/km

    bookings.push({
      id: uuidv4(),
      vehicleId: VEHICLE_IDS[1],
      userId: USER_IDS[2 + (i % 2)],
      groupId: GROUP_IDS[1],
      startTime: startDate,
      endTime: endDate,
      purpose: `Family trip ${i + 1}`,
      destination: 'Quận 7, TP.HCM',
      estimatedDistance: actualDistance,
      status: 'completed',
      checkInTime: startDate,
      checkInOdometer: 8000 + (i * 100),
      checkInBatteryPercent: 95,
      checkOutTime: endDate,
      checkOutOdometer: 8000 + (i * 100) + actualDistance,
      checkOutBatteryPercent: 80,
      actualDistance: actualDistance,
      cost: cost,
      createdAt: new Date(2024, 9 - i, 10),
      updatedAt: endDate
    });
  }

  // Hyundai Ioniq 5 - 7 completed bookings
  for (let i = 0; i < 7; i++) {
    const startDate = new Date(2024, 8 - (i % 3), 20 + i, 7, 0);
    const endDate = new Date(2024, 8 - (i % 3), 20 + i, 19, 0);
    const duration = 12;
    const actualDistance = 80 + (i * 5);
    const cost = (duration * 70000) + (actualDistance * 6000); // 70k/hour + 6k/km

    bookings.push({
      id: uuidv4(),
      vehicleId: VEHICLE_IDS[2],
      userId: USER_IDS[4],
      groupId: GROUP_IDS[2],
      startTime: startDate,
      endTime: endDate,
      purpose: `Long trip ${i + 1}`,
      destination: 'Vũng Tàu',
      estimatedDistance: actualDistance,
      status: 'completed',
      checkInTime: startDate,
      checkInOdometer: 15000 + (i * 100),
      checkInBatteryPercent: 100,
      checkOutTime: endDate,
      checkOutOdometer: 15000 + (i * 100) + actualDistance,
      checkOutBatteryPercent: 60,
      actualDistance: actualDistance,
      cost: cost,
      createdAt: new Date(2024, 8 - (i % 3), 15),
      updatedAt: endDate
    });
  }

  // Insert all bookings using Sequelize
  for (const booking of bookings) {
    try {
      await db.Booking.create(booking);
      console.log(`✅ Created booking ${booking.id} - ${booking.purpose} (${booking.cost.toLocaleString('vi-VN')} VNĐ)`);
    } catch (error) {
      console.error(`❌ Failed to create booking: ${error.message}`);
    }
  }

  // Calculate total revenue per vehicle
  const tesla = bookings.filter(b => b.vehicleId === VEHICLE_IDS[0]);
  const vinfast = bookings.filter(b => b.vehicleId === VEHICLE_IDS[1]);
  const hyundai = bookings.filter(b => b.vehicleId === VEHICLE_IDS[2]);

  const teslaRevenue = tesla.reduce((sum, b) => sum + b.cost, 0);
  const vinfastRevenue = vinfast.reduce((sum, b) => sum + b.cost, 0);
  const hyundaiRevenue = hyundai.reduce((sum, b) => sum + b.cost, 0);

  console.log('\n📊 Revenue Summary:');
  console.log(`Tesla Model 3: ${tesla.length} bookings → ${teslaRevenue.toLocaleString('vi-VN')} VNĐ`);
  console.log(`VinFast VF e34: ${vinfast.length} bookings → ${vinfastRevenue.toLocaleString('vi-VN')} VNĐ`);
  console.log(`Hyundai Ioniq 5: ${hyundai.length} bookings → ${hyundaiRevenue.toLocaleString('vi-VN')} VNĐ`);
  console.log(`\n💰 Total Revenue: ${(teslaRevenue + vinfastRevenue + hyundaiRevenue).toLocaleString('vi-VN')} VNĐ`);
}

seedCompletedBookings()
  .then(() => {
    console.log('\n✅ Seed completed bookings done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
