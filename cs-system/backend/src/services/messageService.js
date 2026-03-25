const Message = require('../models/Message');

class MessageService {
  /**
   * 发送消息
   */
  async sendMessage(sessionId, senderType, content, msgType = 'TEXT', imageUrl = null) {
    const message = await Message.create({
      sessionId,
      senderType,
      senderId: senderType === 'AGENT' ? null : null, // 实际使用时填充
      content,
      msgType,
      imageUrl
    });

    // 更新会话最后消息时间
    const Session = require('../models/Session');
    await Session.findByIdAndUpdate(sessionId, {
      lastMessageAt: new Date()
    });

    return message;
  }

  /**
   * 获取会话聊天记录
   */
  async getMessages(sessionId, limit = 50, skip = 0) {
    return Message.find({ sessionId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'nickname');
  }

  /**
   * 搜索消息（按关键词）
   */
  async searchMessages(keyword, sessionId = null) {
    const query = {
      content: { $regex: keyword, $options: 'i' },
      msgType: 'TEXT'
    };

    if (sessionId) {
      query.sessionId = sessionId;
    }

    return Message.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({ path: 'sessionId', populate: { path: 'agentId customerId' } });
  }

  /**
   * 按条件查询消息
   */
  async queryMessages(filters) {
    const { sessionId, senderType, startTime, endTime, keyword } = filters;

    const query = {};
    if (sessionId) query.sessionId = sessionId;
    if (senderType) query.senderType = senderType;
    if (startTime || endTime) {
      query.createdAt = {};
      if (startTime) query.createdAt.$gte = new Date(startTime);
      if (endTime) query.createdAt.$lte = new Date(endTime);
    }
    if (keyword) {
      query.content = { $regex: keyword, $options: 'i' };
    }

    return Message.find(query)
      .sort({ createdAt: -1 })
      .limit(100);
  }
}

module.exports = new MessageService();
