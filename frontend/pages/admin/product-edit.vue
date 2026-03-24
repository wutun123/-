<template>
  <view class="product-edit-page">
    <view class="edit-content">
      <view class="form-item">
        <text class="form-label">商品名称 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model="formData.name"
          placeholder="请输入商品名称"
          maxlength="128"
        />
      </view>

      <view class="form-item">
        <text class="form-label">商品分类 <text class="required">*</text></text>
        <picker :range="categories" range-key="name" @change="onCategoryChange">
          <view class="picker-input">
            <text v-if="selectedCategory">{{ selectedCategory.name }}</text>
            <text v-else class="placeholder">请选择商品分类</text>
            <uni-icons type="right" size="16" color="#ccc"></uni-icons>
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">商品描述</text>
        <textarea
          class="form-textarea"
          v-model="formData.description"
          placeholder="请输入商品描述"
          maxlength="500"
        />
      </view>

      <view class="form-item">
        <text class="form-label">主图 URL <text class="required">*</text></text>
        <image-uploader
          v-model="formData.main_image"
          :maxCount="1"
          uploadText="上传主图"
        />
      </view>

      <view class="form-item">
        <text class="form-label">商品图片</text>
        <image-uploader
          v-model="formData.images"
          :maxCount="9"
          uploadText="上传图片"
        />
      </view>

      <view class="form-item">
        <text class="form-label">品牌</text>
        <input
          class="form-input"
          v-model="formData.brand"
          placeholder="请输入品牌名称"
          maxlength="64"
        />
      </view>

      <view class="form-item">
        <text class="form-label">佣金比例 (%)</text>
        <input
          class="form-input"
          type="number"
          v-model="formData.commission_rate"
          placeholder="请输入佣金比例"
          step="0.1"
        />
      </view>

      <view class="form-item">
        <text class="form-label">商品状态</text>
        <view class="radio-group">
          <label class="radio-label">
            <radio :checked="formData.status === 1" color="#FF8C42" value="1" />
            <text>上架</text>
          </label>
          <label class="radio-label">
            <radio :checked="formData.status === 0" color="#FF8C42" value="0" />
            <text>下架</text>
          </label>
        </view>
      </view>

      <!-- SKU 列表 -->
      <view class="form-section">
        <view class="section-header">
          <text class="section-title">商品规格</text>
          <button class="add-sku-btn" @click="addSku">
            <uni-icons type="plus" size="16" color="#fff"></uni-icons>
            添加规格
          </button>
        </view>
        <view class="sku-list">
          <view class="sku-item" v-for="(sku, index) in formData.skus" :key="index">
            <view class="sku-header">
              <text class="sku-title">规格 {{ index + 1 }}</text>
              <text class="sku-delete" @click="removeSku(index)">删除</text>
            </view>
            <view class="sku-form">
              <view class="sku-input">
                <text class="input-label">规格名称</text>
                <input v-model="sku.spec_name" placeholder="如：5kg" />
              </view>
              <view class="sku-input">
                <text class="input-label">售价</text>
                <input type="number" v-model="sku.price" placeholder="0.00" />
              </view>
              <view class="sku-input">
                <text class="input-label">原价</text>
                <input type="number" v-model="sku.original_price" placeholder="0.00" />
              </view>
              <view class="sku-input">
                <text class="input-label">库存</text>
                <input type="number" v-model="sku.stock" placeholder="0" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="submit-btn-wrapper">
      <button class="submit-btn" @click="handleSubmit" :loading="submitting">
        {{ isEdit ? '保存修改' : '创建商品' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'uni-app/composables'
import { getCategories } from '@/api/product'
import { getProductDetail, createProduct, updateProduct } from '@/api/admin'
import ImageUploader from '@/components/image-uploader.vue'

const route = useRoute()
const isEdit = computed(() => !!route.query.id)

const categories = ref([])
const selectedCategory = ref(null)

const formData = ref({
  name: '',
  category_id: '',
  description: '',
  main_image: '',
  images: [],
  brand: '',
  commission_rate: 15,
  status: 1,
  skus: []
})

const submitting = ref(false)

onMounted(async () => {
  await loadCategories()
  if (route.query.id) {
    await loadProduct(route.query.id)
  }
})

const loadCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data || []
  } catch (error) {
    console.log('加载分类失败')
  }
}

