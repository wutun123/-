const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');

// 发送消息
router.post('/messages', async (req, res) => {
  try {
    const { sessionId, senderType, content, msgType, imageUrl } = req.body;

    const message = await messageService.sendMessage(
      sessionId,
      senderType,
      content,
      msgType,
      imageUrl
    );

    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 获取会话聊天记录
router.get('/messages/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await messageService.getMessages(sessionId, parseInt(limit), parseInt(skip));

    res.json({ success: true, data: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 搜索消息
router.get('/messages/search', async (req, res) => {
  try {
    const { keyword, sessionId } = req.query;

    if (!keyword) {
      return res.status(400).json({ success: false, message: '请输入搜索关键词' });
    }

    const messages = await messageService.searchMessages(keyword, sessionId || null);

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 条件查询消息
router.get('/messages/query', async (req, res) => {
  try {
    const filters = req.query;
    const messages = await messageService.queryMessages(filters);

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
