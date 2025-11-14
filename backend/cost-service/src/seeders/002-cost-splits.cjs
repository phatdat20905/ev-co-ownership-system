'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get costs to create splits (use total_amount column)
    const [costs] = await queryInterface.sequelize.query(
      "SELECT id, group_id, total_amount FROM costs"
    );
    
    const splits = [];
    
    for (const cost of costs) {
      // Get group members and their ownership percentages
      let members = [];
      if (cost.group_id === MASTER_SEED_DATA.groups.group1.id) {
        members = MASTER_SEED_DATA.groupMembers.group1.map(m => ({
          user_id: m.user_id,
          ownership: m.ownership
        }));
      } else if (cost.group_id === MASTER_SEED_DATA.groups.group2.id) {
        members = MASTER_SEED_DATA.groupMembers.group2.map(m => ({
          user_id: m.user_id,
          ownership: m.ownership
        }));
      } else if (cost.group_id === MASTER_SEED_DATA.groups.group3.id) {
        members = MASTER_SEED_DATA.groupMembers.group3.map(m => ({
          user_id: m.user_id,
          ownership: m.ownership
        }));
      }
      
      // Create split for each member based on ownership percentage
      members.forEach(member => {
        // Calculate split amount from total_amount and ownership percentage
        const splitAmount = Math.round(cost.total_amount * (member.ownership / 100));
        splits.push({
          id: uuidv4(),
          cost_id: cost.id,
          user_id: member.user_id,
          split_amount: splitAmount,
          paid_amount: 0,
          payment_status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        });
      });
    }
    
    await queryInterface.bulkInsert('cost_splits', splits, {});
    
    console.log(`✅ Seeded ${splits.length} cost splits`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cost_splits', null, {});
  }
};
