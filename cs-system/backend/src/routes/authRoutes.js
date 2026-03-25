const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'cs-system-secret-key';

// 模拟用户数据库
const users = [
  { id: '1', username: 'admin', password: bcrypt.hashSync('123456', 10), role: 'admin' },
  { id: '2', username: 'agent1', password: bcrypt.hashSync('123456', 10), role: 'agent' }
];

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const user = users.find(u => u.username === username && u.role === role);
    if (!user) {
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: '未登录' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      data: {
        id: decoded.userId,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: '登录已过期' });
  }
});

module.exports = router;
