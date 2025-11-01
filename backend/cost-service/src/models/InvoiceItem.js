// src/models/InvoiceItem.js
export default (sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define('InvoiceItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoiceId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'invoice_id'
    },
    costId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'cost_id'
    },
    itemDescription: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'item_description'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    }
  }, {
    tableName: 'invoice_items',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['invoice_id']
      },
      {
        fields: ['cost_id']
      }
    ]
  });

  InvoiceItem.associate = function(models) {
    InvoiceItem.belongsTo(models.Invoice, {
      foreignKey: 'invoiceId',
      as: 'invoice'
    });
    
    InvoiceItem.belongsTo(models.Cost, {
      foreignKey: 'costId',
      as: 'cost'
    });
  };

  return InvoiceItem;
};