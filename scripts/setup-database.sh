#!/bin/bash
# 宠星球分销商城 - 数据库快速配置脚本
# 使用方法：bash setup-database.sh

set -e

echo "=========================================="
echo "  宠星球分销商城 - 数据库配置脚本"
echo "=========================================="

# 配置变量
DB_ROOT_PASSWORD=""
DB_PASSWORD="YourStrongPassword123!"
DB_NAME="pet_universe"
DB_USER="pet_user"

echo "请输入 MySQL root 密码:"
read -s DB_ROOT_PASSWORD
echo ""

# 创建数据库和用户
echo "📦 创建数据库和用户..."
mysql -u root -p"$DB_ROOT_PASSWORD" <<EOF
-- 创建数据库
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建数据库用户
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';

-- 授权
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EOF

echo "✅ 数据库和用户创建完成"

# 导入表结构
if [ -f "backend/database/init.sql" ]; then
    echo "📦 导入表结构..."
    mysql -u root -p"$DB_ROOT_PASSWORD" $DB_NAME < backend/database/init.sql
    echo "✅ 表结构导入完成"
else
    echo "⚠️  未找到 init.sql 文件，跳过表结构导入"
fi

echo ""
echo "=========================================="
echo "  数据库配置完成！"
echo "=========================================="
echo "数据库名：$DB_NAME"
echo "用户名：$DB_USER"
echo "密码：$DB_PASSWORD"
echo ""
echo "请将以下配置写入 backend/.env 文件:"
echo "DB_HOST=localhost"
echo "DB_PORT=3306"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$DB_PASSWORD"
echo "=========================================="
