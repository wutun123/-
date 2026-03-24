<template>
  <view class="empty-state">
    <image class="empty-image" src="/static/empty-states/empty-default.png" mode="aspectFit"></image>
    <text class="empty-text">{{ message || '暂无数据' }}</text>
    <button v-if="showButton" class="empty-button" @click="$emit('click')">
      {{ buttonText || '去逛逛' }}
    </button>
  </view>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: '暂无数据'
  },
  showButton: {
    type: Boolean,
    default: true
  },
  buttonText: {
    type: String,
    default: '去逛逛'
  }
})

defineEmits(['click'])
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-image {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 32rpx;
}

.empty-button {
  margin-top: 24rpx;
  padding: 16rpx 64rpx;
  background-color: #FF8C42;
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}
</style>
