<template>
  <view class="admin-page">
    <!-- 顶部导航 -->
    <view class="admin-header">
      <text class="header-title">宠星球管理后台</text>
      <view class="header-actions">
        <text class="admin-name">管理员</text>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </view>
    </view>

    <!-- 侧边栏 + 内容区 -->
    <view class="admin-container">
      <!-- 侧边菜单 -->
      <view class="sidebar">
        <view class="menu-item">
          <text class="menu-title">数据统计</text>
        </view>
        <view
          v-for="menu in menus"
          :key="menu.id"
          :class="['menu-item', { active: currentMenu === menu.id }]"
          @click="switchMenu(menu.id)"
        >
          <uni-icons :type="menu.icon" size="20" :color="currentMenu === menu.id ? '#FF8C42' : '#666'"></uni-icons>
          <text :class="['menu-text', { active: currentMenu === menu.id }]">{{ menu.name }}</text>
        </view>
      </view>

      <!-- 内容区域 -->
      <view class="content-area">
        <!-- 数据统计 -->
        <view v-if="currentMenu === 'dashboard'" class="content-section">
          <view class="stats-grid">
            <view class="stat-card">
              <text class="stat-label">今日订单</text>
              <text class="stat-value">{{ stats.todayOrders }}</text>
              <text class="stat-trend" :class="stats.ordersTrend > 0 ? 'up' : 'down'">
                {{ stats.ordersTrend > 0 ? '+' : ''}}{{ stats.ordersTrend }}%
              </text>
            </view>
            <view class="stat-card">
              <text class="stat-label">今日销售额</text>
              <text class="stat-value">¥{{ stats.todaySales }}</text>
              <text class="stat-trend" :class="stats.salesTrend > 0 ? 'up' : 'down'">
                {{ stats.salesTrend > 0 ? '+' : ''}}{{ stats.salesTrend }}%
              </text>
            </view>
            <view class="stat-card">
              <text class="stat-label">待发货订单</text>
              <text class="stat-value">{{ stats.pendingOrders }}</text>
            </view>
            <view class="stat-card">
              <text class="stat-label">待审核分销商</text>
              <text class="stat-value">{{ stats.pendingDistributors }}</text>
            </view>
          </view>

          <view class="chart-section">
            <view class="section-title">销售趋势</view>
            <view class="chart-placeholder">
              <text>销售图表区域（可接入 ECharts）</text>
            </view>
          </view>
        </view>

        <!-- 商品管理 -->
        <view v-if="currentMenu === 'products'" class="content-section">
          <view class="section-header">
            <text class="section-title">商品管理</text>
            <button class="add-btn" @click="addProduct">
              <uni-icons type="plus" size="16" color="#fff"></uni-icons>
              新增商品
            </button>
          </view>
          <view class="data-table">
            <view class="table-header">
              <view class="table-cell">商品 ID</view>
              <view class="table-cell">商品名称</view>
              <view class="table-cell">分类</view>
              <view class="table-cell">价格</view>
              <view class="table-cell">库存</view>
              <view class="table-cell">状态</view>
              <view class="table-cell">操作</view>
            </view>
            <view class="table-body">
              <view class="table-row" v-for="item in productList" :key="item.id">
                <view class="table-cell">{{ item.id }}</view>
                <view class="table-cell">{{ item.name }}</view>
                <view class="table-cell">{{ item.category }}</view>
                <view class="table-cell">¥{{ item.price }}</view>
                <view class="table-cell">{{ item.stock }}</view>
                <view class="table-cell">
                  <text :class="['status-tag', item.status === 1 ? 'success' : 'danger']">
                    {{ item.status === 1 ? '上架' : '下架' }}
                  </text>
                </view>
                <view class="table-cell">
                  <text class="action-link" @click="editProduct(item)">编辑</text>
                  <text class="action-link" @click="toggleStatus(item)">{{ item.status === 1 ? '下架' : '上架' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 订单管理 -->
        <view v-if="currentMenu === 'orders'" class="content-section">
          <view class="section-header">
            <text class="section-title">订单管理</text>
            <view class="filter-group">
              <picker :range="orderStatusOptions" @change="onOrderStatusChange">
                <view class="filter-btn">
                  <text>{{ orderStatusOptions[currentStatusIndex] }}</text>
                  <uni-icons type="bottom" size="14" color="#999"></uni-icons>
                </view>
              </picker>
            </view>
          </view>
          <view class="data-table">
            <view class="table-header">
              <view class="table-cell">订单号</view>
              <view class="table-cell">用户</view>
              <view class="table-cell">金额</view>
              <view class="table-cell">状态</view>
              <view class="table-cell">下单时间</view>
              <view class="table-cell">操作</view>
            </view>
            <view class="table-body">
              <view class="table-row" v-for="item in orderList" :key="item.id">
                <view class="table-cell">{{ item.order_no }}</view>
                <view class="table-cell">{{ item.user_name }}</view>
                <view class="table-cell">¥{{ item.pay_amount }}</view>
                <view class="table-cell">
                  <text :class="['status-tag', getStatusClass(item.order_status)]">
                    {{ item.status_text }}
                  </text>
                </view>
                <view class="table-cell">{{ item.created_at }}</view>
                <view class="table-cell">
                  <text class="action-link" @click="viewOrderDetail(item)">详情</text>
                  <text class="action-link" v-if="item.order_status === 1" @click="shipOrder(item)">发货</text>
                  <text class="action-link" v-if="item.order_status === 0" @click="cancelOrder(item)">取消</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 分销商管理 -->
        <view v-if="currentMenu === 'distributors'" class="content-section">
          <view class="section-header">
            <text class="section-title">分销商管理</text>
            <view class="filter-group">
              <picker :range="distributorStatusOptions" @change="onDistributorStatusChange">
                <view class="filter-btn">
                  <text>{{ distributorStatusOptions[currentDistributorStatusIndex] }}</text>
                  <uni-icons type="bottom" size="14" color="#999"></uni-icons>
                </view>
              </picker>
            </view>
          </view>
          <view class="data-table">
            <view class="table-header">
              <view class="table-cell">分销商 ID</view>
              <view class="table-cell">昵称</view>
              <view class="table-cell">手机号</view>
              <view class="table-cell">等级</view>
              <view class="table-cell">团队人数</view>
              <view class="table-cell">累计佣金</view>
              <view class="table-cell">状态</view>
              <view class="table-cell">操作</view>
            </view>
            <view class="table-body">
              <view class="table-row" v-for="item in distributorList" :key="item.id">
                <view class="table-cell">{{ item.id }}</view>
                <view class="table-cell">{{ item.nickname }}</view>
                <view class="table-cell">{{ item.phone }}</view>
                <view class="table-cell">{{ item.level_name }}</view>
                <view class="table-cell">{{ item.team_count }}</view>
                <view class="table-cell">¥{{ item.total_commission }}</view>
                <view class="table-cell">
                  <text :class="['status-tag', getDistributorStatusClass(item.status)]">
                    {{ getDistributorStatusText(item.status) }}
                  </text>
                </view>
                <view class="table-cell">
                  <text class="action-link" @click="viewDistributorDetail(item)">详情</text>
                  <text class="action-link" v-if="item.status === 0" @click="auditDistributor(item, 1)">通过</text>
                  <text class="action-link" v-if="item.status === 0" @click="auditDistributor(item, 2)" style="color: #F5222D;">拒绝</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 佣金配置 -->
        <view v-if="currentMenu === 'commission'" class="content-section">
          <view class="section-header">
            <text class="section-title">佣金配置</text>
          </view>
          <view class="form-section">
            <view class="form-item">
              <text class="form-label">一级佣金比例 (%)</text>
              <input
                class="form-input"
                type="number"
                v-model="commissionForm.level1Rate"
                placeholder="请输入佣金比例"
              />
            </view>
            <view class="form-item">
              <text class="form-label">二级佣金比例 (%)</text>
              <input
                class="form-input"
                type="number"
                v-model="commissionForm.level2Rate"
                placeholder="请输入佣金比例"
              />
            </view>
            <view class="form-item">
              <text class="form-label">最低提现金额 (元)</text>
              <input
                class="form-input"
                type="number"
                v-model="commissionForm.minWithdraw"
                placeholder="请输入最低提现金额"
              />
            </view>
            <view class="form-item">
              <text class="form-label">自动升级消费金额 (元)</text>
              <input
                class="form-input"
                type="number"
                v-model="commissionForm.autoUpgradeAmount"
                placeholder="请输入消费金额"
              />
            </view>
            <view class="form-item">
              <text class="form-label">自动升级直推人数</text>
              <input
                class="form-input"
                type="number"
                v-model="commissionForm.autoUpgradeCount"
                placeholder="请输入人数"
              />
            </view>
            <view class="form-actions">
              <button class="submit-btn" @click="saveCommissionConfig">保存配置</button>
            </view>
          </view>
        </view>

        <!-- 提现审核 -->
        <view v-if="currentMenu === 'withdrawals'" class="content-section">
          <view class="section-header">
            <text class="section-title">提现审核</text>
          </view>
          <view class="data-table">
            <view class="table-header">
              <view class="table-cell">提现 ID</view>
              <view class="table-cell">分销商</view>
              <view class="table-cell">提现金额</view>
              <view class="table-cell">状态</view>
              <view class="table-cell">申请时间</view>
              <view class="table-cell">操作</view>
            </view>
            <view class="table-body">
              <view class="table-row" v-for="item in withdrawalList" :key="item.id">
                <view class="table-cell">{{ item.id }}</view>
                <view class="table-cell">{{ item.distributor_name }}</view>
                <view class="table-cell">¥{{ item.amount }}</view>
                <view class="table-cell">
                  <text :class="['status-tag', getWithdrawalStatusClass(item.status)]">
                    {{ getWithdrawalStatusText(item.status) }}
                  </text>
                </view>
                <view class="table-cell">{{ item.apply_time }}</view>
                <view class="table-cell">
                  <text class="action-link" v-if="item.status === 0" @click="auditWithdrawal(item, 1)">通过</text>
                  <text class="action-link" v-if="item.status === 0" @click="auditWithdrawal(item, 3)" style="color: #F5222D;">驳回</text>
                  <text class="action-link" v-else @click="viewWithdrawalDetail(item)">详情</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentMenu = ref('dashboard')
const currentStatusIndex = ref(0)
const currentDistributorStatusIndex = ref(0)

const menus = [
  { id: 'dashboard', name: '数据统计', icon: 'home' },
  { id: 'products', name: '商品管理', icon: 'shop' },
  { id: 'orders', name: '订单管理', icon: 'list' },
  { id: 'distributors', name: '分销商管理', icon: 'staff' },
  { id: 'commission', name: '佣金配置', icon: 'settings' },
  { id: 'withdrawals', name: '提现审核', icon: 'wallet' }
]

const orderStatusOptions = ['全部', '待付款', '待发货', '待收货', '已完成', '已取消', '售后']
const distributorStatusOptions = ['全部', '待审核', '正式', '已拒绝', '已冻结']

const stats = ref({
  todayOrders: 128,
  todaySales: 15680,
  pendingOrders: 36,
  pendingDistributors: 8,
  ordersTrend: 12.5,
  salesTrend: 8.3
})

const productList = ref([
  { id: 1, name: '天然狗粮 5kg', category: '主粮', price: 128, stock: 500, status: 1 },
  { id: 2, name: '猫罐头 80g*12 罐', category: '零食', price: 96, stock: 1000, status: 1 },
  { id: 3, name: '宠物沐浴露 500ml', category: '用品', price: 58, stock: 800, status: 0 }
])

const orderList = ref([
  { id: 1, order_no: 'SO202603240001', user_name: '张三', pay_amount: 128, order_status: 1, status_text: '待发货', created_at: '2026-03-24 10:30' },
  { id: 2, order_no: 'SO202603240002', user_name: '李四', pay_amount: 256, order_status: 0, status_text: '待付款', created_at: '2026-03-24 11:00' }
])

const distributorList = ref([
  { id: 1, nickname: '王五', phone: '138****0001', level_name: '金牌分销商', team_count: 128, total_commission: 5680, status: 1 },
  { id: 2, nickname: '赵六', phone: '138****0002', level_name: '银牌分销商', team_count: 56, total_commission: 2340, status: 0 }
])

const commissionForm = ref({
  level1Rate: 15,
  level2Rate: 8,
  minWithdraw: 10,
  autoUpgradeAmount: 1000,
  autoUpgradeCount: 10
})

const withdrawalList = ref([
  { id: 1, distributor_name: '王五', amount: 500, status: 0, apply_time: '2026-03-24 09:00' },
  { id: 2, distributor_name: '赵六', amount: 200, status: 1, apply_time: '2026-03-23 15:30' }
])

const switchMenu = (id) => {
  currentMenu.value = id
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 退出登录
        console.log('退出登录')
      }
    }
  })
}

