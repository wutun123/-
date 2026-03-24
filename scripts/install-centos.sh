#!/bin/bash
# 宠星球分销商城 - 一键环境安装脚本 (CentOS/RHEL)
# 使用方法：bash install-centos.sh

set -e

echo "=========================================="
echo "  宠星球分销商城 - 环境安装脚本 (CentOS)"
echo "  版本：V1.0"
echo "=========================================="

# 检查是否 root 用户
if [ "$EUID" -ne 0 ]; then
  echo "❌ 请使用 sudo 运行此脚本"
  exit 1
fi

# 安装 EPEL 源
echo "📦 安装 EPEL 源..."
yum install -y epel-release

# 安装 Node.js 18
echo "📦 安装 Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# 安装 MySQL
echo "📦 安装 MySQL..."
yum install -y mysql-server

# 安装 Redis
echo "📦 安装 Redis..."
yum install -y redis

# 安装 Nginx
echo "📦 安装 Nginx..."
yum install -y nginx

# 安装 Git
echo "📦 安装 Git..."
yum install -y git

# 安装 PM2
echo "📦 安装 PM2..."
npm install -g pm2

# 创建应用目录
echo "📦 创建应用目录..."
mkdir -p /var/www/pet-universe

# 创建备份目录
mkdir -p /var/backups/pet-universe

# 配置防火墙
echo "🔒 配置防火墙..."
systemctl start firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# 设置开机自启
echo "🔧 配置服务开机自启..."
systemctl enable mysqld
systemctl enable redis
systemctl enable nginx
systemctl enable firewalld

# 启动服务
systemctl start mysqld
systemctl start redis
systemctl start nginx

# 版本检查
echo ""
echo "=========================================="
echo "  环境安装完成！版本信息："
echo "=========================================="
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "MySQL: $(mysql --version | head -n1)"
echo "Redis: $(redis-server --version)"
echo "Nginx: $(nginx -v 2>&1)"
echo "PM2: $(pm2 -v)"
echo ""
echo "📁 应用目录：/var/www/pet-universe"
echo "📁 备份目录：/var/backups/pet-universe"
echo ""
echo "下一步操作:"
echo "1. 将代码上传到 /var/www/pet-universe"
echo "2. 运行数据库初始化脚本"
echo "3. 配置 backend/.env 文件"
echo "4. 运行 bash deploy.sh 启动服务"
echo "=========================================="
