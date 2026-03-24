#!/bin/bash
# 宠星球分销商城 - 数据库备份脚本
# 使用方法：bash backup.sh

set -e

# 配置项
BACKUP_DIR="/var/backups/pet-universe"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="pet_universe_$DATE.sql"

# 从 .env 读取数据库密码 (如果存在)
ENV_FILE="/var/www/pet-universe/backend/.env"
if [ -f "$ENV_FILE" ]; then
    DB_PASSWORD=$(grep DB_PASSWORD $ENV_FILE | cut -d'=' -f2)
else
    DB_PASSWORD="YourStrongPassword123!"
fi

echo "=========================================="
echo "  宠星球分销商城 - 数据库备份脚本"
echo "=========================================="

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
echo "📦 开始备份数据库..."
mysqldump -u pet_user -p"$DB_PASSWORD" pet_universe > $BACKUP_DIR/$BACKUP_FILE

# 压缩备份
echo "📦 压缩备份文件..."
gzip $BACKUP_DIR/$BACKUP_FILE

# 删除 7 天前的备份
echo "🧹 清理旧备份..."
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# 显示备份信息
BACKUP_SIZE=$(ls -lh $BACKUP_DIR/$BACKUP_FILE.gz | awk '{print $5}')
echo ""
echo "=========================================="
echo "  ✅ 备份完成!"
echo "  备份文件：$BACKUP_FILE.gz"
echo "  文件大小：$BACKUP_SIZE"
echo "  存储位置：$BACKUP_DIR"
echo "=========================================="
