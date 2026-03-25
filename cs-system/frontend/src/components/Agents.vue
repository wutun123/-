<template>
  <div class="agents-page">
    <div class="page-header">
      <h2>客服管理</h2>
      <el-button type="primary" @click="showAddDialog = true">新增客服</el-button>
    </div>

    <el-table :data="agents" stripe border>
      <el-table-column prop="nickname" label="昵称" />
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
      <el-table-column prop="maxConcurrent" label="最大接待量" />
      <el-table-column label="当前接待" width="120">
        <template #default="{ row }">
          {{ row.currentConcurrent }} / {{ row.maxConcurrent }}
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="权重" width="100" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="editAgent(row)">编辑</el-button>
          <el-button size="small" :type="row.status === 'ONLINE' ? 'warning' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 'ONLINE' ? '置忙' : '上线' }}
          </el-button>
          <el-button size="small" type="danger" @click="deleteAgent(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑客服弹窗 -->
    <el-dialog v-model="showAddDialog" :title="editMode ? '编辑客服' : '新增客服'" width="500px">
      <el-form :model="agentForm" label-width="100px">
        <el-form-item label="昵称">
          <el-input v-model="agentForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="分组">
          <el-select v-model="agentForm.groupType" style="width: 100%">
            <el-option label="售前组" value="PRE_SALE" />
            <el-option label="售后组" value="AFTER_SALE" />
            <el-option label="投诉组" value="COMPLAINT" />
          </el-select>
        </el-form-item>
        <el-form-item label="最大接待量">
          <el-input-number v-model="agentForm.maxConcurrent" :min="1" :max="50" />
        </el-form-item>
        <el-form-item label="权重">
          <el-input-number v-model="agentForm.weight" :min="0.1" :max="5" :step="0.1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAgent">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { API } from '../api';

export default {
  name: 'Agents',
  data() {
    return {
      agents: [],
      showAddDialog: false,
      editMode: false,
      agentForm: {
        _id: '',
        nickname: '',
        groupType: 'PRE_SALE',
        maxConcurrent: 10,
        weight: 1.0
      }
    };
  },
  mounted() {
    this.loadAgents();
  },
  methods: {
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
      const map = { ONLINE: 'success', BUSY: 'warning', OFFLINE: 'info' };
      return map[status] || '';
    },
    getStatusLabel(status) {
      const map = { ONLINE: '在线', BUSY: '忙碌', OFFLINE: '离线' };
      return map[status] || status;
    },
    editAgent(agent) {
      this.agentForm = { ...agent };
      this.editMode = true;
      this.showAddDialog = true;
    },
    async saveAgent() {
      if (this.editMode && this.agentForm._id) {
        await API.put(`/agents/${this.agentForm._id}`, this.agentForm);
        this.$message.success('更新成功');
      } else {
        await API.post('/agents', this.agentForm);
        this.$message.success('创建成功');
      }
      this.showAddDialog = false;
      this.loadAgents();
    },
    async toggleStatus(agent) {
      const newStatus = agent.status === 'ONLINE' ? 'BUSY' : 'ONLINE';
      await API.put(`/agents/${agent._id}/status`, { status: newStatus });
      this.$message.success('状态已更新');
      this.loadAgents();
    },
    async deleteAgent(agent) {
      await this.$confirm('确定删除该客服？', '提示', { type: 'warning' });
      await API.delete(`/agents/${agent._id}`);
      this.$message.success('删除成功');
      this.loadAgents();
    }
  }
};
</script>

<style scoped>
.agents-page {
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
</style>
