<template>
  <div class="dashboard-page">
    <h2>工作台概览</h2>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <el-card shadow="hover" class="action-card" @click="$router.push('/sessions')">
        <div class="action-icon">💬</div>
        <div class="action-label">会话管理</div>
      </el-card>
      <el-card shadow="hover" class="action-card" @click="$router.push('/agents')">
        <div class="action-icon">👥</div>
        <div class="action-label">客服管理</div>
      </el-card>
      <el-card shadow="hover" class="action-card" @click="$router.push('/rules')">
        <div class="action-icon">⚙️</div>
        <div class="action-label">分配规则</div>
      </el-card>
      <el-card shadow="hover" class="action-card" @click="$router.push('/stats')">
        <div class="action-icon">📊</div>
        <div class="action-label">数据统计</div>
      </el-card>
    </div>

    <!-- 实时数据 -->
    <el-row :gutter="20" class="data-cards">
      <el-col :span="6">
        <el-card>
          <div class="data-card">
            <div class="data-label">等待分配</div>
            <div class="data-value waiting">{{ waitingCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="data-card">
            <div class="data-label">进行中会话</div>
            <div class="data-value active">{{ activeCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="data-card">
            <div class="data-label">在线客服</div>
            <div class="data-value online">{{ onlineCount }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="data-card">
            <div class="data-label">今日接待</div>
            <div class="data-value today">{{ todayCount }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近会话 -->
    <div class="recent-section">
      <h3>最近会话</h3>
      <el-table :data="recentSessions" stripe border>
        <el-table-column prop="customerName" label="客户" />
        <el-table-column prop="agentName" label="客服" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ASSIGNED' ? 'success' : 'info'">
              {{ row.status === 'ASSIGNED' ? '进行中' : '等待分配' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { API } from '../api';

export default {
  name: 'Dashboard',
  data() {
    return {
      waitingCount: 0,
      activeCount: 0,
      onlineCount: 0,
      todayCount: 0,
      recentSessions: []
    };
  },
  mounted() {
    this.loadDashboard();
    // 每 30 秒刷新一次数据
    setInterval(this.loadDashboard, 30000);
  },
  methods: {
    async loadDashboard() {
      try {
        const [statsRes, sessionsRes] = await Promise.all([
          API.get('/stats/overview'),
          API.get('/sessions/waiting')
        ]);

        this.waitingCount = sessionsRes.data.data?.length || 0;
        this.activeCount = 0; // 从其他接口获取
        this.onlineCount = statsRes.data.data?.onlineAgents || 0;
        this.todayCount = statsRes.data.data?.todaySessions || 0;

        this.recentSessions = (sessionsRes.data.data || []).slice(0, 5).map(s => ({
          customerName: s.customerId?.nickname || '游客',
          agentName: '未分配',
          status: s.status,
          createdAt: s.createdAt
        }));
      } catch (error) {
        console.error('加载失败:', error);
      }
    },
    formatDate(date) {
      if (!date) return '-';
      const d = new Date(date);
      return `${d.getMonth()+1}/${d.getDate()} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    }
  }
};
</script>

<style scoped>
.dashboard-page {
  padding: 0;
}

.dashboard-page h2 {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.action-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.action-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
}

.action-icon {
  font-size: 56px;
  margin-bottom: 16px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

.action-label {
  font-size: 15px;
  color: rgba(255,255,255,0.95);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.data-cards {
  margin-bottom: 24px;
}

.data-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s ease;
}

.data-card:hover {
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
  transform: translateY(-4px);
}

.data-label {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 12px;
  font-weight: 500;
}

.data-value {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.data-value.waiting {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.data-value.active {
  background: linear-gradient(135deg, #34d399 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.data-value.online {
  background: linear-gradient(135deg, #60a5fa 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.data-value.today {
  background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.recent-section {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.recent-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}
</style>
