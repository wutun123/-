# 宠星球分销商城 - 部署脚本说明

## 📁 脚本清单

| 脚本文件 | 用途 | 执行时间 |
|---------|------|---------|
| `install.sh` | Ubuntu/Debian 环境安装 | 5-10 分钟 |
| `install-centos.sh` | CentOS/RHEL 环境安装 | 5-10 分钟 |
| `setup-database.sh` | 数据库快速配置 | 1 分钟 |
| `deploy.sh` | 应用部署/更新 | 2 分钟 |
| `backup.sh` | 数据库备份 | 1 分钟 |

---

## 🚀 使用流程

### 1. 首次部署

```bash
# Step 1: 安装环境（需要 root 权限）
sudo bash scripts/install.sh

# Step 2: 配置数据库
bash scripts/setup-database.sh

# Step 3: 配置环境变量
cd /var/www/pet-universe/backend
cp .env.example .env
nano .env

# Step 4: 启动服务
bash scripts/deploy.sh
```

### 2. 更新代码

```bash
# 直接运行部署脚本
bash scripts/deploy.sh
```

### 3. 定时备份

```bash
# 添加定时任务
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /var/www/pet-universe/scripts/backup.sh
```

---

## 📝 脚本详解

### install.sh - 环境安装脚本

**功能**:
- 安装 Node.js 18
- 安装 MySQL 8.0
- 安装 Redis 6.0
- 安装 Nginx
- 安装 Git 和 PM2
- 配置防火墙
- 创建应用目录

**适用系统**: Ubuntu 20.04+ / Debian 10+

**CentOS 用户请使用**: `install-centos.sh`

---

### setup-database.sh - 数据库配置脚本

**功能**:
- 创建数据库 `pet_universe`
- 创建用户 `pet_user`
- 导入表结构
- 配置权限

**需要输入**: MySQL root 密码

**输出**: 数据库连接信息（用于配置 .env）

---

### deploy.sh - 应用部署脚本

**功能**:
- 备份当前版本
- 拉取最新代码（Git）
- 安装后端依赖
- 重启 PM2 服务
- 显示服务状态

**前提条件**: 已运行过 `install.sh`

---

### backup.sh - 数据库备份脚本

**功能**:
- 导出数据库到 SQL 文件
- 压缩备份文件
- 清理 7 天前旧备份

**备份位置**: `/var/backups/pet-universe/`

---

## 🔧 故障排查

### 脚本执行失败

```bash
# 检查脚本权限
chmod +x scripts/*.sh

# 检查是否 root 用户（install.sh 需要）
sudo bash scripts/install.sh
```

### 数据库脚本报错

```bash
# 检查 MySQL 是否运行
systemctl status mysql

# 手动测试连接
mysql -u root -p
```

### 部署脚本报错

```bash
# 查看 PM2 日志
pm2 logs pet-api

# 检查端口占用
netstat -tlnp | grep 3000
```

---

## 📊 环境变量配置

编辑 `backend/.env`:

```env
# 必须修改
NODE_ENV=production
DB_PASSWORD=你的强密码
JWT_SECRET=随机生成的长字符串（至少 32 位）
WECHAT_APP_ID=你的小程序 AppID
WECHAT_APP_SECRET=你的小程序 Secret

# 可选修改
DISTRIBUTION_LEVEL1_RATE=15     # 一级分销比例
DISTRIBUTION_LEVEL2_RATE=8      # 二级分销比例
DISTRIBUTION_MIN_WITHDRAW=10    # 最低提现金额
```

---

## 🎯 最佳实践

1. **首次部署前先测试**: 在测试环境验证后再部署生产
2. **定期备份**: 配置 cron 定时备份数据库
3. **监控日志**: 使用 `pm2 logs` 和 Nginx 日志监控异常
4. **更新前备份**: `deploy.sh` 会自动备份，但建议手动再备一份
5. **使用 HTTPS**: 生产环境必须配置 SSL 证书

---

## 📞 需要帮助？

- 查看详细文档：`DEPLOY.md`, `DOCKER_DEPLOY.md`
- 查看 PM2 日志：`pm2 logs`
- 查看 Nginx 日志：`tail -f /var/log/nginx/error.log`
- 查看 MySQL 日志：`tail -f /var/log/mysql/error.log`
