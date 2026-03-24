const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const ProductSku = sequelize.define('ProductSku', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: 'SKU ID'
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '商品 ID'
  },
  spec_name: {
    type: DataTypes.STRING(64),
    comment: '规格名称 如"5kg"'
  },
  spec_value: {
    type: DataTypes.STRING(128),
    comment: '规格值 JSON'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '售价'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    comment: '原价'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '库存'
  },
  sku_code: {
    type: DataTypes.STRING(64),
    comment: 'SKU 编码'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态 0-禁用 1-启用'
  }
}, {
  tableName: 'product_skus',
  indexes: [
    { fields: ['product_id'] }
  ]
})

module.exports = ProductSku
