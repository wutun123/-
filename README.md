# 宠星球分销商城 - 项目说明文档

## 项目简介

宠星球分销商城是一个基于 uni-app + Koa 的微信小程序分销电商平台，支持二级分销、微信分账、佣金提现等功能。

**项目名称**: 宠星球 (Pet Universe)
**品牌 Slogan**: 宠爱每一只小星球

---

## 技术栈

### 前端
- **框架**: uni-app (Vue 3)
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI 组件**: uView Plus
- **目标平台**: 微信小程序

### 后端
- **运行环境**: Node.js
- **Web 框架**: Koa
- **数据库**: MySQL 8.0
- **缓存**: Redis
- **ORM**: Sequelize

---

## 项目结构

```
E:\测试项目\
├── frontend/              # 前端项目
│   ├── pages/            # 页面
│   │   ├── index/        # 首页
│   │   ├── category/     # 分类页
│   │   ├── product/      # 商品页
│   │   ├── cart/         # 购物车
│   │   ├── order/        # 订单
│   │   ├── user/         # 用户中心
│   │   └── distributor/  # 分销中心
│   ├── components/       # 公共组件
│   ├── api/              # API 接口
│   ├── stores/           # 状态管理
│   ├── utils/            # 工具类
│   ├── static/           # 静态资源
│   ├── App.vue           # 应用入口
│   ├── main.js           # 入口文件
│   ├── pages.json        # 页面配置
│   ├── manifest.json     # 应用配置
│   └── styles/           # 全局样式
│
├── backend/              # 后端项目
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   ├── middlewares/  # 中间件
│   │   ├── database/     # 数据库配置
│   │   └── index.js      # 服务入口
│   ├── database/         # 数据库脚本
│   ├── .env.example      # 环境变量模板
│   └── package.json      # 项目配置
│
├── DESIGN_SPEC.md        # UI 设计规范
└── README.md             # 项目说明
```

---

## 核心功能

### C 端小程序
1. **首页**: Banner 轮播、分类导航、商品推荐
2. **商品**: 列表、详情、规格选择、搜索
3. **购物车**: 添加、编辑、结算
4. **订单**: 创建、支付、列表、详情、售后
5. **用户中心**: 个人信息、地址管理、收藏、优惠券
6. **分销中心**: 申请、团队管理、佣金、提现

### B 端管理后台（待开发）
1. **商品管理**: 发布、编辑、上下架、库存
2. **订单管理**: 列表、发货、退款审核
3. **分销商管理**: 审核、等级、冻结
4. **佣金配置**: 比例设置、提现审核
5. **数据报表**: 销售、佣金、用户分析

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0
- MySQL >= 8.0
- Redis >= 6.0
- 微信开发者工具

---

## 📦 部署指南

### 方式对比

| 方式 | 耗时 | 难度 | 场景 |
|------|------|------|------|
| Docker Compose | 5 分钟 | ⭐ | 快速测试 |
| 一键脚本 | 15 分钟 | ⭐⭐ | 生产环境（推荐）|
| 手动部署 | 30 分钟 | ⭐⭐⭐ | 完全控制 |

### 快速部署命令

```bash
# Ubuntu/Debian 一键安装
sudo bash scripts/install.sh
bash scripts/setup-database.sh
bash scripts/deploy.sh

# Docker 快速启动
docker-compose up -d
```

### 详细文档

- 📘 **QUICKSTART.md** - 5 分钟快速上手
- 📗 **DEPLOY.md** - 完整部署指南
- 📙 **DOCKER_DEPLOY.md** - Docker 部署指南
- 📕 **scripts/README.md** - 部署脚本说明

---

## 🔧 开发环境启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env 文件，配置数据库和微信信息

# 初始化数据库
mysql -u root -p < database/init.sql

# 启动服务
npm run dev    # 开发环境
npm start      # 生产环境
```

### 前端启动

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 开发环境运行
# 方式 1: 使用 HBuilderX 打开项目，运行到微信小程序
# 方式 2: 使用 CLI
npm run dev:mp-weixin

# 生产环境打包
npm run build:mp-weixin
```

