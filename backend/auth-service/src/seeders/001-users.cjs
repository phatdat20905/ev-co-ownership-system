'use strict';

const bcrypt = require('bcryptjs');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = Object.values(MASTER_SEED_DATA.users);

    const usersData = await Promise.all(
      users.map(async (user) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        password_hash: await bcrypt.hash(user.password, 10),
        role: user.role,
        is_verified: user.id.startsWith('6666') ? false : true,
        is_active: true,
        last_login_at: user.id.startsWith('6666') ? null : MASTER_SEED_DATA.dates.now,
        created_at: user.id.startsWith('1111') 
          ? MASTER_SEED_DATA.dates.adminCreated
          : user.id.startsWith('2222')
          ? MASTER_SEED_DATA.dates.staffCreated
          : user.id.startsWith('3333')
          ? MASTER_SEED_DATA.dates.group1Created
          : user.id.startsWith('4444')
          ? MASTER_SEED_DATA.dates.group2Created
          : MASTER_SEED_DATA.dates.group3Created,
        updated_at: MASTER_SEED_DATA.dates.now
      }))
    );

    // Idempotent insert: don't re-insert users with existing email
    const emails = usersData.map(u => `'${u.email}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT email FROM users WHERE email IN (${emails})`
    );
    const existingSet = new Set(existing.map(r => r.email));
    const toInsert = usersData.filter(u => !existingSet.has(u.email));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('users', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} users (of ${usersData.length} total)`);
    } else {
      console.log('⏩ Users already exist — nothing to do');
    }
    console.log(`📧 Test credentials: admin@evcoownership.com / Password123!`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
