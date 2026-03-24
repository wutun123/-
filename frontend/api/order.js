/**
 * 订单模块接口
 */
import { get, post } from '@/utils/request'

/**
 * 创建订单
 */
export function createOrder(data) {
  return post('/orders', data)
}

/**
 * 获取订单列表
 */
export function getOrderList(params) {
  return get('/orders', params)
}

/**
 * 获取订单详情
 */
export function getOrderDetail(id) {
  return get(`/orders/${id}`)
}

/**
 * 取消订单
 */
export function cancelOrder(id) {
  return post(`/orders/${id}/cancel`)
}

/**
 * 确认收货
 */
export function confirmOrder(id) {
  return post(`/orders/${id}/confirm`)
}

/**
 * 删除订单
 */
export function deleteOrder(id) {
  return post(`/orders/${id}/delete`)
}

/**
 * 申请售后
 */
export function applyAfterSale(data) {
  return post('/orders/after-sale', data)
}
