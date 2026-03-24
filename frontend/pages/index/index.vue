<template>
  <view class="index-page">
    <!-- 搜索栏 -->
    <view class="search-bar" @click="goToSearch">
      <view class="search-icon">
        <uni-icons type="search" size="20" color="#999"></uni-icons>
      </view>
      <text class="placeholder">搜索商品/品牌</text>
    </view>

    <!-- Banner 轮播 -->
    <swiper class="banner" :indicator-dots="true" :autoplay="true" :interval="5000" :circular="true">
      <swiper-item v-for="(item, index) in banners" :key="index">
        <image :src="item.image" mode="aspectFill" class="banner-image" @click="onBannerClick(item)"></image>
      </swiper-item>
    </swiper>

    <!-- 分类导航 -->
    <view class="nav-grid">
      <view
        v-for="(item, index) in categories"
        :key="index"
        class="nav-item"
        @click="goToCategory(item.id)"
      >
        <image :src="item.icon" class="nav-icon"></image>
        <text class="nav-text">{{ item.name }}</text>
      </view>
    </view>

    <!-- 热销推荐 -->
    <view class="product-section">
      <view class="section-header">
        <text class="section-title">热销推荐</text>
        <text class="section-more" @click="goToList">查看更多 ></text>
      </view>

      <!-- 商品列表 -->
      <view class="product-list">
        <product-card
          v-for="item in products"
          :key="item.id"
          :product="item"
          @click="goToDetail(item.id)"
        ></product-card>
      </view>
    </view>

    <!-- 骨架屏加载 -->
    <loading-skeleton v-if="loading"></loading-skeleton>

    <!-- 空状态 -->
    <empty-state
      v-if="!loading && products.length === 0"
      message="暂无商品"
    ></empty-state>

    <!-- 底部占位 -->
    <view style="height: 200rpx;"></view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBanners, getHomeProducts, getCategories } from '@/api/product'
import ProductCard from '@/components/product-card.vue'
import LoadingSkeleton from '@/components/loading-skeleton.vue'
import EmptyState from '@/components/empty-state.vue'

const banners = ref([])
const categories = ref([
  { id: 1, name: '主粮', icon: '/static/pet-elements/food.png' },
  { id: 2, name: '零食', icon: '/static/pet-elements/snack.png' },
  { id: 3, name: '用品', icon: '/static/pet-elements/supply.png' },
  { id: 4, name: '玩具', icon: '/static/pet-elements/toy.png' },
  { id: 5, name: '窝垫', icon: '/static/pet-elements/bed.png' },
  { id: 6, name: '服饰', icon: '/static/pet-elements/clothes.png' }
])
const products = ref([])
const loading = ref(true)

const loadData = async () => {
  loading.value = true
  try {
    // 获取商品数据
    const productRes = await getHomeProducts()
    products.value = productRes.data || []
  } catch (error) {
    console.log('加载商品失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})

const goToSearch = () => {
  uni.navigateTo({ url: '/pages/search/index' })
}

const goToCategory = (id) => {
  uni.switchTab({ url: `/pages/category/index?catId=${id}` })
}

const goToList = () => {
  uni.switchTab({ url: '/pages/product/list' })
}

const goToDetail = (id) => {
  uni.navigateTo({ url: `/pages/product/detail?id=${id}` })
}

const onBannerClick = (item) => {
  if (item.link) {
    uni.navigateTo({ url: item.link })
  }
}
</script>

<style lang="scss" scoped>
.index-page {
  padding-bottom: 24rpx;
  background-color: #f5f5f5;
}

.search-bar {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #fff;
  border-radius: 0 0 12rpx 12rpx;

  .search-icon {
    margin-right: 16rpx;
  }

  .placeholder {
    color: #999;
    font-size: 28rpx;
  }
}

.banner {
  height: 300rpx;
  margin: 24rpx 24rpx 0;
  border-radius: 12rpx;
  overflow: hidden;

  .banner-image {
    width: 100%;
    height: 100%;
  }
}

.nav-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 32rpx 24rpx;
  background-color: #fff;
  margin-top: 24rpx;
}

.nav-item {
  width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16rpx;

  .nav-icon {
    width: 80rpx;
    height: 80rpx;
    margin-bottom: 8rpx;
  }

  .nav-text {
    font-size: 24rpx;
    color: #666;
  }
}

.product-section {
  margin-top: 24rpx;
  background-color: #fff;
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .section-more {
    font-size: 24rpx;
    color: #999;
  }
}

.product-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
</style>
