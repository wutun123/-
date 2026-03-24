<template>
  <view class="category-page">
    <!-- 左侧分类列表 -->
    <scroll-view class="category-left" scroll-y>
      <view
        v-for="item in categories"
        :key="item.id"
        :class="['category-item', { active: currentCategoryId === item.id }]"
        @click="selectCategory(item.id)"
      >
        <image v-if="item.icon" :src="item.icon" class="category-icon"></image>
        <text class="category-name">{{ item.name }}</text>
      </view>
    </scroll-view>

    <!-- 右侧商品列表 -->
    <view class="category-right">
      <view class="goods-list">
        <product-card
          v-for="product in products"
          :key="product.id"
          :product="product"
          @click="goToDetail(product.id)"
        ></product-card>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'uni-app/composables'
import { getCategories, getProductList } from '@/api/product'
import ProductCard from '@/components/product-card.vue'

const route = useRoute()
const categories = ref([])
const products = ref([])
const currentCategoryId = ref(1)

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data || []
    if (categories.value.length > 0) {
      currentCategoryId.value = categories.value[0].id
      loadProducts()
    }
  } catch (error) {
    console.log('加载分类失败')
  }
}

const loadProducts = async () => {
  try {
    const res = await getProductList({ category_id: currentCategoryId.value })
    products.value = res.data?.list || []
  } catch (error) {
    console.log('加载商品失败')
  }
}

const selectCategory = (id) => {
  currentCategoryId.value = id
  loadProducts()
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` })
}

onMounted(() => {
  loadCategories()
})
</script>

<style lang="scss" scoped>
.category-page {
  display: flex;
  height: 100vh;
}

.category-left {
  width: 200rpx;
  background-color: #f5f5f5;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 16rpx;
  background-color: #f5f5f5;

  &.active {
    background-color: #fff;
  }

  .category-icon {
    width: 64rpx;
    height: 64rpx;
    margin-bottom: 12rpx;
  }

  .category-name {
    font-size: 24rpx;
    color: #666;
  }
}

.category-right {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
}

.goods-list {
  display: flex;
  flex-wrap: wrap;
  padding: 24rpx;
  justify-content: space-between;
}
</style>
