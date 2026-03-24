const multer = require('koa-multer')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads')
const imagesDir = path.join(uploadDir, 'images')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true })
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const fileName = `${uuidv4()}${ext}`
    cb(null, fileName)
  }
})

// 文件过滤 - 只允许图片
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件（jpeg, jpg, png, gif, webp）'))
  }
}

// 限制文件大小 - 最大 5MB
const limits = {
  fileSize: 5 * 1024 * 1024,
  files: 10
}

const upload = multer({
  storage,
  fileFilter,
  limits
})

/**
 * 单图上传
 */
async function uploadSingle(ctx) {
  try {
    const file = ctx.file
    if (!file) {
      ctx.body = { code: 400, message: '请选择要上传的文件' }
      return
    }

    const fileUrl = `/uploads/images/${file.filename}`

    ctx.body = {
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
    ctx.body = { code: 500, message: '上传失败' }
  }
}

/**
 * 多图上传
 */
async function uploadMultiple(ctx) {
  try {
    const files = ctx.files
    if (!files || files.length === 0) {
      ctx.body = { code: 400, message: '请选择要上传的文件' }
      return
    }

    const urls = files.map(file => ({
      url: `/uploads/images/${file.filename}`,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }))

    ctx.body = {
      code: 200,
      message: `成功上传 ${files.length} 张图片`,
      data: {
        files: urls,
        total: files.length
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
    ctx.body = { code: 500, message: '上传失败' }
  }
}

/**
 * Base64 图片上传
 */
async function uploadBase64(ctx) {
  try {
    const { base64, filename } = ctx.request.body

    if (!base64) {
      ctx.body = { code: 400, message: '请提供 base64 图片数据' }
      return
    }

    // 解析 base64 数据
    const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/)
    if (!matches) {
      ctx.body = { code: 400, message: '无效的 base64 图片格式' }
      return
    }

    const [, ext, data] = matches
    const buffer = Buffer.from(data, 'base64')
    const fileName = `${uuidv4()}.${ext}`
    const filePath = path.join(imagesDir, fileName)

    // 写入文件
    fs.writeFileSync(filePath, buffer)

    const fileUrl = `/uploads/images/${fileName}`

    ctx.body = {
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl,
        filename: filename || fileName,
        size: buffer.length,
        mimetype: `image/${ext}`
      }
    }
  } catch (error) {
    console.error('上传失败:', error)
    ctx.body = { code: 500, message: '上传失败' }
  }
}

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadBase64
}
