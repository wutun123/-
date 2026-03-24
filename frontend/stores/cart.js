import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  /**
   * 购物车商品总数
   */
  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  /**
   * 选中商品总价
   */
  const totalPrice = computed(() => {
    return items.value
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  /**
   * 添加商品
   */
  function add(product) {
    const existing = items.value.find(item => item.sku_id === product.sku_id)
    if (existing) {
      existing.quantity += product.quantity || 1
    } else {
      items.value.push({
        ...product,
        quantity: product.quantity || 1,
        selected: true
      })
    }
  }

  /**
   * 更新数量
   */
  function updateQuantity(skuId, quantity) {
    const item = items.value.find(i => i.sku_id === skuId)
    if (item) {
      item.quantity = quantity
    }
  }

  /**
   * 切换选中状态
   */
  function toggleSelect(skuId) {
    const item = items.value.find(i => i.sku_id === skuId)
    if (item) {
      item.selected = !item.selected
    }
  }

  /**
   * 全选/取消全选
   */
  function toggleSelectAll() {
    const allSelected = items.value.every(item => item.selected)
    items.value.forEach(item => {
      item.selected = !allSelected
    })
  }

  /**
   * 删除商品
   */
  function remove(skuId) {
    items.value = items.value.filter(i => i.sku_id !== skuId)
  }

  /**
   * 清空购物车
   */
  function clear() {
    items.value = []
  }

  /**
   * 同步购物车数据
   */
  function syncCart(newItems) {
    items.value = newItems || []
  }

  return {
    items,
    totalCount,
    totalPrice,
    add,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    remove,
    clear,
    syncCart
  }
})
