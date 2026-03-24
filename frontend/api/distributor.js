/**
 * 分销模块接口
 */
import { get, post } from '@/utils/request'

/**
 * 获取分销商信息
 */
export function getDistributorInfo() {
  return get('/distributor/info')
}

/**
 * 申请成为分销商
 */
export function applyDistributor(data) {
  return post('/distributor/apply', data)
}

/**
 * 获取我的团队
 */
export function getTeam(params) {
  return get('/distributor/team', params)
}

/**
 * 获取佣金记录
 */
export function getCommissions(params) {
  return get('/distributor/commissions', params)
}

/**
 * 申请提现
 */
export function applyWithdraw(data) {
  return post('/distributor/withdraw', data)
}

/**
 * 获取提现记录
 */
export function getWithdrawals(params) {
  return get('/distributor/withdrawals', params)
}

/**
 * 生成推广海报
 */
export function generatePoster(data) {
  return post('/promotion/poster', data)
}

/**
 * 绑定分销关系
 */
export function bindDistribution(data) {
  return post('/promotion/bind', data)
}

/**
 * 获取分销统计数据
 */
export function getDistributorStats() {
  return get('/distributor/stats')
}
