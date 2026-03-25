<template>
  <div class="messages-page">
    <div class="page-header">
      <h2>聊天记录</h2>
      <div class="header-actions">
        <el-input v-model="filters.keyword" placeholder="搜索消息内容" style="width: 200px" />
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" @change="onDateChange" />
        <el-button type="primary" @click="searchMessages">搜索</el-button>
      </div>
    </div>

    <el-table :data="messages" stripe border>
      <el-table-column prop="sessionId.customerId" label="客户" />
      <el-table-column prop="senderType" label="发送方" width="100">
        <template #default="{ row }">
          <el-tag :type="row.senderType === 'CUSTOMER' ? 'success' : ''">
            {{ row.senderType === 'CUSTOMER' ? '客户' : row.senderType === 'AGENT' ? '客服' : '系统' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="msgType" label="类型" width="80">
        <template #default="{ row }">
          {{ row.msgType === 'TEXT' ? '文本' : row.msgType === 'IMAGE' ? '图片' : '文件' }}
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" min-width="300" />
      <el-table-column prop="createdAt" label="时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :total="total" layout="total, prev, pager, next" @current-change="loadMessages" />
    </div>
  </div>
</template>

<script>
import { API } from '../api';

export default {
  name: 'Messages',
  data() {
    return {
      messages: [],
      currentPage: 1,
      pageSize: 50,
      total: 0,
      filters: {
        keyword: '',
        startTime: '',
        endTime: ''
      },
      dateRange: []
    };
  },
  mounted() {
    this.loadMessages();
  },
  methods: {
    async loadMessages() {
      const params = {
        limit: this.pageSize,
        skip: (this.currentPage - 1) * this.pageSize,
        ...this.filters
      };
      const res = await API.get('/messages/query', { params });
      this.messages = res.data.data || [];
      this.total = res.data.total || 0;
    },
    onDateChange(dates) {
      if (dates && dates.length === 2) {
        this.filters.startTime = dates[0].toISOString();
        this.filters.endTime = dates[1].toISOString();
      } else {
        this.filters.startTime = '';
        this.filters.endTime = '';
      }
    },
    searchMessages() {
      this.currentPage = 1;
      this.loadMessages();
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
.messages-page {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
