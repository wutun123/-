<template>
  <view class="address-page">
    <!-- 地址列表 -->
    <view class="address-list" v-if="addresses.length > 0">
      <view
        class="address-item"
        v-for="item in addresses"
        :key="item.id"
        @click="handleAddressClick(item)"
      >
        <view class="address-header">
          <text class="receiver-name">{{ item.receiver_name }}</text>
          <text class="receiver-phone">{{ item.receiver_phone }}</text>
          <text class="default-tag" v-if="item.is_default">默认</text>
        </view>
        <text class="address-detail">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail_address }}</text>
        <view class="address-actions">
          <view class="action-btn" @click.stop="editAddress(item)">
            <uni-icons type="compose" size="18" color="#666"></uni-icons>
            <text class="action-text">编辑</text>
          </view>
          <view class="action-btn" @click.stop="deleteAddress(item)">
            <uni-icons type="trash" size="18" color="#F5222D"></uni-icons>
            <text class="action-text">删除</text>
          </view>
          <view class="action-btn" @click.stop="setDefaultAddress(item)" v-if="!item.is_default">
            <uni-icons type="checkmarkempty" size="18" color="#FF8C42"></uni-icons>
            <text class="action-text">设为默认</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <empty-state
      v-else
      message="暂无收货地址"
      :show-button="false"
    ></empty-state>

    <!-- 底部添加按钮 -->
    <view class="add-btn-wrapper" v-if="!isSelectMode">
      <button class="add-btn" @click="goToAdd">
        <uni-icons type="plus" size="20" color="#fff"></uni-icons>
        <text class="add-text">新增地址</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'uni-app/composables'
import { getUserAddresses, deleteAddress, setDefaultAddress } from '@/api/user'
import EmptyState from '@/components/empty-state.vue'

const route = useRoute()
const addresses = ref([])
const isSelectMode = ref(false)

const isSelectMode = ref(false)
const selectMode = ref(false)

onMounted(() => {
  isSelectMode.value = route.query.select === 'true'
  loadAddresses()
})

const loadAddresses = async () => {
  try {
    const res = await getUserAddresses()
    addresses.value = res.data || []
  } catch (error) {
    console.log('加载地址失败')
  }
}

const handleAddressClick = (item) => {
  if (isSelectMode.value) {
    // 返回选中的地址
    uni.navigateBack({
      url: `/pages/order/confirm?address_id=${item.id}`
    })
  }
}

const editAddress = (item) => {
  uni.navigateTo({
    url: `/pages/user/address-edit?id=${item.id}`
  })
}

const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/user/address-edit'
  })
}

const deleteAddress = async (item) => {
  uni.showModal({
    title: '提示',
    content: '确定删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteAddress(item.id)
          uni.showToast({ title: '删除成功' })
          loadAddresses()
        } catch (error) {
          uni.showToast({ title: '删除失败', icon: 'none' })
        }
      }
    }
  })
}

const setDefaultAddress = async (item) => {
  try {
    await setDefaultAddress(item.id)
    uni.showToast({ title: '设置成功' })
    loadAddresses()
  } catch (error) {
    uni.showToast({ title: '设置失败', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
.address-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 140rpx;
}

.address-list {
  padding: 24rpx;
}

.address-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .address-header {
    display: flex;
    align-items: center;
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

    .default-tag {
      margin-left: 16rpx;
      padding: 4rpx 12rpx;
      background-color: #FF8C42;
      color: #fff;
      font-size: 22rpx;
      border-radius: 4rpx;
    }
  }

  .address-detail {
    display: block;
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 24rpx;
  }

  .address-actions {
    display: flex;
    gap: 24rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #f0f0f0;

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .action-text {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.add-btn-wrapper {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  background: linear-gradient(135deg, #FF8C42, #FFB380);
  border-radius: 44rpx;
  border: none;

  .add-text {
    margin-left: 8rpx;
    font-size: 30rpx;
    color: #fff;
    font-weight: 600;
  }
}
</style>
