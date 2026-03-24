const { Order, OrderItem, User, Product, ProductSku, Distributor, Withdrawal, Commission, sequelize, Category } = require('../models')
const { Op } = require('sequelize')

/**
 * 获取后台统计数据
 */
async function getDashboardStats(ctx) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // 今日订单数和销售额
    const todayOrders = await Order.count({
      where: {
        created_at: { [Op.gte]: today },
        order_status: { [Op.ne]: 4 }
      }
    })

    const todaySales = await Order.sum('pay_amount', {
      where: {
        created_at: { [Op.gte]: today },
        order_status: { [Op.in]: [1, 2, 3] }
      }
    })

    // 昨日数据用于计算趋势
    const yesterdayOrders = await Order.count({
      where: {
        created_at: { [Op.gte]: yesterday, [Op.lt]: today },
        order_status: { [Op.ne]: 4 }
      }
    })

    const yesterdaySales = await Order.sum('pay_amount', {
      where: {
        created_at: { [Op.gte]: yesterday, [Op.lt]: today },
        order_status: { [Op.in]: [1, 2, 3] }
      }
    })

    // 待发货订单
    const pendingOrders = await Order.count({
      where: { order_status: 1 }
    })

    // 待审核分销商
    const pendingDistributors = await Distributor.count({
      where: { status: 0 }
    })

    // 计算增长率
    const ordersTrend = yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders * 100).toFixed(2) : 0
    const salesTrend = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales * 100).toFixed(2) : 0

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        today_orders: todayOrders,
        today_sales: todaySales || 0,
        pending_orders: pendingOrders,
        pending_distributors: pendingDistributors,
        orders_trend: parseFloat(ordersTrend),
        sales_trend: parseFloat(salesTrend)
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ctx.body = { code: 500, message: '获取统计数据失败' }
  }
}

/**
 * 获取销售统计
 */
async function getSalesStats(ctx) {
  const { start_date, end_date, group_by = 'day' } = ctx.query

  try {
    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        list: [],
        total: 0
      }
    }
  } catch (error) {
    console.error('获取销售统计失败:', error)
    ctx.body = { code: 500, message: '获取销售统计失败' }
  }
}

/**
 * 获取佣金统计
 */
async function getCommissionStats(ctx) {
  try {
    const totalCommission = await Commission.sum('amount')
    const withdrawnCommission = await Commission.sum('amount', {
      where: { status: 2 }
    })
    const pendingCommission = await Commission.sum('amount', {
      where: { status: 0 }
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        total_commission: totalCommission || 0,
        withdrawn_commission: withdrawnCommission || 0,
        pending_commission: pendingCommission || 0
      }
    }
  } catch (error) {
    console.error('获取佣金统计失败:', error)
    ctx.body = { code: 500, message: '获取佣金统计失败' }
  }
}

/**
 * 获取用户统计
 */
async function getUserStats(ctx) {
  try {
    const totalUsers = await User.count()
    const totalDistributors = await Distributor.count()
    const activeDistributors = await Distributor.count({
      where: { status: 1 }
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        total_users: totalUsers,
        total_distributors: totalDistributors,
        active_distributors: activeDistributors
      }
    }
  } catch (error) {
    console.error('获取用户统计失败:', error)
    ctx.body = { code: 500, message: '获取用户统计失败' }
  }
}

// ==================== 商品管理接口 ====================

/**
 * 获取商品列表（后台）
 */
