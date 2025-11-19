import dashboardService from '../src/services/dashboardService.js';
import { mongoDBClient } from '../src/config/mongodb.js';
import db from '../src/models/index.js';

async function main() {
  try {
    console.log('Connecting to Postgres...');
    await db.sequelize.authenticate();
    console.log('Postgres connected.');

    console.log('Connecting to MongoDB...');
    await mongoDBClient.connect();
    console.log('MongoDB connected.');

    const overview = await dashboardService.getOverviewStats('7d');

    console.log('--- Dashboard Overview (raw) ---');
    console.log(JSON.stringify(overview, null, 2));

    const flatStats = {
      totalUsers: overview.users?.total || 0,
      activeUsers: overview.users?.active || 0,
      monthlyRevenue: overview.revenue?.total || 0,
      totalRevenue: overview.revenue?.total || 0,
      todayBookings: Math.floor(overview.bookings?.total / 30) || 0,
      period: overview.period
    };

    console.log('--- Flattened stats (frontend shape) ---');
    console.log(JSON.stringify(flatStats, null, 2));

    await mongoDBClient.disconnect();
    await db.sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Error verifying dashboard:', err);
    try { await mongoDBClient.disconnect(); } catch (e) {}
    try { await db.sequelize.close(); } catch (e) {}
    process.exit(1);
  }
}

main();
