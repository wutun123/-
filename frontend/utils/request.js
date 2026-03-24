const BASE_URL = 'https://api.petplanet.com/api/v1'

/**
 * 请求封装
 */
export function request(options) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data)
          } else if (res.data.code === 401) {
            // token 过期，跳转登录
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.reLaunch({ url: '/pages/user/login' })
            reject(new Error(res.data.message || '请先登录'))
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(new Error(res.data.message || '请求失败'))
          }
        } else if (res.statusCode === 404) {
          reject(new Error('接口不存在'))
        } else if (res.statusCode === 500) {
          reject(new Error('服务器错误'))
        } else {
          reject(new Error('网络错误'))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(new Error(err.errMsg || '网络请求失败'))
      }
    })
  })
}

/**
 * GET 请求
 */
export const get = (url, data) => request({ url, method: 'GET', data })

/**
 * POST 请求
 */
export const post = (url, data) => request({ url, method: 'POST', data })

/**
 * PUT 请求
 */
export const put = (url, data) => request({ url, method: 'PUT', data })

/**
 * DELETE 请求
 */
export const del = (url, data) => request({ url, method: 'DELETE', data })

/**
 * 文件上传
 */
export const upload = (url, filePath, name = 'file') => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')

    uni.uploadFile({
      url: BASE_URL + url,
      filePath,
      name,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data)
        } else {
          reject(new Error(data.message || '上传失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      }
    })
  })
}
