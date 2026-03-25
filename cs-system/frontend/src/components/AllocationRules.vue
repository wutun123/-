<template>
  <div class="allocation-rules">
    <div class="page-header">
      <h2>分配规则配置</h2>
      <button @click="saveRules" class="btn-save">保存配置</button>
    </div>

    <div class="rule-section">
      <h3>基础设置</h3>
      <div class="form-item">
        <label>启用自动分配</label>
        <el-switch v-model="autoAllocate" />
      </div>
      <div class="form-item">
        <label>默认分配策略</label>
        <el-radio-group v-model="defaultStrategy">
          <el-radio label="LEAST_LOAD">最少接待优先</el-radio>
          <el-radio label="ROUND_ROBIN">轮询分配</el-radio>
          <el-radio label="WEIGHT">权重分配</el-radio>
        </el-radio-group>
      </div>
      <div class="form-item">
        <label>超时自动转交（秒）</label>
        <el-input-number v-model="timeoutSeconds" :min="60" :max="1800" />
      </div>
    </div>

    <div class="rule-section">
      <h3>分组匹配规则</h3>
      <el-table :data="groupRules" border>
        <el-table-column prop="problemType" label="问题类型" />
        <el-table-column prop="targetGroup" label="分配组" />
        <el-table-column prop="priority" label="优先级" />
      </el-table>
    </div>

    <div class="rule-section">
      <h3>客服权重设置</h3>
      <el-table :data="agents" border>
        <el-table-column prop="name" label="客服" />
        <el-table-column prop="groupType" label="分组" />
        <el-table-column prop="maxConcurrent" label="最大接待量" />
        <el-table-column prop="weight" label="权重">
          <template #default="{ row }">
            <el-input-number v-model="row.weight" :min="0.1" :max="5" :step="0.1" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { API } from '../api';

export default {
  name: 'AllocationRules',
  data() {
    return {
      autoAllocate: true,
      defaultStrategy: 'LEAST_LOAD',
      timeoutSeconds: 300,
      groupRules: [
        { problemType: '售前咨询', targetGroup: 'PRE_SALE', priority: 1 },
        { problemType: '售后问题', targetGroup: 'AFTER_SALE', priority: 1 },
        { problemType: '投诉建议', targetGroup: 'COMPLAINT', priority: 1 }
      ],
      agents: []
    };
  },
  mounted() {
    this.loadRules();
    this.loadAgents();
  },
  methods: {
    async loadRules() {
      const res = await API.get('/allocation-rules');
      const rules = res.data.data;
      // 解析现有规则
    },
    async loadAgents() {
      const res = await API.get('/agents');
      this.agents = res.data.data;
    },
    async saveRules() {
      const rules = [
        {
          ruleType: this.defaultStrategy,
          ruleValue: this.defaultStrategy === 'GROUP_MATCH' ? this.groupRules : null,
          enabled: this.autoAllocate
        }
      ];

      await API.put('/allocation-rules', { rules });
      this.$message.success('保存成功');
    }
  }
};
</script>

<style scoped>
.allocation-rules {
  padding: 24px;
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

.btn-save {
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

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.rule-section {
  background: #fff;
  padding: 24px;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.rule-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.rule-section h3::before {
  content: '';
  display: block;
  width: 3px;
  height: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.form-item label {
  width: 150px;
  color: #6b7280;
  font-size: 14px;
}
</style>
