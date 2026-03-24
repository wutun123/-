const jwt = require('jsonwebtoken')

/**
 * JWT 认证中间件
 */
async function authMiddleware(ctx, next) {
  const authHeader = ctx.headers.authorization

  if (!authHeader) {
    ctx.status = 401
    ctx.body = { code: 401, message: '缺少认证信息' }
    return
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    ctx.state.user = decoded
    await next()
  } catch (error) {
    ctx.status = 401
    ctx.body = { code: 401, message: '认证失效，请重新登录' }
  }
}

/**
 * 管理员认证中间件
 */
async function adminMiddleware(ctx, next) {
  // TODO: 实现管理员权限验证
  await next()
}

module.exports = {
  authMiddleware,
  adminMiddleware
}
