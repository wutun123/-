const express = require('express');
const router = express.Router();
const AgentService = require('../services/agentService');
const ruleService = require('../services/ruleService');

// 获取客服列表
router.get('/agents', async (req, res) => {
  try {
    const { groupType, status } = req.query;
    const agents = await AgentService.getAgents({ groupType, status });

    res.json({ success: true, data: agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取客服详情
router.get('/agents/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await AgentService.getAgentById(agentId);

    if (!agent) {
      return res.status(404).json({ success: false, message: '客服不存在' });
    }

    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 创建客服
router.post('/agents', async (req, res) => {
  try {
    const agent = await AgentService.createAgent(req.body);
    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新客服信息
router.put('/agents/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await AgentService.updateAgent(agentId, req.body);
    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 更新客服状态
router.put('/agents/:agentId/status', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { status } = req.body;

    if (!['ONLINE', 'BUSY', 'OFFLINE'].includes(status)) {
      return res.status(400).json({ success: false, message: '无效的状态值' });
    }

    const agent = await AgentService.updateStatus(agentId, status);
    res.json({ success: true, data: agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取分配规则
router.get('/allocation-rules', async (req, res) => {
  try {
    const { enabled } = req.query;
    const rules = enabled === 'true'
      ? await ruleService.getEnabledRules()
      : await ruleService.getAllRules();

    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 保存分配规则
router.put('/allocation-rules', async (req, res) => {
  try {
    const { rules } = req.body;
    const result = await ruleService.saveRules(rules);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取客服统计数据
router.get('/agents/:agentId/stats', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { startDate, endDate } = req.query;

    const stats = await AgentService.getAgentStats(
      agentId,
      startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate || new Date()
    );

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