const addProduct = () => {
  uni.navigateTo({ url: '/pages/admin/product-edit' })
}

const editProduct = (item) => {
  uni.navigateTo({ url: `/pages/admin/product-edit?id=${item.id}` })
}

const toggleStatus = (item) => {
  uni.showModal({
    title: '提示',
    content: `确定${item.status === 1 ? '下架' : '上架'}该商品吗？`,
    success: (res) => {
      if (res.confirm) {
        item.status = item.status === 1 ? 0 : 1
      }
    }
  })
}

const onOrderStatusChange = (e) => {
  currentStatusIndex.value = e.detail.value
  // TODO: 加载对应状态的订单
}

const onDistributorStatusChange = (e) => {
  currentDistributorStatusIndex.value = e.detail.value
  // TODO: 加载对应状态的分销商
}

const getStatusClass = (status) => {
  const classMap = { 0: 'warning', 1: 'primary', 2: 'info', 3: 'success', 4: 'danger', 5: 'warning' }
  return classMap[status] || 'default'
}

const getDistributorStatusClass = (status) => {
  const classMap = { 0: 'warning', 1: 'success', 2: 'danger', 3: 'danger' }
  return classMap[status] || 'default'
}

const getDistributorStatusText = (status) => {
  const textMap = { 0: '待审核', 1: '正式', 2: '已拒绝', 3: '已冻结' }
  return textMap[status] || '未知'
}