const loadProduct = async (id) => {
  try {
    const res = await getProductDetail(id)
    const data = res.data
    formData.value = {
      name: data.name,
      category_id: data.category_id,
      description: data.description,
      main_image: data.main_image,
      images: data.images || [],
      brand: data.brand,
      commission_rate: data.commission_rate,
      status: data.status,
      skus: data.skus || []
    }
    if (data.category_id) {
      const cat = categories.value.find(c => c.id === data.category_id)
      selectedCategory.value = cat
    }
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const onCategoryChange = (e) => {
  const index = e.detail.value
  selectedCategory.value = categories.value[index]
  formData.value.category_id = categories.value[index].id
}

const addSku = () => {
  formData.value.skus.push({
    spec_name: '',
    price: 0,
    original_price: 0,
    stock: 0
  })
}

const removeSku = (index) => {
  formData.value.skus.splice(index, 1)
}

const validateForm = () => {
  if (!formData.value.name) {
    uni.showToast({ title: '请输入商品名称', icon: 'none' })
    return false
  }
  if (!formData.value.category_id) {
    uni.showToast({ title: '请选择商品分类', icon: 'none' })
    return false
  }
  if (!formData.value.main_image) {
    uni.showToast({ title: '请上传商品主图', icon: 'none' })
    return false
  }
  if (formData.value.skus.length === 0) {
    uni.showToast({ title: '请至少添加一个规格', icon: 'none' })
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true

  try {
    const data = {
      name: formData.value.name,
      category_id: formData.value.category_id,
      description: formData.value.description,
      main_image: formData.value.main_image,
      images: formData.value.images,
      brand: formData.value.brand,
      commission_rate: formData.value.commission_rate,
      status: formData.value.status,
      skus: formData.value.skus
    }

    if (isEdit.value) {
      await updateProduct(route.query.id, data)
      uni.showToast({ title: '修改成功' })
    } else {
      await createProduct(data)
      uni.showToast({ title: '创建成功' })
    }

    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } catch (error) {
    uni.showToast({ title: error.message || '操作失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.product-edit-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 140rpx;
}

.edit-content {
  padding: 24rpx;
}

.form-item {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .form-label {
    display: block;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;

    .required {
      color: #F5222D;
    }
  }

  .form-input {
    width: 100%;
    height: 72rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    padding: 0 24rpx;
    font-size: 26rpx;
    color: #333;
  }

  .form-textarea {
    width: 100%;
    height: 160rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    padding: 16rpx;
    font-size: 26rpx;
    color: #333;
    line-height: 1.5;
  }

  .picker-input {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 72rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    padding: 0 24rpx;
    font-size: 26rpx;
    color: #333;

    .placeholder {
      color: #ccc;
    }
  }

  .upload-box {
    margin-top: 16rpx;
    width: 200rpx;
    height: 200rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .preview-image {
      width: 100%;
      height: 100%;
      border-radius: 8rpx;
    }

    .upload-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;

      .upload-text {
        margin-top: 8rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;

    .image-item {
      position: relative;
      width: 160rpx;
      height: 160rpx;
      background-color: #f5f5f5;
      border-radius: 8rpx;

      .image-preview {
        width: 100%;
        height: 100%;
        border-radius: 8rpx;
      }

      .image-delete {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        width: 32rpx;
        height: 32rpx;
        background-color: rgba(0,0,0,0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &.upload-item {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .radio-group {
    display: flex;
    gap: 32rpx;

    .radio-label {
      display: flex;
      align-items: center;
      gap: 8rpx;
      font-size: 26rpx;
      color: #666;
    }
  }
}

.form-section {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .section-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }

    .add-sku-btn {
      display: flex;
      align-items: center;
      padding: 12rpx 24rpx;
      background: linear-gradient(135deg, #FF8C42, #FFB380);
      color: #fff;
      font-size: 24rpx;
      border-radius: 8rpx;
      border: none;
    }
  }

  .sku-list {
    .sku-item {
      background-color: #f5f5f5;
      border-radius: 8rpx;
      padding: 24rpx;
      margin-bottom: 24rpx;

      .sku-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;

        .sku-title {
          font-size: 26rpx;
          font-weight: 600;
          color: #333;
        }

        .sku-delete {
          font-size: 24rpx;
          color: #F5222D;
        }
      }

      .sku-form {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;

        .sku-input {
          width: calc(50% - 8rpx);

          .input-label {
            display: block;
            font-size: 24rpx;
            color: #999;
            margin-bottom: 8rpx;
          }

          input {
            width: 100%;
            height: 64rpx;
            background-color: #fff;
            border-radius: 8rpx;
            padding: 0 16rpx;
            font-size: 26rpx;
            color: #333;
          }
        }
      }
    }
  }
}

.submit-btn-wrapper {
  padding: 24rpx;

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
</style>
