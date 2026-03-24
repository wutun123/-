/**
 * 购物车模块接口
 */
import { get, post, put, del } from '@/utils/request'

/**
 * 获取购物车列表
 */
export function getCartList() {
  return get('/cart/items')
}

/**
 * 添加商品到购物车
 */
export function addCartItem(data) {
  return post('/cart/items', data)
}

/**
 * 更新购物车商品数量
 */
export function updateCartItemQuantity(skuId, quantity) {
  return put(`/cart/items/${skuId}`, { quantity })
}

/**
 * 删除购物车商品
 */
export function deleteCartItem(skuId) {
  return del(`/cart/items/${skuId}`)
}

/**
 * 清空购物车
 */
export function clearCart() {
  return del('/cart/items/clear')
}
