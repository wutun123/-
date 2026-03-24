<template>
  <view class="cart-page">
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="page-title">购物车</text>
      <text class="edit-btn" @click="toggleEditMode">{{ isEditMode ? '完成' : '管理' }}</text>
    </view>

    <!-- 购物车列表 -->
    <view class="cart-list" v-if="cartItems.length > 0">
      <view
        class="cart-item"
        v-for="item in cartItems"
        :key="item.sku_id"
      >
        <view class="item-checkbox" @click="toggleSelect(item.sku_id)">
          <uni-icons
            :type="item.selected ? 'checkbox-filled' : 'circle'"
            :color="item.selected ? '#FF8C42' : '#CCCCCC'"
            size="20"
          ></uni-icons>
        </view>

        <image :src="item.main_image" mode="aspectFill" class="item-image"></image>

        <view class="item-info">
          <text class="item-name">{{ item.product_name }}</text>
          <text class="item-spec">{{ item.sku_spec }}</text>
          <view class="item-bottom">
            <text class="item-price">¥{{ item.price }}</text>
            <view class="item-quantity" v-if="!isEditMode">
              <view class="quantity-btn" @click="decreaseQuantity(item)">
                <uni-icons type="minus" size="16" color="#999"></uni-icons>
              </view>
              <text class="quantity-value">{{ item.quantity }}</text>
              <view class="quantity-btn" @click="increaseQuantity(item)">
                <uni-icons type="plus" size="16" color="#999"></uni-icons>
              </view>
            </view>
            <text v-else class="delete-btn" @click="deleteItem(item.sku_id)">删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <empty-state
      v-else
      message="购物车空空如也"
      button-text="去逛逛"
      @click="goToShopping"
    ></empty-state>

    <!-- 底部结算栏 -->
    <view class="cart-footer" v-if="cartItems.length > 0">
      <view class="footer-left">
        <view class="select-all" @click="toggleSelectAll">
          <uni-icons
            :type="isAllSelected ? 'checkbox-filled' : 'circle'"
            :color="isAllSelected ? '#FF8C42' : '#CCCCCC'"
            size="20"
          ></uni-icons>
          <text class="select-all-text">全选</text>
        </view>
        <view class="total-info">
          <text class="total-text">合计：</text>
          <text class="total-price">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
      </view>
      <view class="checkout-btn" @click="goToCheckout">
        结算 ({{ selectedCount }})
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCartList, updateCartItemQuantity, deleteCartItem } from '@/api/cart'
import { useCartStore } from '@/stores/cart'
import EmptyState from '@/components/empty-state.vue'

const cartStore = useCartStore()
const cartItems = ref([])
const isEditMode = ref(false)

const isAllSelected = computed(() => {
  return cartItems.value.every(item => item.selected)
})

const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const loadCart = async () => {
  try {
    const res = await getCartList()
    cartItems.value = res.data || []
  } catch (error) {
    console.log('加载购物车失败')
  }
}

onMounted(() => {
  loadCart()
})

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const toggleSelect = (skuId) => {
  const item = cartItems.value.find(i => i.sku_id === skuId)
  if (item) {
    item.selected = !item.selected
  }
}

const toggleSelectAll = () => {
  const newStatus = !isAllSelected.value
  cartItems.value.forEach(item => {
    item.selected = newStatus
  })
}

const increaseQuantity = async (item) => {
  item.quantity++
  await updateCartItemQuantity(item.sku_id, item.quantity)
}

const decreaseQuantity = async (item) => {
  if (item.quantity <= 1) return
  item.quantity--
  await updateCartItemQuantity(item.sku_id, item.quantity)
}

const deleteItem = async (skuId) => {
  uni.showModal({
    title: '提示',
    content: '确定删除该商品吗？',
    success: async (res) => {
      if (res.confirm) {
        await deleteCartItem(skuId)
        cartItems.value = cartItems.value.filter(i => i.sku_id !== skuId)
      }
    }
  })
}

const goToCheckout = () => {
  const selectedItems = cartItems.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }
  uni.navigateTo({
    url: `/pages/order/confirm?items=${encodeURIComponent(JSON.stringify(selectedItems))}`
  })
}

const goToShopping = () => {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx;
  background-color: #fff;

  .page-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .edit-btn {
    font-size: 28rpx;
    color: #666;
  }
}

.cart-list {
  padding: 24rpx;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  background-color: #fff;
  border-radius: 12rpx;
  margin-bottom: 24rpx;

  .item-checkbox {
    margin-top: 20rpx;
    margin-right: 16rpx;
  }

  .item-image {
    width: 180rpx;
    height: 180rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    margin-left: 24rpx;
    display: flex;
    flex-direction: column;

    .item-name {
      font-size: 28rpx;
      color: #333;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-spec {
      font-size: 22rpx;
      color: #999;
      margin-top: 8rpx;
      padding: 4rpx 12rpx;
      background-color: #f5f5f5;
      border-radius: 4rpx;
      width: fit-content;
    }

    .item-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16rpx;

      .item-price {
        font-size: 34rpx;
        font-weight: 600;
        color: #FF8C42;
      }

      .item-quantity {
        display: flex;
        align-items: center;

        .quantity-btn {
          width: 56rpx;
          height: 56rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1rpx solid #ddd;
          border-radius: 8rpx;
        }

        .quantity-value {
          margin: 0 16rpx;
          font-size: 28rpx;
          color: #333;
          min-width: 60rpx;
          text-align: center;
        }
      }

      .delete-btn {
        font-size: 26rpx;
        color: #F5222D;
      }
    }
  }
}

.cart-footer {
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
    flex: 1;

    .select-all {
      display: flex;
      align-items: center;
      margin-right: 24rpx;

      .select-all-text {
        margin-left: 8rpx;
        font-size: 28rpx;
        color: #666;
      }
    }

    .total-info {
      .total-text {
        font-size: 26rpx;
        color: #666;
      }

      .total-price {
        font-size: 36rpx;
        font-weight: 600;
        color: #F5222D;
      }
    }
  }

  .checkout-btn {
    padding: 16rpx 48rpx;
    background: linear-gradient(135deg, #FF8C42, #FFB380);
    color: #fff;
    font-size: 28rpx;
    border-radius: 40rpx;
  }
}
</style>
