'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const contracts = [
      // Group 1 contracts
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group1.id,
        contract_type: 'co_ownership',
        contract_number: 'CONTRACT-2024-001',
        title: 'Hợp đồng đồng sở hữu Tesla Model 3 - Nhóm 1',
        content: `
HỢP ĐỒNG ĐỒNG SỞ HỮU XE ĐIỆN
Số hợp đồng: CONTRACT-2024-001

Bên A (Nhóm đồng sở hữu): Nhóm Tesla Model 3 - Professional
Phương tiện: Tesla Model 3 (Biển số: 51A-12345)

Điều khoản:
1. Tỷ lệ sở hữu được phân chia theo thỏa thuận giữa các thành viên
2. Đóng góp quỹ chung: 2,000,000 VNĐ/tháng
3. Quyền sử dụng xe: Tối đa 8 giờ/ngày
4. Thời gian thông báo trước khi đặt lịch: 24 giờ
5. Bảo trì và bảo hiểm được chia theo tỷ lệ sở hữu
        `,
        status: 'active',
  // migrations expect DATEONLY for effective/expiry dates — use YYYY-MM-DD
  effective_date: MASTER_SEED_DATA.dates.group1Created.toISOString().split('T')[0],
  expiry_date: new Date('2025-12-31').toISOString().split('T')[0],
        auto_renew: true,
        version: 1,
        parent_contract_id: null,
        activated_at: MASTER_SEED_DATA.dates.group1Created,
        terminated_at: null,
        created_by: MASTER_SEED_DATA.users.coowner1.id,
        created_at: MASTER_SEED_DATA.dates.group1Created,
        updated_at: MASTER_SEED_DATA.dates.group1Created
      },
      
      // Group 2 contracts
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group2.id,
        contract_type: 'co_ownership',
        contract_number: 'CONTRACT-2024-002',
        title: 'Hợp đồng đồng sở hữu VinFast VF e34 - Nhóm 2',
        content: `
HỢP ĐỒNG ĐỒNG SỞ HỮU XE ĐIỆN
Số hợp đồng: CONTRACT-2024-002

Bên A (Nhóm đồng sở hữu): Nhóm VinFast VF e34 - Family
Phương tiện: VinFast VF e34 (Biển số: 30G-67890)

Điều khoản:
1. Tỷ lệ sở hữu được phân chia theo thỏa thuận giữa các thành viên
2. Đóng góp quỹ chung: 1,500,000 VNĐ/tháng
3. Quyền sử dụng xe: Tối đa 8 giờ/ngày
4. Phù hợp cho gia đình
5. Bảo trì và bảo hiểm được chia theo tỷ lệ sở hữu
        `,
        status: 'active',
  effective_date: MASTER_SEED_DATA.dates.group2Created.toISOString().split('T')[0],
  expiry_date: new Date('2025-12-31').toISOString().split('T')[0],
        auto_renew: true,
        version: 1,
        parent_contract_id: null,
        activated_at: MASTER_SEED_DATA.dates.group2Created,
        terminated_at: null,
        created_by: MASTER_SEED_DATA.users.coowner5.id,
        created_at: MASTER_SEED_DATA.dates.group2Created,
        updated_at: MASTER_SEED_DATA.dates.group2Created
      },
      
      // Group 3 contracts
      {
        id: uuidv4(),
        group_id: MASTER_SEED_DATA.groups.group3.id,
        contract_type: 'co_ownership',
        contract_number: 'CONTRACT-2024-003',
        title: 'Hợp đồng đồng sở hữu Hyundai Ioniq 5 - Nhóm 3',
        content: `
HỢP ĐỒNG ĐỒNG SỞ HỮU XE ĐIỆN
Số hợp đồng: CONTRACT-2024-003

Bên A (Nhóm đồng sở hữu): Nhóm Hyundai Ioniq 5 - Multi-purpose
Phương tiện: Hyundai Ioniq 5 (Biển số: 51B-24680)

Điều khoản:
1. Tỷ lệ sở hữu được phân chia theo thỏa thuận giữa các thành viên
2. Đóng góp quỹ chung: 2,500,000 VNĐ/tháng
3. Quyền sử dụng xe: Tối đa 8 giờ/ngày
4. Mục đích sử dụng đa dạng
5. Bảo trì và bảo hiểm được chia theo tỷ lệ sở hữu
        `,
        status: 'active',
  effective_date: MASTER_SEED_DATA.dates.group3Created.toISOString().split('T')[0],
  expiry_date: new Date('2025-12-31').toISOString().split('T')[0],
        auto_renew: true,
        version: 1,
        parent_contract_id: null,
        activated_at: MASTER_SEED_DATA.dates.group3Created,
        terminated_at: null,
        created_by: MASTER_SEED_DATA.users.coowner8.id,
        created_at: MASTER_SEED_DATA.dates.group3Created,
        updated_at: MASTER_SEED_DATA.dates.group3Created
      }
    ];

    // Idempotent insert: only insert contracts whose contract_number doesn't already exist
    const contractNumbers = contracts.map(c => `'${c.contract_number}'`).join(',');
    const [existingRows] = await queryInterface.sequelize.query(
      `SELECT contract_number FROM contracts WHERE contract_number IN (${contractNumbers})`
    );

    const existingSet = new Set(existingRows.map(r => r.contract_number));
    const toInsert = contracts.filter(c => !existingSet.has(c.contract_number));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('contracts', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} contracts`);
      toInsert.forEach(c => console.log(`   - ${c.title} (${c.contract_number})`));
    } else {
      console.log('⏩ Contracts already seeded — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    // Only delete seeded contracts by contract_number to be safe
    const contractNumbers = ['CONTRACT-2024-001','CONTRACT-2024-002','CONTRACT-2024-003'];
    await queryInterface.bulkDelete('contracts', { contract_number: contractNumbers }, {});
  }
};
