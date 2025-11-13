// src/models/KYCVerification.js
export default (sequelize, DataTypes) => {
  const KYCVerification = sequelize.define('KYCVerification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id'
    },
    idCardNumber: {
      type: DataTypes.STRING(20),
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
      allowNull: false,
      defaultValue: 'pending',
      field: 'verification_status'
    },
    verifiedBy: {
      type: DataTypes.UUID,
      field: 'verified_by'
    },
    verifiedAt: {
      type: DataTypes.DATE,
      field: 'verified_at'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      field: 'rejection_reason'
    },
    submittedAt: {
      type: DataTypes.DATE,
      field: 'submitted_at'
    }
  }, {
    tableName: 'kyc_verifications',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['verification_status']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['verified_by']
      },
      {
        fields: ['submitted_at']
      }
    ]
  });

  KYCVerification.associate = function(models) {
    KYCVerification.belongsTo(models.StaffProfile, {
      foreignKey: 'verified_by',
      as: 'verifiedByStaff'
    });
  };

  KYCVerification.beforeCreate((kyc) => {
    if (!kyc.submittedAt) {
      kyc.submittedAt = new Date();
    }
  });

  KYCVerification.beforeUpdate((kyc) => {
    if (kyc.changed('verificationStatus') && kyc.verificationStatus === 'approved') {
      kyc.verifiedAt = new Date();
    }
  });

  return KYCVerification;
};