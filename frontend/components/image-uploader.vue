<template>
  <view class="upload-container">
    <view class="upload-list" v-if="fileList.length > 0">
      <view class="upload-item" v-for="(file, index) in fileList" :key="index">
        <image class="upload-image" :src="file.url || file.path" mode="aspectFill" @click="previewImage(index)" />
        <view class="upload-mask" @click="removeImage(index)">
          <text class="remove-icon">×</text>
        </view>
        <view class="upload-index" v-if="showIndex">{{ index + 1 }}</view>
      </view>
    </view>

    <view class="upload-btn" @click="chooseImage" v-if="fileList.length < maxCount">
      <view class="upload-btn-content">
        <uni-icons type="camera" size="40" color="#999"></uni-icons>
        <text class="upload-text">{{ uploadText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { uploadSingle, uploadMultiple } from '@/api/admin'

const props = defineProps({
  modelValue: {
    type: [Array, String],
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 9
  },
  autoUpload: {
    type: Boolean,
    default: true
  },
  uploadText: {
    type: String,
    default: '上传图片'
  },
  showIndex: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'success'])

const fileList = ref([])

// 初始化
if (props.modelValue) {
  if (Array.isArray(props.modelValue)) {
    fileList.value = props.modelValue.map(item => {
      if (typeof item === 'string') {
        return { url: item }
      }
      return item
    })
  } else if (typeof props.modelValue === 'string') {
    fileList.value = [{ url: props.modelValue }]
  }
}

// 选择图片
const chooseImage = async () => {
  const remainCount = props.maxCount - fileList.value.length

  try {
    const res = await uni.chooseImage({
      count: Math.min(remainCount, 9),
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    })

    const tempFiles = res.tempFiles
    const uploadedFiles = []

    if (props.autoUpload) {
      // 自动上传
      uni.showLoading({ title: '上传中...' })

      for (const file of tempFiles) {
        try {
          const result = await uploadSingle(file)
          if (result.statusCode === 200 && result.data.code === 200) {
            uploadedFiles.push({
              url: result.data.data.url,
              path: file.path
            })
          }
        } catch (error) {
          console.error('上传失败:', error)
          uni.showToast({ title: '上传失败', icon: 'none' })
        }
      }

      uni.hideLoading()
    } else {
      // 不上传，仅显示本地预览
      tempFiles.forEach(file => {
        uploadedFiles.push({
          url: file.path,
          path: file.path,
          isLocal: true
        })
      })
    }

    if (uploadedFiles.length > 0) {
      fileList.value = [...fileList.value, ...uploadedFiles]
      emitUpdate()
      emit('change', fileList.value)
    }
  } catch (error) {
    console.error('选择图片失败:', error)
  }
}

// 预览图片
const previewImage = (index) => {
  const urls = fileList.value.map(item => item.url || item.path)
  uni.previewImage({
    urls,
    current: index
  })
}

// 删除图片
const removeImage = (index) => {
  uni.showModal({
    title: '提示',
    content: '确定删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        fileList.value.splice(index, 1)
        emitUpdate()
        emit('change', fileList.value)
      }
    }
  })
}

// 发送更新
const emitUpdate = () => {
  const urls = fileList.value.map(item => item.url)
  if (props.maxCount === 1) {
    emit('update:modelValue', urls[0] || '')
  } else {
    emit('update:modelValue', urls)
  }
}

// 获取文件列表
const getFiles = () => {
  return fileList.value
}

// 清空文件
const clearFiles = () => {
  fileList.value = []
  emitUpdate()
}

defineExpose({
  getFiles,
  clearFiles
})
</script>

<style lang="scss" scoped>
.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.upload-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background-color: #f5f5f5;

  .upload-image {
    width: 100%;
    height: 100%;
  }

  .upload-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s;

    &:active {
      opacity: 1;
    }

    .remove-icon {
      font-size: 60rpx;
      color: #fff;
    }
  }

  .upload-index {
    position: absolute;
    top: 8rpx;
    left: 8rpx;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.6);
    color: #fff;
    font-size: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.upload-btn {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ddd;

  .upload-btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
  }

  .upload-text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
