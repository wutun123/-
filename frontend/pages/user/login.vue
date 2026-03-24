<template>
  <view class="login-page">
    <view class="login-content">
      <!-- Logo -->
      <view class="logo-section">
        <image class="logo" src="/static/images/logo.png" mode="aspectFit"></image>
        <text class="app-name">宠星球</text>
        <text class="app-slogan">宠爱每一只小星球</text>
      </view>

      <!-- 登录按钮 -->
      <view class="login-actions">
        <button class="login-btn-wechat" @click="wechatLogin">
          <image class="wechat-icon" src="/static/icons/wechat.png"></image>
          <text class="btn-text">微信一键登录</text>
        </button>

        <view class="agreement-tip">
          <text>登录即表示您同意</text>
          <text class="link" @click.stop="showUserAgreement">《用户协议》</text>
          <text>和</text>
          <text class="link" @click.stop="showPrivacyPolicy">《隐私政策》</text>
        </view>
      </view>

      <!-- 其他登录方式 -->
      <view class="other-login">
        <text class="other-text">其他登录方式</text>
        <view class="other-icons">
          <view class="other-icon" @click="phoneLogin">
            <uni-icons type="staff" size="28" color="#666"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部版权信息 -->
    <view class="footer">
      <text class="copyright">© 2026 宠星球 Pet Universe</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { wechatLogin } from '@/api/auth'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const agreeing = ref(false)

const wechatLoginHandler = async () => {
  uni.showLoading({ title: '登录中...' })

  try {
    // 微信登录
    const loginRes = await uni.login({ provider: 'weixin' })

    // 调用后端接口
    const res = await wechatLogin(loginRes.code)

    // 保存用户信息
    userStore.setToken(res.data.token)
    userStore.setUserInfo(res.data.user)

    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })

    // 跳转回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  }
}

const phoneLogin = () => {
  uni.navigateTo({ url: '/pages/user/phone-login' })
}

const showUserAgreement = () => {
  uni.showModal({
    title: '用户协议',
    content: '这里是用户协议内容...',
    showCancel: false
  })
}

const showPrivacyPolicy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '这里是隐私政策内容...',
    showCancel: false
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #FF8C42 0%, #FFB380 100%);
  display: flex;
  flex-direction: column;
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 48rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 120rpx;

  .logo {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 32rpx;
  }

  .app-name {
    font-size: 44rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16rpx;
  }

  .app-slogan {
    font-size: 26rpx;
    color: rgba(255,255,255,0.9);
  }
}

.login-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-btn-wechat {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 48rpx;
  margin-bottom: 32rpx;
  border: none;

  .wechat-icon {
    width: 48rpx;
    height: 48rpx;
    margin-right: 16rpx;
  }

  .btn-text {
    font-size: 32rpx;
    color: #07C160;
    font-weight: 600;
  }
}

.agreement-tip {
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);

  .link {
    color: #fff;
    text-decoration: underline;
  }
}

.other-login {
  margin-top: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .other-text {
    font-size: 26rpx;
    color: rgba(255,255,255,0.8);
    margin-bottom: 32rpx;
  }

  .other-icons {
    display: flex;
    gap: 48rpx;
  }

  .other-icon {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255,255,255,0.2);
    border-radius: 50%;
  }
}

.footer {
  padding: 48rpx 0;
  text-align: center;

  .copyright {
    font-size: 24rpx;
    color: rgba(255,255,255,0.6);
  }
}
</style>