---

## 核心 API 接口

### 认证接口
```
POST   /api/v1/auth/wechat-login    # 微信登录
GET    /api/v1/user/profile         # 获取用户信息
PUT    /api/v1/user/profile         # 更新用户信息
POST   /api/v1/user/bind-phone      # 绑定手机号
```

### 商品接口
```
GET    /api/v1/products             # 商品列表
GET    /api/v1/products/:id         # 商品详情
GET    /api/v1/categories           # 分类列表
```

### 订单接口
```
POST   /api/v1/orders               # 创建订单
GET    /api/v1/orders               # 订单列表
GET    /api/v1/orders/:id           # 订单详情
POST   /api/v1/orders/:id/cancel    # 取消订单
POST   /api/v1/orders/:id/confirm   # 确认收货
```

### 分销接口
```
GET    /api/v1/distributor/info         # 分销商信息
POST   /api/v1/distributor/apply        # 申请分销
GET    /api/v1/distributor/team         # 我的团队
GET    /api/v1/distributor/commissions  # 佣金记录
POST   /api/v1/distributor/withdraw     # 申请提现
GET    /api/v1/distributor/stats        # 分销统计
```

---

## 数据库表结构

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| products | 商品表 |
| product_skus | 商品 SKU 表 |
| categories | 商品分类表 |
| orders | 订单主表 |
| order_items | 订单商品表 |
| user_addresses | 用户地址表 |
| distributors | 分销商表 |
| commissions | 佣金记录表 |
| withdrawals | 提现记录表 |
| distribution_relations | 分销关系表 |
| coupons | 优惠券表 |
| user_coupons | 用户优惠券表 |
| admins | 管理员表 |
| system_configs | 系统配置表 |

---

## 分销规则

### 二级分销机制
```
A(分销商) → 推荐 → B(分销商) → 推荐 → C(会员)

C 下单购买:
- B 获得一级佣金 (15%)
- A 获得二级佣金 (8%)
```

### 佣金配置
- 一级佣金比例：15%
- 二级佣金比例：8%
- 最低提现金额：10 元
- 佣金结算周期：订单完成后 7 天

### 升级规则
- 累计消费满 1000 元 → 银牌分销商
- 直推 10 人 → 银牌分销商

---

## 配置说明

### 环境变量 (.env)
```env
# 服务器配置
NODE_ENV=development
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pet_universe
DB_USER=root
DB_PASSWORD=your_password

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 微信配置
WECHAT_APP_ID=wx_xxx
WECHAT_APP_SECRET=your_app_secret
WECHAT_MCH_ID=1234567890
WECHAT_API_KEY=your_api_key
```

---

## 项目进度

| 模块 | 状态 | 完成度 |
|------|------|--------|
| 需求分析 | ✅ 完成 | 100% |
| UI 设计 | ✅ 完成 | 100% |
| 前端开发 | ✅ 完成 | 85% |
| 后端开发 | ✅ 完成 | 85% |
| 测试用例 | ✅ 完成 | 100% |

---

## 下一步计划

1. **完善前端页面**
   - [ ] 订单列表页
   - [ ] 订单详情页
   - [ ] 支付页面
   - [ ] 地址管理页
   - [ ] 分销中心完整页面

2. **完善后端接口**
   - [ ] 支付接口（微信支付）
   - [ ] 分账接口（微信分账）
   - [ ] 优惠券接口
   - [ ] 管理后台接口

3. **接口联调**
   - [ ] 登录联调
   - [ ] 下单支付联调
   - [ ] 分销绑定联调
   - [ ] 佣金结算联调

4. **测试优化**
   - [ ] 功能测试
   - [ ] 性能优化
   - [ ] Bug 修复

---

## 团队成员

- **产品经理**: 刘备
- **项目经理**: 孔明
- **UI 设计师**: 康康
- **前端开发**: 赵云
- **后端开发**: 张飞
- **测试工程师**: 庞统

---

## 联系方式

如有问题，请联系项目协调者。

**版本**: V1.0
**最后更新**: 2026-03-24
