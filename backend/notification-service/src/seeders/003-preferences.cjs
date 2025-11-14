'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const preferences = [];

    // Create preferences for all users
    const allUsers = Object.values(MASTER_SEED_DATA.users);

    allUsers.forEach(user => {
      const pref = {
        id: uuidv4(),
        user_id: user.id,
        preferences: {
          email_enabled: true,
          sms_enabled: user.role === 'co_owner', // Only co-owners get SMS
          push_enabled: true,
          channels: {
            booking: { email: true, sms: true, push: true },
            payment: { email: true, sms: false, push: true },
            maintenance: { email: true, sms: false, push: true },
            voting: { email: true, sms: false, push: true },
            dispute: { email: true, sms: true, push: true }
          },
          quiet_hours: {
            enabled: true,
            start: '22:00',
            end: '07:00'
          }
        },
        created_at: new Date(),
        updated_at: new Date()
      };

      preferences.push(pref);
    });

    // Idempotent insert: only add preferences for user_ids that don't exist
    const userIds = preferences.map(p => `'${p.user_id}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT user_id FROM user_preferences WHERE user_id IN (${userIds})`
    );
    const existingSet = new Set(existing.map(r => r.user_id));
    const toInsert = preferences.filter(p => !existingSet.has(p.user_id));

    if (toInsert.length > 0) {
      toInsert.forEach(p => {
        p.preferences = Sequelize.literal(`'${JSON.stringify(p.preferences)}'::jsonb`);
      });
      await queryInterface.bulkInsert('user_preferences', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} user preferences`);
    } else {
      console.log('⏩ User preferences already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('notification_preferences', null, {});
  }
};
