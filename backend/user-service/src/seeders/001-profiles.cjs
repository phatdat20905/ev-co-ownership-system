'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const profiles = Object.keys(MASTER_SEED_DATA.users).map(key => {
      const user = MASTER_SEED_DATA.users[key];
      const profile = MASTER_SEED_DATA.profiles[key];
      
      return {
        id: uuidv4(),
        user_id: user.id,
        full_name: profile.full_name,
        gender: profile.gender,
        date_of_birth: new Date(profile.date_of_birth),
        phone_number: user.phone || null,
        email: user.email || null,
        address: profile.address,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&size=200&background=random`,
        bio: user.role === 'admin' 
          ? 'Quản trị viên hệ thống EV Co-ownership'
          : user.role === 'staff'
          ? 'Nhân viên hỗ trợ khách hàng'
          : 'Thành viên đồng sở hữu xe điện',
        // Use JSON string for JSONB bulkInsert compatibility
        preferences: JSON.stringify({
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          language: 'vi',
          timezone: 'Asia/Ho_Chi_Minh'
        }),
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
      };
    });

    // Idempotent insert: check which user_ids already exist and only insert missing profiles
    const userIds = profiles.map(p => p.user_id);
    const existing = await queryInterface.sequelize.query(
      `SELECT user_id FROM user_profiles WHERE user_id IN (:userIds)`,
      { replacements: { userIds }, type: Sequelize.QueryTypes.SELECT }
    );

    const existingIds = existing.map(r => r.user_id);
    const profilesToInsert = profiles.filter(p => !existingIds.includes(p.user_id));

    if (profilesToInsert.length > 0) {
      await queryInterface.bulkInsert('user_profiles', profilesToInsert, {});
      console.log(`✅ Seeded ${profilesToInsert.length} user profiles`);
    } else {
      console.log('⏩ User profiles already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('user_profiles', null, {});
  }
};
