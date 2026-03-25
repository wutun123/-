const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const sessionRoutes = require('./routes/sessionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const agentRoutes = require('./routes/agentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cs-system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB 连接成功');
}).catch(err => {
  console.error('MongoDB 连接失败:', err);
});

// 路由
app.use('/api', authRoutes);
app.use('/api', sessionRoutes);
app.use('/api', messageRoutes);
app.use('/api', agentRoutes);
app.use('/api', adminRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket 支持（用于实时消息）
const http = require('http');
const WebSocket = require('ws');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// 存储 WebSocket 连接
const clients = new Map();

wss.on('connection', (ws, req) => {
  const sessionId = req.url.split('?')[1];
  if (sessionId) {
    clients.set(sessionId, ws);
  }

  console.log('客户端已连接');

  ws.on('message', (message) => {
    console.log('收到消息:', message);
    // 广播消息给所有连接的客户端
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'MESSAGE',
          data: JSON.parse(message)
        }));
      }
    });
  });

  ws.on('close', () => {
    console.log('客户端断开连接');
    clients.delete(sessionId);
  });
});

// 广播消息工具函数
app.broadcastMessage = (sessionId, message) => {
  const ws = clients.get(sessionId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'NEW_MESSAGE',
      data: message
    }));
  }
};

// 启动服务器
server.listen(PORT, () => {
  console.log(`客服系统后端服务已启动：http://localhost:${PORT}`);
});

module.exports = app;
