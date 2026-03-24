const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const Distributor = sequelize.define('Distributor', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '分销商 ID'
  },
  user_id: {
    type: DataTypes.BIGINT,
    unique: true,
    allowNull: false,
    comment: '用户 ID'
  },
  level: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '等级 1-铜牌 2-银牌 3-金牌'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '状态 0-待审核 1-正式 2-已拒绝 3-已冻结'
  },
  parent_id: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    comment: '上级分销商 ID'
  },
  team_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '团队人数'
  },
  level1_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '一级团队人数'
  },
  level2_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '二级团队人数'
  },
  total_commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '累计佣金'
  },
  withdrawn_commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '已提现佣金'
  },
  pending_commission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '待结算佣金'
  },
  apply_time: {
    type: DataTypes.DATE,
    comment: '申请时间'
  },
  audit_time: {
    type: DataTypes.DATE,
    comment: '审核时间'
  },
  approved_time: {
    type: DataTypes.DATE,
    comment: '通过时间'
  }
}, {
  tableName: 'distributors',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['parent_id'] },
    { fields: ['status'] }
  ]
})

module.exports = Distributor
