// src/models/Invoice.js
export default (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id'
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'invoice_number'
    },
    invoicePeriodStart: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'invoice_period_start'
    },
    invoicePeriodEnd: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'invoice_period_end'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'total_amount'
    },
    status: {
      type: DataTypes.ENUM('unpaid', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'unpaid'
    },
    generatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'generated_at'
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'due_date'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'paid_at'
    },
    pdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'pdf_url'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  }, {
    tableName: 'invoices',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        fields: ['group_id']
      },
      {
        fields: ['invoice_number'],
        unique: true
      },
      {
        fields: ['status']
      }
    ]
  });

  Invoice.associate = function(models) {
    Invoice.hasMany(models.InvoiceItem, {
      foreignKey: 'invoiceId',
      as: 'items'
    });
  };

  return Invoice;
};