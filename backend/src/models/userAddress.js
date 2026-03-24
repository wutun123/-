const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const UserAddress = sequelize.define('UserAddress', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '地址 ID'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户 ID'
  },
  receiver_name: {
    type: DataTypes.STRING(32),
    allowNull: false,
    comment: '收件人姓名'
  },
  receiver_phone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '收件人电话'
  },
  province: {
    type: DataTypes.STRING(32),
    comment: '省'
  },
  city: {
    type: DataTypes.STRING(32),
    comment: '市'
  },
  district: {
    type: DataTypes.STRING(32),
    comment: '区'
  },
  detail_address: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: '详细地址'
  },
  is_default: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
    comment: '是否默认 0-否 1-是'
  }
}, {
  tableName: 'user_addresses',
  indexes: [
    { fields: ['user_id'] }
  ]
})

module.exports = UserAddress
