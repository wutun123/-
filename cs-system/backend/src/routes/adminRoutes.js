const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const Agent = require('../models/Agent');

// 获取所有会话列表（管理员）
router.get('/sessions/all', async (req, res) => {
  try {
    const { status, groupType, agentId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (groupType) query.groupType = groupType;
    if (agentId) query.agentId = agentId;

    const sessions = await Session.find(query)
      .populate('customerId', 'nickname avatar')
      .populate('agentId', 'nickname')
      .sort({ lastMessageAt: -1 });

    const data = sessions.map(s => ({
      _id: s._id,
      customerName: s.customerId?.nickname || '游客',
      customerAvatar: s.customerId?.avatar,
      agentName: s.agentId?.nickname || '未分配',
      groupType: s.groupType,
      status: s.status,
      createdAt: s.createdAt,
      lastMessageAt: s.lastMessageAt
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取等待分配的会话
router.get('/sessions/waiting', async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'WAITING' })
      .populate('customerId', 'nickname')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 手动分配会话
router.post('/sessions/:sessionId/assign', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { agentId } = req.body;

    const session = await Session.findByIdAndUpdate(
      sessionId,
      { agentId, status: 'ASSIGNED', assignedAt: new Date() },
      { new: true }
    );

    // 更新客服接待数
    const agent = await Agent.findById(agentId);
    if (agent) {
      agent.currentConcurrent += 1;
      if (agent.currentConcurrent >= agent.maxConcurrent) {
        agent.status = 'BUSY';
      }
      await agent.save();
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取数据统计
router.get('/stats/overview', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSessions = await Session.countDocuments();
    const todaySessions = await Session.countDocuments({ createdAt: { $gte: today } });
    const onlineAgents = await Agent.countDocuments({ status: 'ONLINE' });

    // 计算平均响应时间（模拟）
    const avgResponseTime = 28;

    res.json({
      success: true,
      data: {
        totalSessions,
        todaySessions,
        avgResponseTime,
        onlineAgents
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取客服统计数据
router.get('/stats/agents', async (req, res) => {
  try {
    const agents = await Agent.find({});
    const stats = agents.map(a => ({
      agentId: a._id,
      agentName: a.nickname,
      sessionCount: Math.floor(Math.random() * 100),
      messageCount: Math.floor(Math.random() * 500),
      avgDuration: Math.floor(Math.random() * 600),
      satisfaction: (Math.random() * 2 + 3).toFixed(1)
    }));

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
