<template>
  <view class="address-edit-page">
    <view class="edit-content">
      <view class="form-item">
        <text class="form-label">收货人 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model="formData.receiver_name"
          placeholder="请输入收货人姓名"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <text class="form-label">手机号 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model="formData.receiver_phone"
          type="number"
          maxlength="11"
          placeholder="请输入收货人手机号"
        />
      </view>

      <view class="form-item">
        <text class="form-label">所在地区 <text class="required">*</text></text>
        <view class="region-picker" @click="showRegionPicker = true">
          <text class="region-text" v-if="selectedRegion">{{ selectedRegion }}</text>
          <text class="region-placeholder" v-else>请选择省/市/区</text>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">详细地址 <text class="required">*</text></text>
        <textarea
          class="form-textarea"
          v-model="formData.detail_address"
          placeholder="请输入详细地址，如街道、门牌号等"
          maxlength="100"
        />
      </view>

      <view class="form-item">
        <text class="form-label">默认地址</text>
        <switch
          :checked="formData.is_default"
          color="#FF8C42"
          @change="onDefaultChange"
        />
      </view>

      <view class="form-tip">
        <uni-icons type="info" size="16" color="#999"></uni-icons>
        <text class="tip-text">信息将用于商品配送，请确保准确无误</text>
      </view>
    </view>

    <view class="submit-btn-wrapper">
      <button class="submit-btn" @click="handleSubmit" :loading="submitting">
        {{ isEdit ? '保存修改' : '保存地址' }}
      </button>
    </view>

    <!-- 地区选择器 -->
    <uni-popup ref="regionPopup" type="bottom" v-model:show="showRegionPicker">
      <view class="region-popup">
        <view class="popup-header">
          <text class="popup-title">选择地区</text>
          <uni-icons type="closeempty" size="20" @click="showRegionPicker = false"></uni-icons>
        </view>
        <view class="popup-content">
          <picker-mode-region
            @change="onRegionChange"
            :value="regionValue"
          />
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'uni-app/composables'
import { getAddressDetail, addAddress, updateAddress } from '@/api/user'

const route = useRoute()
const isEdit = computed(() => !!route.query.id)

const formData = ref({
  receiver_name: '',
  receiver_phone: '',
  province: '',
  city: '',
  district: '',
  detail_address: '',
  is_default: false
})

const selectedRegion = ref('')
const showRegionPicker = ref(false)
const submitting = ref(false)
const regionValue = ref([])

onMounted(() => {
  if (route.query.id) {
    loadAddress(route.query.id)
  }
})

const loadAddress = async (id) => {
  try {
    const res = await getAddressDetail(id)
    const data = res.data
    formData.value = {
      receiver_name: data.receiver_name,
      receiver_phone: data.receiver_phone,
      province: data.province,
      city: data.city,
      district: data.district,
      detail_address: data.detail_address,
      is_default: !!data.is_default
    }
    selectedRegion.value = `${data.province}${data.city}${data.district}`
  } catch (error) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
}

const onRegionChange = (event) => {
  const [province, city, district] = event.detail.value
  formData.value.province = province.name
  formData.value.city = city.name
  formData.value.district = district.name
  selectedRegion.value = `${province.name}${city.name}${district.name}`
  showRegionPicker.value = false
}

const onDefaultChange = (event) => {
  formData.value.is_default = event.detail.value
}

const validateForm = () => {
  if (!formData.value.receiver_name) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return false
  }

  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(formData.value.receiver_phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return false
  }

  if (!formData.value.province || !formData.value.city || !formData.value.district) {
    uni.showToast({ title: '请选择所在地区', icon: 'none' })
    return false
  }

  if (!formData.value.detail_address) {
    uni.showToast({ title: '请输入详细地址', icon: 'none' })
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  submitting.value = true

  try {
    const data = {
      receiver_name: formData.value.receiver_name,
      receiver_phone: formData.value.receiver_phone,
      province: formData.value.province,
      city: formData.value.city,
      district: formData.value.district,
      detail_address: formData.value.detail_address,
      is_default: formData.value.is_default ? 1 : 0
    }

    if (isEdit.value) {
      await updateAddress(route.query.id, data)
      uni.showToast({ title: '修改成功' })
    } else {
      await addAddress(data)
      uni.showToast({ title: '添加成功' })
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
.address-edit-page {
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
    height: 88rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
  }

  .region-picker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 88rpx;
    background-color: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;

    .region-text {
      font-size: 28rpx;
      color: #333;
    }

    .region-placeholder {
      font-size: 28rpx;
      color: #ccc;
    }
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

  .form-tip {
    display: flex;
    align-items: center;
    padding: 16rpx;
    background-color: #FFF5F0;
    border-radius: 8rpx;
    margin-top: 24rpx;

    .tip-text {
      margin-left: 8rpx;
      font-size: 24rpx;
      color: #999;
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
