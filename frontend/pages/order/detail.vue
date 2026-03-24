<template>
  <view class="order-detail-page">
    <!-- 订单状态卡片 -->
    <view class="status-card">
      <view class="status-icon">
        <uni-icons :type="statusIcon" size="60" :color="statusColor"></uni-icons>
      </view>
      <text class="status-text">{{ orderInfo.status_text || '待付款' }}</text>
      <view class="status-actions" v-if="orderInfo.actions && orderInfo.actions.length > 0">
        <button
          v-for="action in orderInfo.actions"
          :key="action.type"
          :class="['status-btn', action.type]"
          @click="handleAction(action)"
        >
          {{ action.label }}
        </button>
      </view>
    </view>

    <!-- 物流信息（待收货/已完成） -->
    <view class="logistics-section" v-if="orderInfo.order_status >= 2">
      <view class="section-title">
        <uni-icons type="location" size="20" color="#FF8C42"></uni-icons>
        <text class="title-text">物流信息</text>
      </view>
      <view class="logistics-content">
        <view class="logistics-row" v-if="logistics.company">
          <text class="logistics-label">物流公司：</text>
          <text class="logistics-value">{{ logistics.company }}</text>
        </view>
        <view class="logistics-row">
          <text class="logistics-label">物流单号：</text>
          <text class="logistics-value">{{ logistics.tracking_no || '暂无' }}</text>
        </view>
        <view class="logistics-trace" v-if="logistics.traces && logistics.traces.length > 0">
          <view class="trace-item" v-for="(trace, index) in logistics.traces" :key="index">
            <view class="trace-dot" :class="{ active: index === 0 }"></view>
            <view class="trace-content">
              <text class="trace-time">{{ trace.time }}</text>
              <text class="trace-info">{{ trace.info }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 收货信息 -->
    <view class="address-section">
      <view class="section-title">
        <uni-icons type="location" size="20" color="#FF8C42"></uni-icons>
        <text class="title-text">收货信息</text>
      </view>
      <view class="address-content">
        <view class="address-row">
          <text class="address-name">{{ orderInfo.receiver_name }}</text>
          <text class="address-phone">{{ orderInfo.receiver_phone }}</text>
        </view>
        <text class="address-detail">{{ orderInfo.receiver_address }}</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="goods-section">
      <view class="section-title">
        <text class="title-text">商品信息</text>
      </view>
      <view class="goods-list">
        <view class="goods-item" v-for="item in orderInfo.items" :key="item.id">
          <image :src="item.image" class="goods-image"></image>
          <view class="goods-info">
            <text class="goods-name">{{ item.product_name }}</text>
            <text class="goods-spec">{{ item.sku_spec }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 金额明细 -->
    <view class="amount-section">
      <view class="amount-row">
        <text class="amount-label">商品总额</text>
        <text class="amount-value">¥{{ orderInfo.total_amount }}</text>
      </view>
      <view class="amount-row">
        <text class="amount-label">运费</text>
        <text class="amount-value">¥{{ orderInfo.freight_amount }}</text>
      </view>
      <view class="amount-row" v-if="orderInfo.discount_amount > 0">
        <text class="amount-label">优惠金额</text>
        <text class="amount-value text-success">-¥{{ orderInfo.discount_amount }}</text>
      </view>
      <view class="amount-row amount-total">
        <text class="amount-label">实付款</text>
        <text class="amount-total-price">¥{{ orderInfo.pay_amount }}</text>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info-section">
      <view class="section-title">
        <text class="title-text">订单信息</text>
      </view>
      <view class="info-list">
        <view class="info-row">
          <text class="info-label">订单编号</text>
          <text class="info-value" @click="copyOrderNo">{{ orderInfo.order_no }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">下单时间</text>
          <text class="info-value">{{ orderInfo.created_at }}</text>
        </view>
        <view class="info-row" v-if="orderInfo.pay_time">
          <text class="info-label">支付时间</text>
          <text class="info-value">{{ orderInfo.pay_time }}</text>
        </view>
        <view class="info-row" v-if="orderInfo.delivery_time">
          <text class="info-label">发货时间</text>
          <text class="info-value">{{ orderInfo.delivery_time }}</text>
        </view>
        <view class="info-row" v-if="orderInfo.receive_time">
          <text class="info-label">收货时间</text>
          <text class="info-value">{{ orderInfo.receive_time }}</text>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="order-footer" v-if="showFooter">
      <view class="footer-actions">
        <button
          v-for="action in footerActions"
          :key="action.type"
          :class="['footer-btn', action.type]"
          @click="handleAction(action)"
        >
          {{ action.label }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'uni-app/composables'
import { getOrderDetail, cancelOrder, confirmOrder } from '@/api/order'

const route = useRoute()
const orderInfo = ref({})
const logistics = ref({})

const statusIcon = computed(() => {
  const icons = { 0: 'close', 1: 'clock', 2: 'location', 3: 'checkmarkempty', 4: 'close', 5: 'refresh' }
  return icons[orderInfo.value.order_status] || 'clock'
})

const statusColor = computed(() => {
  const colors = { 0: '#F5222D', 1: '#FAAD14', 2: '#4A9EFF', 3: '#52C41A', 4: '#999', 5: '#FAAD14' }
  return colors[orderInfo.value.order_status] || '#666'
})

const showFooter = computed(() => {
  return [0, 2, 3].includes(orderInfo.value.order_status)
})

const footerActions = computed(() => {
  const actions = []
  switch (orderInfo.value.order_status) {
    case 0:
      actions.push({ type: 'cancel', label: '取消订单' }, { type: 'pay', label: '去支付' })
      break
    case 2:
      actions.push({ type: 'logistics', label: '查看物流' }, { type: 'confirm', label: '确认收货' })
      break
    case 3:
      actions.push({ type: 'after', label: '申请售后' }, { type: 'review', label: '评价' })
      break
  }
  return actions
})

const loadOrderDetail = async () => {
  try {
    const res = await getOrderDetail(route.query.id)
    orderInfo.value = res.data
    // TODO: 加载物流信息
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const handleAction = async (action) => {
  switch (action.type) {
    case 'pay':
      uni.navigateTo({ url: `/pages/order/pay?id=${orderInfo.value.id}` })
      break
    case 'cancel':
      uni.showModal({
        title: '提示',
        content: '确定取消订单吗？',
        success: async (res) => {
          if (res.confirm) {
            await cancelOrder(orderInfo.value.id)
            uni.showToast({ title: '订单已取消' })
            loadOrderDetail()
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
            await confirmOrder(orderInfo.value.id)
            uni.showToast({ title: '确认成功' })
            loadOrderDetail()
          }
        }
      })
      break
    case 'logistics':
      uni.navigateTo({ url: `/pages/order/logistics?id=${orderInfo.value.id}` })
      break
  }
}

const copyOrderNo = () => {
  uni.setClipboardData({
    data: orderInfo.value.order_no,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 140rpx;
}

.status-card {
  background: linear-gradient(135deg, #FF8C42, #FFB380);
  padding: 48rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .status-icon {
    margin-bottom: 16rpx;
  }

  .status-text {
    font-size: 36rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 24rpx;
  }

  .status-actions {
    display: flex;
    gap: 16rpx;

    .status-btn {
      padding: 16rpx 48rpx;
      font-size: 28rpx;
      border-radius: 32rpx;

      &.pay {
        background-color: #fff;
        color: #FF8C42;
      }

      &.cancel {
        background-color: rgba(255,255,255,0.3);
        color: #fff;
      }
    }
  }
}

.section-title {
  display: flex;
  align-items: center;
  padding: 24rpx 24rpx 16rpx;
  background-color: #fff;

  .title-text {
    margin-left: 12rpx;
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
  }
}

.logistics-section {
  margin-bottom: 24rpx;

  .logistics-content {
    background-color: #fff;
    padding: 24rpx;

    .logistics-row {
      display: flex;
      margin-bottom: 16rpx;

      .logistics-label {
        font-size: 26rpx;
        color: #999;
        width: 180rpx;
      }

      .logistics-value {
        flex: 1;
        font-size: 26rpx;
        color: #333;
      }
    }

    .logistics-trace {
      margin-top: 24rpx;
      padding-top: 24rpx;
      border-top: 1rpx solid #f0f0f0;

      .trace-item {
        display: flex;
        margin-bottom: 24rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .trace-dot {
          width: 16rpx;
          height: 16rpx;
          border-radius: 50%;
          background-color: #ddd;
          margin-right: 16rpx;
          flex-shrink: 0;

          &.active {
            background-color: #FF8C42;
          }
        }

        .trace-content {
          flex: 1;

          .trace-time {
            display: block;
            font-size: 24rpx;
            color: #999;
            margin-bottom: 8rpx;
          }

          .trace-info {
            display: block;
            font-size: 26rpx;
            color: #333;
          }
        }
      }
    }
  }
}

.address-section {
  margin-bottom: 24rpx;

  .address-content {
    background-color: #fff;
    padding: 24rpx;

    .address-row {
      margin-bottom: 12rpx;

      .address-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        margin-right: 24rpx;
      }

      .address-phone {
        font-size: 28rpx;
        color: #666;
      }
    }

    .address-detail {
      display: block;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

.goods-section {
  margin-bottom: 24rpx;

  .goods-list {
    background-color: #fff;
    padding: 24rpx;

    .goods-item {
      display: flex;
      padding-bottom: 24rpx;
      margin-bottom: 24rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        padding-bottom: 0;
        margin-bottom: 0;
        border-bottom: none;
      }

      .goods-image {
        width: 160rpx;
        height: 160rpx;
        border-radius: 8rpx;
        margin-right: 24rpx;
      }

      .goods-info {
        flex: 1;

        .goods-name {
          display: block;
          font-size: 28rpx;
          color: #333;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .goods-spec {
          display: block;
          font-size: 22rpx;
          color: #999;
          margin-top: 8rpx;
        }

        .goods-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16rpx;

          .goods-price {
            font-size: 32rpx;
            font-weight: 600;
            color: #FF8C42;
          }

          .goods-quantity {
            font-size: 26rpx;
            color: #999;
          }
        }
      }
    }
  }
}

.amount-section {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .amount-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;

    .amount-label {
      font-size: 28rpx;
      color: #666;
    }

    .amount-value {
      font-size: 28rpx;
      color: #333;

      &.text-success {
        color: #52C41A;
      }
    }

    &.amount-total {
      border-top: 1rpx solid #f0f0f0;
      margin-top: 16rpx;
      padding-top: 16rpx;

      .amount-total-price {
        font-size: 40rpx;
        font-weight: 600;
        color: #F5222D;
      }
    }
  }
}

.order-info-section {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .info-list {
    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-size: 26rpx;
        color: #999;
      }

      .info-value {
        font-size: 26rpx;
        color: #333;
      }
    }
  }
}

.order-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);

  .footer-actions {
    display: flex;
    gap: 16rpx;

    .footer-btn {
      padding: 16rpx 40rpx;
      font-size: 28rpx;
      border-radius: 32rpx;

      &.pay {
        background: linear-gradient(135deg, #FF8C42, #FFB380);
        color: #fff;
        border: none;
      }

      &.cancel, &.after {
        background-color: #fff;
        color: #666;
        border: 1rpx solid #ddd;
      }

      &.confirm {
        background: linear-gradient(135deg, #FF8C42, #FFB380);
        color: #fff;
        border: none;
      }
    }
  }
}
</style>
