<template>
  <div class="agent-workspace">
    <!-- 左侧会话列表 -->
    <div class="session-list-panel">
      <div class="panel-header">
        <h3>当前会话 ({{ sessions.length }})</h3>
        <button @click="refreshSessions" class="btn-refresh">刷新</button>
      </div>
      <div class="session-list">
        <div
          v-for="session in sessions"
          :key="session.id"
          :class="['session-item', { active: activeSessionId === session.id }]"
          @click="selectSession(session.id)"
        >
          <div class="session-info">
            <div class="customer-name">{{ session.customerName || '游客' }}</div>
            <div class="last-message">{{ session.lastMessage || '暂无消息' }}</div>
          </div>
          <div class="session-meta">
            <span class="time">{{ formatTime(session.lastMessageAt) }}</span>
            <button @click.stop="showTransferModal(session)" class="btn-transfer">转交</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间聊天窗口 -->
    <div class="chat-panel">
      <div v-if="activeSessionId" class="chat-container">
        <div class="chat-header">
          <div class="customer-info">
            <span class="name">{{ currentCustomer?.name || '游客' }}</span>
            <span class="status-tag" :class="currentSession?.status">{{ currentSession?.status }}</span>
          </div>
          <div class="header-actions">
            <button @click="endSession" class="btn-end">结束会话</button>
          </div>
        </div>
        <div class="chat-messages" ref="messageContainer">
          <div v-for="msg in messages" :key="msg.id" :class="['message', msg.senderType]">
            <div class="message-content">
              <div class="message-sender">{{ msg.senderName }}</div>
              <div class="message-bubble">{{ msg.content }}</div>
              <div class="message-time">{{ formatTime(msg.createdAt) }}</div>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <div class="input-toolbar">
            <button @click="showQuickReplies = !showQuickReplies" class="btn-tool">快捷回复</button>
          </div>
          <div v-if="showQuickReplies" class="quick-replies">
            <button
              v-for="(reply, index) in quickReplies"
              :key="index"
              @click="insertReply(reply)"
              class="btn-reply"
            >
              {{ reply }}
            </button>
          </div>
          <textarea
            v-model="inputMessage"
            @keyup.enter.exact="sendMessage"
            placeholder="输入消息... (Enter 发送)"
            rows="3"
          ></textarea>
          <div class="input-actions">
            <button @click="sendMessage" class="btn-send">发送</button>
          </div>
        </div>
      </div>
      <div v-else class="no-session">
        <p>请选择一个会话开始聊天</p>
      </div>
    </div>

    <!-- 右侧客户信息 -->
    <div class="customer-panel" v-if="currentCustomer">
      <div class="panel-header">
        <h3>客户信息</h3>
      </div>
      <div class="customer-info">
        <div class="info-item">
          <label>昵称:</label>
          <span>{{ currentCustomer.name }}</span>
        </div>
        <div class="info-item">
          <label>历史会话:</label>
          <span>{{ currentCustomer.sessionCount }} 次</span>
        </div>
        <div class="info-item">
          <label>最近下单:</label>
          <span>{{ currentCustomer.lastOrder || '无' }}</span>
        </div>
        <div class="info-item">
          <label>游戏偏好:</label>
          <span>{{ currentCustomer.gamePrefs || '未设置' }}</span>
        </div>
      </div>
    </div>

    <!-- 转交弹窗 -->
    <div v-if="showTransfer" class="modal-overlay" @click.self="showTransfer = false">
      <div class="modal">
        <h3>转交会话</h3>
        <select v-model="transferTarget">
          <option value="">选择目标客服</option>
          <option v-for="agent in availableAgents" :key="agent.id" :value="agent.id">
            {{ agent.name }} ({{ agent.currentConcurrent }}/{{ agent.maxConcurrent }})
          </option>
        </select>
        <textarea v-model="transferReason" placeholder="转交原因" rows="3"></textarea>
        <div class="modal-actions">
          <button @click="confirmTransfer" class="btn-confirm">确认转交</button>
          <button @click="showTransfer = false" class="btn-cancel">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { API } from '../api';

