const Koa = require('koa')
const cors = require('cors')
const bodyParser = require('koa-bodyparser')
const dotenv = require('dotenv')
const logger = require('winston')
const serve = require('koa-static')
const path = require('path')

const { sequelize, testConnection } = require('./database')
const routes = require('./routes')
const { syncDatabase } = require('./database')

dotenv.config()

const app = new Koa()

// 配置日志
logger.configure({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    new logger.transports.Console(),
    new logger.transports.File({ filename: 'logs/app.log' })
  ]
})

// 中间件
app.use(cors())
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'],
  formLimit: '1mb',
  jsonLimit: '1mb'
}))

// 静态文件服务 - 支持图片上传
app.use(serve(path.join(__dirname, '../uploads')))

// 日志中间件
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    logger.error('Error:', error)
    ctx.status = error.status || 500
    ctx.body = {
      code: ctx.status,
      message: error.message || '服务器错误'
    }
  }
})

// 路由
app.use(routes.routes(), routes.allowedMethods())

// 健康检查
app.use(async (ctx) => {
  if (ctx.path === '/health') {
    ctx.body = { status: 'ok', timestamp: new Date().toISOString() }
  }
})

// 启动服务
const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // 测试数据库连接
    await testConnection()

    // 同步数据库模型
    await syncDatabase(false)

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器启动成功：http://localhost:${PORT}`)
      console.log(`环境：${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('启动失败:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app
