# 宠星球分销商城 - 部署指南

**版本**: V1.0
**更新日期**: 2026-03-24

---

## 一、服务器准备

### 1.1 服务器配置要求

| 配置 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 2 核 | 4 核 |
| 内存 | 4GB | 8GB |
| 硬盘 | 40GB | 80GB SSD |
| 带宽 | 3Mbps | 5Mbps+ |
| 系统 | Ubuntu 20.04 / CentOS 7+ | Ubuntu 22.04 |

### 1.2 开放端口

| 端口 | 用途 | 说明 |
|------|------|------|
| 22 | SSH | 远程连接 |
| 80 | HTTP | Nginx 反向代理 |
| 443 | HTTPS | SSL 加密（必需） |
| 3000 | 应用服务 | Node.js 后端 |
| 3306 | MySQL | 数据库（建议不开放外网） |
| 6379 | Redis | 缓存（建议不开放外网） |

---

## 二、环境安装

### 2.1 一键安装脚本（Ubuntu/Debian）

```bash
#!/bin/bash
# 保存为 install.sh 后执行：bash install.sh

echo "========== 开始安装环境 =========="

# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 18
echo "安装 Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# 安装 MySQL
echo "安装 MySQL..."
apt install -y mysql-server

# 安装 Redis
echo "安装 Redis..."
apt install -y redis-server

# 安装 Nginx
echo "安装 Nginx..."
apt install -y nginx

# 安装 Git
echo "安装 Git..."
apt install -y git

# 安装 PM2（Node.js 进程管理）
echo "安装 PM2..."
npm install -g pm2

# 配置防火墙
echo "配置防火墙..."
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

echo "========== 环境安装完成 =========="

# 版本检查
echo "Node.js 版本：$(node -v)"
echo "npm 版本：$(npm -v)"
echo "MySQL 版本：$(mysql --version)"
echo "Redis 版本：$(redis-server --version)"
echo "Nginx 版本：$(nginx -v)"
```

### 2.2 CentOS/RHEL 安装脚本

```bash
#!/bin/bash
# 保存为 install-centos.sh 后执行：bash install-centos.sh

echo "========== 开始安装环境 =========="

# 安装 EPEL 源
yum install -y epel-release

# 安装 Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 安装 MySQL
yum install -y mysql-server

# 安装 Redis
yum install -y redis

# 安装 Nginx
yum install -y nginx

# 安装 Git
yum install -y git

# 安装 PM2
npm install -g pm2

# 配置防火墙
systemctl start firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

echo "========== 环境安装完成 =========="
```

---

## 三、数据库配置

### 3.1 创建数据库和用户

```bash
# 登录 MySQL
mysql -u root -p
```

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS `pet_universe` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建数据库用户（生产环境建议使用强密码）
CREATE USER 'pet_user'@'localhost' IDENTIFIED BY 'YourStrongPassword123!';

-- 授权
GRANT ALL PRIVILEGES ON pet_universe.* TO 'pet_user'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 3.2 导入表结构

```bash
# 进入项目目录
cd /path/to/pet-universe/backend

# 导入数据库
mysql -u pet_user -p pet_universe < database/init.sql
```

---

## 四、后端部署

### 4.1 克隆/上传代码

```bash
# 创建应用目录
mkdir -p /var/www/pet-universe
cd /var/www/pet-universe

# 方式 1: Git 克隆
git clone <你的代码仓库地址> .

# 方式 2: 本地上传（使用 scp）
# 本地执行：scp -r ./backend/* root@服务器 IP:/var/www/pet-universe/backend
# 本地执行：scp -r ./frontend/* root@服务器 IP:/var/www/pet-universe/frontend
```

### 4.2 安装后端依赖

```bash
cd /var/www/pet-universe/backend

# 安装依赖
npm install --production

# 或者使用淘宝镜像加速
npm install --production --registry=https://registry.npmmirror.com
```

### 4.3 配置环境变量

```bash
cd /var/www/pet-universe/backend

# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**.env 配置说明**:

```env
# 服务器配置
NODE_ENV=production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pet_universe
DB_USER=pet_user
DB_PASSWORD=YourStrongPassword123!

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT 配置（务必修改为随机字符串）
JWT_SECRET=your_random_secret_key_change_now_$(date +%s)
JWT_EXPIRES_IN=7d

