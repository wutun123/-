-- 宠星球分销商城 - 数据库初始化脚本
-- 版本：V1.0
-- 日期：2026-03-24

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `pet_universe` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `pet_universe`;

-- 用户表
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户 ID',
  `openid` VARCHAR(64) NOT NULL UNIQUE COMMENT '微信 OpenID',
  `unionid` VARCHAR(64) UNIQUE COMMENT '微信 UnionID',
  `nickname` VARCHAR(64) COMMENT '昵称',
  `avatar` VARCHAR(255) COMMENT '头像 URL',
  `phone` VARCHAR(20) COMMENT '手机号',
  `gender` TINYINT DEFAULT 0 COMMENT '性别 0-未知 1-男 2-女',
  `member_level` TINYINT DEFAULT 1 COMMENT '会员等级 1-普通 2-VIP',
  `total_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '累计消费金额',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_openid` (`openid`),
  INDEX `idx_phone` (`phone`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 商品分类表
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(32) NOT NULL COMMENT '分类名称',
  `parent_id` INT DEFAULT 0 COMMENT '父分类 ID',
  `icon` VARCHAR(255) COMMENT '图标 URL',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0-隐藏 1-显示',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_parent_id` (`parent_id`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品分类表';

-- 商品表
CREATE TABLE `products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '商品 ID',
  `name` VARCHAR(128) NOT NULL COMMENT '商品名称',
  `category_id` INT NOT NULL COMMENT '分类 ID',
  `description` TEXT COMMENT '商品描述',
  `main_image` VARCHAR(255) NOT NULL COMMENT '主图 URL',
  `images` JSON COMMENT '图片列表 JSON',
  `brand` VARCHAR(64) COMMENT '品牌',
  `commission_rate` DECIMAL(5,2) DEFAULT 0 COMMENT '佣金比例%',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0-下架 1-上架',
  `sales` INT DEFAULT 0 COMMENT '销量',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category_id`),
  INDEX `idx_status` (`status`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 商品 SKU 表
CREATE TABLE `product_skus` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'SKU ID',
  `product_id` BIGINT NOT NULL COMMENT '商品 ID',
  `spec_name` VARCHAR(64) COMMENT '规格名称 如"5kg"',
  `spec_value` VARCHAR(128) COMMENT '规格值 JSON',
  `price` DECIMAL(10,2) NOT NULL COMMENT '售价',
  `original_price` DECIMAL(10,2) COMMENT '原价',
  `stock` INT DEFAULT 0 COMMENT '库存',
  `sku_code` VARCHAR(64) COMMENT 'SKU 编码',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_product` (`product_id`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品 SKU 表';

-- 订单主表
CREATE TABLE `orders` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单 ID',
  `order_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `distributor_id` BIGINT COMMENT '分销商 ID(谁推广的)',
  `order_status` TINYINT DEFAULT 0 COMMENT '状态 0-待付款 1-待发货 2-待收货 3-已完成 4-已取消 5-售后',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '订单总额',
  `freight_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
  `discount_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
  `pay_amount` DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  `pay_time` TIMESTAMP NULL COMMENT '支付时间',
  `delivery_time` TIMESTAMP NULL COMMENT '发货时间',
  `receive_time` TIMESTAMP NULL COMMENT '收货时间',
  `finish_time` TIMESTAMP NULL COMMENT '完成时间',
  `cancel_time` TIMESTAMP NULL COMMENT '取消时间',
  `receiver_name` VARCHAR(32) COMMENT '收件人',
  `receiver_phone` VARCHAR(20) COMMENT '收件人电话',
  `receiver_address` VARCHAR(255) COMMENT '收件地址',
  `remark` VARCHAR(255) COMMENT '用户备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_order_no` (`order_no`),
  INDEX `idx_distributor` (`distributor_id`),
  INDEX `idx_status` (`order_status`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单主表';

-- 订单商品表
CREATE TABLE `order_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单商品 ID',
  `order_id` BIGINT NOT NULL COMMENT '订单 ID',
  `product_id` BIGINT NOT NULL COMMENT '商品 ID',
  `sku_id` BIGINT COMMENT 'SKU ID',
  `product_name` VARCHAR(128) NOT NULL COMMENT '商品名称',
  `sku_spec` VARCHAR(128) COMMENT 'SKU 规格',
  `price` DECIMAL(10,2) NOT NULL COMMENT '单价',
  `quantity` INT NOT NULL COMMENT '数量',
  `total_amount` DECIMAL(10,2) NOT NULL COMMENT '小计',
  `commission_amount` DECIMAL(10,2) DEFAULT 0 COMMENT '佣金金额',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order` (`order_id`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单商品表';

-- 分销商表
CREATE TABLE `distributors` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '分销商 ID',
  `user_id` BIGINT NOT NULL UNIQUE COMMENT '用户 ID',
  `level` TINYINT DEFAULT 1 COMMENT '等级 1-铜牌 2-银牌 3-金牌',
  `status` TINYINT DEFAULT 0 COMMENT '状态 0-待审核 1-正式 2-已拒绝 3-已冻结',
  `parent_id` BIGINT DEFAULT 0 COMMENT '上级分销商 ID',
  `team_count` INT DEFAULT 0 COMMENT '团队人数',
  `level1_count` INT DEFAULT 0 COMMENT '一级团队人数',
  `level2_count` INT DEFAULT 0 COMMENT '二级团队人数',
  `total_commission` DECIMAL(10,2) DEFAULT 0 COMMENT '累计佣金',
  `withdrawn_commission` DECIMAL(10,2) DEFAULT 0 COMMENT '已提现佣金',
  `pending_commission` DECIMAL(10,2) DEFAULT 0 COMMENT '待结算佣金',
  `apply_time` TIMESTAMP NULL COMMENT '申请时间',
  `audit_time` TIMESTAMP NULL COMMENT '审核时间',
  `approved_time` TIMESTAMP NULL COMMENT '通过时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_parent` (`parent_id`),
  INDEX `idx_status` (`status`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分销商表';

-- 佣金记录表
CREATE TABLE `commissions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '佣金 ID',
  `user_id` BIGINT NOT NULL COMMENT '分销商用户 ID',
  `order_id` BIGINT NOT NULL COMMENT '订单 ID',
  `order_no` VARCHAR(32) NOT NULL COMMENT '订单号',
  `level` TINYINT NOT NULL COMMENT '佣金层级 1-一级 2-二级',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '佣金金额',
  `status` TINYINT DEFAULT 0 COMMENT '状态 0-待结算 1-已结算 2-已提现 3-已取消',
  `settled_at` TIMESTAMP NULL COMMENT '结算时间',
  `withdrawn_at` TIMESTAMP NULL COMMENT '提现时间',
  `remark` VARCHAR(255) COMMENT '备注',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user` (`user_id`),
  INDEX `idx_order` (`order_id`),
  INDEX `idx_status` (`status`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='佣金记录表';

-- 提现记录表
CREATE TABLE `withdrawals` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '提现 ID',
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `distributor_id` BIGINT NOT NULL COMMENT '分销商 ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '提现金额',
  `status` TINYINT DEFAULT 0 COMMENT '状态 0-待审核 1-处理中 2-已完成 3-已驳回',
  `audit_remark` VARCHAR(255) COMMENT '审核备注',
  `transaction_id` VARCHAR(64) COMMENT '微信分账交易号',
  `apply_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `audit_time` TIMESTAMP NULL COMMENT '审核时间',
  `finish_time` TIMESTAMP NULL COMMENT '完成时间',
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提现记录表';

-- 分销关系表
CREATE TABLE `distribution_relations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '关系 ID',
  `user_id` BIGINT NOT NULL COMMENT '粉丝用户 ID',
  `distributor_id` BIGINT NOT NULL COMMENT '绑定分销商 ID',
  `level` TINYINT NOT NULL COMMENT '关系层级 1-一级 2-二级',
  `bind_source` VARCHAR(32) COMMENT '绑定来源 share/click',
  `bind_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_user_distributor` (`user_id`, `distributor_id`, `level`),
  INDEX `idx_user` (`user_id`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分销关系表';

-- 用户地址表
CREATE TABLE `user_addresses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `receiver_name` VARCHAR(32) NOT NULL COMMENT '收件人姓名',
  `receiver_phone` VARCHAR(20) NOT NULL COMMENT '收件人电话',
  `province` VARCHAR(32) COMMENT '省',
  `city` VARCHAR(32) COMMENT '市',
  `district` VARCHAR(32) COMMENT '区',
  `detail_address` VARCHAR(128) NOT NULL COMMENT '详细地址',
  `is_default` TINYINT DEFAULT 0 COMMENT '是否默认 0-否 1-是',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户地址表';

-- 优惠券表
CREATE TABLE `coupons` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL COMMENT '券名称',
  `type` TINYINT DEFAULT 1 COMMENT '类型 1-满减 2-折扣',
  `threshold_amount` DECIMAL(10,2) COMMENT '门槛金额',
  `discount_amount` DECIMAL(10,2) COMMENT '减免金额',
  `discount_rate` DECIMAL(5,2) COMMENT '折扣率',
  `max_discount` DECIMAL(10,2) COMMENT '最高优惠',
  `total_count` INT COMMENT '发放总量',
  `received_count` INT DEFAULT 0 COMMENT '已领取数量',
  `used_count` INT DEFAULT 0 COMMENT '已使用数量',
  `valid_start` TIMESTAMP COMMENT '有效期开始',
  `valid_end` TIMESTAMP COMMENT '有效期结束',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0-无效 1-有效',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='优惠券表';

-- 用户优惠券表
CREATE TABLE `user_coupons` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `coupon_id` BIGINT NOT NULL COMMENT '优惠券 ID',
  `order_id` BIGINT NULL COMMENT '使用订单 ID',
  `status` TINYINT DEFAULT 0 COMMENT '状态 0-未使用 1-已使用 2-已过期',
  `receive_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `use_time` TIMESTAMP NULL COMMENT '使用时间',
  `expire_time` TIMESTAMP COMMENT '过期时间',
  INDEX `idx_user` (`user_id`),
  INDEX `idx_status` (`status`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户优惠券表';

-- 管理员表
CREATE TABLE `admins` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(32) NOT NULL UNIQUE COMMENT '用户名',
  `password_hash` VARCHAR(128) NOT NULL COMMENT '密码哈希',
  `real_name` VARCHAR(32) COMMENT '真实姓名',
  `role_id` BIGINT COMMENT '角色 ID',
  `status` TINYINT DEFAULT 1 COMMENT '状态 0-禁用 1-启用',
  `last_login_time` TIMESTAMP NULL,
  `last_login_ip` VARCHAR(32),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_username` (`username`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 系统配置表
CREATE TABLE `system_configs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `config_key` VARCHAR(64) NOT NULL UNIQUE COMMENT '配置键',
  `config_value` TEXT COMMENT '配置值',
  `config_type` VARCHAR(32) COMMENT '类型',
  `remark` VARCHAR(255) COMMENT '说明',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_key` (`config_key`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 初始化系统配置数据
INSERT INTO `system_configs` (`config_key`, `config_value`, `config_type`, `remark`) VALUES
('distribution.level1_rate', '15.00', 'distribution', '一级佣金比例%'),
('distribution.level2_rate', '8.00', 'distribution', '二级佣金比例%'),
('distribution.min_withdraw', '10.00', 'distribution', '最低提现金额'),
('distribution.auto_upgrade_amount', '1000.00', 'distribution', '自动升级消费金额'),
('distribution.auto_upgrade_count', '10', 'distribution', '自动升级直推人数'),
('order.auto_cancel_minutes', '30', 'order', '订单超时取消时间 (分钟)'),
('order.auto_confirm_days', '7', 'order', '自动确认收货天数'),
('order.commission_settle_days', '7', 'order', '佣金结算等待天数');

-- 初始化分类数据
INSERT INTO `categories` (`name`, `parent_id`, `icon`, `sort_order`, `status`) VALUES
('主粮', 0, '/static/pet-elements/food.png', 1, 1),
('零食', 0, '/static/pet-elements/snack.png', 2, 1),
('用品', 0, '/static/pet-elements/supply.png', 3, 1),
('玩具', 0, '/static/pet-elements/toy.png', 4, 1),
('窝垫', 0, '/static/pet-elements/bed.png', 5, 1),
('服饰', 0, '/static/pet-elements/clothes.png', 6, 1);

-- 初始化测试商品数据
INSERT INTO `products` (`name`, `category_id`, `description`, `main_image`, `images`, `brand`, `commission_rate`, `status`, `sales`) VALUES
('天然狗粮 5kg', 1, '优质天然狗粮，富含营养', '/static/products/dog-food-5kg.jpg', '["/static/products/dog-food-5kg-1.jpg", "/static/products/dog-food-5kg-2.jpg"]', '宠星球', 15.00, 1, 2000),
('猫罐头 80g*12 罐', 2, '美味猫罐头，补充营养', '/static/products/cat-food-can.jpg', '["/static/products/cat-food-can-1.jpg"]', '宠星球', 12.00, 1, 1500),
('宠物沐浴露 500ml', 3, '温和配方，清洁护理', '/static/products/pet-shampoo.jpg', '["/static/products/pet-shampoo-1.jpg"]', '宠星球', 10.00, 1, 800),
('猫抓板瓦楞纸', 4, '耐磨瓦楞纸，猫咪最爱', '/static/products/cat-scratch.jpg', '["/static/products/cat-scratch-1.jpg"]', '宠星球', 8.00, 1, 3000),
('宠物窝垫 L 号', 5, '柔软舒适，四季可用', '/static/products/pet-bed.jpg', '["/static/products/pet-bed-1.jpg"]', '宠星球', 10.00, 1, 1200);

-- 初始化商品 SKU 数据
INSERT INTO `product_skus` (`product_id`, `spec_name`, `spec_value`, `price`, `original_price`, `stock`, `status`) VALUES
(1, '5kg 原味', '{"flavor": "original", "weight": "5kg"}', 128.00, 198.00, 500, 1),
(1, '5kg 牛肉味', '{"flavor": "beef", "weight": "5kg"}', 138.00, 208.00, 300, 1),
(1, '10kg 原味', '{"flavor": "original", "weight": "10kg"}', 228.00, 358.00, 200, 1),
(2, '80g*12 罐', '{"spec": "80g*12"}', 96.00, 120.00, 1000, 1),
(2, '80g*24 罐', '{"spec": "80g*24"}', 176.00, 220.00, 500, 1),
(3, '500ml 薰衣草', '{"scent": "lavender", "volume": "500ml"}', 58.00, 78.00, 800, 1),
(3, '500ml 柑橘香', '{"scent": "citrus", "volume": "500ml"}', 58.00, 78.00, 600, 1),
(4, '大号', '{"size": "large"}', 35.00, 49.00, 2000, 1),
(4, '特大号', '{"size": "xlarge"}', 45.00, 59.00, 1500, 1),
(5, 'L 号 灰色', '{"size": "L", "color": "gray"}', 89.00, 129.00, 500, 1),
(5, 'XL 号 灰色', '{"size": "XL", "color": "gray"}', 99.00, 139.00, 300, 1);

-- 初始化管理员账号 (密码：admin123)
INSERT INTO `admins` (`username`, `password_hash`, `real_name`, `status`) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 1);

-- 完成提示
SELECT '数据库初始化完成！' AS message;
