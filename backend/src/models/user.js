const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户 ID'
  },
  openid: {
    type: DataTypes.STRING(64),
    unique: true,
    allowNull: false,
    comment: '微信 OpenID'
  },
  unionid: {
    type: DataTypes.STRING(64),
    unique: true,
    comment: '微信 UnionID'
  },
  nickname: {
    type: DataTypes.STRING(64),
    comment: '昵称'
  },
  avatar: {
    type: DataTypes.STRING(255),
    comment: '头像 URL'
  },
  phone: {
    type: DataTypes.STRING(20),
    comment: '手机号'
  },
  gender: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '性别 0-未知 1-男 2-女'
  },
  member_level: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '会员等级 1-普通 2-VIP'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '累计消费金额'
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['openid'] },
    { fields: ['phone'] }
  ]
})

module.exports = User
