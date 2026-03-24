<template>
  <view class="order-list-page">
    <!-- 订单状态筛选 -->
    <view class="order-tabs">
      <scroll-view class="tabs-scroll" scroll-x>
        <view class="tabs-wrapper">
          <view
            v-for="tab in tabs"
            :key="tab.value"
            :class="['tab-item', { active: currentTab === tab.value }]"
            @click="switchTab(tab.value)"
          >
            {{ tab.label }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list" v-if="orders.length > 0">
      <view class="order-card" v-for="order in orders" :key="order.id" @click="goToDetail(order.id)">
        <!-- 订单头部 -->
        <view class="order-header">
          <text class="order-no">订单号：{{ order.order_no }}</text>
          <text :class="['order-status', order.status_class]">{{ order.status_text }}</text>
        </view>

        <!-- 商品信息 -->
        <view class="order-items">
          <view class="order-item" v-for="item in order.items" :key="item.id">
            <image :src="item.image" class="item-image"></image>
            <view class="item-info">
              <text class="item-name">{{ item.product_name }}</text>
              <text class="item-spec">{{ item.sku_spec }}</text>
              <view class="item-bottom">
                <text class="item-price">¥{{ item.price }}</text>
                <text class="item-quantity">x{{ item.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 订单金额 -->
        <view class="order-footer">
          <view class="order-total">
            <text class="total-label">合计：</text>
            <text class="total-amount">¥{{ order.pay_amount }}</text>
          </view>
          <!-- 订单操作按钮 -->
          <view class="order-actions" v-if="order.actions && order.actions.length > 0">
            <button
              v-for="action in order.actions"
              :key="action.type"
              :class="['action-btn', action.type]"
              @click.stop="handleAction(order, action)"
            >
              {{ action.label }}
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <empty-state
      v-else
      :message="getEmptyMessage(currentTab)"
      button-text="去逛逛"
      @click="goToShopping"
    ></empty-state>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <text class="load-text">{{ loading ? '加载中...' : '加载更多' }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'uni-app/composables'
import { getOrderList } from '@/api/order'
import EmptyState from '@/components/empty-state.vue'

const route = useRoute()
const orders = ref([])
const currentTab = ref(0)
const page = ref(1)
const hasMore = ref(true)
const loading = ref(false)

const tabs = [
  { value: 0, label: '全部' },
  { value: 1, label: '待付款' },
  { value: 2, label: '待发货' },
  { value: 3, label: '待收货' },
  { value: 4, label: '已完成' },
  { value: 5, label: '售后' }
]

const statusClassMap = {
  0: 'status-pending',
  1: 'status-wait',
  2: 'status-shipping',
  3: 'status-success',
  4: 'status-cancel',
  5: 'status-after'
}

const loadOrders = async (reset = false) => {
  if (loading.value) return

  if (reset) {
    page.value = 1
    orders.value = []
    hasMore.value = true
  }

  loading.value = true
  try {
    const res = await getOrderList({
      status: currentTab.value,
      page: page.value,
      page_size: 10
    })

    const newOrders = res.data?.list || []
    if (newOrders.length < 10) {
      hasMore.value = false
    }

    // 添加状态样式和操作按钮
    const processedOrders = newOrders.map(order => ({
      ...order,
      status_class: statusClassMap[order.order_status],
      actions: getOrderActions(order)
    }))

    orders.value = reset ? processedOrders : [...orders.value, ...processedOrders]
    page.value++
  } catch (error) {
    console.log('加载订单失败')
  } finally {
    loading.value = false
  }
}

const getOrderActions = (order) => {
  const actions = []
  switch (order.order_status) {
    case 0: // 待付款
      actions.push({ type: 'pay', label: '去支付' }, { type: 'cancel', label: '取消订单' })
      break
    case 2: // 待收货
      actions.push({ type: 'confirm', label: '确认收货' })
      break
    case 3: // 已完成
      actions.push({ type: 'review', label: '评价' }, { type: 'after', label: '售后' })
      break
    case 5: // 售后
      actions.push({ type: 'detail', label: '查看详情' })
      break
  }
  return actions
}

const switchTab = (value) => {
  currentTab.value = value
  loadOrders(true)
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${id}` })
}

const handleAction = (order, action) => {
  switch (action.type) {
    case 'pay':
      uni.navigateTo({ url: `/pages/order/pay?id=${order.id}` })
      break
    case 'cancel':
      uni.showModal({
        title: '提示',
        content: '确定取消订单吗？',
        success: async (res) => {
          if (res.confirm) {
            // TODO: 调用取消接口
            loadOrders(true)
          }
        }
      })
      break
    case 'confirm':
      uni.showModal({
        title: '提示',
        content: '确认收到商品吗？',
        success: async (res) => {
          if (res.confirm) {
            // TODO: 调用确认接口
            loadOrders(true)
          }
        }
      })
      break
  }
}

const getEmptyMessage = (tab) => {
  const messages = {
    0: '暂无订单',
    1: '暂无待付款订单',
    2: '暂无待发货订单',
    3: '暂无待收货订单',
    4: '暂无已完成订单',
    5: '暂无售后订单'
  }
  return messages[tab] || '暂无订单'
}

const goToShopping = () => {
  uni.switchTab({ url: '/pages/index/index' })
}

onMounted(() => {
  // 从路由参数获取初始状态
  if (route.query.status !== undefined) {
    currentTab.value = parseInt(route.query.status)
  }
  loadOrders()
})
</script>

<style lang="scss" scoped>
.order-list-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.order-tabs {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-wrapper {
  display: inline-flex;
  padding: 0 24rpx;
}

.tab-item {
  padding: 28rpx 32rpx;
  font-size: 28rpx;
  color: #666;
  margin-right: 16rpx;
  position: relative;

  &.active {
    color: #FF8C42;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background-color: #FF8C42;
      border-radius: 2rpx;
    }
  }
}

.order-list {
  padding: 24rpx;
}

.order-card {
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .order-no {
    font-size: 24rpx;
    color: #999;
  }

  .order-status {
    font-size: 26rpx;

    &.status-pending {
      color: #F5222D;
    }

    &.status-wait {
      color: #FAAD14;
    }

    &.status-shipping {
      color: #4A9EFF;
    }

    &.status-success {
      color: #52C41A;
    }

    &.status-cancel {
      color: #999;
    }
  }
}

.order-items {
  padding: 24rpx;
}

.order-item {
  display: flex;
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .item-image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 8rpx;
    margin-right: 24rpx;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;

    .item-name {
      display: block;
      font-size: 28rpx;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-spec {
      display: block;
      font-size: 22rpx;
      color: #999;
      margin-top: 8rpx;
    }

    .item-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16rpx;

      .item-price {
        font-size: 32rpx;
        font-weight: 600;
        color: #FF8C42;
      }

      .item-quantity {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  border-top: 1rpx solid #f0f0f0;

  .order-total {
    .total-label {
      font-size: 26rpx;
      color: #666;
    }

    .total-amount {
      font-size: 34rpx;
      font-weight: 600;
      color: #F5222D;
    }
  }

  .order-actions {
    display: flex;
    gap: 16rpx;

    .action-btn {
      padding: 12rpx 28rpx;
      font-size: 26rpx;
      border-radius: 32rpx;

      &.pay, &.confirm {
        background: linear-gradient(135deg, #FF8C42, #FFB380);
        color: #fff;
        border: none;
      }

      &.cancel, &.after {
        background-color: #fff;
        color: #666;
        border: 1rpx solid #ddd;
      }
    }
  }
}

.load-more {
  padding: 32rpx;
  text-align: center;

  .load-text {
    font-size: 26rpx;
    color: #999;
  }
}
</style>
