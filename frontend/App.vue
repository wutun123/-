<script>
export default {
  onLaunch: function() {
    console.log('App Launch - 宠星球分销商城')
    // 检查登录状态
    const token = uni.getStorageSync('token')
    if (token) {
      // token 存在，验证是否过期
      this.checkToken(token)
    }
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    async checkToken(token) {
      // 验证 token 有效性
      try {
        const res = await uni.request({
          url: 'https://api.petplanet.com/api/v1/user/profile',
          header: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (res[1].statusCode !== 200) {
          // token 过期，清除本地存储
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
        }
      } catch (e) {
        console.log('Token 验证失败')
      }
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

/*每个页面公共 css*/
page {
  background-color: #f5f5f5;
  font-size: 28rpx;
  line-height: 1.5;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', STHeiti, 'Microsoft Yahei', sans-serif;
}

/* 主色 */
.text-primary {
  color: #FF8C42;
}

/* 辅助色 */
.text-secondary {
  color: #666666;
}

/* 警告色 */
.text-warning {
  color: #FAAD14;
}

/* 成功色 */
.text-success {
  color: #52C41A;
}

/* 错误色 */
.text-error {
  color: #F5222D;
}

/* 通用按钮 */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  background: linear-gradient(135deg, #FF8C42, #FFB380);
  color: #FFFFFF;
  font-size: 32rpx;
  font-weight: 500;
  border: none;

  &:active {
    opacity: 0.8;
  }
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  background-color: #FFFFFF;
  color: #FF8C42;
  font-size: 32rpx;
  border: 2rpx solid #FF8C42;

  &:active {
    opacity: 0.8;
  }
}

/* 空状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  .empty-image {
    width: 300rpx;
    height: 300rpx;
    margin-bottom: 32rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999999;
  }
}

/* 加载状态 */
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50rpx 0;
}
</style>
