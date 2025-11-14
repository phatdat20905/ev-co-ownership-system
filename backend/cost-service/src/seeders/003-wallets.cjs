'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const userWallets = [];
    const groupWallets = [];

    // Create wallets for all co-owners (insert only missing)
    const coowners = Object.values(MASTER_SEED_DATA.users).filter(u => u.role === 'co_owner');
    const coownerIds = coowners.map(u => u.id);

    // Find existing user_wallet user_ids
    const [existingUserRows] = await queryInterface.sequelize.query(
      `SELECT user_id FROM user_wallets WHERE user_id IN (${coownerIds.map(id => `'${id}'`).join(',')})`
    );
    const existingUserIds = new Set(existingUserRows.map(r => r.user_id));

    coowners.forEach(user => {
      if (!existingUserIds.has(user.id)) {
        userWallets.push({
          id: uuidv4(),
          user_id: user.id,
          balance: Math.floor(Math.random() * 10000000) + 5000000, // Random 5-15 triệu
          currency: 'VND',
          created_at: MASTER_SEED_DATA.dates.systemStart,
          updated_at: MASTER_SEED_DATA.dates.now
        });
      }
    });

    // Create group wallets (insert only missing)
    const groupIds = Object.values(MASTER_SEED_DATA.groups).map(g => g.id);
    const [existingGroupRows] = await queryInterface.sequelize.query(
      `SELECT group_id FROM group_wallets WHERE group_id IN (${groupIds.map(id => `'${id}'`).join(',')})`
    );
    const existingGroupIds = new Set(existingGroupRows.map(r => r.group_id));

    Object.values(MASTER_SEED_DATA.groups).forEach(group => {
      if (!existingGroupIds.has(group.id)) {
        groupWallets.push({
          id: uuidv4(),
          group_id: group.id,
          balance: group.fund_balance,
          currency: 'VND',
          created_at: MASTER_SEED_DATA.dates.systemStart,
          updated_at: MASTER_SEED_DATA.dates.now
        });
      }
    });

    if (userWallets.length > 0) {
      await queryInterface.bulkInsert('user_wallets', userWallets, {});
    }
    if (groupWallets.length > 0) {
      await queryInterface.bulkInsert('group_wallets', groupWallets, {});
    }

    console.log(`✅ Seeded ${userWallets.length} user wallets`);
    console.log(`✅ Seeded ${groupWallets.length} group wallets`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_wallets', null, {});
    await queryInterface.bulkDelete('group_wallets', null, {});
  }
};
