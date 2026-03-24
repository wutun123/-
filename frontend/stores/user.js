import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref('')

  /**
   * 设置用户信息
   */
  function setUserInfo(info) {
    userInfo.value = info
    uni.setStorageSync('userInfo', info)
  }

  /**
   * 设置 token
   */
  function setToken(newToken) {
    token.value = newToken
    uni.setStorageSync('token', newToken)
  }

  /**
   * 获取用户信息
   */
  function getUserInfo() {
    if (!userInfo.value) {
      userInfo.value = uni.getStorageSync('userInfo')
    }
    return userInfo.value
  }

  /**
   * 获取 token
   */
  function getToken() {
    if (!token.value) {
      token.value = uni.getStorageSync('token')
    }
    return token.value
  }

  /**
   * 退出登录
   */
  function logout() {
    userInfo.value = null
    token.value = ''
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('token')
  }

  /**
   * 检查是否登录
   */
  function isLogin() {
    return !!getToken()
  }

  /**
   * 获取用户 ID
   */
  const userId = ref(0)

  return {
    userInfo,
    token,
    userId,
    setUserInfo,
    setToken,
    getUserInfo,
    getToken,
    logout,
    isLogin
  }
})
