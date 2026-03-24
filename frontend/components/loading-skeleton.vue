<template>
  <view class="loading-skeleton">
    <view class="skeleton-item" v-for="i in 6" :key="i">
      <view class="skeleton-image"></view>
      <view class="skeleton-text skeleton-text-title"></view>
      <view class="skeleton-text skeleton-text-desc"></view>
      <view class="skeleton-text skeleton-text-price"></view>
    </view>
  </view>
</template>

<script setup>
// 骨架屏组件 - 加载时显示
</script>

<style lang="scss" scoped>
.loading-skeleton {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 24rpx;
  background-color: #fff;
}

.skeleton-item {
  width: 340rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.skeleton-image {
  width: 100%;
  height: 340rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-text {
  height: 24rpx;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin: 16rpx 16rpx 0;
  border-radius: 4rpx;
}

.skeleton-text-title {
  height: 32rpx;
  width: 80%;
}

.skeleton-text-desc {
  width: 60%;
}

.skeleton-text-price {
  width: 40%;
  margin-bottom: 16rpx;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
