<template>
  <view class="user-page">
    <!-- 用户信息卡片 -->
    <view class="user-header" v-if="isLoggedIn">
      <view class="user-info">
        <image :src="userInfo.avatar || '/static/images/default-avatar.png'" class="user-avatar"></image>
        <view class="user-detail">
          <text class="user-nickname">{{ userInfo.nickname || '宠星球用户' }}</text>
          <text class="user-level">会员等级：{{ levelText }}</text>
        </view>
        <uni-icons type="right" color="#999" size="16"></uni-icons>
      </view>
      <!-- 数据概览 -->
      <view class="user-stats">
        <view class="stat-item" @click="goToOrders(0)">
          <text class="stat-value">{{ stats.order_count }}</text>
          <text class="stat-label">全部订单</text>
        </view>
        <view class="stat-item" @click="goToOrders(1)">
          <text class="stat-value">{{ stats.pending_payment }}</text>
          <text class="stat-label">待付款</text>
        </view>
        <view class="stat-item" @click="goToOrders(2)">
          <text class="stat-value">{{ stats.pending_delivery }}</text>
          <text class="stat-label">待发货</text>
        </view>
        <view class="stat-item" @click="goToOrders(3)">
          <text class="stat-value">{{ stats.pending_receive }}</text>
          <text class="stat-label">待收货</text>
        </view>
        <view class="stat-item" @click="goToAfterSale">
          <text class="stat-value">{{ stats.after_sale }}</text>
          <text class="stat-label">售后</text>
        </view>
      </view>
    </view>

    <!-- 未登录提示 -->
    <view class="user-header" v-else @click="goToLogin">
      <view class="login-tip">
        <text class="tip-text">点击登录，享受更多优惠</text>
        <button class="login-btn">立即登录</button>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-title">我的服务</view>
      <view class="menu-list">
        <view class="menu-item" @click="goToAddress">
          <uni-icons type="location" size="24" color="#FF8C42"></uni-icons>
          <text class="menu-label">收货地址</text>
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="goToFavorites">
          <uni-icons type="heart" size="24" color="#FF8C42"></uni-icons>
          <text class="menu-label">我的收藏</text>
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="goToCoupons">
          <uni-icons type="wallet" size="24" color="#FF8C42"></uni-icons>
          <text class="menu-label">优惠券</text>
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 分销中心入口 -->
    <view class="menu-section" v-if="isDistributor">
      <view class="menu-title">分销中心</view>
      <view class="menu-list">
        <view class="menu-item" @click="goToDistributor">
          <uni-icons type="staff" size="24" color="#FF8C42"></uni-icons>
          <text class="menu-label">我的团队</text>
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="goToCommission">
          <uni-icons type="money-yen" size="24" color="#FF8C42"></uni-icons>
          <text class="menu-label">佣金记录</text>
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 未成为分销商 -->
    <view class="distributor-tip" v-else @click="goToDistributor">
      <view class="tip-content">
        <text class="tip-title">成为分销商 赚取佣金</text>
        <text class="tip-desc">推广赚佣 邀请好友一起赚</text>
      </view>
      <button class="apply-btn">立即申请</button>
    </view>

    <!-- 其他功能 -->
    <view class="menu-section">
      <view class="menu-list">
        <view class="menu-item" @click="goToFeedback">
          <uni-icons type="chat" size="24" color="#666"></uni-icons>
          <text class="menu-label">意见反馈</text>
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
        <view class="menu-item" @click="goToAbout">
          <uni-icons type="info" size="24" color="#666"></uni-icons>
          <text class="menu-label">关于我们</text>
          <uni-icons type="right" size="14" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserProfile } from '@/api/auth'
import { getDistributorInfo } from '@/api/distributor'

const isLoggedIn = ref(false)
const userInfo = ref(null)
const isDistributor = ref(false)
const stats = ref({
  order_count: 0,
  pending_payment: 0,
  pending_delivery: 0,
  pending_receive: 0,
  after_sale: 0
})

const levelText = computed(() => {
  const levels = { 1: '普通会员', 2: 'VIP 会员' }
  return levels[userInfo.value?.member_level] || '普通会员'
})

