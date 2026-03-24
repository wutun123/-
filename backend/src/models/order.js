const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '订单 ID'
  },
  order_no: {
    type: DataTypes.STRING(32),
    unique: true,
    allowNull: false,
    comment: '订单号'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户 ID'
  },
  distributor_id: {
    type: DataTypes.BIGINT,
    comment: '分销商 ID(谁推广的)'
  },
  order_status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态 0-待付款 1-待发货 2-待收货 3-已完成 4-已取消 5-售后'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '订单总额'
  },
  freight_amount: {
    type: DataTypes.DECIMAL(10, 2),
  defaultValue: 0,
    comment: '运费'
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '优惠金额'
  },
  pay_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '实付金额'
  },
  pay_time: {
    type: DataTypes.DATE,
    comment: '支付时间'
  },
  delivery_time: {
    type: DataTypes.DATE,
    comment: '发货时间'
  },
  receive_time: {
    type: DataTypes.DATE,
    comment: '收货时间'
  },
  finish_time: {
    type: DataTypes.DATE,
    comment: '完成时间'
  },
  cancel_time: {
    type: DataTypes.DATE,
    comment: '取消时间'
  },
  receiver_name: {
    type: DataTypes.STRING(32),
    comment: '收件人'
  },
  receiver_phone: {
    type: DataTypes.STRING(20),
    comment: '收件人电话'
  },
  receiver_address: {
    type: DataTypes.STRING(255),
    comment: '收件地址'
  },
  remark: {
    type: DataTypes.STRING(255),
    comment: '用户备注'
  }
}, {
  tableName: 'orders',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['order_no'] },
    { fields: ['distributor_id'] },
    { fields: ['order_status'] }
  ]
})

module.exports = Order
