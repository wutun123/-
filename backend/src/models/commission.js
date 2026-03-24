const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const Commission = sequelize.define('Commission', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '佣金 ID'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '分销商用户 ID'
  },
  order_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '订单 ID'
  },
  order_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '订单号'
  },
  level: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '佣金层级 1-一级 2-二级'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '佣金金额'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态 0-待结算 1-已结算 2-已提现 3-已取消'
  },
  settled_at: {
    type: DataTypes.DATE,
    comment: '结算时间'
  },
  withdrawn_at: {
    type: DataTypes.DATE,
    comment: '提现时间'
  },
  remark: {
    type: DataTypes.STRING(255),
    comment: '备注'
  }
}, {
  tableName: 'commissions',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['order_id'] },
    { fields: ['status'] }
  ]
})

module.exports = Commission
