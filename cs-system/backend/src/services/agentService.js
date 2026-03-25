const Agent = require('../models/Agent');

class AgentService {
  /**
   * 更新客服状态
   */
  async updateStatus(agentId, status) {
    const agent = await Agent.findByIdAndUpdate(
      agentId,
      { status },
      { new: true }
    );
    return agent;
  }

  /**
   * 获取客服列表
   */
  async getAgents(filters = {}) {
    const { groupType, status } = filters;
    const query = {};
    if (groupType) query.groupType = groupType;
    if (status) query.status = status;

    return Agent.find(query).sort({ createdAt: -1 });
  }

  /**
   * 获取客服详情
   */
  async getAgentById(agentId) {
    return Agent.findById(agentId);
  }

  /**
   * 创建客服
   */
  async createAgent(data) {
    return Agent.create(data);
  }

  /**
   * 更新客服信息
   */
  async updateAgent(agentId, data) {
    return Agent.findByIdAndUpdate(agentId, data, { new: true });
  }

  /**
   * 删除客服
   */
  async deleteAgent(agentId) {
    return Agent.findByIdAndDelete(agentId);
  }

  /**
   * 获取客服统计数据
   */
  async getAgentStats(agentId, startDate, endDate) {
    const Session = require('../models/Session');
    const Message = require('../models/Message');

    const sessions = await Session.aggregate([
      { $match: { agentId: new require('mongodb').ObjectId(agentId) } },
      { $match: { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    const messages = await Message.aggregate([
      { $match: { senderType: 'AGENT' } },
      { $lookup: { from: 'sessions', localField: 'sessionId', foreignField: '_id', as: 'session' } },
      { $match: { 'session.agentId': new require('mongodb').ObjectId(agentId) } },
      { $match: { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    return {
      sessionCount: sessions[0]?.count || 0,
      messageCount: messages[0]?.count || 0
    };
  }
}

module.exports = new AgentService();