export default {
  name: 'AgentWorkspace',
  data() {
    return {
      sessions: [],
      messages: [],
      activeSessionId: null,
      currentSession: null,
      currentCustomer: null,
      inputMessage: '',
      showQuickReplies: false,
      quickReplies: [
        '您好，请问有什么可以帮您？',
        '请稍等，我为您查询',
        '感谢您的耐心等待',
        '还有其他问题吗？'
      ],
      showTransfer: false,
      transferTarget: '',
      transferReason: '',
      availableAgents: [],
      ws: null
    };
  },
  computed: {
    agentId() {
      return this.$store.state.agentId || 'current-agent-id';
    }
  },
  mounted() {
    this.loadSessions();
    this.loadAgents();
    this.connectWebSocket();
  },
  methods: {
    async loadSessions() {
      const res = await API.get(`/sessions/agent/${this.agentId}`);
      this.sessions = res.data.data;
    },
    async loadAgents() {
      const res = await API.get('/agents?status=ONLINE');
      this.availableAgents = res.data.data.filter(a => a._id !== this.agentId);
    },
    async selectSession(sessionId) {
      this.activeSessionId = sessionId;
      this.currentSession = this.sessions.find(s => s._id === sessionId);
      await this.loadMessages(sessionId);
      this.scrollToBottom();
    },
    async loadMessages(sessionId) {
      const res = await API.get(`/messages/session/${sessionId}`);
      this.messages = res.data.data;
    },
    async sendMessage() {
      if (!this.inputMessage.trim() || !this.activeSessionId) return;

      await API.post('/messages', {
        sessionId: this.activeSessionId,
        senderType: 'AGENT',
        content: this.inputMessage,
        msgType: 'TEXT'
      });

      this.inputMessage = '';
      await this.loadMessages(this.activeSessionId);
      this.scrollToBottom();
    },
    insertReply(reply) {
      this.inputMessage = reply;
      this.showQuickReplies = false;
    },
    showTransferModal(session) {
      this.transferSession = session;
      this.showTransfer = true;
    },
    async confirmTransfer() {
      if (!this.transferTarget) return;

      await API.post(`/sessions/${this.transferSession._id}/transfer`, {
        fromAgentId: this.agentId,
        toAgentId: this.transferTarget,
        reason: this.transferReason
      });

      this.showTransfer = false;
      this.loadSessions();
    },
    async endSession() {
      if (!this.activeSessionId) return;

      await API.post(`/sessions/${this.activeSessionId}/end`);
      this.loadSessions();
      this.messages = [];
      this.activeSessionId = null;
    },
    connectWebSocket() {
      this.ws = new WebSocket('ws://localhost:3000/ws');
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'MESSAGE') {
          this.handleNewMessage(data.data);
        }
      };
    },
    handleNewMessage(message) {
      if (message.sessionId === this.activeSessionId) {
        this.messages.push(message);
        this.scrollToBottom();
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (this.$refs.messageContainer) {
          this.$refs.messageContainer.scrollTop = this.$refs.messageContainer.scrollHeight;
        }
      });
    },
    formatTime(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    },
    refreshSessions() {
      this.loadSessions();
    }
  }
};
</script>

<style scoped>
.agent-workspace {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

.session-list-panel {
  width: 300px;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
}

.panel-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.btn-refresh {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: rgba(255,255,255,0.3);
}

.session-list {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
}

.session-item {
  padding: 16px 20px;
  border-bottom: 1px solid #e8e8e8;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  transition: all 0.2s ease;
  background: #fff;
}

.session-item:last-child {
  border-bottom: none;
}

.session-item:hover {
  background: #f3f4f6;
}

.session-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-left: 4px solid #667eea;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.customer-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
  font-size: 15px;
}

.last-message {
  color: #9ca3af;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.time {
  color: #9ca3af;
  font-size: 12px;
}

.btn-transfer {
  background: #fef3c7;
  border: none;
  color: #d97706;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.btn-transfer:hover {
  background: #fde68a;
}

.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  margin: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.customer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-info .name {
  color: #fff;
  font-weight: 600;
  font-size: 16px;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.header-actions .btn-end {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.header-actions .btn-end:hover {
  background: rgba(255,255,255,0.3);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);
}

.message {
  margin-bottom: 20px;
  display: flex;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.CUSTOMER {
  justify-content: flex-start;
}

.message.AGENT {
  justify-content: flex-end;
}

.message-content {
  max-width: 65%;
}

.message-bubble {
  display: inline-block;
  padding: 12px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-size: 14px;
  line-height: 1.5;
}

.message.CUSTOMER .message-bubble {
  border-bottom-left-radius: 4px;
}

.message.AGENT .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-sender {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

.message.AGENT .message-sender {
  text-align: right;
  color: #667eea;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 6px;
}

.chat-input {
  border-top: 1px solid #e8e8e8;
  padding: 16px 20px;
  background: #fff;
}

.input-toolbar {
  margin-bottom: 12px;
}

.btn-tool {
  background: #f3f4f6;
  border: none;
  color: #6b7280;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-tool:hover {
  background: #e5e7eb;
}

.quick-replies {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.btn-reply {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid #e0e7ff;
  color: #667eea;
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-reply:hover {
  background: #667eea;
  color: #fff;
}

.chat-input textarea {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  resize: none;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-actions {
  margin-top: 12px;
  text-align: right;
}

.btn-send {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-send:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.customer-panel {
  width: 260px;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  padding: 0;
  box-shadow: -2px 0 8px rgba(0,0,0,0.05);
}

.customer-panel .panel-header {
  padding: 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e8e8e8;
}

.customer-panel .panel-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 15px;
  font-weight: 600;
}

.customer-info {
  padding: 20px;
}

.info-item {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item label {
  color: #9ca3af;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.info-item span {
  color: #1f2937;
  font-size: 14px;
  font-weight: 500;
}

.no-session {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-size: 16px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  padding: 28px;
  border-radius: 16px;
  width: 440px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal select,
.modal textarea {
  width: 100%;
  margin: 8px 0;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.modal select:focus,
.modal textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #e5e7eb;
}
</style>
