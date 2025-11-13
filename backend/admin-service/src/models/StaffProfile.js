// src/models/StaffProfile.js
export default (sequelize, DataTypes) => {
  const StaffProfile = sequelize.define('StaffProfile', {
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
    employeeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'employee_id'
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    department: {
      type: DataTypes.ENUM('support', 'finance', 'operations', 'admin'),
      allowNull: false
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        user_management: false,
        dispute_management: false,
        kyc_approval: false,
        system_settings: false,
        reports_view: false,
        analytics_view: false
      }
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'hire_date'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'staff_profiles',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['department']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  StaffProfile.associate = function(models) {
    StaffProfile.hasMany(models.Dispute, {
      foreignKey: 'assigned_to',
      as: 'assignedDisputes'
    });
    StaffProfile.hasMany(models.KYCVerification, {
      foreignKey: 'verified_by',
      as: 'verifiedKYCs'
    });
  };

  return StaffProfile;
};