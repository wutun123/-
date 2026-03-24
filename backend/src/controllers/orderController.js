const { Order, OrderItem, ProductSku, Product, User } = require('../models')
const { sequelize } = require('../database')
const { Op } = require('sequelize')

/**
 * 创建订单
 */
async function createOrder(ctx) {
  const userId = ctx.state.user.id
  const { items, address_id, coupon_id, remark } = ctx.request.body

  const transaction = await sequelize.transaction()

  try {
    if (!items || items.length === 0) {
      ctx.body = { code: 400, message: '请选择商品' }
      return
    }

    // 获取用户地址
    const UserAddress = require('../models/userAddress')
    const address = await UserAddress.findByPk(address_id)
    if (!address) {
      ctx.body = { code: 400, message: '请选择收货地址' }
      return
    }

    // 计算订单金额
    let totalAmount = 0
    let freightAmount = 0
    let discountAmount = 0

    // 检查库存并计算总价
    for (const item of items) {
      const sku = await ProductSku.findByPk(item.sku_id)
      if (!sku || sku.stock < item.quantity) {
        await transaction.rollback()
        ctx.body = { code: 400, message: `${sku ? '库存不足' : '商品不存在'}` }
        return
      }
      totalAmount += parseFloat(sku.price) * item.quantity
    }

    // 生成订单号
    const orderNo = 'SO' + Date.now() + Math.floor(Math.random() * 10000).toString().padStart(4, '0')

    // 创建订单
    const order = await Order.create({
      order_no: orderNo,
      user_id: userId,
      order_status: 0, // 待付款
      total_amount: totalAmount,
      freight_amount: freightAmount,
      discount_amount: discountAmount,
      pay_amount: totalAmount + freightAmount - discountAmount,
      receiver_name: address.receiver_name,
      receiver_phone: address.receiver_phone,
      receiver_address: `${address.province}${address.city}${address.district}${address.detail_address}`,
      remark
    }, { transaction })

    // 创建订单商品
    for (const item of items) {
      const sku = await ProductSku.findByPk(item.sku_id, {
        include: [{ model: Product, as: 'product' }]
      })

      await OrderItem.create({
        order_id: order.id,
        product_id: sku.product_id,
        sku_id: sku.id,
        product_name: sku.product.name,
        sku_spec: sku.spec_name,
        price: sku.price,
        quantity: item.quantity,
        total_amount: parseFloat(sku.price) * item.quantity,
        commission_amount: 0 // 佣金待计算
      }, { transaction })

      // 扣减库存
      await ProductSku.update(
        { stock: sku.stock - item.quantity },
        { where: { id: sku.id } },
        { transaction }
      )
    }

    await transaction.commit()

    ctx.body = {
      code: 200,
      message: '订单创建成功',
      data: {
        order_id: order.id,
        order_no: order.order_no,
        pay_amount: order.pay_amount
      }
    }
  } catch (error) {
    await transaction.rollback()
    console.error('创建订单失败:', error)
    ctx.body = { code: 500, message: '创建订单失败' }
  }
}

/**
 * 获取订单列表
 */
async function getOrderList(ctx) {
  const userId = ctx.state.user.id
  const { status, page = 1, page_size = 20 } = ctx.query

  try {
    const offset = (page - 1) * page_size
    const where = { user_id: userId }

    if (status !== undefined) {
      where.order_status = parseInt(status)
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{
        model: OrderItem,
        as: 'items',
        limit: 1 // 只显示一个商品用于展示
      }],
      order: [['created_at', 'DESC']],
      offset: parseInt(offset),
      limit: parseInt(page_size)
    })

    const statusMap = { 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已取消', 5: '售后' }

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        total: count,
        list: rows.map(order => ({
          id: order.id,
          order_no: order.order_no,
          order_status: order.order_status,
          status_text: statusMap[order.order_status],
          pay_amount: order.pay_amount,
          items: order.items.map(item => ({
            product_name: item.product_name,
            sku_spec: item.sku_spec,
            price: item.price,
            quantity: item.quantity,
            image: '/static/products/default.jpg' // TODO: 关联图片
          })),
          created_at: order.created_at
        }))
      }
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ctx.body = { code: 500, message: '获取订单列表失败' }
  }
}

/**
 * 获取订单详情
 */
async function getOrderDetail(ctx) {
  const { id } = ctx.params
  const userId = ctx.state.user.id

  try {
    const order = await Order.findOne({
      where: { id, user_id: userId },
      include: [{
        model: OrderItem,
        as: 'items'
      }]
    })

    if (!order) {
      ctx.body = { code: 404, message: '订单不存在' }
      return
    }

    const statusMap = { 0: '待付款', 1: '待发货', 2: '待收货', 3: '已完成', 4: '已取消', 5: '售后' }

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        id: order.id,
        order_no: order.order_no,
        order_status: order.order_status,
        status_text: statusMap[order.order_status],
        total_amount: order.total_amount,
        freight_amount: order.freight_amount,
        discount_amount: order.discount_amount,
        pay_amount: order.pay_amount,
        receiver_name: order.receiver_name,
        receiver_phone: order.receiver_phone,
        receiver_address: order.receiver_address,
        remark: order.remark,
        pay_time: order.pay_time,
        delivery_time: order.delivery_time,
        items: order.items.map(item => ({
          product_name: item.product_name,
          sku_spec: item.sku_spec,
          price: item.price,
          quantity: item.quantity,
          total_amount: item.total_amount
        }))
      }
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ctx.body = { code: 500, message: '获取订单详情失败' }
  }
}

/**
 * 取消订单
 */
async function cancelOrder(ctx) {
  const { id } = ctx.params
  const userId = ctx.state.user.id

  try {
    const order = await Order.findOne({
      where: { id, user_id: userId }
    })

    if (!order) {
      ctx.body = { code: 404, message: '订单不存在' }
      return
    }

    if (order.order_status !== 0) {
      ctx.body = { code: 400, message: '该订单不能取消' }
      return
    }

    await order.update({
      order_status: 4, // 已取消
      cancel_time: new Date()
    })

    // 恢复库存
    const items = await OrderItem.findAll({ where: { order_id: id } })
    for (const item of items) {
      const sku = await ProductSku.findByPk(item.sku_id)
      if (sku) {
        await ProductSku.update(
          { stock: sku.stock + item.quantity },
          { where: { id: sku.id } }
        )
      }
    }

    ctx.body = {
      code: 200,
      message: '订单已取消'
    }
  } catch (error) {
    console.error('取消订单失败:', error)
    ctx.body = { code: 500, message: '取消订单失败' }
  }
}

/**
 * 确认收货
 */
async function confirmOrder(ctx) {
  const { id } = ctx.params
  const userId = ctx.state.user.id

  try {
    const order = await Order.findOne({
      where: { id, user_id: userId }
    })

    if (!order) {
      ctx.body = { code: 404, message: '订单不存在' }
      return
    }

    if (order.order_status !== 2) {
      ctx.body = { code: 400, message: '该订单不能确认收货' }
      return
    }

    await order.update({
      order_status: 3, // 已完成
      receive_time: new Date(),
      finish_time: new Date()
    })

    // TODO: 触发佣金结算

    ctx.body = {
      code: 200,
      message: '确认收货成功'
    }
  } catch (error) {
    console.error('确认收货失败:', error)
    ctx.body = { code: 500, message: '确认收货失败' }
  }
}

module.exports = {
  createOrder,
  getOrderList,
  getOrderDetail,
  cancelOrder,
  confirmOrder
}
