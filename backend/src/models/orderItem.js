const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '订单商品 ID'
  },
  order_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '订单 ID'
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '商品 ID'
  },
  sku_id: {
    type: DataTypes.BIGINT,
    comment: 'SKU ID'
  },
  product_name: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: '商品名称'
  },
  sku_spec: {
    type: DataTypes.STRING(128),
    comment: 'SKU 规格'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '单价'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '数量'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '小计'
  },
  commission_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '佣金金额'
  }
}, {
  tableName: 'order_items',
  indexes: [
    { fields: ['order_id'] }
  ]
})

module.exports = OrderItem
