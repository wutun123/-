const { Distributor, Commission, Withdrawal, DistributionRelation, User } = require('../models')
const { sequelize } = require('../database')
const { Op } = require('sequelize')

/**
 * 获取分销商信息
 */
async function getDistributorInfo(ctx) {
  const userId = ctx.state.user.id

  try {
    const distributor = await Distributor.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'avatar']
      }]
    })

    if (!distributor) {
      ctx.body = {
        code: 200,
        message: 'success',
        data: {
          is_distributor: false,
          status: -1
        }
      }
      return
    }

    const levelNames = { 1: '铜牌分销商', 2: '银牌分销商', 3: '金牌分销商' }

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        is_distributor: true,
        level: distributor.level,
        level_name: levelNames[distributor.level] || '铜牌分销商',
        status: distributor.status,
        team_count: distributor.team_count || 0,
        level1_count: distributor.level1_count || 0,
        level2_count: distributor.level2_count || 0,
        pending_commission: distributor.pending_commission || 0,
        withdrawn_commission: distributor.withdrawn_commission || 0,
        total_commission: distributor.total_commission || 0
      }
    }
  } catch (error) {
    console.error('获取分销商信息失败:', error)
    ctx.body = { code: 500, message: '获取分销商信息失败' }
  }
}

/**
 * 申请成为分销商
 */
async function applyDistributor(ctx) {
  const userId = ctx.state.user.id
  const { reason } = ctx.request.body

  try {
    // 检查是否已申请
    const existing = await Distributor.findOne({ where: { user_id: userId } })
    if (existing) {
      ctx.body = { code: 400, message: '您已提交过申请' }
      return
    }

    const distributor = await Distributor.create({
      user_id: userId,
      status: 0, // 待审核
      level: 1,
      apply_time: new Date()
    })

    ctx.body = {
      code: 200,
      message: '申请提交成功，请等待审核',
      data: distributor
    }
  } catch (error) {
    console.error('申请分销商失败:', error)
    ctx.body = { code: 500, message: '申请失败' }
  }
}

/**
 * 获取我的团队
 */
async function getTeam(ctx) {
  const userId = ctx.state.user.id
  const { level = 1 } = ctx.query

  try {
    const distributor = await Distributor.findOne({ where: { user_id: userId } })
    if (!distributor) {
      ctx.body = { code: 400, message: '不是分销商' }
      return
    }

    const relations = await DistributionRelation.findAll({
      where: {
        distributor_id: distributor.id,
        level: parseInt(level)
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'nickname', 'avatar']
      }],
      limit: 50
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        total: relations.length,
        list: relations.map(r => ({
          user_id: r.user_id,
          nickname: r.user?.nickname || '未知用户',
          avatar: r.user?.avatar || '',
          bind_time: r.bind_time
        }))
      }
    }
  } catch (error) {
    console.error('获取团队失败:', error)
    ctx.body = { code: 500, message: '获取团队失败' }
  }
}

/**
 * 获取佣金记录
 */
async function getCommissions(ctx) {
  const userId = ctx.state.user.id
  const { status, page = 1, page_size = 20 } = ctx.query

  try {
    const offset = (page - 1) * page_size
    const where = { user_id: userId }

    if (status !== undefined) {
      where.status = parseInt(status)
    }

    const { count, rows } = await Commission.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(page_size)
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        total: count,
        list: rows.map(c => ({
          id: c.id,
          order_no: c.order_no,
          amount: c.amount,
          level: c.level,
          status: c.status,
          created_at: c.created_at,
          settled_at: c.settled_at,
          withdrawn_at: c.withdrawn_at
        }))
      }
    }
  } catch (error) {
    console.error('获取佣金记录失败:', error)
    ctx.body = { code: 500, message: '获取佣金记录失败' }
  }
}

/**
 * 申请提现
 */
async function applyWithdraw(ctx) {
  const userId = ctx.state.user.id
  const { amount } = ctx.request.body

  try {
    const distributor = await Distributor.findOne({ where: { user_id: userId } })
    if (!distributor) {
      ctx.body = { code: 400, message: '不是分销商' }
      return
    }

    const minWithdraw = parseFloat(process.env.DISTRIBUTION_MIN_WITHDRAW || 10)
    if (amount < minWithdraw) {
      ctx.body = { code: 400, message: `最低提现金额${minWithdraw}元` }
      return
    }

    if (amount > distributor.pending_commission) {
      ctx.body = { code: 400, message: '可提现余额不足' }
      return
    }

    // 创建提现记录
    const withdrawal = await Withdrawal.create({
      user_id: userId,
      distributor_id: distributor.id,
      amount,
      status: 0 // 待审核
    })

    // 冻结佣金
    await distributor.update({
      pending_commission: distributor.pending_commission - amount
    })

    ctx.body = {
      code: 200,
      message: '提现申请已提交',
      data: withdrawal
    }
  } catch (error) {
    console.error('申请提现失败:', error)
    ctx.body = { code: 500, message: '提现申请失败' }
  }
}

/**
 * 获取提现记录
 */
async function getWithdrawals(ctx) {
  const userId = ctx.state.user.id
  const { page = 1, page_size = 20 } = ctx.query

  try {
    const offset = (page - 1) * page_size

    const { count, rows } = await Withdrawal.findAndCountAll({
      where: { user_id: userId },
      order: [['apply_time', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(page_size)
    })

    const statusMap = { 0: '待审核', 1: '处理中', 2: '已完成', 3: '已驳回' }

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        total: count,
        list: rows.map(w => ({
          id: w.id,
          amount: w.amount,
          status: w.status,
          status_text: statusMap[w.status],
          apply_time: w.apply_time,
          audit_time: w.audit_time,
          finish_time: w.finish_time,
          audit_remark: w.audit_remark
        }))
      }
    }
  } catch (error) {
    console.error('获取提现记录失败:', error)
    ctx.body = { code: 500, message: '获取提现记录失败' }
  }
}

/**
 * 获取分销统计数据
 */
async function getDistributorStats(ctx) {
  const userId = ctx.state.user.id

  try {
    const distributor = await Distributor.findOne({ where: { user_id: userId } })
    if (!distributor) {
      ctx.body = { code: 400, message: '不是分销商' }
      return
    }

    // 统计今日、本月佣金
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const todayCommission = await Commission.sum('amount', {
      where: {
        user_id: userId,
        created_at: { [Op.gte]: today }
      }
    })

    const monthCommission = await Commission.sum('amount', {
      where: {
        user_id: userId,
        created_at: { [Op.gte]: monthStart }
      }
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        today_commission: todayCommission || 0,
        month_commission: monthCommission || 0,
        total_commission: distributor.total_commission || 0,
        withdrawn_count: await Withdrawal.count({
          where: { user_id: userId, status: 2 }
        })
      }
    }
  } catch (error) {
    console.error('获取分销统计失败:', error)
    ctx.body = { code: 500, message: '获取分销统计失败' }
  }
}

module.exports = {
  getDistributorInfo,
  applyDistributor,
  getTeam,
  getCommissions,
  applyWithdraw,
  getWithdrawals,
  getDistributorStats
}
