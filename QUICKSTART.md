# 宠星球分销商城 - 快速部署手册

> **5 分钟快速上手，30 分钟完成生产部署**

---

## 🚀 方式对比

| 部署方式 | 适用场景 | 耗时 | 难度 |
|---------|---------|------|------|
| Docker Compose | 快速测试/开发环境 | 5 分钟 | ⭐ |
| 源码部署 | 生产环境 | 30 分钟 | ⭐⭐⭐ |
| 一键脚本 | 生产环境（推荐） | 15 分钟 | ⭐⭐ |

---

## 📦 方式一：Docker Compose（5 分钟测试环境）

### Step 1: 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | bash

# CentOS
yum install -y yum-utils && yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
yum install docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl start docker
```

### Step 2: 启动服务

```bash
# 进入项目目录
cd /path/to/pet-universe

# 复制环境变量
cp backend/.env.example backend/.env

# 编辑配置（必须修改密码）
nano backend/.env

# 一键启动
docker-compose up -d

# 查看状态
docker-compose ps
```

### Step 3: 初始化数据库

```bash
docker exec -i pet-mysql mysql -u pet_user -ppet_password pet_universe < backend/database/init.sql
```

### Step 4: 验证

```bash
# 测试 API
curl http://localhost/api/v1/health

# 查看日志
docker-compose logs -f backend
```

**✅ 完成！** 现在可以访问 http://localhost 测试了

---

## 📦 方式二：一键脚本部署（15 分钟生产环境）

### Step 1: 准备服务器

**要求**: Ubuntu 20.04+ / CentOS 7+, 2 核 4GB 以上

### Step 2: 运行安装脚本

```bash
# 上传代码到服务器
scp -r ./* root@your_server_ip:/var/www/pet-universe

# SSH 登录服务器
ssh root@your_server_ip

# 进入项目目录
cd /var/www/pet-universe

# 执行安装脚本
chmod +x scripts/*.sh
bash scripts/install.sh
```

### Step 3: 配置数据库

```bash
# 运行数据库配置脚本
bash scripts/setup-database.sh

# 按提示输入 root 密码，会自动创建数据库和用户
```

### Step 4: 配置环境变量

```bash
cd /var/www/pet-universe/backend
cp .env.example .env
nano .env
```

**必须修改的配置**:
```env
NODE_ENV=production
DB_PASSWORD=你的数据库密码
JWT_SECRET=随机生成一个长字符串
WECHAT_APP_ID=你的小程序 AppID
WECHAT_APP_SECRET=你的小程序 Secret
```

### Step 5: 启动服务

```bash
# 运行部署脚本
bash scripts/deploy.sh
```

### Step 6: 配置 Nginx

```bash
# 复制配置
cp nginx/nginx.conf /etc/nginx/sites-available/pet-universe

# 编辑域名
nano /etc/nginx/sites-available/pet-universe
# 修改 server_name 为你的域名

# 启用配置
ln -s /etc/nginx/sites-available/pet-universe /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: 配置 SSL 证书

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 申请证书（替换为你的域名）
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**✅ 完成！** 现在可以访问 https://yourdomain.com 测试了

---

## 📦 方式三：手动源码部署（30 分钟，完全控制）

参考 `DEPLOY.md` 文档，适合需要完全控制部署流程的场景。

---

## 🔧 快速配置小程序

### 1. 微信公众平台配置

1. 登录 https://mp.weixin.qq.com/
2. 开发 → 开发管理 → 开发设置
3. 服务器域名配置：
   - request 合法域名：`https://yourdomain.com`
   - uploadFile 合法域名：`https://yourdomain.com`
   - downloadFile 合法域名：`https://yourdomain.com`

### 2. 修改小程序配置

编辑 `frontend/manifest.json`:
```json
"mp-weixin": {
  "appid": "你的小程序 AppID",
  "scriptLibraries": []
}
```

### 3. 构建小程序

```bash
cd frontend
npm install
npm run build:mp-weixin
```

将 `dist/build/mp-weixin` 目录上传到微信开发者工具。

---

## 🩺 故障排查

### 后端无法启动

```bash
# 查看 PM2 日志
pm2 logs pet-api

# 查看端口占用
netstat -tlnp | grep 3000

# 检查数据库连接
mysql -u pet_user -p -e "SELECT 1"
```

### Nginx 无法访问

```bash
# 检查配置
nginx -t

# 查看日志
tail -f /var/log/nginx/error.log

# 检查防火墙
ufw status
```

### 数据库连接失败

```bash
# 检查 MySQL 状态
systemctl status mysql

# 检查用户权限
mysql -u root -p -e "SHOW GRANTS FOR 'pet_user'@'localhost';"
```

---

## 📊 运维命令速查

| 操作 | 命令 |
|------|------|
| 查看服务状态 | `pm2 status` |
| 重启服务 | `pm2 restart pet-api` |
| 查看日志 | `pm2 logs pet-api` |
| 备份数据库 | `bash scripts/backup.sh` |
| 更新代码 | `git pull && bash scripts/deploy.sh` |
| Nginx 配置 | `nginx -t && systemctl restart nginx` |

---

## 📋 部署检查清单

- [ ] 服务器环境安装完成
- [ ] 数据库创建并导入表结构
- [ ] .env 配置完成（特别是密码和微信配置）
- [ ] PM2 服务运行正常 (`pm2 status`)
- [ ] Nginx 配置完成
- [ ] SSL 证书配置完成
- [ ] 域名解析完成
- [ ] 微信公众平台域名配置完成
- [ ] 小程序测试通过

---

## 📚 相关文档

- `DEPLOY.md` - 详细部署指南
- `DOCKER_DEPLOY.md` - Docker 部署指南
- `PROJECT_SUMMARY.md` - 项目总结
- `README.md` - 项目说明

---

**需要帮助？** 查看 PM2 日志：`pm2 logs` 或 Nginx 日志：`/var/log/nginx/`

**生产环境建议**：配置定时备份 `crontab -e` 添加 `0 2 * * * bash /var/www/pet-universe/scripts/backup.sh`
