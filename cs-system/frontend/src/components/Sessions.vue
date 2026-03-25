<template>
  <div class="sessions-page">
    <div class="page-header">
      <h2>会话管理</h2>
      <div class="header-actions">
        <el-input v-model="searchKeyword" placeholder="搜索客户..." style="width: 200px" />
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px" clearable>
          <el-option label="等待中" value="WAITING" />
          <el-option label="分配中" value="ASSIGNED" />
          <el-option label="已结束" value="ENDED" />
        </el-select>
      </div>
    </div>

    <el-table :data="filteredSessions" stripe border>
      <el-table-column prop="customerName" label="客户" />
      <el-table-column prop="groupType" label="分组">
        <template #default="{ row }">
          <el-tag :type="getGroupTypeTag(row.groupType)">
            {{ getGroupTypeLabel(row.groupType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="agentName" label="客服" />
      <el-table-column prop="createdAt" label="创建时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="lastMessageAt" label="最后消息" width="160">
        <template #default="{ row }">
          {{ formatDate(row.lastMessageAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="viewSession(row)">查看</el-button>
          <el-button size="small" type="warning" @click="transferSession(row)" v-if="row.status !== 'ENDED'">转交</el-button>
          <el-button size="small" type="danger" @click="endSession(row)" v-if="row.status !== 'ENDED'">结束</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 查看会话详情弹窗 -->
    <el-dialog v-model="showDetail" title="会话详情" width="800px">
      <div class="message-list">
        <div v-for="msg in currentMessages" :key="msg.id" :class="['message-item', msg.senderType]">
          <div class="msg-content">{{ msg.content }}</div>
          <div class="msg-time">{{ formatDate(msg.createdAt) }}</div>
        </div>
      </div>
    </el-dialog>

    <!-- 转交弹窗 -->
    <el-dialog v-model="showTransfer" title="转交会话" width="400px">
      <el-form :model="transferForm" label-width="80px">
        <el-form-item label="目标客服">
          <el-select v-model="transferForm.toAgentId" placeholder="请选择" style="width: 100%">
            <el-option v-for="agent in availableAgents" :key="agent._id" :value="agent._id" :label="agent.nickname" />
          </el-select>
        </el-form-item>
        <el-form-item label="转交原因">
          <el-input v-model="transferForm.reason" type="textarea" rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransfer = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">确认转交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { API } from '../api';

export default {
  name: 'Sessions',
  data() {
    return {
      sessions: [],
      agents: [],
      searchKeyword: '',
      statusFilter: '',
      showDetail: false,
      showTransfer: false,
      currentSession: null,
      currentMessages: [],
      transferForm: {
        sessionId: '',
        fromAgentId: '',
        toAgentId: '',
        reason: ''
      }
    };
  },
  computed: {
    filteredSessions() {
      return this.sessions.filter(s => {
        const matchKeyword = !this.searchKeyword || (s.customerName && s.customerName.includes(this.searchKeyword));
        const matchStatus = !this.statusFilter || s.status === this.statusFilter;
        return matchKeyword && matchStatus;
      });
    }
  },
  mounted() {
    this.loadSessions();
    this.loadAgents();
  },
  methods: {
    async loadSessions() {
      const res = await API.get('/sessions/agent/all');
      this.sessions = res.data.data || [];
    },
    async loadAgents() {
      const res = await API.get('/agents');
      this.agents = res.data.data || [];
    },
    getGroupTypeTag(type) {
      const map = { PRE_SALE: '', AFTER_SALE: 'success', COMPLAINT: 'danger' };
      return map[type] || '';
    },
    getGroupTypeLabel(type) {
      const map = { PRE_SALE: '售前', AFTER_SALE: '售后', COMPLAINT: '投诉' };
      return map[type] || type;
    },
    getStatusTag(status) {
      const map = { WAITING: 'info', ASSIGNED: '', ENDED: 'info' };
      return map[status] || '';
    },
    getStatusLabel(status) {
      const map = { WAITING: '等待分配', ASSIGNED: '进行中', ENDED: '已结束' };
      return map[status] || status;
    },
    formatDate(date) {
      if (!date) return '-';
      const d = new Date(date);
      return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    },
    async viewSession(session) {
      this.currentSession = session;
      const res = await API.get(`/messages/session/${session._id}`);
      this.currentMessages = res.data.data || [];
      this.showDetail = true;
    },
    transferSession(session) {
      this.transferForm = {
        sessionId: session._id,
        fromAgentId: session.agentId,
        toAgentId: '',
        reason: ''
      };
      this.showTransfer = true;
    },
    async confirmTransfer() {
      await API.post(`/sessions/${this.transferForm.sessionId}/transfer`, this.transferForm);
      this.$message.success('转交成功');
      this.showTransfer = false;
      this.loadSessions();
    },
    async endSession(session) {
      await API.post(`/sessions/${session._id}/end`);
      this.$message.success('已结束');
      this.loadSessions();
    }
  }
};
</script>

<style scoped>
.sessions-page {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e8e8e8;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-header h2::before {
  content: '';
  display: block;
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.message-list {
  max-height: 500px;
  overflow-y: auto;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.message-item {
  padding: 14px 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  max-width: 75%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.CUSTOMER {
  background: #fff;
  border: 1px solid #e5e7eb;
  margin-right: auto;
}

.message-item.AGENT {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  margin-left: auto;
  text-align: right;
}

.msg-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 6px;
}

.message-item.AGENT .msg-time {
  color: rgba(255,255,255,0.7);
}
</style>
