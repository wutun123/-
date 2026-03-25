<template>
  <div class="stats-page">
    <h2>数据统计</h2>

    <!-- 概览卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalSessions }}</div>
          <div class="stat-label">总会话数</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value">{{ stats.todaySessions }}</div>
          <div class="stat-label">今日会话</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value">{{ stats.avgResponseTime }}s</div>
          <div class="stat-label">平均响应时间</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-value">{{ stats.onlineAgents }}</div>
          <div class="stat-label">在线客服</div>
        </div>
      </el-col>
    </el-row>

    <!-- 客服接待排名 -->
    <div class="stat-section">
      <h3>客服接待排名</h3>
      <el-table :data="agentStats" stripe border>
        <el-table-column prop="agentName" label="客服" />
        <el-table-column prop="sessionCount" label="接待会话数" sortable />
        <el-table-column prop="messageCount" label="消息数" sortable />
        <el-table-column prop="avgDuration" label="平均时长">
          <template #default="{ row }">
            {{ Math.floor(row.avgDuration / 60) }}分{{ row.avgDuration % 60 }}秒
          </template>
        </el-table-column>
        <el-table-column prop="satisfaction" label="满意度">
          <template #default="{ row }">
            <el-rate v-model="row.satisfaction" disabled />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 会话趋势图 -->
    <div class="stat-section">
      <h3>近 7 日会话趋势</h3>
      <div ref="chartRef" style="height: 300px;"></div>
    </div>
  </div>
</template>

<script>
import { API } from '../api';

export default {
  name: 'Stats',
  data() {
    return {
      stats: {
        totalSessions: 0,
        todaySessions: 0,
        avgResponseTime: 0,
        onlineAgents: 0
      },
      agentStats: [],
      chartRef: null
    };
  },
  mounted() {
    this.loadStats();
    this.loadAgentStats();
  },
  methods: {
    async loadStats() {
      // 模拟数据
      this.stats = {
        totalSessions: 1280,
        todaySessions: 45,
        avgResponseTime: 28,
        onlineAgents: 8
      };
    },
    async loadAgentStats() {
      const res = await API.get('/agents');
      const agents = res.data.data || [];
      this.agentStats = agents.map(a => ({
        agentName: a.nickname,
        sessionCount: Math.floor(Math.random() * 100),
        messageCount: Math.floor(Math.random() * 500),
        avgDuration: Math.floor(Math.random() * 600),
        satisfaction: (Math.random() * 2 + 3).toFixed(1)
      })).sort((a, b) => b.sessionCount - a.sessionCount);
    }
  }
};
</script>

<style scoped>
.stats-page {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.stats-page h2 {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.overview-cards {
  margin-bottom: 32px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  padding: 28px 20px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
}

.stat-value {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
  letter-spacing: 0.5px;
}

.stat-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}

.stat-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat-section h3::before {
  content: '';
  display: block;
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}
</style>
