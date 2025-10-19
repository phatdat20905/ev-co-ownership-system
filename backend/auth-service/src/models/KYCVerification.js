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
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    idCardNumber: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true,
      field: 'id_card_number'
    },
    idCardFrontUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'id_card_front_url'
    },
    idCardBackUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'id_card_back_url'
    },
    driverLicenseNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'driver_license_number'
    },
    driverLicenseUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'driver_license_url'
    },
    verificationStatus: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      field: 'verification_status'
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'verified_by',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'verified_at'
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason'
    }
  }, {
    tableName: 'kyc_verifications',
    timestamps: true,
    underscored: true
  });

  KYCVerification.associate = function(models) {
    KYCVerification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    KYCVerification.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifier'
    });
  };

  return KYCVerification;
};