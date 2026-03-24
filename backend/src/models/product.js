const { DataTypes } = require('sequelize')
const { sequelize } = require('../database')

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '商品 ID'
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: '商品名称'
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '分类 ID'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '商品描述'
  },
  main_image: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '主图 URL'
  },
  images: {
    type: DataTypes.JSON,
    comment: '图片列表 JSON'
  },
  brand: {
    type: DataTypes.STRING(64),
    comment: '品牌'
  },
  commission_rate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: '佣金比例%'
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
    comment: '状态 0-下架 1-上架'
  }
}, {
  tableName: 'products',
  indexes: [
    { fields: ['category_id'] },
    { fields: ['status'] }
  ]
})

module.exports = Product
