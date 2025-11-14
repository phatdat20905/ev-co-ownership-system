import db from '../src/models/index.js';
import MASTER_SEED_DATA from '../../shared/seed-data/master-data.js';

async function run() {
  const userIds = Object.values(MASTER_SEED_DATA.users).map(u => u.id).filter(Boolean);
  console.log('Deleting user_profiles for user ids:', userIds.length);

  const deleted = await db.UserProfile.destroy({ where: { userId: userIds } });
  console.log(`Deleted ${deleted} user_profiles rows.`);

  await db.sequelize.close();
}

run().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(2); });
