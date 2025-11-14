'use strict';

const { v4: uuidv4 } = require('uuid');
const MASTER_SEED_DATA = require('../../../shared/seed-data/master-data').MASTER_SEED_DATA;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const settings = [
      {
        id: uuidv4(),
        setting_key: 'system.name',
        setting_value: 'EV Co-ownership & Cost-sharing System',
        data_type: 'string',
        category: 'general',
        description: 'Tên hệ thống',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'system.timezone',
        setting_value: 'Asia/Ho_Chi_Minh',
        data_type: 'string',
        category: 'general',
        description: 'Múi giờ hệ thống',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'booking.max_advance_days',
        setting_value: '14',
        data_type: 'number',
        category: 'general',
        description: 'Số ngày tối đa được đặt trước',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'booking.min_notice_hours',
        setting_value: '24',
        data_type: 'number',
        category: 'general',
        description: 'Số giờ tối thiểu phải báo trước khi hủy',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'booking.max_hours_per_day',
        setting_value: '8',
        data_type: 'number',
        category: 'general',
        description: 'Số giờ tối đa được đặt mỗi ngày',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'payment.late_fee_percentage',
        setting_value: '5',
        data_type: 'number',
        category: 'billing',
        description: 'Phần trăm phí phạt thanh toán trễ',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'payment.deadline_days',
        setting_value: '15',
        data_type: 'number',
        category: 'billing',
        description: 'Số ngày hạn thanh toán',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'maintenance.emergency_threshold',
        setting_value: '10000000',
        data_type: 'number',
        category: 'general',
        description: 'Ngưỡng chi phí khẩn cấp không cần phê duyệt (VNĐ)',
        is_public: false,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'battery.low_warning_percentage',
        setting_value: '20',
        data_type: 'number',
        category: 'general',
        description: 'Phần trăm pin cảnh báo thấp',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'voting.quorum_percentage',
        setting_value: '60',
        data_type: 'number',
        category: 'analytics',
        description: 'Phần trăm tối thiểu phải tham gia biểu quyết',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'voting.approval_threshold',
        setting_value: '51',
        data_type: 'number',
        category: 'analytics',
        description: 'Phần trăm tối thiểu phải đồng ý để thông qua',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'notification.quiet_hours_start',
        setting_value: '22:00',
        data_type: 'string',
        category: 'notifications',
        description: 'Giờ bắt đầu chế độ im lặng',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'notification.quiet_hours_end',
        setting_value: '07:00',
        data_type: 'string',
        category: 'notifications',
        description: 'Giờ kết thúc chế độ im lặng',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'kyc.auto_approve_enabled',
        setting_value: 'false',
        data_type: 'boolean',
        category: 'security',
        description: 'Tự động duyệt KYC (chỉ dùng cho test)',
        is_public: false,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        setting_key: 'feature.ai_recommendations',
        setting_value: 'true',
        data_type: 'boolean',
        category: 'analytics',
        description: 'Bật tính năng gợi ý AI',
        is_public: true,
        updated_by: MASTER_SEED_DATA.users.admin1.id,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Idempotent insert: insert only keys that are missing (uses setting_key)
    const keys = settings.map(s => `'${s.setting_key}'`).join(',');
    const [existing] = await queryInterface.sequelize.query(
      `SELECT setting_key FROM system_settings WHERE setting_key IN (${keys})`
    );
    const existingKeys = existing.map(r => r.setting_key);
    const toInsert = settings.filter(s => !existingKeys.includes(s.setting_key));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert('system_settings', toInsert, {});
    }

    console.log(`✅ Seeded ${toInsert.length} system settings (inserted), ${settings.length - toInsert.length} already existed`);
    console.log(`   - ${toInsert.filter(s => s.category === 'general').length} general settings (new)`);
    console.log(`   - ${toInsert.filter(s => s.category === 'billing').length} billing settings (new)`);
    console.log(`   - ${toInsert.filter(s => s.category === 'analytics').length} analytics settings (new)`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('system_settings', null, {});
  }
};
