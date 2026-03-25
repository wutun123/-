const express = require('express');
const router = express.Router();
const allocationService = require('../services/allocationService');
const AgentService = require('../services/agentService');

// 创建新会话（客户发起咨询）
router.post('/sessions', async (req, res) => {
  try {
    const { customerId, groupType } = req.body;
    const Session = require('../models/Session');

    const session = await Session.create({
      customerId,
      groupType: groupType || 'PRE_SALE',
      status: 'WAITING'
    });

    // 触发自动分配
    const result = await allocationService.allocateSession(session._id, groupType);

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        ...result
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取客服的会话列表
router.get('/sessions/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.query;
    const Session = require('../models/Session');

    const query = { agentId, status: status || { $ne: 'ENDED' } };
    const sessions = await Session.find(query)
      .populate('customerId')
      .sort({ lastMessageAt: -1 });

    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 会话转交
router.post('/sessions/:sessionId/transfer', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { fromAgentId, toAgentId, reason } = req.body;

    const result = await allocationService.transferSession(
      sessionId,
      fromAgentId,
      toAgentId,
      reason
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 结束会话
router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const Session = require('../models/Session');

    const session = await Session.findByIdAndUpdate(
      sessionId,
      { status: 'ENDED', endedAt: new Date() },
      { new: true }
    );

    // 更新客服接待数
    if (session.agentId) {
      const Agent = require('../models/Agent');
      const agent = await Agent.findById(session.agentId);
      if (agent) {
        agent.currentConcurrent = Math.max(0, agent.currentConcurrent - 1);
        if (agent.status === 'BUSY' && agent.currentConcurrent < agent.maxConcurrent) {
          agent.status = 'ONLINE';
        }
        await agent.save();
      }
    }

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