async function getProductList(ctx) {
  try {
    const { page = 1, pageSize = 10, keyword, category_id, status } = ctx.query
    const offset = (page - 1) * pageSize

    const where = {}
    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` }
    }
    if (category_id) {
      where.category_id = category_id
    }
    if (status !== undefined) {
      where.status = status
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      include: [{
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['id', 'DESC']]
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ctx.body = { code: 500, message: '获取商品列表失败' }
  }
}

/**
 * 获取商品详情（后台）
 */
async function getProductDetail(ctx) {
  try {
    const { id } = ctx.params

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: ProductSku, as: 'skus' }
      ]
    })

    if (!product) {
      ctx.body = { code: 404, message: '商品不存在' }
      return
    }

    ctx.body = {
      code: 200,
      message: 'success',
      data: product
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ctx.body = { code: 500, message: '获取商品详情失败' }
  }
}

/**
 * 创建商品
 */
async function createProduct(ctx) {
  const transaction = await sequelize.transaction()
  try {
    const { name, category_id, description, main_image, images, brand, commission_rate, skus } = ctx.request.body

    // 创建商品
    const product = await Product.create({
      name,
      category_id,
      description,
      main_image,
      images,
      brand,
      commission_rate,
      status: 0 // 默认下架
    }, { transaction })

    // 创建 SKU
    if (skus && Array.isArray(skus)) {
      await ProductSku.bulkCreate(
        skus.map(sku => ({
          product_id: product.id,
          sku_name: sku.sku_name,
          sku_code: sku.sku_code,
          price: sku.price,
          stock: sku.stock,
          image: sku.image
        })),
        { transaction }
      )
    }

    await transaction.commit()

    ctx.body = {
      code: 200,
      message: '创建成功',
      data: product
    }
  } catch (error) {
    await transaction.rollback()
    console.error('创建商品失败:', error)
    ctx.body = { code: 500, message: '创建商品失败' }
  }
}

/**
 * 更新商品
 */
async function updateProduct(ctx) {
  const transaction = await sequelize.transaction()
  try {
    const { id } = ctx.params
    const { name, category_id, description, main_image, images, brand, commission_rate, skus } = ctx.request.body

    const product = await Product.findByPk(id)
    if (!product) {
      ctx.body = { code: 404, message: '商品不存在' }
      return
    }

    await product.update({
      name,
      category_id,
      description,
      main_image,
      images,
      brand,
      commission_rate
    }, { transaction })

    // 更新 SKU
    if (skus && Array.isArray(skus)) {
      await ProductSku.destroy({ where: { product_id: id }, transaction })
      await ProductSku.bulkCreate(
        skus.map(sku => ({
          product_id: id,
          sku_name: sku.sku_name,
          sku_code: sku.sku_code,
          price: sku.price,
          stock: sku.stock,
          image: sku.image
        })),
        { transaction }
      )
    }

    await transaction.commit()

    ctx.body = {
      code: 200,
      message: '更新成功',
      data: product
    }
  } catch (error) {
    await transaction.rollback()
    console.error('更新商品失败:', error)
    ctx.body = { code: 500, message: '更新商品失败' }
  }
}

/**
 * 删除商品
 */
async function deleteProduct(ctx) {
  const transaction = await sequelize.transaction()
  try {
    const { id } = ctx.params

    const product = await Product.findByPk(id)
    if (!product) {
      ctx.body = { code: 404, message: '商品不存在' }
      return
    }

    // 删除 SKU
    await ProductSku.destroy({ where: { product_id: id }, transaction })
    // 删除商品
    await product.destroy({ transaction })

    await transaction.commit()

    ctx.body = {
      code: 200,
      message: '删除成功'
    }
  } catch (error) {
    await transaction.rollback()
    console.error('删除商品失败:', error)
    ctx.body = { code: 500, message: '删除商品失败' }
  }
}

/**
 * 上下架商品
 */
async function toggleProductStatus(ctx) {
  try {
    const { id } = ctx.params
    const { status } = ctx.request.body

    const product = await Product.findByPk(id)
    if (!product) {
      ctx.body = { code: 404, message: '商品不存在' }
      return
    }

    await product.update({ status: status ? 1 : 0 })

    ctx.body = {
      code: 200,
      message: '操作成功',
      data: product
    }
  } catch (error) {
    console.error('上下架商品失败:', error)
    ctx.body = { code: 500, message: '操作失败' }
  }
}

/**
 * 获取分类列表
 */
async function getCategoryList(ctx) {
  try {
    const categories = await Category.findAll({
      order: [['sort_order', 'ASC'], ['id', 'DESC']]
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: categories
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ctx.body = { code: 500, message: '获取分类列表失败' }
  }
}

// ==================== 订单管理接口 ====================

/**
 * 获取订单列表（后台）
 */
async function getOrderList(ctx) {
  try {
    const { page = 1, pageSize = 10, order_no, order_status, user_id, start_date, end_date } = ctx.query
    const offset = (page - 1) * pageSize

    const where = {}
    if (order_no) {
      where.order_no = { [Op.like]: `%${order_no}%` }
    }
    if (order_status !== undefined) {
      where.order_status = order_status
    }
    if (user_id) {
      where.user_id = user_id
    }
    if (start_date && end_date) {
      where.created_at = {
        [Op.gte]: new Date(start_date),
        [Op.lte]: new Date(end_date)
      }
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'avatar', 'phone']
      }, {
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'main_image']
        }]
      }],
      order: [['id', 'DESC']]
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ctx.body = { code: 500, message: '获取订单列表失败' }
  }
}

/**
 * 获取订单详情（后台）
 */
async function getOrderDetail(ctx) {
  try {
    const { id } = ctx.params

    const order = await Order.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'nickname', 'avatar', 'phone'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: Distributor, as: 'distributor' }
      ]
    })

    if (!order) {
      ctx.body = { code: 404, message: '订单不存在' }
      return
    }

    ctx.body = {
      code: 200,
      message: 'success',
      data: order
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ctx.body = { code: 500, message: '获取订单详情失败' }
  }
}

/**
 * 订单发货
 */
async function shipOrder(ctx) {
  try {
    const { id } = ctx.params
    const { logistics_company, logistics_no } = ctx.request.body

    const order = await Order.findByPk(id)
    if (!order) {
      ctx.body = { code: 404, message: '订单不存在' }
      return
    }

    if (order.order_status !== 1) {
      ctx.body = { code: 400, message: '订单状态不允许发货' }
      return
    }

    await order.update({
      delivery_time: new Date(),
      logistics_company,
      logistics_no,
      order_status: 2
    })

    ctx.body = {
      code: 200,
      message: '发货成功'
    }
  } catch (error) {
    console.error('订单发货失败:', error)
    ctx.body = { code: 500, message: '发货失败' }
  }
}

/**
 * 取消订单（后台）
 */
async function cancelOrder(ctx) {
  try {
    const { id } = ctx.params

    const order = await Order.findByPk(id)
    if (!order) {
      ctx.body = { code: 404, message: '订单不存在' }
      return
    }

    if (order.order_status !== 0) {
      ctx.body = { code: 400, message: '订单状态不允许取消' }
      return
    }

    await order.update({
      cancel_time: new Date(),
      order_status: 4
    })

    ctx.body = {
      code: 200,
      message: '取消成功'
    }
  } catch (error) {
    console.error('取消订单失败:', error)
    ctx.body = { code: 500, message: '取消失败' }
  }
}

// ==================== 分销商管理接口 ====================

/**
 * 获取分销商列表（后台）
 */
async function getDistributorList(ctx) {
  try {
    const { page = 1, pageSize = 10, keyword, status, level } = ctx.query
    const offset = (page - 1) * pageSize

    const where = {}
    if (status !== undefined) {
      where.status = status
    }
    if (level) {
      where.level = level
    }

    const { count, rows } = await Distributor.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'avatar', 'phone'],
        where: keyword ? {
          [Op.or]: [
            { nickname: { [Op.like]: `%${keyword}%` } },
            { phone: { [Op.like]: `%${keyword}%` } }
          ]
        } : {}
      }],
      order: [['id', 'DESC']]
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    }
  } catch (error) {
    console.error('获取分销商列表失败:', error)
    ctx.body = { code: 500, message: '获取分销商列表失败' }
  }
}

/**
 * 获取分销商详情（后台）
 */
async function getDistributorDetail(ctx) {
  try {
    const { id } = ctx.params

    const distributor = await Distributor.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'avatar', 'phone', 'created_at']
      }]
    })

    if (!distributor) {
      ctx.body = { code: 404, message: '分销商不存在' }
      return
    }

    ctx.body = {
      code: 200,
      message: 'success',
      data: distributor
    }
  } catch (error) {
    console.error('获取分销商详情失败:', error)
    ctx.body = { code: 500, message: '获取分销商详情失败' }
  }
}

/**
 * 审核分销商
 */
async function auditDistributor(ctx) {
  try {
    const { id } = ctx.params
    const { status, reason } = ctx.request.body

    const distributor = await Distributor.findByPk(id)
    if (!distributor) {
      ctx.body = { code: 404, message: '分销商不存在' }
      return
    }

    if (distributor.status !== 0) {
      ctx.body = { code: 400, message: '该分销商已审核' }
      return
    }

    const updateData = {
      audit_time: new Date(),
      approved_time: status === 1 ? new Date() : null
    }

    if (status === 1) {
      updateData.status = 1
    } else if (status === 2) {
      updateData.status = 2
      updateData.reason = reason
    }

    await distributor.update(updateData)

    ctx.body = {
      code: 200,
      message: status === 1 ? '审核通过' : '已拒绝'
    }
  } catch (error) {
    console.error('审核分销商失败:', error)
    ctx.body = { code: 500, message: '审核失败' }
  }
}

/**
 * 冻结/解冻分销商
 */
async function toggleDistributorStatus(ctx) {
  try {
    const { id } = ctx.params
    const { status } = ctx.request.body

    const distributor = await Distributor.findByPk(id)
    if (!distributor) {
      ctx.body = { code: 404, message: '分销商不存在' }
      return
    }

    await distributor.update({ status: status ? 3 : 1 })

    ctx.body = {
      code: 200,
      message: status === 3 ? '已冻结' : '已解冻'
    }
  } catch (error) {
    console.error('操作失败:', error)
    ctx.body = { code: 500, message: '操作失败' }
  }
}

/**
 * 更新分销商等级
 */
async function updateDistributorLevel(ctx) {
  try {
    const { id } = ctx.params
    const { level } = ctx.request.body

    const distributor = await Distributor.findByPk(id)
    if (!distributor) {
      ctx.body = { code: 404, message: '分销商不存在' }
      return
    }

    await distributor.update({ level })

    ctx.body = {
      code: 200,
      message: '更新成功'
    }
  } catch (error) {
    console.error('更新分销商等级失败:', error)
    ctx.body = { code: 500, message: '更新失败' }
  }
}

// ==================== 提现管理接口 ====================

/**
 * 获取提现列表（后台）
 */
async function getWithdrawalList(ctx) {
  try {
    const { page = 1, pageSize = 10, status } = ctx.query
    const offset = (page - 1) * pageSize

    const where = {}
    if (status !== undefined) {
      where.status = status
    }

    const { count, rows } = await Withdrawal.findAndCountAll({
      where,
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      include: [{
        model: Distributor,
        as: 'distributor',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar', 'phone']
        }]
      }],
      order: [['id', 'DESC']]
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      }
    }
  } catch (error) {
    console.error('获取提现列表失败:', error)
    ctx.body = { code: 500, message: '获取提现列表失败' }
  }
}

/**
 * 获取提现详情（后台）
 */
async function getWithdrawalDetail(ctx) {
  try {
    const { id } = ctx.params

    const withdrawal = await Withdrawal.findByPk(id, {
      include: [{
        model: Distributor,
        as: 'distributor',
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'nickname', 'avatar', 'phone']
        }]
      }]
    })

    if (!withdrawal) {
      ctx.body = { code: 404, message: '提现记录不存在' }
      return
    }

    ctx.body = {
      code: 200,
      message: 'success',
      data: withdrawal
    }
  } catch (error) {
    console.error('获取提现详情失败:', error)
    ctx.body = { code: 500, message: '获取提现详情失败' }
  }
}

/**
 * 审核提现
 */
async function auditWithdrawal(ctx) {
  const transaction = await sequelize.transaction()
  try {
    const { id } = ctx.params
    const { status, reason } = ctx.request.body

    const withdrawal = await Withdrawal.findByPk(id)
    if (!withdrawal) {
      ctx.body = { code: 404, message: '提现记录不存在' }
      return
    }

    if (withdrawal.status !== 0) {
      ctx.body = { code: 400, message: '该提现已审核' }
      return
    }

    if (status === 1) {
      // 通过 - 更新状态为处理中
      await withdrawal.update({
        status: 1,
        audit_time: new Date()
      }, { transaction })
    } else if (status === 3) {
      // 驳回 - 退回佣金
      await withdrawal.update({
        status: 3,
        audit_time: new Date(),
        reason
      }, { transaction })

      // 恢复分销商佣金
      const distributor = await Distributor.findByPk(withdrawal.distributor_id, { transaction })
      if (distributor) {
        await distributor.update({
          pending_commission: parseFloat(distributor.pending_commission) + parseFloat(withdrawal.amount)
        }, { transaction })
      }
    }

    await transaction.commit()

    ctx.body = {
      code: 200,
      message: status === 1 ? '审核通过' : '已驳回'
    }
  } catch (error) {
    await transaction.rollback()
    console.error('审核提现失败:', error)
    ctx.body = { code: 500, message: '审核失败' }
  }
}

/**
 * 确认打款
 */
async function confirmWithdrawal(ctx) {
  try {
    const { id } = ctx.params

    const withdrawal = await Withdrawal.findByPk(id)
    if (!withdrawal) {
      ctx.body = { code: 404, message: '提现记录不存在' }
      return
    }

    if (withdrawal.status !== 1) {
      ctx.body = { code: 400, message: '提现状态不允许打款' }
      return
    }

    await withdrawal.update({
      status: 2,
      pay_time: new Date()
    })

    ctx.body = {
      code: 200,
      message: '确认打款成功'
    }
  } catch (error) {
    console.error('确认打款失败:', error)
    ctx.body = { code: 500, message: '确认打款失败' }
  }
}

// ==================== 佣金配置接口 ====================

/**
 * 获取佣金配置
 */
async function getCommissionConfig(ctx) {
  try {
    // TODO: 从系统配置表读取
    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        level1_rate: 15,
        level2_rate: 8,
        min_withdraw: 10,
        auto_upgrade_amount: 1000,
        auto_upgrade_count: 10
      }
    }
  } catch (error) {
    console.error('获取佣金配置失败:', error)
    ctx.body = { code: 500, message: '获取配置失败' }
  }
}

/**
 * 保存佣金配置
 */
async function saveCommissionConfig(ctx) {
  try {
    const { level1_rate, level2_rate, min_withdraw, auto_upgrade_amount, auto_upgrade_count } = ctx.request.body

    // TODO: 保存到系统配置表
    console.log('保存佣金配置:', { level1_rate, level2_rate, min_withdraw, auto_upgrade_amount, auto_upgrade_count })

    ctx.body = {
      code: 200,
      message: '保存成功'
    }
  } catch (error) {
    console.error('保存佣金配置失败:', error)
    ctx.body = { code: 500, message: '保存失败' }
  }
}

module.exports = {
  getDashboardStats,
  getSalesStats,
  getCommissionStats,
  getUserStats,
  // 商品管理
  getProductList,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getCategoryList,
  // 订单管理
  getOrderList,
  getOrderDetail,
  shipOrder,
  cancelOrder,
  // 分销商管理
  getDistributorList,
  getDistributorDetail,
  auditDistributor,
  toggleDistributorStatus,
  updateDistributorLevel,
  // 提现管理
  getWithdrawalList,
  getWithdrawalDetail,
  auditWithdrawal,
  confirmWithdrawal,
  // 佣金配置
  getCommissionConfig,
  saveCommissionConfig
}
