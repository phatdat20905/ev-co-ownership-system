export default (sequelize, DataTypes) => {
  const EmailVerification = sequelize.define('EmailVerification', {
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
    verificationToken: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'verification_token'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expires_at'
    },
    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'email_verifications',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['verification_token']
      },
      {
        fields: ['expires_at']
      }
    ]
  });

  EmailVerification.associate = function(models) {
    EmailVerification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return EmailVerification;
};