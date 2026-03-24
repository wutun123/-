// 导出所有模型
const User = require('./user')
const Product = require('./product')
const ProductSku = require('./productSku')
const Order = require('./order')
const OrderItem = require('./orderItem')
const Distributor = require('./distributor')
const Commission = require('./commission')
const Withdrawal = require('./withdrawal')
const DistributionRelation = require('./distributionRelation')
const UserAddress = require('./userAddress')

// 定义关联关系
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' })
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

User.hasOne(Distributor, { foreignKey: 'user_id', as: 'distributor' })
Distributor.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

Product.hasMany(ProductSku, { foreignKey: 'product_id', as: 'skus' })
ProductSku.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' })
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' })

// 分销关系
Distributor.hasMany(Distributor, { foreignKey: 'parent_id', as: 'children' })
Distributor.belongsTo(Distributor, { foreignKey: 'parent_id', as: 'parent' })

// 用户地址
User.hasMany(UserAddress, { foreignKey: 'user_id', as: 'addresses' })
UserAddress.belongsTo(User, { foreignKey: 'user_id', as: 'user' })

module.exports = {
  User,
  Product,
  ProductSku,
  Order,
  OrderItem,
  Distributor,
  Commission,
  Withdrawal,
  DistributionRelation,
  UserAddress
}
