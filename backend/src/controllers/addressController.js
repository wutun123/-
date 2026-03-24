const { UserAddress } = require('../models')

/**
 * 获取用户地址列表
 */
async function getUserAddresses(ctx) {
  const userId = ctx.state.user.id

  try {
    const addresses = await UserAddress.findAll({
      where: { user_id: userId },
      order: [['is_default', 'DESC'], ['created_at', 'DESC']]
    })

    ctx.body = {
      code: 200,
      message: 'success',
      data: addresses
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    ctx.body = { code: 500, message: '获取地址列表失败' }
  }
}

/**
 * 获取地址详情
 */
async function getAddressDetail(ctx) {
  const { id } = ctx.params
  const userId = ctx.state.user.id

  try {
    const address = await UserAddress.findOne({
      where: { id, user_id: userId }
    })

    if (!address) {
      ctx.body = { code: 404, message: '地址不存在' }
      return
    }

    ctx.body = {
      code: 200,
      message: 'success',
      data: address
    }
  } catch (error) {
    console.error('获取地址详情失败:', error)
    ctx.body = { code: 500, message: '获取地址详情失败' }
  }
}

/**
 * 新增地址
 */
async function addAddress(ctx) {
  const userId = ctx.state.user.id
  const { receiver_name, receiver_phone, province, city, district, detail_address, is_default } = ctx.request.body

  // 验证必填字段
  if (!receiver_name || !receiver_phone || !detail_address) {
    ctx.body = { code: 400, message: '请填写完整信息' }
    return
  }

  // 验证手机号
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(receiver_phone)) {
    ctx.body = { code: 400, message: '请输入正确的手机号' }
    return
  }

  const transaction = await ctx.app.context.db.transaction()

  try {
    // 如果是默认地址，先取消其他默认
    if (is_default) {
      await UserAddress.update(
        { is_default: 0 },
        { where: { user_id: userId } },
        { transaction }
      )
    }

    // 检查地址数量限制（最多 20 个）
    const count = await UserAddress.count({ where: { user_id: userId } })
    if (count >= 20) {
      ctx.body = { code: 400, message: '最多添加 20 个地址' }
      await transaction.rollback()
      return
    }

    const address = await UserAddress.create({
      user_id: userId,
      receiver_name,
      receiver_phone,
      province,
      city,
      district,
      detail_address,
      is_default: is_default ? 1 : 0
    }, { transaction })

    await transaction.commit()

    ctx.body = {
      code: 200,
      message: '添加成功',
      data: address
    }
  } catch (error) {
    await transaction.rollback()
    console.error('新增地址失败:', error)
    ctx.body = { code: 500, message: '新增地址失败' }
  }
}

/**
 * 编辑地址
 */
async function updateAddress(ctx) {
  const { id } = ctx.params
  const userId = ctx.state.user.id
  const { receiver_name, receiver_phone, province, city, district, detail_address, is_default } = ctx.request.body

  try {
    const address = await UserAddress.findOne({
      where: { id, user_id: userId }
    })

    if (!address) {
      ctx.body = { code: 404, message: '地址不存在' }
      return
    }

    const transaction = await ctx.app.context.db.transaction()

    // 如果设为默认，先取消其他默认
    if (is_default && !address.is_default) {
      await UserAddress.update(
        { is_default: 0 },
        { where: { user_id: userId, id: { [Op.ne]: id } } },
        { transaction }
      )
    }

    await address.update({
      receiver_name: receiver_name || address.receiver_name,
      receiver_phone: receiver_phone || address.receiver_phone,
      province: province || address.province,
      city: city || address.city,
      district: district || address.district,
      detail_address: detail_address || address.detail_address,
      is_default: is_default !== undefined ? (is_default ? 1 : 0) : address.is_default
    }, { transaction })

    await transaction.commit()

    ctx.body = {
      code: 200,
      message: '更新成功',
      data: address
    }
  } catch (error) {
    console.error('更新地址失败:', error)
    ctx.body = { code: 500, message: '更新地址失败' }
  }
}

/**
 * 删除地址
 */
async function deleteAddress(ctx) {
  const { id } = ctx.params
  const userId = ctx.state.user.id

  try {
    const address = await UserAddress.findOne({
      where: { id, user_id: userId }
    })

    if (!address) {
      ctx.body = { code: 404, message: '地址不存在' }
      return
    }

    await address.destroy()

    ctx.body = {
      code: 200,
      message: '删除成功'
    }
  } catch (error) {
    console.error('删除地址失败:', error)
    ctx.body = { code: 500, message: '删除地址失败' }
  }
}

/**
 * 设置默认地址
 */
async function setDefaultAddress(ctx) {
  const { id } = ctx.params
  const userId = ctx.state.user.id

  try {
    const transaction = await ctx.app.context.db.transaction()

    // 取消所有默认
    await UserAddress.update(
      { is_default: 0 },
      { where: { user_id: userId } },
      { transaction }
    )

    // 设置新的默认地址
    await UserAddress.update(
      { is_default: 1 },
      { where: { id, user_id: userId } },
      { transaction }
    )

    await transaction.commit()

    ctx.body = {
      code: 200,
      message: '设置成功'
    }
  } catch (error) {
    console.error('设置默认地址失败:', error)
    ctx.body = { code: 500, message: '设置默认地址失败' }
  }
}

module.exports = {
  getUserAddresses,
  getAddressDetail,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
}
