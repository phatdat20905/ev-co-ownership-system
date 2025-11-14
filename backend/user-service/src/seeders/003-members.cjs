'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const members = [];
    
    Object.keys(MASTER_SEED_DATA.groupMembers).forEach(groupKey => {
      const groupId = MASTER_SEED_DATA.groups[groupKey].id;
      const groupMembers = MASTER_SEED_DATA.groupMembers[groupKey];
      const joinDate = groupKey === 'group1'
        ? MASTER_SEED_DATA.dates.group1Created
        : groupKey === 'group2'
        ? MASTER_SEED_DATA.dates.group2Created
        : MASTER_SEED_DATA.dates.group3Created;
      
      groupMembers.forEach(member => {
        members.push({
          id: uuidv4(),
          group_id: groupId,
          user_id: member.user_id,
          role: member.role === 'owner' ? 'admin' : member.role,
          ownership_percentage: member.ownership,
          joined_at: joinDate,
          is_active: true
        });
      });
    });

    // Idempotent insert: only insert group_member pairs that don't exist
    const groupIds = Array.from(new Set(members.map(m => m.group_id)));
    const userIds = Array.from(new Set(members.map(m => m.user_id)));

    const existing = await queryInterface.sequelize.query(
      `SELECT group_id, user_id FROM group_members WHERE group_id IN (:groupIds) AND user_id IN (:userIds)`,
      { replacements: { groupIds, userIds }, type: Sequelize.QueryTypes.SELECT }
    );

    const existingPairs = new Set(existing.map(r => `${r.group_id}|${r.user_id}`));
    const membersToInsert = members.filter(m => !existingPairs.has(`${m.group_id}|${m.user_id}`));

    if (membersToInsert.length > 0) {
      await queryInterface.bulkInsert('group_members', membersToInsert, {});
      console.log(`✅ Seeded ${membersToInsert.length} group members`);
    } else {
      console.log('⏩ Group members already exist — nothing to do');
    }

    console.log(`   - Group 1: ${MASTER_SEED_DATA.groupMembers.group1.length} members`);
    console.log(`   - Group 2: ${MASTER_SEED_DATA.groupMembers.group2.length} members`);
    console.log(`   - Group 3: ${MASTER_SEED_DATA.groupMembers.group3.length} members`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('group_members', null, {});
  }
};
