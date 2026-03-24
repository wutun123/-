<template>
  <view class="distributor-apply-page">
    <view class="apply-content">
      <!-- 头部说明 -->
      <view class="apply-header">
        <text class="header-title">申请成为分销商</text>
        <text class="header-desc">推广赚佣金 邀请好友一起赚</text>
      </view>

      <!-- 分销权益 -->
      <view class="benefits-section">
        <view class="benefit-item">
          <view class="benefit-icon">
            <uni-icons type="money-yen" size="32" color="#FF8C42"></uni-icons>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">一级佣金 15%</text>
            <text class="benefit-desc">直接邀请好友下单，获得 15% 佣金</text>
          </view>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon">
            <uni-icons type="gift" size="32" color="#FF8C42"></uni-icons>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">二级佣金 8%</text>
            <text class="benefit-desc">间接邀请好友下单，获得 8% 佣金</text>
          </view>
        </view>
        <view class="benefit-item">
          <view class="benefit-icon">
            <uni-icons type="wallet" size="32" color="#FF8C42"></uni-icons>
          </view>
          <view class="benefit-content">
            <text class="benefit-title">微信分账</text>
            <text class="benefit-desc">佣金直接打入微信零钱，安全快速</text>
          </view>
        </view>
      </view>

      <!-- 申请表单 -->
      <view class="apply-form">
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input
            class="form-input"
            v-model="formData.nickname"
            placeholder="请输入您的昵称"
            maxlength="20"
          />
        </view>
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            class="form-input"
            v-model="formData.phone"
            type="number"
            maxlength="11"
            placeholder="请输入您的手机号"
          />
        </view>
        <view class="form-item">
          <text class="form-label">申请原因</text>
          <textarea
            class="form-textarea"
            v-model="formData.reason"
            placeholder="请简单说明您的申请原因（选填）"
            maxlength="200"
          />
        </view>
        <view class="form-tip">
          <uni-icons type="info" size="16" color="#999"></uni-icons>
          <text class="tip-text">提交后我们将在 1-3 个工作日内完成审核</text>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-btn-wrapper">
        <button class="submit-btn" @click="handleSubmit" :loading="submitting">
          提交申请
        </button>
      </view>

      <!-- 升级条件 -->
      <view class="upgrade-section">
        <view class="section-title">升级条件</view>
        <view class="upgrade-card">
          <view class="upgrade-item">
            <text class="upgrade-num">累计消费 ¥1000</text>
            <text class="upgrade-desc">或</text>
          </view>
          <view class="upgrade-item">
            <text class="upgrade-num">直推 10 人</text>
            <text class="upgrade-desc">满足任一条件即可升级为银牌分销商</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { getUserProfile } from '@/api/auth'
import { applyDistributor } from '@/api/distributor'

const formData = ref({
  nickname: '',
  phone: '',
  reason: ''
})
const submitting = ref(false)

const handleSubmit = async () => {
  // 验证必填项
  if (!formData.value.nickname) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  // 验证手机号
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(formData.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  submitting.value = true

  try {
    await applyDistributor({
      nickname: formData.value.nickname,
      phone: formData.value.phone,
      reason: formData.value.reason
    })

    uni.showModal({
      title: '提示',
      content: '申请已提交，请等待审核结果',
      showCancel: false,
      success: () => {
        uni.navigateBack()
      }
    })
  } catch (error) {
    uni.showToast({ title: error.message || '申请失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.distributor-apply-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.apply-content {
  padding: 24rpx;
}

.apply-header {
  text-align: center;
  padding: 40rpx 0;

  .header-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }

  .header-desc {
    display: block;
    font-size: 26rpx;
    color: #999;
  }
}

.benefits-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .benefit-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    .benefit-icon {
      width: 80rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #FFF5F0;
      border-radius: 50%;
      margin-right: 24rpx;
    }

    .benefit-content {
      flex: 1;

      .benefit-title {
        display: block;
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
      }

      .benefit-desc {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
      }
    }
  }
}

.apply-form {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

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
      height: 88rpx;
      background-color: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 28rpx;
      color: #333;
    }

    .form-textarea {
      width: 100%;
      height: 200rpx;
      background-color: #f5f5f5;
      border-radius: 12rpx;
      padding: 24rpx;
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
    }
  }

  .form-tip {
    display: flex;
    align-items: center;
    padding: 16rpx;
    background-color: #FFF5F0;
    border-radius: 8rpx;

    .tip-text {
      margin-left: 8rpx;
      font-size: 24rpx;
      color: #999;
    }
  }
}

.submit-btn-wrapper {
  margin-bottom: 24rpx;

  .submit-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #FF8C42, #FFB380);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 44rpx;
    border: none;
  }
}

.upgrade-section {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
  }

  .upgrade-card {
    .upgrade-item {
      text-align: center;
      padding: 24rpx 0;

      .upgrade-num {
        display: block;
        font-size: 36rpx;
        font-weight: 600;
        color: #FF8C42;
      }

      .upgrade-desc {
        display: block;
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
      }
    }
  }
}
</style>
