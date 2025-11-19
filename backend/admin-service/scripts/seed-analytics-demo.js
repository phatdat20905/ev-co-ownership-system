import { mongoDBClient } from '../src/config/mongodb.js';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  try {
    await mongoDBClient.connect();
    const events = mongoDBClient.getCollection('analytics_events');
    const now = new Date();

    // Create simple daily events for the past 7 days
    const docs = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
      const iso = day.toISOString();

      // user registrations
      for (let i = 0; i < 5 + d; i++) {
        docs.push({
          _id: uuidv4(),
          service: 'user-service',
          event_type: 'user.registered',
          timestamp: new Date(day.getTime() + i * 1000),
          user_id: uuidv4(),
          user_name: `demo_user_${d}_${i}`,
          metadata: {},
          created_at: day,
          // Fields expected by analyticsRepository aggregation
          indexed_service: 'user-service',
          indexed_event_type: 'user.registered',
          indexed_timestamp: new Date(day.getTime() + i * 1000)
        });
      }

      // bookings
      for (let i = 0; i < 3 + Math.floor(d / 2); i++) {
        docs.push({
          _id: uuidv4(),
          service: 'booking-service',
          event_type: 'booking.created',
          timestamp: new Date(day.getTime() + i * 2000),
          user_id: uuidv4(),
          metadata: { amount: 0 },
          created_at: day,
          indexed_service: 'booking-service',
          indexed_event_type: 'booking.created',
          indexed_timestamp: new Date(day.getTime() + i * 2000)
        });
      }

      // payments
      for (let i = 0; i < 2 + Math.floor(d / 3); i++) {
        docs.push({
          _id: uuidv4(),
          service: 'cost-service',
          event_type: 'payment.completed',
          timestamp: new Date(day.getTime() + i * 3000),
          user_id: uuidv4(),
          metadata: { amount: 150000 },
          created_at: day,
          indexed_service: 'cost-service',
          indexed_event_type: 'payment.completed',
          indexed_timestamp: new Date(day.getTime() + i * 3000)
        });
      }
    }

    if (docs.length > 0) {
      await events.insertMany(docs);
      console.log(`✅ Inserted ${docs.length} demo analytics events into MongoDB`);
    } else {
      console.log('No analytics docs to insert');
    }

    // Optionally insert an admin metric
    const adminMetrics = mongoDBClient.getCollection('admin_metrics');
    await adminMetrics.insertOne({
      metric_type: 'real_time',
      timestamp: new Date(),
      metrics: { demo: true },
      environment: process.env.NODE_ENV || 'development',
      created_at: new Date()
    });

    await mongoDBClient.disconnect();
  } catch (err) {
    console.error('Failed to seed analytics:', err);
    try { await mongoDBClient.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

seed();
