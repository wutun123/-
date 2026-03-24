/**
 * 商品模块接口
 */
import { get } from '@/utils/request'

/**
 * 获取首页商品列表
 */
export function getHomeProducts() {
  return get('/products/home')
}

/**
 * 获取商品列表
 */
export function getProductList(params) {
  return get('/products', params)
}

/**
 * 获取商品详情
 */
export function getProductDetail(id) {
  return get(`/products/${id}`)
}

/**
 * 获取分类列表
 */
export function getCategories() {
  return get('/categories')
}

/**
 * 搜索商品
 */
export function searchProducts(params) {
  return get('/products/search', params)
}
