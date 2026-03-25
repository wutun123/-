# 游戏陪玩客服系统

## 项目结构

```
cs-system/
├── backend/                    # 后端服务 (Node.js + Express + MongoDB)
│   └── src/
│       ├── models/             # 数据模型
│       │   ├── Agent.js        # 客服模型
│       │   ├── Session.js      # 会话模型
│       │   ├── Message.js      # 消息模型
│       │   ├── TransferLog.js  # 转交日志
│       │   ├── AllocationRule.js # 分配规则
│       │   └── Customer.js     # 客户模型
│       ├── services/           # 业务逻辑层
│       │   ├── allocationService.js
│       │   ├── messageService.js
│       │   ├── agentService.js
│       │   └── ruleService.js
│       ├── routes/             # API 路由
│       │   ├── authRoutes.js   # 认证接口
│       │   ├── sessionRoutes.js
│       │   ├── messageRoutes.js
│       │   ├── agentRoutes.js
│       │   └── adminRoutes.js
│       ├── middleware/
│       │   └── auth.js         # JWT 认证中间件
│       └── app.js              # 应用入口
│
└── frontend/                   # 前端页面 (Vue 3)
    ├── src/
    │   ├── components/         # Vue 组件
    │   │   ├── Login.vue       # 登录页
    │   │   ├── Layout.vue      # 布局框架
    │   │   ├── Dashboard.vue   # 首页概览
    │   │   ├── AgentWorkspace.vue # 客服工作台
    │   │   ├── Sessions.vue    # 会话管理
    │   │   ├── Agents.vue      # 客服管理
    │   │   ├── AllocationRules.vue # 分配规则
    │   │   ├── Messages.vue    # 聊天记录
    │   │   └── Stats.vue       # 数据统计
    │   ├── api/                # API 调用封装
    │   ├── store/              # Vuex 状态管理
    │   ├── router/             # 路由配置
    │   ├── App.vue
    │   └── main.js
    └── public/
        └── index.html
```

## 功能清单

### 已实现功能
| 模块 | 功能 | 状态 |
|------|------|------|
| 认证 | 登录/登出、JWT  Token | ✅ |
| 客服管理 | 增删改查、状态切换、权重设置 | ✅ |
| 会话管理 | 自动分配、手动分配、转交、结束 | ✅ |
| 分配规则 | 轮询/最少接待/权重/分组匹配 | ✅ |
| 聊天功能 | 发送消息、历史记录、实时推送 | ✅ |
| 聊天记录 | 搜索、筛选、分页 | ✅ |
| 数据统计 | 概览卡片、客服排名、趋势图 | ✅ |

### 页面列表
- `/login` - 登录页
- `/dashboard` - 首页概览
- `/workspace` - 客服工作台（聊天窗口）
- `/sessions` - 会话管理
- `/agents` - 客服管理
- `/rules` - 分配规则配置
- `/messages` - 聊天记录查询
- `/stats` - 数据统计分析

## 核心 API

### 认证
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/login` | POST | 用户登录 |
| `/api/me` | GET | 获取当前用户信息 |

### 会话
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/sessions` | POST | 创建会话并自动分配 |
| `/api/sessions/agent/:agentId` | GET | 获取客服会话列表 |
| `/api/sessions/all` | GET | 获取全部会话（管理员） |
| `/api/sessions/:sessionId/transfer` | POST | 会话转交 |
| `/api/sessions/:sessionId/end` | POST | 结束会话 |
| `/api/sessions/:sessionId/assign` | POST | 手动分配会话 |

### 消息
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/messages` | POST | 发送消息 |
| `/api/messages/session/:sessionId` | GET | 获取会话聊天记录 |
| `/api/messages/query` | GET | 条件查询消息 |
| `/api/messages/search` | GET | 关键词搜索消息 |

### 客服
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/agents` | GET/POST | 获取列表/创建客服 |
| `/api/agents/:agentId` | PUT | 更新客服信息 |
| `/api/agents/:agentId/status` | PUT | 更新客服状态 |
| `/api/allocation-rules` | GET/PUT | 获取/保存分配规则 |

### 统计
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/stats/overview` | GET | 获取概览数据 |
| `/api/stats/agents` | GET | 获取客服统计数据 |

## 数据模型

### Agent (客服)
```javascript
{
  nickname: String,
  groupType: 'PRE_SALE' | 'AFTER_SALE' | 'COMPLAINT',
  status: 'ONLINE' | 'BUSY' | 'OFFLINE',
  maxConcurrent: Number,
  currentConcurrent: Number,
  weight: Number
}
```

### Session (会话)
```javascript
{
  customerId: ObjectId,
  agentId: ObjectId,
  groupType: String,
  status: 'WAITING' | 'ASSIGNED' | 'TRANSFERRING' | 'ENDED',
  assignedAt: Date,
  endedAt: Date,
  lastMessageAt: Date
}
```

### Message (消息)
```javascript
{
  sessionId: ObjectId,
  senderType: 'CUSTOMER' | 'AGENT' | 'SYSTEM',
  msgType: 'TEXT' | 'IMAGE' | 'FILE',
  content: String,
  imageUrl: String,
  createdAt: Date
}
```

## 快速启动

### 环境要求
- Node.js >= 16
- MongoDB >= 5.0

### 启动后端
```bash
cd cs-system/backend
npm install
npm run dev
# 服务启动在 http://localhost:3000
```

### 启动前端
```bash
cd cs-system/frontend
npm install
npm run serve
# 前端启动在 http://localhost:8080
```

### 默认账号
- 管理员：admin / 123456
- 客服：agent1 / 123456

## 技术栈

**后端**
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- bcryptjs 密码加密
- WebSocket 实时通信

**前端**
- Vue 3 + Vuex
- Vue Router
- Axios
- Element Plus UI