# 微信配置（从微信公众平台获取）
WECHAT_APP_ID=wx_xxxxxxxxxxxxxxxx
WECHAT_APP_SECRET=your_app_secret_from_wechat
WECHAT_MCH_ID=1234567890
WECHAT_API_KEY=your_api_key_from_wechat
WECHAT_NOTIFY_URL=https://yourdomain.com/api/v1/payments/wechat/notify

# 分销配置
DISTRIBUTION_LEVEL1_RATE=15
DISTRIBUTION_LEVEL2_RATE=8
DISTRIBUTION_MIN_WITHDRAW=10
DISTRIBUTION_AUTO_UPGRADE_AMOUNT=1000
DISTRIBUTION_AUTO_UPGRADE_COUNT=10

# 订单配置
ORDER_AUTO_CANCEL_MINUTES=30
ORDER_AUTO_CONFIRM_DAYS=7
ORDER_COMMISSION_SETTLE_DAYS=7
```

### 4.4 启动后端服务

```bash
cd /var/www/pet-universe/backend

# 使用 PM2 启动
pm2 start src/index.js --name pet-api

# 设置开机自启
pm2 save
pm2 startup

# 查看日志
pm2 logs pet-api

# 查看状态
pm2 status
```

---

## 五、前端部署

### 5.1 方式一：构建后上传（推荐）

```bash
# 在本地电脑执行
cd /path/to/frontend

# 安装依赖
npm install

# 修改 manifest.json 中的小程序 AppID
# 将 "appid": "wx_xxx" 改为你的小程序 AppID

# 构建
npm run build:mp-weixin

# 上传 dist/build/mp-weixin 目录到微信开发者工具
```

### 5.2 方式二：服务器构建

```bash
cd /var/www/pet-universe/frontend

# 安装依赖
npm install --registry=https://registry.npmmirror.com

# 安装 HBuilderX CLI（可选，用于命令行构建）
# 下载地址：https://www.dcloud.io/hbuilderx.html
```

---

## 六、Nginx 配置

### 6.1 创建 Nginx 配置文件

```bash
# 创建配置文件
nano /etc/nginx/sites-available/pet-universe
```

### 6.2 Nginx 配置内容

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # 强制跳转到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL 证书配置
    ssl_certificate /etc/nginx/ssl/yourdomain.com.crt;
    ssl_certificate_key /etc/nginx/ssl/yourdomain.com.key;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 前端静态文件（如果有 H5 版本）
    location / {
        root /var/www/pet-universe/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 日志
    access_log /var/log/nginx/pet-universe-access.log;
    error_log /var/log/nginx/pet-universe-error.log;
}
```

### 6.3 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/pet-universe /etc/nginx/sites-enabled/pet-universe

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

---

## 七、SSL 证书配置

### 7.1 免费证书申请（Let's Encrypt）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期
certbot renew --dry-run
```

### 7.2 腾讯云/阿里云证书

1. 在云平台申请免费 SSL 证书
2. 下载 Nginx 格式的证书文件
3. 上传到服务器 `/etc/nginx/ssl/` 目录
4. 参考 6.2 配置证书路径

---

## 八、小程序配置

### 8.1 微信公众平台配置

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入 开发 → 开发管理
3. 配置服务器域名：
   - request 合法域名：`https://yourdomain.com`
   - uploadFile 合法域名：`https://yourdomain.com`
   - downloadFile 合法域名：`https://yourdomain.com`

### 8.2 微信支付配置

