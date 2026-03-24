# 宠星球分销商城 - Docker 快速部署指南

## 方式一：Docker Compose 部署（推荐）

### 1. 前置要求

- Docker 20.10+
- Docker Compose 2.0+

### 2. 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
bash get-docker.sh

# CentOS
yum install -y yum-utils
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl start docker
```

### 3. 配置环境变量

```bash
cd /path/to/pet-universe

# 复制环境变量文件
cp backend/.env.example backend/.env

# 编辑配置
nano backend/.env
```

**必须修改的配置**:
```env
DB_PASSWORD=your_strong_password
JWT_SECRET=your_random_secret_key
WECHAT_APP_ID=wx_xxxxxxxxxxxxxxxx
WECHAT_APP_SECRET=your_app_secret
```

### 4. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 5. 导入数据库

```bash
# 进入 MySQL 容器
docker exec -i pet-mysql mysql -u pet_user -ppet_password pet_universe < backend/database/init.sql
```

### 6. 访问服务

- 前端地址：http://localhost
- 后端 API：http://localhost/api/v1/health
- MySQL：localhost:3306
- Redis：localhost:6379

---

## 方式二：源码部署

### 1. 克隆代码

```bash
git clone <your-repo-url> /var/www/pet-universe
cd /var/www/pet-universe
```

### 2. 运行安装脚本

```bash
# 给脚本执行权限
chmod +x scripts/install.sh

# 执行安装
bash scripts/install.sh
```

### 3. 配置数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行 SQL
source /var/www/pet-universe/backend/database/init.sql
```

### 4. 配置环境变量

```bash
cd /var/www/pet-universe/backend
cp .env.example .env
nano .env
```

### 5. 启动后端服务

```bash
cd /var/www/pet-universe/backend

# PM2 启动
pm2 start src/index.js --name pet-api

# 设置开机自启
pm2 save
pm2 startup
```

### 6. 配置 Nginx

```bash
# 复制配置文件
cp nginx/nginx.conf /etc/nginx/sites-available/pet-universe

# 创建软链接
ln -s /etc/nginx/sites-available/pet-universe /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

### 7. 配置 SSL 证书

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
echo "0 3 * * * certbot renew --quiet" | crontab -
```

---

## 运维命令

### 服务管理

```bash
# Docker 方式
docker-compose up -d          # 启动
docker-compose down           # 停止
docker-compose restart        # 重启
docker-compose logs -f        # 查看日志
docker-compose ps             # 查看状态

# PM2 方式
pm2 start pet-api             # 启动
pm2 restart pet-api           # 重启
pm2 stop pet-api              # 停止
pm2 logs pet-api              # 查看日志
pm2 status                    # 查看状态
```

### 数据库管理

```bash
# 进入 MySQL
docker exec -it pet-mysql mysql -u pet_user -p

# 备份数据库
docker exec pet-mysql mysqldump -u pet_user -ppet_password pet_universe > backup.sql

# 恢复数据库
docker exec -i pet-mysql mysql -u pet_user -ppet_password pet_universe < backup.sql
```

### 日志查看

```bash
# 应用日志
docker-compose logs -f backend

# Nginx 日志
docker-compose logs -f nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# MySQL 日志
docker-compose logs -f mysql
```

---

## 常见问题

### 1. 容器启动失败

```bash
# 查看具体错误
docker-compose logs backend

# 检查端口占用
netstat -tlnp | grep 3000

# 重启容器
docker-compose restart
```

### 2. 数据库连接失败

```bash
# 检查 MySQL 是否运行
docker-compose ps mysql

# 测试连接
docker exec pet-backend ping mysql
```

### 3. Nginx 无法访问

```bash
# 检查配置
docker exec pet-nginx nginx -t

# 重启 Nginx
docker-compose restart nginx
```

### 4. 清理所有数据（慎用）

```bash
docker-compose down -v
rm -rf data/
```

---

## 性能优化

### 1. MySQL 优化

编辑 `docker-compose.yml`:
```yaml
mysql:
  command: --innodb-buffer-pool-size=1G --max-connections=500
```

### 2. Redis 优化

```bash
docker exec pet-redis redis-cli CONFIG SET maxmemory 512mb
docker exec pet-redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 3. Node.js 集群模式

编辑 `backend/src/index.js`, 使用 PM2 集群:
```bash
pm2 start src/index.js -i max --name pet-api
```

---

## 监控告警

### PM2 Plus 监控

```bash
pm2 plus
```

访问 https://app.pm2.io 查看实时监控

### 系统监控

```bash
# 安装监控工具
apt install -y htop nmon

# 查看资源使用
docker stats
```

---

## 备份策略

### 定时备份

```bash
# 编辑 crontab
crontab -e

# 每天凌晨 2 点备份
0 2 * * * /var/www/pet-universe/scripts/backup.sh

# 每周日清理旧备份
0 3 * * 0 find /var/backups/pet-universe -mtime +30 -delete
```

---

**部署完成后，请参考 DEPLOY.md 进行小程序配置和验证！**
