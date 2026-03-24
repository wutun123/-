const jwt = require('jsonwebtoken')
const crypto = require('crypto-js')
const { User, Distributor } = require('../models')
const { sequelize } = require('../database')

/**
 * 微信登录
 */
async function wechatLogin(ctx) {
  const { code } = ctx.request.body

  try {
    // 调用微信 API 获取 openid
    const wechatConfig = {
      appId: process.env.WECHAT_APP_ID,
      appSecret: process.env.WECHAT_APP_SECRET
    }

    // TODO: 实际项目中需要调用微信 API
    // const res = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
    //   params: { appid: wechatConfig.appId, secret: wechatConfig.appSecret, js_code: code, grant_type: 'authorization_code' }
    // })

    // 模拟返回
    const openid = `mock_openid_${code}`
    const unionid = `mock_unionid_${code}`

    // 查找或创建用户
    let user = await User.findOne({ where: { openid } })

    if (!user) {
      user = await User.create({
        openid,
        unionid,
        nickname: `宠星球用户${Math.floor(Math.random() * 10000)}`,
        avatar: ''
      })
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user.id, openid: user.openid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    ctx.body = {
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
          is_distributor: false
        }
      }
    }
  } catch (error) {
    console.error('微信登录失败:', error)
    ctx.body = {
      code: 500,
      message: '登录失败',
      data: null
    }
  }
}

/**
 * 获取用户信息
 */
async function getUserProfile(ctx) {
  const userId = ctx.state.user.id

  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['openid', 'unionid'] }
    })

    if (!user) {
      ctx.body = { code: 404, message: '用户不存在' }
      return
    }

    ctx.body = {
      code: 200,
      message: 'success',
      data: user
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ctx.body = { code: 500, message: '获取用户信息失败' }
  }
}

/**
 * 更新用户信息
 */
async function updateUserProfile(ctx) {
  const userId = ctx.state.user.id
  const { nickname, avatar, phone, gender } = ctx.request.body

  try {
    const user = await User.findByPk(userId)
    if (!user) {
      ctx.body = { code: 404, message: '用户不存在' }
      return
    }

    await user.update({
      nickname: nickname || user.nickname,
      avatar: avatar || user.avatar,
      phone: phone || user.phone,
      gender: gender || user.gender
    })

    ctx.body = {
      code: 200,
      message: '更新成功',
      data: user
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    ctx.body = { code: 500, message: '更新失败' }
  }
}

/**
 * 绑定手机号
 */
async function bindPhone(ctx) {
  const userId = ctx.state.user.id
  const { phone, code } = ctx.request.body

  try {
    // TODO: 验证短信验证码

    const user = await User.findByPk(userId)
    if (!user) {
      ctx.body = { code: 404, message: '用户不存在' }
      return
    }

    await user.update({ phone })

    ctx.body = {
      code: 200,
      message: '绑定成功',
      data: user
    }
  } catch (error) {
    console.error('绑定手机号失败:', error)
    ctx.body = { code: 500, message: '绑定失败' }
  }
}

module.exports = {
  wechatLogin,
  getUserProfile,
  updateUserProfile,
  bindPhone
}