const loadUserInfo = async () => {
  try {
    const res = await getUserProfile()
    userInfo.value = res.data
    isLoggedIn.value = true
  } catch (error) {
    isLoggedIn.value = false
  }
}

const checkDistributor = async () => {
  try {
    const res = await getDistributorInfo()
    isDistributor.value = res.data?.is_distributor || false
  } catch (error) {
    console.log('检查分销商状态失败')
  }
}

onMounted(() => {
  loadUserInfo()
  checkDistributor()
})

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/user/login' })
}

const goToOrders = (status) => {
  uni.navigateTo({ url: `/pages/order/list?status=${status}` })
}

const goToAfterSale = () => {
  uni.navigateTo({ url: '/pages/order/list?status=5' })
}

const goToAddress = () => {
  uni.navigateTo({ url: '/pages/user/address' })
}

const goToFavorites = () => {
  uni.navigateTo({ url: '/pages/user/favorite' })
}

const goToCoupons = () => {
  uni.navigateTo({ url: '/pages/user/coupons' })
}

const goToDistributor = () => {
  uni.navigateTo({ url: '/pages/distributor/index' })
}

const goToCommission = () => {
  uni.navigateTo({ url: '/pages/distributor/commission' })
}

const goToFeedback = () => {
  uni.navigateTo({ url: '/pages/user/feedback' })
}

const goToAbout = () => {
  uni.navigateTo({ url: '/pages/user/about' })
}
</script>

<style lang="scss" scoped>
.user-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-header {
  background: linear-gradient(135deg, #FF8C42, #FFB380);
  padding: 40rpx 24rpx 24rpx;
  margin-bottom: 24rpx;

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;

    .user-avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 4rpx solid rgba(255,255,255,0.3);
    }

    .user-detail {
      flex: 1;
      margin-left: 24rpx;
      display: flex;
      flex-direction: column;

      .user-nickname {
        font-size: 32rpx;
        font-weight: 600;
        color: #fff;
      }

      .user-level {
        font-size: 24rpx;
        color: rgba(255,255,255,0.9);
        margin-top: 8rpx;
      }
    }
  }

  .user-stats {
    display: flex;
    justify-content: space-around;
    background-color: rgba(255,255,255,0.2);
    border-radius: 16rpx;
    padding: 24rpx 0;

    .stat-item {
      text-align: center;

      .stat-value {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: #fff;
      }

      .stat-label {
        display: block;
        font-size: 22rpx;
        color: rgba(255,255,255,0.9);
        margin-top: 8rpx;
      }
    }
  }

  .login-tip {
    display: flex;
    flex-direction: column;
    align-items: center;

    .tip-text {
      font-size: 28rpx;
      color: rgba(255,255,255,0.9);
      margin-bottom: 24rpx;
    }

    .login-btn {
      background-color: #fff;
      color: #FF8C42;
      border-radius: 40rpx;
      padding: 16rpx 64rpx;
      font-size: 28rpx;
    }
  }
}

.menu-section {
  background-color: #fff;
  margin-bottom: 24rpx;
  padding: 24rpx;

  .menu-title {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .menu-list {
    .menu-item {
      display: flex;
      align-items: center;
      padding: 24rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .menu-label {
        flex: 1;
        margin-left: 16rpx;
        font-size: 28rpx;
        color: #333;
      }
    }
  }
}

.distributor-tip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #FF8C42, #FFB380);
  margin: 24rpx;
  padding: 24rpx;
  border-radius: 16rpx;

  .tip-content {
    .tip-title {
      display: block;
      font-size: 28rpx;
      font-weight: 600;
      color: #fff;
    }

    .tip-desc {
      display: block;
      font-size: 22rpx;
      color: rgba(255,255,255,0.9);
      margin-top: 8rpx;
    }
  }

  .apply-btn {
    background-color: #fff;
    color: #FF8C42;
    border-radius: 32rpx;
    padding: 12rpx 32rpx;
    font-size: 26rpx;
  }
}
</style>
