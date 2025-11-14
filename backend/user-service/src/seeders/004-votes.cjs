'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const votes = [
      // Group 1 - Insurance vote (executed)
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group1.id,
        title: 'Mua bảo hiểm VCX cho xe Tesla Model 3',
        description: 'Đề xuất mua bảo hiểm VCX (Vật chất xe) với mức phí 15 triệu/năm',
        vote_type: 'insurance',
        status: 'executed',
        created_by: MASTER_SEED_DATA.groups.group1.created_by,
        created_at: new Date('2024-02-01T08:00:00Z'),
        deadline: new Date('2024-02-08T08:00:00Z'),
        closed_at: new Date('2024-02-08T08:00:00Z'),
        updated_at: new Date('2024-02-08T08:00:00Z')
      },

      // Group 2 - Maintenance vote (open)
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group2.id,
        title: 'Thay pin xe VinFast VF e34',
        description: 'Pin bắt đầu suy giảm hiệu suất, cần thay thế. Chi phí ước tính 50 triệu đồng',
        vote_type: 'maintenance',
        status: 'open',
        created_by: MASTER_SEED_DATA.groups.group2.created_by,
        created_at: new Date('2024-11-10T08:00:00Z'),
        deadline: new Date('2024-11-17T08:00:00Z')
        ,
        updated_at: MASTER_SEED_DATA.dates.now
      },

      // Group 3 - Upgrade vote (closed)
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group3.id,
        title: 'Nâng cấp hệ thống âm thanh Ioniq 5',
        description: 'Thay thế hệ thống âm thanh với loa JBL cao cấp, chi phí 30 triệu',
        vote_type: 'upgrade',
        status: 'closed',
        created_by: MASTER_SEED_DATA.groups.group3.created_by,
        created_at: new Date('2024-10-15T08:00:00Z'),
        deadline: new Date('2024-10-22T08:00:00Z'),
        closed_at: new Date('2024-10-22T08:00:00Z'),
        updated_at: new Date('2024-10-22T08:00:00Z')
      }
    ];

    await queryInterface.bulkInsert('group_votes', votes, {});
    
    console.log(`✅ Seeded ${votes.length} group votes`);
    console.log(`   - ${votes.filter(v => v.status === 'approved').length} approved`);
    console.log(`   - ${votes.filter(v => v.status === 'ongoing').length} ongoing`);
    console.log(`   - ${votes.filter(v => v.status === 'rejected').length} rejected`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('group_votes', null, {});
  }
};