const getWithdrawalStatusClass = (status) => {
  const classMap = { 0: 'warning', 1: 'primary', 2: 'success', 3: 'danger' }
  return classMap[status] || 'default'
}

const getWithdrawalStatusText = (status) => {
  const textMap = { 0: '待审核', 1: '处理中', 2: '已完成', 3: '已驳回' }
  return textMap[status] || '未知'
}

const viewOrderDetail = (item) => {
  uni.navigateTo({ url: `/pages/admin/order-detail?id=${item.id}` })
}

const shipOrder = (item) => {
  uni.navigateTo({ url: `/pages/admin/order-ship?id=${item.id}` })
}

const cancelOrder = (item) => {
  uni.showModal({
    title: '提示',
    content: '确定取消该订单吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 取消订单
      }
    }
  })
}

const viewDistributorDetail = (item) => {
  uni.navigateTo({ url: `/pages/admin/distributor-detail?id=${item.id}` })
}

const auditDistributor = (item, result) => {
  uni.showModal({
    title: '提示',
    content: result === 1 ? '确定通过审核吗？' : '确定拒绝审核吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 审核分销商
      }
    }
  })
}

const saveCommissionConfig = () => {
  uni.showLoading({ title: '保存中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '保存成功' })
  }, 1000)
}

const auditWithdrawal = (item, result) => {
  uni.showModal({
    title: '提示',
    content: result === 1 ? '确定通过提现申请吗？' : '确定驳回提现申请吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 审核提现
      }
    }
  })
}

