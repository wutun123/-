<template>
  <view class="product-card" @click="$emit('click')">
    <image :src="product.main_image" mode="aspectFill" class="product-image"></image>
    <view class="product-info">
      <text class="product-name">{{ product.name }}</text>
      <text class="product-desc">{{ product.description }}</text>
      <view class="price-row">
        <text class="price">¥{{ formatPrice(product.price) }}</text>
        <text class="original-price" v-if="product.original_price">¥{{ formatPrice(product.original_price) }}</text>
      </view>
      <text class="sales">销量 {{ formatSales(product.sales) }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['click'])

const formatPrice = (price) => {
  return Number(price).toFixed(2)
}

const formatSales = (sales) => {
  return sales >= 10000 ? (sales / 10000).toFixed(1) + '万' : sales
}
</script>

<style lang="scss" scoped>
.product-card {
  width: 340rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 24rpx;
}

.product-image {
  width: 100%;
  height: 340rpx;
}

.product-info {
  padding: 16rpx;
}

.product-name {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.product-desc {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-top: 16rpx;

  .price {
    font-size: 34rpx;
    font-weight: 600;
    color: #FF8C42;
  }

  .original-price {
    font-size: 24rpx;
    color: #999;
    text-decoration: line-through;
    margin-left: 12rpx;
  }
}

.sales {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}
</style>
