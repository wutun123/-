/**
 * 用户模块接口
 */
import { get, post, put, del } from '@/utils/request'

/**
 * 获取用户地址列表
 */
export function getUserAddresses() {
  return get('/user/addresses')
}

/**
 * 获取地址详情
 */
export function getAddressDetail(id) {
  return get(`/user/addresses/${id}`)
}

/**
 * 新增地址
 */
export function addAddress(data) {
  return post('/user/addresses', data)
}

/**
 * 编辑地址
 */
export function updateAddress(id, data) {
  return put(`/user/addresses/${id}`, data)
}

/**
 * 删除地址
 */
export function deleteAddress(id) {
  return del(`/user/addresses/${id}`)
}

/**
 * 设置默认地址
 */
export function setDefaultAddress(id) {
  return post(`/user/addresses/${id}/default`)
}

/**
 * 获取收藏列表
 */
export function getFavorites() {
  return get('/user/favorites')
}

/**
 * 添加收藏
 */
export function addFavorite(productId) {
  return post('/user/favorites', { product_id: productId })
}

/**
 * 删除收藏
 */
export function removeFavorite(productId) {
  return del(`/user/favorites/${productId}`)
}

/**
 * 获取优惠券列表
 */
export function getCoupons(params) {
  return get('/user/coupons', params)
}

/**
 * 领取优惠券
 */
export function claimCoupon(couponId) {
  return post('/user/coupons/claim', { coupon_id: couponId })
}