const viewWithdrawalDetail = (item) => {
  uni.navigateTo({ url: `/pages/admin/withdrawal-detail?id=${item.id}` })
}
</script>

<style lang="scss" scoped>
.admin-page {
  min-height: 100vh;
  background-color: #f0f2f5;
}

.admin-header {
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

  .header-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
  }

  .header-actions {
    display: flex;
    align-items: center;

    .admin-name {
      font-size: 28rpx;
      color: #666;
      margin-right: 24rpx;
    }

    .logout-btn {
      padding: 12rpx 28rpx;
      font-size: 26rpx;
      background-color: #FF8C42;
      color: #fff;
      border-radius: 8rpx;
      border: none;
    }
  }
}

.admin-container {
  display: flex;
  height: calc(100vh - 100rpx);
}

.sidebar {
  width: 400rpx;
  background-color: #fff;
  padding: 24rpx 0;
  border-right: 1rpx solid #e8e8e8;

  .menu-item {
    display: flex;
    align-items: center;
    padding: 28rpx 40rpx;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #FFF5F0;
    }

    &.active {
      background-color: #FFF5F0;
      border-right: 4rpx solid #FF8C42;
    }

    .menu-text {
      margin-left: 16rpx;
      font-size: 28rpx;
      color: #666;

      &.active {
        color: #FF8C42;
        font-weight: 600;
      }
    }
  }
}

