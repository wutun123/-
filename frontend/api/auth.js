/**
 * 用户认证接口
 */
import { post, get } from '@/utils/request'

/**
 * 微信登录
 */
export function wechatLogin(code) {
  return post('/auth/wechat-login', { code })
}

/**
 * 绑定手机号
 */
export function bindPhone(phone, code) {
  return post('/user/bind-phone', { phone, code })
}

/**
 * 获取用户信息
 */
export function getUserProfile() {
  return get('/user/profile')
}

/**
 * 更新用户信息
 */
export function updateProfile(data) {
  return put('/user/profile', data)
}
