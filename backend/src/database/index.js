const { Sequelize } = require('sequelize')
const dotenv = require('dotenv')

dotenv.config()

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    timezone: '+08:00',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
)

// 测试连接
async function testConnection() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功!')
  } catch (error) {
    console.error('数据库连接失败:', error)
    process.exit(1)
  }
}

// 同步数据库
async function syncDatabase(force = false) {
  try {
    await sequelize.sync({ force, alter: !force })
    console.log('数据库同步成功!')
  } catch (error) {
    console.error('数据库同步失败:', error)
    process.exit(1)
  }
}

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
}
