/**
 * 管理后台接口
 */
import { get, post, put, del } from '@/utils/request'

/**
 * 管理员登录
 */
export function adminLogin(data) {
  return post('/admin/login', data)
}

/**
 * 获取统计数据
 */
export function getDashboardStats() {
  return get('/admin/stats/dashboard')
}

// ==================== 商品管理 ====================

/**
 * 获取商品列表
 */
export function getProductList(params) {
  return get('/admin/products', params)
}

/**
 * 获取商品详情
 */
export function getProductDetail(id) {
  return get(`/admin/products/${id}`)
}

/**
 * 创建商品
 */
export function createProduct(data) {
  return post('/admin/products', data)
}

/**
 * 更新商品
 */
export function updateProduct(id, data) {
  return put(`/admin/products/${id}`, data)
}

/**
 * 删除商品
 */
export function deleteProduct(id) {
  return del(`/admin/products/${id}`)
}

/**
 * 上架/下架商品
 */
export function toggleProductStatus(id, status) {
  return post(`/admin/products/${id}/status`, { status })
}

// ==================== 订单管理 ====================

/**
 * 获取订单列表
 */
export function getOrderList(params) {
  return get('/admin/orders', params)
}

/**
 * 获取订单详情
 */
export function getOrderDetail(id) {
  return get(`/admin/orders/${id}`)
}

/**
 * 订单发货
 */
export function shipOrder(id, data) {
  return post(`/admin/orders/${id}/ship`, data)
}

/**
 * 取消订单
 */
export function cancelOrder(id) {
  return post(`/admin/orders/${id}/cancel`)
}

/**
 * 退款审核
 */
export function auditRefund(id, data) {
  return post(`/admin/orders/${id}/refund-audit`, data)
}

// ==================== 分销商管理 ====================

/**
 * 获取分销商列表
 */
export function getDistributorList(params) {
  return get('/admin/distributors', params)
}

/**
 * 获取分销商详情
 */
export function getDistributorDetail(id) {
  return get(`/admin/distributors/${id}`)
}

/**
 * 审核分销商
 */
export function auditDistributor(id, result) {
  return post(`/admin/distributors/${id}/audit`, { result })
}

/**
 * 冻结/解冻分销商
 */
export function toggleDistributorStatus(id, status) {
  return post(`/admin/distributors/${id}/status`, { status })
}

// ==================== 佣金配置 ====================

/**
 * 获取佣金配置
 */
export function getCommissionConfig() {
  return get('/admin/commission/config')
}

/**
 * 保存佣金配置
 */
export function saveCommissionConfig(data) {
  return put('/admin/commission/config', data)
}

// ==================== 提现审核 ====================

/**
 * 获取提现列表
 */
export function getWithdrawalList(params) {
  return get('/admin/withdrawals', params)
}

/**
 * 获取提现详情
 */
export function getWithdrawalDetail(id) {
  return get(`/admin/withdrawals/${id}`)
}

/**
 * 审核提现
 */
export function auditWithdrawal(id, result, remark = '') {
  return post(`/admin/withdrawals/${id}/audit`, { result, remark })
}

// ==================== 数据报表 ====================

/**
 * 销售统计
 */
export function getSalesStats(params) {
  return get('/admin/stats/sales', params)
}

/**
 * 佣金统计
 */
export function getCommissionStats(params) {
  return get('/admin/stats/commission', params)
}

/**
 * 用户统计
 */
export function getUserStats(params) {
  return get('/admin/stats/users', params)
}

// ==================== 图片上传 ====================

/**
 * 单图上传
 */
export function uploadSingle(file) {
  const formData = new FormData()
  formData.append('file', file)
  return uni.request({
    url: '/api/v1/upload/single',
    method: 'post',
    data: formData,
    header: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 多图上传
 */
export function uploadMultiple(files) {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  return uni.request({
    url: '/api/v1/upload/multiple',
    method: 'post',
    data: formData,
    header: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * Base64 图片上传
 */
export function uploadBase64(base64, filename) {
  return post('/upload/base64', { base64, filename })
}
