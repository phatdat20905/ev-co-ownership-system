// Seed script for fairness analysis demo data
import mongoose from 'mongoose';
import { config } from 'dotenv';
import FairnessRecord from '../src/models/FairnessRecord.js';

config();

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://admin:admin123@localhost:27017/ev_ai_service?authSource=admin';

// Demo data
const demoFairnessRecords = [
  {
    groupId: '77777777-7777-7777-7777-777777777771', // Nhóm Tesla Model 3 - Professional
    vehicleId: '88888888-8888-8888-8888-888888888881', // Tesla Model 3
    analysisDate: new Date('2025-01-15'),
    periodStart: new Date('2024-12-15'),
    periodEnd: new Date('2025-01-15'),
    timeRange: 'month',
    overallFairnessScore: 72,
    fairnessLevel: 'fair',
    totalBookings: 24,
    totalUsageHours: 180,
    members: [
      {
        userId: '33333333-3333-3333-3333-333333333331', // Nguyễn Văn An
        ownershipPercentage: 40,
        actualUsagePercentage: 55,
        totalBookingHours: 99,
        totalBookingDays: 12,
        usageDeviation: 15,
        fairnessScore: 70,
        status: 'overuse',
        recommendedHours: 72
      },
      {
        userId: '33333333-3333-3333-3333-333333333332', // Trần Thị Bảo
        ownershipPercentage: 30,
        actualUsagePercentage: 28,
        totalBookingHours: 50,
        totalBookingDays: 8,
        usageDeviation: -2,
        fairnessScore: 90,
        status: 'fair',
        recommendedHours: 54
      },
      {
        userId: '33333333-3333-3333-3333-333333333333', // Lê Văn Cường
        ownershipPercentage: 20,
        actualUsagePercentage: 12,
        totalBookingHours: 22,
        totalBookingDays: 4,
        usageDeviation: -8,
        fairnessScore: 80,
        status: 'underuse',
        recommendedHours: 36
      },
      {
        userId: '33333333-3333-3333-3333-333333333334', // Phạm Thị Diệu
        ownershipPercentage: 10,
        actualUsagePercentage: 5,
        totalBookingHours: 9,
        totalBookingDays: 2,
        usageDeviation: -5,
        fairnessScore: 75,
        status: 'underuse',
        recommendedHours: 18
      }
    ],
    conflicts: 3,
    recommendations: [
      {
        userId: '33333333-3333-3333-3333-333333333331',
        priority: 'high',
        message: 'Bạn đã sử dụng xe 55% so với mức sở hữu 40%. Hãy cân nhắc giảm bớt lượt đặt xe để công bằng hơn cho các thành viên khác.',
        suggestedTimeSlots: []
      },
      {
        userId: '33333333-3333-3333-3333-333333333333',
        priority: 'medium',
        message: 'Bạn mới chỉ sử dụng 12% so với mức sở hữu 20%. Bạn có thể đặt thêm khoảng 36h trong kỳ tới.',
        suggestedTimeSlots: [
          { dayOfWeek: 'monday', startHour: 8, endHour: 12, reason: 'Thời gian ít xung đột' },
          { dayOfWeek: 'wednesday', startHour: 14, endHour: 18, reason: 'Thời gian khả dụng cao' },
          { dayOfWeek: 'friday', startHour: 9, endHour: 17, reason: 'Ngày cuối tuần rảnh' }
        ]
      },
      {
        userId: '33333333-3333-3333-3333-333333333334',
        priority: 'medium',
        message: 'Bạn chưa tận dụng hết quyền lợi của mình (chỉ dùng 5% so với 10% sở hữu). Hãy tăng cường sử dụng xe.',
        suggestedTimeSlots: [
          { dayOfWeek: 'tuesday', startHour: 10, endHour: 16, reason: 'Thời điểm ít cạnh tranh' },
          { dayOfWeek: 'saturday', startHour: 8, endHour: 18, reason: 'Cả ngày cuối tuần' }
        ]
      }
    ],
    insights: [
      {
        category: 'usage_pattern',
        severity: 'info',
        message: 'Nguyễn Văn An có xu hướng sử dụng xe nhiều vào cuối tuần và giờ cao điểm.',
        affectedUsers: ['33333333-3333-3333-3333-333333333331']
      },
      {
        category: 'fairness',
        severity: 'warning',
        message: 'Chênh lệch giữa mức sở hữu và mức sử dụng thực tế của Nguyễn Văn An đang ở mức cao (15%).',
        affectedUsers: ['33333333-3333-3333-3333-333333333331']
      },
      {
        category: 'recommendation',
        severity: 'info',
        message: 'Lê Văn Cường và Phạm Thị Diệu nên tăng cường sử dụng xe vào các thời điểm trống để tối ưu quyền lợi.',
        affectedUsers: ['33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333334']
      }
    ],
    aiMetadata: {
      modelUsed: 'gemini-2.5-flash',
      confidenceScore: 0.85,
      processingTime: 1240,
      version: '1.0.0'
    }
  },
  {
    groupId: '77777777-7777-7777-7777-777777777771', // Same group - previous month
    vehicleId: '88888888-8888-8888-8888-888888888881',
    analysisDate: new Date('2024-12-15'),
    periodStart: new Date('2024-11-15'),
    periodEnd: new Date('2024-12-15'),
    timeRange: 'month',
    overallFairnessScore: 65,
    fairnessLevel: 'needs_improvement',
    totalBookings: 20,
    totalUsageHours: 150,
    members: [
      {
        userId: '33333333-3333-3333-3333-333333333331',
        ownershipPercentage: 40,
        actualUsagePercentage: 60,
        totalBookingHours: 90,
        totalBookingDays: 10,
        usageDeviation: 20,
        fairnessScore: 60,
        status: 'overuse',
        recommendedHours: 60
      },
      {
        userId: '33333333-3333-3333-3333-333333333332',
        ownershipPercentage: 30,
        actualUsagePercentage: 26,
        totalBookingHours: 39,
        totalBookingDays: 6,
        usageDeviation: -4,
        fairnessScore: 86,
        status: 'fair',
        recommendedHours: 45
      },
      {
        userId: '33333333-3333-3333-3333-333333333333',
        ownershipPercentage: 20,
        actualUsagePercentage: 10,
        totalBookingHours: 15,
        totalBookingDays: 4,
        usageDeviation: -10,
        fairnessScore: 74,
        status: 'underuse',
        recommendedHours: 30
      },
      {
        userId: '33333333-3333-3333-3333-333333333334',
        ownershipPercentage: 10,
        actualUsagePercentage: 4,
        totalBookingHours: 6,
        totalBookingDays: 2,
        usageDeviation: -6,
        fairnessScore: 70,
        status: 'underuse',
        recommendedHours: 15
      }
    ],
    conflicts: 5,
    recommendations: [
      {
        userId: '33333333-3333-3333-3333-333333333331',
        priority: 'high',
        message: 'Mức sử dụng của bạn cao hơn đáng kể so với tỷ lệ sở hữu. Đề nghị cân nhắc giảm bớt thời gian đặt xe.',
        suggestedTimeSlots: []
      },
      {
        userId: '33333333-3333-3333-3333-333333333333',
        priority: 'high',
        message: 'Bạn đang sử dụng dưới mức quyền lợi. Hãy tận dụng thời gian sử dụng xe nhiều hơn.',
        suggestedTimeSlots: [
          { dayOfWeek: 'tuesday', startHour: 10, endHour: 16, reason: 'Thời điểm ít cạnh tranh' },
          { dayOfWeek: 'thursday', startHour: 8, endHour: 18, reason: 'Cả ngày trống' }
        ]
      },
      {
        userId: '33333333-3333-3333-3333-333333333334',
        priority: 'high',
        message: 'Bạn gần như không sử dụng xe. Nếu không có nhu cầu, hãy cân nhắc giảm tỷ lệ sở hữu hoặc cho thành viên khác thuê.',
        suggestedTimeSlots: [
          { dayOfWeek: 'saturday', startHour: 8, endHour: 18, reason: 'Thời gian cuối tuần rảnh' }
        ]
      }
    ],
    insights: [
      {
        category: 'conflict',
        severity: 'warning',
        message: 'Số lượng xung đột đặt xe tăng cao (5 xung đột). Cần điều chỉnh lịch để tránh tranh chấp.',
        affectedUsers: ['33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333332']
      },
      {
        category: 'fairness',
        severity: 'warning',
        message: 'Mức độ công bằng chung của nhóm đang giảm so với tháng trước. Đề xuất tổ chức họp nhóm để thống nhất quy tắc sử dụng rõ ràng hơn.',
        affectedUsers: ['33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333334']
      },
      {
        category: 'recommendation',
        severity: 'info',
        message: 'Hai thành viên có tỷ lệ sở hữu thấp (20% và 10%) nên được khuyến khích sử dụng nhiều hơn hoặc cân nhắc điều chỉnh cơ cấu sở hữu.',
        affectedUsers: ['33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333334']
      }
    ],
    aiMetadata: {
      modelUsed: 'gemini-2.5-flash',
      confidenceScore: 0.82,
      processingTime: 1180,
      version: '1.0.0'
    }
  },
  // Group 2 - VinFast VF e34
  {
    groupId: '77777777-7777-7777-7777-777777777772', // Nhóm VinFast VF e34 - Family
    vehicleId: '88888888-8888-8888-8888-888888888882', // VinFast VF e34
    analysisDate: new Date('2025-01-15'),
    periodStart: new Date('2024-12-15'),
    periodEnd: new Date('2025-01-15'),
    timeRange: 'month',
    overallFairnessScore: 88,
    fairnessLevel: 'excellent',
    totalBookings: 18,
    totalUsageHours: 145,
    members: [
      {
        userId: '44444444-4444-4444-4444-444444444441', // Hoàng Văn Ễ
        ownershipPercentage: 50,
        actualUsagePercentage: 48,
        totalBookingHours: 70,
        totalBookingDays: 9,
        usageDeviation: -2,
        fairnessScore: 95,
        status: 'fair',
        recommendedHours: 72.5
      },
      {
        userId: '44444444-4444-4444-4444-444444444442', // Võ Thị Phượng
        ownershipPercentage: 30,
        actualUsagePercentage: 32,
        totalBookingHours: 46,
        totalBookingDays: 6,
        usageDeviation: 2,
        fairnessScore: 92,
        status: 'fair',
        recommendedHours: 43.5
      },
      {
        userId: '44444444-4444-4444-4444-444444444443', // Nguyễn Văn Giang
        ownershipPercentage: 20,
        actualUsagePercentage: 20,
        totalBookingHours: 29,
        totalBookingDays: 4,
        usageDeviation: 0,
        fairnessScore: 100,
        status: 'fair',
        recommendedHours: 29
      }
    ],
    conflicts: 1,
    recommendations: [
      {
        userId: '44444444-4444-4444-4444-444444444441',
        priority: 'low',
        message: 'Mức sử dụng của bạn rất hợp lý và công bằng. Tiếp tục duy trì!',
        suggestedTimeSlots: []
      },
      {
        userId: '44444444-4444-4444-4444-444444444442',
        priority: 'low',
        message: 'Bạn đang sử dụng đúng mức, tuy nhiên có thể giảm một chút để tối ưu cho nhóm.',
        suggestedTimeSlots: []
      },
      {
        userId: '44444444-4444-4444-4444-444444444443',
        priority: 'low',
        message: 'Hoàn hảo! Bạn đang sử dụng đúng tỷ lệ sở hữu của mình.',
        suggestedTimeSlots: []
      }
    ],
    insights: [
      {
        category: 'fairness',
        severity: 'info',
        message: 'Nhóm này có mức độ công bằng xuất sắc! Tất cả thành viên đều sử dụng xe gần đúng với tỷ lệ sở hữu.',
        affectedUsers: ['44444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444442', '44444444-4444-4444-4444-444444444443']
      },
      {
        category: 'usage_pattern',
        severity: 'info',
        message: 'Nhóm chủ yếu sử dụng xe vào cuối tuần và ngày lễ, phù hợp với mục đích gia đình.',
        affectedUsers: []
      }
    ],
    aiMetadata: {
      modelUsed: 'gemini-2.5-flash',
      confidenceScore: 0.92,
      processingTime: 980,
      version: '1.0.0'
    }
  }
];

async function seedFairnessData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing fairness records...');
    await FairnessRecord.deleteMany({});
    console.log('✅ Cleared existing records');

    console.log('🌱 Seeding fairness records...');
    const inserted = await FairnessRecord.insertMany(demoFairnessRecords);
    console.log(`✅ Seeded ${inserted.length} fairness records`);

    console.log('\n📊 Seeded Records:');
    inserted.forEach(record => {
      console.log(`  - Group ${record.groupId.slice(0, 8)}: Score ${record.overallFairnessScore}, Level: ${record.fairnessLevel}`);
    });

    console.log('\n✅ Fairness data seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding fairness data:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run seeding
seedFairnessData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
