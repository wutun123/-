const { Order, OrderItem, User, Product, Distributor, Withdrawal, Commission, sequelize } = require('../models')
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
        order_status: { [Op.ne]: 4 } // 排除已取消
      }
    })

    const todaySales = await Order.sum('pay_amount', {
      where: {
        created_at: { [Op.gte]: today },
        order_status: { [Op.in]: [1, 2, 3] } // 只计算有效订单
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
    // TODO: 根据日期和分组方式统计数据
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

module.exports = {
  getDashboardStats,
  getSalesStats,
  getCommissionStats,
  getUserStats
}
