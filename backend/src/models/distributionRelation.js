const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const DistributionRelation = sequelize.define('DistributionRelation', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '关系 ID'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '粉丝用户 ID'
  },
  distributor_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '绑定分销商 ID'
  },
  level: {
    type: DataTypes.TINYINT,
    allowNull: false,
    comment: '关系层级 1-一级 2-二级'
  },
  bind_source: {
    type: DataTypes.STRING(32),
    comment: '绑定来源 share/click'
  },
  bind_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '绑定时间'
  }
}, {
  tableName: 'distribution_relations',
  indexes: [
    { fields: ['user_id', 'distributor_id', 'level'], unique: true },
    { fields: ['user_id'] }
  ]
})

module.exports = DistributionRelation
