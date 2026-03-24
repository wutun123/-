#!/bin/bash
# 宠星球分销商城 - 一键部署脚本
# 使用方法：bash deploy.sh

set -e

# 配置项
APP_DIR="/var/www/pet-universe"
BACKUP_DIR="/var/backups/pet-universe"

echo "=========================================="
echo "  宠星球分销商城 - 一键部署脚本"
echo "=========================================="

# 检查是否已安装
check_installed() {
    if [ ! -d "$APP_DIR" ]; then
        echo "❌ 项目目录不存在，请先运行 install.sh"
        exit 1
    fi
    echo "✅ 检测到已安装的项目"
}

# 备份当前版本
backup() {
    echo "📦 备份当前版本..."
    mkdir -p $BACKUP_DIR
    tar -czf $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).tar.gz -C $APP_DIR .
    echo "✅ 备份完成"
}

# 拉取最新代码
pull_code() {
    echo "📥 拉取最新代码..."
    cd $APP_DIR
    git pull origin main
    echo "✅ 代码更新完成"
}

# 安装后端依赖
install_backend() {
    echo "📦 安装后端依赖..."
    cd $APP_DIR/backend
    npm install --production --registry=https://registry.npmmirror.com
    echo "✅ 后端依赖安装完成"
}

# 重启服务
restart_service() {
    echo "🔄 重启服务..."
    pm2 restart pet-api
    pm2 save
    echo "✅ 服务重启完成"
}

# 检查服务状态
check_status() {
    echo "📊 服务状态:"
    pm2 status
    echo ""
    systemctl status nginx --no-pager
}

# 主流程
main() {
    check_installed
    backup
    pull_code
    install_backend
    restart_service
    check_status

    echo ""
    echo "=========================================="
    echo "  🎉 部署完成!"
    echo "=========================================="
}

main
