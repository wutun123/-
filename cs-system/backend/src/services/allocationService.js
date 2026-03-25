const Agent = require('../models/Agent');
const Session = require('../models/Session');
const TransferLog = require('../models/TransferLog');

class AllocationService {
  /**
   * 自动分配会话给最合适的客服
   */
  async allocateSession(sessionId, groupType) {
    const session = await Session.findById(sessionId);

    // 获取所有可用客服
    let availableAgents = await Agent.find({
      status: 'ONLINE',
      groupType: groupType || 'PRE_SALE'
    });

    // 过滤出未达到上限的客服
    availableAgents = availableAgents.filter(a => a.currentConcurrent < a.maxConcurrent);

    if (availableAgents.length === 0) {
      // 如果没有可用客服，尝试其他分组
      availableAgents = await Agent.find({
        status: 'ONLINE',
        currentConcurrent: { $lt: mongoose.Schema.Types.Mixed } // 任何有容量的
      });
    }

    if (availableAgents.length === 0) {
      session.status = 'WAITING';
      await session.save();
      return { success: false, message: '暂无可用客服' };
    }

    // 获取分配规则
    const rules = await AllocationRule.find({ enabled: true }).sort({ priority: -1 });
    let selectedAgent;

    for (const rule of rules) {
      selectedAgent = await this.applyRule(availableAgents, rule);
      if (selectedAgent) break;
    }

    // 默认：最少接待优先
    if (!selectedAgent) {
      selectedAgent = availableAgents.sort((a, b) =>
        a.currentConcurrent - b.currentConcurrent
      )[0];
    }

    // 分配会话
    session.agentId = selectedAgent._id;
    session.status = 'ASSIGNED';
    session.assignedAt = new Date();
    await session.save();

    // 更新客服当前接待数
    selectedAgent.currentConcurrent += 1;
    if (selectedAgent.currentConcurrent >= selectedAgent.maxConcurrent) {
      selectedAgent.status = 'BUSY';
    }
    await selectedAgent.save();

    return { success: true, agent: selectedAgent };
  }

  /**
   * 应用分配规则
   */
  async applyRule(agents, rule) {
    switch (rule.ruleType) {
      case 'ROUND_ROBIN':
        return agents[0]; // 简单轮询
      case 'LEAST_LOAD':
        return agents.sort((a, b) => a.currentConcurrent - b.currentConcurrent)[0];
      case 'WEIGHT':
        return agents.sort((a, b) => b.weight - a.weight)[0];
      case 'GROUP_MATCH':
        return agents.find(a => a.groupType === rule.ruleValue);
      default:
        return null;
    }
  }

  /**
   * 会话转交
   */
  async transferSession(sessionId, fromAgentId, toAgentId, reason) {
    const session = await Session.findById(sessionId);
    const fromAgent = await Agent.findById(fromAgentId);
    const toAgent = await Agent.findById(toAgentId);

    if (!toAgent || toAgent.status === 'OFFLINE') {
      return { success: false, message: '目标客服不可用' };
    }

    if (toAgent.currentConcurrent >= toAgent.maxConcurrent) {
      return { success: false, message: '目标客服已满负荷' };
    }

    // 创建转交记录
    await TransferLog.create({
      sessionId,
      fromAgentId,
      toAgentId,
      reason,
      customerNotified: true
    });

    // 更新会话
    session.agentId = toAgentId;
    await session.save();

    // 更新客服接待数
    fromAgent.currentConcurrent -= 1;
    if (fromAgent.status === 'BUSY' && fromAgent.currentConcurrent < fromAgent.maxConcurrent) {
      fromAgent.status = 'ONLINE';
    }
    await fromAgent.save();

    toAgent.currentConcurrent += 1;
    if (toAgent.currentConcurrent >= toAgent.maxConcurrent) {
      toAgent.status = 'BUSY';
    }
    await toAgent.save();

    return { success: true };
  }

  /**
   * 超时自动转交
   */
  async autoTransferOnTimeout() {
    const timeoutMs = 300 * 1000; // 5 分钟
    const now = new Date();

    const sessions = await Session.find({
      status: 'ASSIGNED',
      lastMessageAt: { $lt: new Date(now - timeoutMs) }
    }).populate('agentId');

    for (const session of sessions) {
      // 查找同组其他客服
      const nextAgent = await Agent.findOne({
        _id: { $ne: session.agentId._id },
        status: 'ONLINE',
        groupType: session.groupType,
        currentConcurrent: { $lt: session.agentId.maxConcurrent }
      });

      if (nextAgent) {
        await this.transferSession(
          session._id,
          session.agentId._id,
          nextAgent._id,
          '超时自动转交'
        );
      }
    }
  }
}

module.exports = new AllocationService();