.content-area {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;
}

.content-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .add-btn {
    display: flex;
    align-items: center;
    padding: 16rpx 28rpx;
    background: linear-gradient(135deg, #FF8C42, #FFB380);
    color: #fff;
    font-size: 26rpx;
    border-radius: 8rpx;
    border: none;
  }

  .filter-group {
    display: flex;
    gap: 16rpx;

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      padding: 12rpx 24rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      font-size: 26rpx;
      color: #666;
    }
  }
}

.stats-grid {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;

  .stat-card {
    flex: 1;
    background: linear-gradient(135deg, #FF8C42, #FFB380);
    border-radius: 12rpx;
    padding: 32rpx;
    position: relative;

    .stat-label {
      display: block;
      font-size: 24rpx;
      color: rgba(255,255,255,0.9);
      margin-bottom: 16rpx;
    }

    .stat-value {
      display: block;
      font-size: 48rpx;
      font-weight: 600;
      color: #fff;
    }

    .stat-trend {
      position: absolute;
      top: 32rpx;
      right: 32rpx;
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 4rpx;

      &.up {
        background-color: rgba(82, 196, 26, 0.3);
        color: #fff;
      }

      &.down {
        background-color: rgba(245, 34, 45, 0.3);
        color: #fff;
      }
    }
  }
}

.chart-section {
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
  }

  .chart-placeholder {
    height: 400rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }
}

.data-table {
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  overflow: hidden;

  .table-header {
    display: flex;
    background-color: #f5f5f5;
    font-weight: 600;

    .table-cell {
      flex: 1;
      padding: 20rpx 16rpx;
      font-size: 26rpx;
      color: #666;
      text-align: center;
      border-right: 1rpx solid #e8e8e8;

      &:last-child {
        border-right: none;
      }
    }
  }

  .table-body {
    .table-row {
      display: flex;
      border-bottom: 1rpx solid #e8e8e8;

      &:last-child {
        border-bottom: none;
      }

      .table-cell {
        flex: 1;
        padding: 20rpx 16rpx;
        font-size: 26rpx;
        color: #333;
        text-align: center;
        border-right: 1rpx solid #e8e8e8;

        &:last-child {
          border-right: none;
        }
      }
    }
  }
}

.status-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  font-size: 24rpx;
  border-radius: 4rpx;

  &.success {
    background-color: #f6ffed;
    color: #52C41A;
  }

  &.primary {
    background-color: #e6f7ff;
    color: #4A9EFF;
  }

  &.warning {
    background-color: #fffbe6;
    color: #FAAD14;
  }

  &.danger {
    background-color: #fff2f0;
    color: #F5222D;
  }

  &.info {
    background-color: #f5f5f5;
    color: #666;
  }
}

.action-link {
  display: inline-block;
  margin: 0 8rpx;
  font-size: 26rpx;
  color: #4A9EFF;
  cursor: pointer;
}

.form-section {
  max-width: 800rpx;

  .form-item {
    margin-bottom: 24rpx;

    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 12rpx;
    }

    .form-input {
      width: 100%;
      height: 72rpx;
      border: 1rpx solid #ddd;
      border-radius: 8rpx;
      padding: 0 24rpx;
      font-size: 26rpx;
      color: #333;
    }
  }

  .form-actions {
    margin-top: 32rpx;

    .submit-btn {
      width: 100%;
      height: 80rpx;
      background: linear-gradient(135deg, #FF8C42, #FFB380);
      color: #fff;
      font-size: 30rpx;
      border-radius: 8rpx;
      border: none;
    }
  }
}
</style>