1. 登录 [微信支付商户平台](https://pay.weixin.qq.com/)
2. 产品中心 → 分账功能 → 申请开通
3. 配置 API 密钥
4. 下载 API 证书

---

## 九、验证部署

### 9.1 检查服务状态

```bash
# 检查 Node.js 服务
pm2 status

# 检查 Nginx
systemctl status nginx

# 检查 MySQL
systemctl status mysql

# 检查 Redis
systemctl status redis

# 检查端口监听
netstat -tlnp | grep -E '3000|80|443|3306'
```

### 9.2 测试 API 接口

```bash
# 测试健康检查接口
curl https://yourdomain.com/api/v1/health

# 测试获取分类列表
curl https://yourdomain.com/api/v1/categories

# 应该返回 JSON 数据
```

### 9.3 小程序真机测试

1. 在微信开发者工具中编译
2. 点击"预览"生成二维码
3. 用手机微信扫码测试
4. 测试登录、商品浏览、下单等核心功能

---

## 十、常见问题

### 10.1 后端启动失败

```bash
# 查看 PM2 日志
pm2 logs pet-api --lines 100

# 常见原因:
# 1. 端口被占用：修改.env 中的 PORT
# 2. 数据库连接失败：检查 MySQL 服务和密码
# 3. 依赖缺失：重新 npm install
```

### 10.2 Nginx 无法访问

```bash
# 检查防火墙
ufw status

# 检查 SELinux（CentOS）
getenforce
setenforce 0  # 临时关闭

# 检查 Nginx 配置
nginx -t
```

### 10.3 小程序请求失败

1. 检查服务器域名是否配置
2. 检查 HTTPS 证书是否有效
3. 检查 Nginx 代理配置
4. 小程序后台添加合法域名

### 10.4 数据库连接失败

```bash
# 检查 MySQL 是否运行
systemctl status mysql

# 检查用户权限
mysql -u pet_user -p -e "SHOW GRANTS;"

# 检查 bind-address
nano /etc/mysql/mysql.conf.d/mysqld.cnf
# 确保 bind-address = 127.0.0.1
```

---

## 十一、运维脚本

### 11.1 备份脚本

```bash
#!/bin/bash
# backup.sh - 数据库备份脚本

BACKUP_DIR="/var/backups/pet-universe"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="pet_universe_$DATE.sql"

mkdir -p $BACKUP_DIR

mysqldump -u pet_user -p'YourPassword' pet_universe > $BACKUP_DIR/$BACKUP_FILE

# 压缩
gzip $BACKUP_DIR/$BACKUP_FILE

# 删除 7 天前的备份
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

echo "备份完成：$BACKUP_FILE.gz"
```

### 11.2 部署脚本

```bash
#!/bin/bash
# deploy.sh - 一键部署脚本

echo "========== 开始部署 =========="

# 拉取最新代码
cd /var/www/pet-universe
git pull

# 安装后端依赖
cd backend
npm install --production

# 重启服务
pm2 restart pet-api

# 清理缓存
pm2 flush

echo "========== 部署完成 =========="
pm2 status
```

### 11.3 定时任务

```bash
# 编辑 crontab
crontab -e

# 添加定时任务
# 每天凌晨 2 点备份数据库
0 2 * * * /var/www/pet-universe/scripts/backup.sh

# 每 5 分钟检查服务状态
*/5 * * * * pm2 status > /dev/null || pm2 restart pet-api
```

---

## 十二、性能优化

### 12.1 MySQL 优化

```sql
-- 优化配置 /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
max_connections = 500
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
query_cache_size = 64M
```

### 12.2 Redis 优化

```bash
# /etc/redis/redis.conf
maxmemory 512mb
maxmemory-policy allkeys-lru
```

### 12.3 Node.js 优化

```bash
# PM2 集群模式启动（多核利用）
pm2 start src/index.js -i max --name pet-api
```

---

## 十三、监控告警

### 13.1 PM2 监控

```bash
# 安装 PM2 Plus
pm2 plus

# 在线查看：https://app.pm2.io
```

### 13.2 系统监控

```bash
# 安装 htop
apt install -y htop

# 安装 nmon
apt install -y nmon
```

---

## 十四、安全加固

### 14.1 服务器安全

```bash
# 禁用 root 登录
nano /etc/ssh/sshd_config
# PermitRootLogin no

# 创建普通用户
adduser deploy
usermod -aG sudo deploy

# 配置密钥登录
ssh-copy-id deploy@server_ip
```

### 14.2 数据库安全

```sql
-- 删除测试数据库
DROP DATABASE IF EXISTS test;

-- 限制用户权限
REVOKE ALL ON *.* FROM 'pet_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON pet_universe.* TO 'pet_user'@'localhost';
```

### 14.3 应用安全

1. 定期更新依赖：`npm audit fix`
2. 配置 HTTPS 强制跳转
3. 设置合理的 CORS 策略
4. 开启防火墙

---

## 十五、部署检查清单

- [ ] 服务器环境安装完成
- [ ] 数据库创建并导入表结构
- [ ] 后端依赖安装完成
- [ ] .env 配置完成
- [ ] PM2 服务运行正常
- [ ] Nginx 配置完成
- [ ] SSL 证书配置完成
- [ ] 域名解析完成
- [ ] 微信公众平台域名配置
- [ ] 微信支付配置完成
- [ ] 小程序测试通过
- [ ] 备份脚本配置完成

---

## 十六、联系方式

部署过程中遇到问题，请检查：
1. PM2 日志：`pm2 logs`
2. Nginx 日志：`/var/log/nginx/`
3. MySQL 日志：`/var/log/mysql/`

---

**祝部署顺利！**
