<template>
  <view class="order-confirm-page">
    <!-- 收货地址 -->
    <view class="address-section" @click="chooseAddress">
      <view class="address-content" v-if="selectedAddress">
        <view class="address-row">
          <text class="receiver-name">{{ selectedAddress.receiver_name }}</text>
          <text class="receiver-phone">{{ selectedAddress.receiver_phone }}</text>
        </view>
        <view class="address-detail">
          {{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail_address }}
        </view>
      </view>
      <view class="no-address" v-else>
        <text class="no-address-text">请选择收货地址</text>
      </view>
      <uni-icons type="right" color="#999" size="16"></uni-icons>
    </view>

    <!-- 商品信息 -->
    <view class="goods-section">
      <view class="section-title">商品信息</view>
      <view class="goods-list">
        <view class="goods-item" v-for="item in orderItems" :key="item.sku_id">
          <image :src="item.main_image || '/static/images/default-product.png'" class="goods-image"></image>
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
        <text class="amount-value">¥{{ goodsAmount.toFixed(2) }}</text>
      </view>
      <view class="amount-row">
        <text class="amount-label">运费</text>
        <text class="amount-value">¥{{ freightAmount.toFixed(2) }}</text>
      </view>
      <view class="amount-row" v-if="discountAmount > 0">
        <text class="amount-label">优惠</text>
        <text class="amount-value text-success">-¥{{ discountAmount.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 备注 -->
    <view class="remark-section">
      <textarea
        class="remark-input"
        placeholder="选填：对本订单的说明"
        v-model="remark"
        maxlength="200"
      ></textarea>
    </view>

    <!-- 底部提交栏 -->
    <view class="order-footer">
      <view class="footer-left">
        <text class="total-label">实付款：</text>
        <text class="total-price">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <view class="submit-btn" @click="submitOrder">提交订单</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'uni-app/composables'
import { createOrder } from '@/api/order'
import { getUserAddresses } from '@/api/user'

const route = useRoute()
const orderItems = ref([])
const selectedAddress = ref(null)
const remark = ref('')

const goodsAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const freightAmount = computed(() => {
  return 0 // TODO: 运费模板计算
})

const discountAmount = computed(() => {
  return 0 // TODO: 优惠券计算
})

const totalAmount = computed(() => {
  return goodsAmount.value + freightAmount.value - discountAmount.value
})

const loadOrderItems = () => {
  const itemsParam = route.query.items
  if (itemsParam) {
    orderItems.value = JSON.parse(decodeURIComponent(itemsParam))
  }
}

const loadAddress = async () => {
  try {
    const res = await getUserAddresses()
    const addresses = res.data || []
    const defaultAddress = addresses.find(a => a.is_default === 1)
    selectedAddress.value = defaultAddress || addresses[0] || null
  } catch (error) {
    console.log('加载地址失败')
  }
}

const chooseAddress = () => {
  uni.navigateTo({ url: '/pages/user/address?select=true' })
}

const submitOrder = async () => {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  try {
    const items = orderItems.value.map(item => ({
      sku_id: item.sku_id,
      quantity: item.quantity
    }))

    const res = await createOrder({
      items,
      address_id: selectedAddress.value.id,
      remark: remark.value
    })

    // 跳转支付
    uni.redirectTo({
      url: `/pages/order/pay?order_id=${res.data.order_id}`
    })
  } catch (error) {
    console.log('创建订单失败')
  }
}

onMounted(() => {
  loadOrderItems()
  loadAddress()
})
</script>

<style lang="scss" scoped>
.order-confirm-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.address-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  background-color: #fff;
  margin-bottom: 24rpx;

  .address-content {
    flex: 1;

    .address-row {
      margin-bottom: 16rpx;

      .receiver-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
        margin-right: 24rpx;
      }

      .receiver-phone {
        font-size: 28rpx;
        color: #666;
      }
    }

    .address-detail {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
    }
  }

  .no-address {
    .no-address-text {
      font-size: 28rpx;
      color: #999;
    }
  }
}

.goods-section {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
  }

  .goods-list {
    .goods-item {
      display: flex;
      padding: 16rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
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
  }
}

.remark-section {
  background-color: #fff;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .remark-input {
    width: 100%;
    height: 160rpx;
    font-size: 28rpx;
    color: #333;
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
  justify-content: space-between;
  padding: 0 24rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);

  .footer-left {
    display: flex;
    align-items: center;

    .total-label {
      font-size: 26rpx;
      color: #666;
    }

    .total-price {
      font-size: 40rpx;
      font-weight: 600;
      color: #F5222D;
    }
  }

  .submit-btn {
    padding: 16rpx 48rpx;
    background: linear-gradient(135deg, #FF8C42, #FFB380);
    color: #fff;
    font-size: 28rpx;
    border-radius: 40rpx;
  }
}
</style>
