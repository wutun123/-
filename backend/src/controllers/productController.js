const { Product, ProductSku, Category } = require('../models')
const { Op } = require('sequelize')

/**
 * 获取商品列表
 */
async function getProductList(ctx) {
  const {
    category_id,
    keyword,
    sort = 'comprehensive',
    page = 1,
    page_size = 20
  } = ctx.query

  try {
    const offset = (page - 1) * page_size
    const limit = parseInt(page_size)

    const where = { status: 1 }

    if (category_id) {
      where.category_id = category_id
    }

    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` }
    }

    let order = []
    switch (sort) {
      case 'sales':
        order = [['sales', 'DESC']]
        break
      case 'price_asc':
        order = [['price', 'ASC']]
        break
      case 'price_desc':
        order = [['price', 'DESC']]
        break
      default:
        order = [['created_at', 'DESC']]
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{
        model: ProductSku,
        as: 'skus',
        where: { status: 1 },
        required: false
      }],
      order,
      offset: parseInt(offset),
      limit
    })

    // 格式化商品数据
    const list = rows.map(product => {
      const minPrice = product.skus?.length > 0
        ? Math.min(...product.skus.map(sku => parseFloat(sku.price)))
        : 0

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        main_image: product.main_image,
        price: minPrice,
        original_price: product.skus?.[0]?.original_price || 0,
        sales: product.sales || 0,
        commission_rate: product.commission_rate
      }
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        total: count,
        list
      }
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ctx.body = { code: 500, message: '获取商品列表失败' }
  }
}

/**
 * 获取商品详情
 */
async function getProductDetail(ctx) {
  const { id } = ctx.params

  try {
    const product = await Product.findByPk(id, {
      include: [{
        model: ProductSku,
        as: 'skus',
        where: { status: 1 }
      }]
    })

    if (!product) {
      ctx.body = { code: 404, message: '商品不存在' }
      return
    }

    ctx.body = {
      code: 200,
      message: 'success',
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        main_image: product.main_image,
        images: product.images || [],
        brand: product.brand,
        commission_rate: product.commission_rate,
        skus: product.skus.map(sku => ({
          id: sku.id,
          spec_name: sku.spec_name,
          spec_value: sku.spec_value,
          price: sku.price,
          original_price: sku.original_price,
          stock: sku.stock
        }))
      }
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ctx.body = { code: 500, message: '获取商品详情失败' }
  }
}

/**
 * 获取分类列表
 */
async function getCategories(ctx) {
  try {
    const categories = await Category.findAll({
      where: { status: 1 },
      order: [['sort_order', 'ASC']]
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: categories
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
    ctx.body = { code: 500, message: '获取分类列表失败' }
  }
}

module.exports = {
  getProductList,
  getProductDetail,
  getCategories
}
