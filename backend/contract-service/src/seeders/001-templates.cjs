'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const templates = [
      {
        id: uuidv4(),
        template_name: 'Hợp đồng đồng sở hữu xe điện',
        // description column not present in migration; if you need to keep it, migrate later
        template_type: 'co_ownership',
        content: `
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

HỢP ĐỒNG ĐỒNG SỞ HỮU VÀ SỬ DỤNG XE ĐIỆN

Hôm nay, ngày {{contract_date}}, tại {{contract_location}}

BÊN A (CHỦ XE): {{owner_name}}
CMND/CCCD: {{owner_id}}
Địa chỉ: {{owner_address}}

BÊN B (ĐỒNG SỞ HỮU): {{member_name}}
CMND/CCCD: {{member_id}}
Địa chỉ: {{member_address}}

THÔNG TIN XE:
- Biển số: {{vehicle_plate}}
- Loại xe: {{vehicle_model}}
- Năm sản xuất: {{vehicle_year}}

ĐIỀU 1: QUY ĐỊNH SỞ HỮU
- Tỷ lệ sở hữu: {{ownership_percentage}}%
- Quyền và nghĩa vụ được quy định theo tỷ lệ sở hữu

ĐIỀU 2: ĐÓNG GÓP QUÁN LÝ
- Đóng góp hàng tháng: {{monthly_contribution}} VNĐ
- Thanh toán trước ngày 5 hàng tháng

ĐIỀU 3: SỬ DỤNG XE
- Đặt lịch trước tối thiểu 24 giờ
- Tối đa {{max_hours_per_day}} giờ/ngày
- Ưu tiên theo điểm priority

ĐIỀU 4: CHI PHÍ
- Chia sẻ theo tỷ lệ sở hữu
- Bao gồm: bảo hiểm, bảo dưỡng, sạc điện

CHỮ KÝ BÊN A                    CHỮ KÝ BÊN B
`,
        // variables stored as JSONB
        variables: [
          'contract_date', 'contract_location', 'owner_name', 'owner_id', 'owner_address',
          'member_name', 'member_id', 'member_address', 'vehicle_plate', 'vehicle_model',
          'vehicle_year', 'ownership_percentage', 'monthly_contribution', 'max_hours_per_day'
        ],
        version: '1.0',
        is_active: true,
        created_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date('2024-01-01T08:00:00Z'),
        updated_at: new Date('2024-01-01T08:00:00Z')
      },
      {
        id: uuidv4(),
        template_name: 'Phụ lục bảo trì định kỳ',
  // migration allowed enum: 'co_ownership' | 'amendment' | 'termination'
  template_type: 'amendment',
        content: `
PHỤ LỤC HỢP ĐỒNG
BẢO TRÌ ĐỊNH KỲ XE ĐIỆN

Kèm theo hợp đồng số: {{contract_number}}

LỊCH BẢO TRÌ:
- Bảo dưỡng định kỳ: Mỗi {{maintenance_km}} km hoặc {{maintenance_months}} tháng
- Kiểm tra pin: Mỗi {{battery_check_months}} tháng
- Đăng kiểm: Theo quy định pháp luật

CHI PHÍ BẢO TRÌ:
- Dự kiến: {{estimated_cost}} VNĐ/năm
- Chia sẻ theo tỷ lệ sở hữu

TRÁCH NHIỆM:
- Người phát hiện sự cố phải báo ngay
- Sửa chữa khẩn cấp < {{emergency_threshold}} VNĐ không cần phê duyệt
- Sửa chữa lớn cần biểu quyết

Ngày ký: {{appendix_date}}
`,
        variables: [
          'contract_number', 'maintenance_km', 'maintenance_months', 'battery_check_months',
          'estimated_cost', 'emergency_threshold', 'appendix_date'
        ],
        version: '1.0',
        is_active: true,
        created_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date('2024-01-01T08:00:00Z'),
        updated_at: new Date('2024-01-01T08:00:00Z')
      },
      {
        id: uuidv4(),
        template_name: 'Thỏa thuận rút khỏi nhóm',
  template_type: 'termination',
        content: `
THỎA THUẬN RÚT KHỎI NHÓM ĐỒNG SỞ HỮU

Ngày: {{exit_date}}

BÊN RÚT: {{exiting_member_name}}
Tỷ lệ sở hữu hiện tại: {{current_ownership}}%

ĐIỀU KHOẢN:
1. Giá trị thanh toán: {{settlement_amount}} VNĐ
2. Thời hạn thanh toán: {{payment_deadline}}
3. Chuyển giao quyền sở hữu cho: {{new_owner_name}}

CAM KẾT:
- Thanh lý mọi khoản nợ trước khi rút
- Bàn giao đầy đủ tài liệu liên quan
- Không có tranh chấp sau khi ký

CHỮ KÝ CÁC BÊN
`,
        variables: [
          'exit_date', 'exiting_member_name', 'current_ownership', 'settlement_amount',
          'payment_deadline', 'new_owner_name'
        ],
        version: '1.0',
        is_active: true,
        created_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date('2024-01-01T08:00:00Z'),
        updated_at: new Date('2024-01-01T08:00:00Z')
      }
    ];

    // Idempotent insert by template_name
    const names = templates.map(t => `'${t.template_name}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT template_name FROM contract_templates WHERE template_name IN (${names})`
    );
    const existingSet = new Set(existing.map(r => r.template_name));
    const toInsert = templates.filter(t => !existingSet.has(t.template_name));
    if (toInsert.length > 0) {
      // Convert variables arrays to JSONB literal so Postgres receives JSONB (not text[])
      toInsert.forEach(t => {
        if (t.variables && Array.isArray(t.variables)) {
          t.variables = Sequelize.literal(`'${JSON.stringify(t.variables)}'::jsonb`);
        }
      });
      await queryInterface.bulkInsert('contract_templates', toInsert, {});
      console.log(`✅ Seeded ${toInsert.length} contract templates`);
    } else {
      console.log('⏩ Contract templates already exist — nothing to do');
    }
  },

  async down(queryInterface, Sequelize) {
    // Only remove the seeded templates by name to be safe
    const templateNames = ['Hợp đồng đồng sở hữu xe điện','Phụ lục bảo trì định kỳ','Thỏa thuận rút khỏi nhóm'];
    await queryInterface.bulkDelete('contract_templates', { template_name: templateNames }, {});
  }
};
