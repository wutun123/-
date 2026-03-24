const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const Withdrawal = sequelize.define('Withdrawal', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '提现 ID'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户 ID'
  },
  distributor_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '分销商 ID'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '提现金额'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态 0-待审核 1-处理中 2-已完成 3-已驳回'
  },
  audit_remark: {
    type: DataTypes.STRING(255),
    comment: '审核备注'
  },
  transaction_id: {
    type: DataTypes.STRING(64),
    comment: '微信分账交易号'
  },
  apply_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '申请时间'
  },
  audit_time: {
    type: DataTypes.DATE,
    comment: '审核时间'
  },
  finish_time: {
    type: DataTypes.DATE,
    comment: '完成时间'
  }
}, {
  tableName: 'withdrawals',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] }
  ]
})

module.exports = Withdrawal
