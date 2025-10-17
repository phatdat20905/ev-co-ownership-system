import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const KYCVerification = sequelize.define('KYCVerification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  idCardNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    field: 'id_card_number'
  },
  idCardFrontUrl: {
    type: DataTypes.STRING(500),
    field: 'id_card_front_url'
  },
  idCardBackUrl: {
    type: DataTypes.STRING(500),
    field: 'id_card_back_url'
  },
  driverLicenseNumber: {
    type: DataTypes.STRING(20),
    field: 'driver_license_number'
  },
  driverLicenseUrl: {
    type: DataTypes.STRING(500),
    field: 'driver_license_url'
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    field: 'verification_status'
  },
  verifiedBy: {
    type: DataTypes.UUID,
    field: 'verified_by',
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  verifiedAt: {
    type: DataTypes.DATE,
    field: 'verified_at',
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    field: 'rejection_reason',
    allowNull: true
  }
}, {
  tableName: 'kyc_verifications',
  timestamps: true,
  underscored: true
});

export default KYCVerification;