const Router = require('koa-router')
const authController = require('../controllers/authController')
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const distributorController = require('../controllers/distributorController')
const addressController = require('../controllers/addressController')
const adminController = require('../controllers/adminController')
const uploadController = require('../controllers/uploadController')
const { authMiddleware, adminMiddleware } = require('../middlewares/auth')

const router = new Router({ prefix: '/api/v1' })

// 公开接口
router.post('/auth/wechat-login', authController.wechatLogin)

// 需要认证的接口
router.use(authMiddleware)

// 用户接口
router.get('/user/profile', authController.getUserProfile)
router.put('/user/profile', authController.updateUserProfile)
router.post('/user/bind-phone', authController.bindPhone)

// 商品接口
router.get('/products', productController.getProductList)
router.get('/products/home', productController.getProductList)
router.get('/products/:id', productController.getProductDetail)
router.get('/categories', productController.getCategories)

// 订单接口
router.post('/orders', orderController.createOrder)
router.get('/orders', orderController.getOrderList)
router.get('/orders/:id', orderController.getOrderDetail)
router.post('/orders/:id/cancel', orderController.cancelOrder)
router.post('/orders/:id/confirm', orderController.confirmOrder)

// 地址接口
router.get('/user/addresses', addressController.getUserAddresses)
router.get('/user/addresses/:id', addressController.getAddressDetail)
router.post('/user/addresses', addressController.addAddress)
router.put('/user/addresses/:id', addressController.updateAddress)
router.delete('/user/addresses/:id', addressController.deleteAddress)
router.post('/user/addresses/:id/default', addressController.setDefaultAddress)

// 分销接口
router.get('/distributor/info', distributorController.getDistributorInfo)
router.post('/distributor/apply', distributorController.applyDistributor)
router.get('/distributor/team', distributorController.getTeam)
router.get('/distributor/commissions', distributorController.getCommissions)
router.post('/distributor/withdraw', distributorController.applyWithdraw)
router.get('/distributor/withdrawals', distributorController.getWithdrawals)
router.get('/distributor/stats', distributorController.getDistributorStats)

// 管理后台接口
router.post('/admin/login', authController.wechatLogin) // TODO: 实现管理员登录

// 统计接口
router.get('/admin/stats/dashboard', adminController.getDashboardStats)
router.get('/admin/stats/sales', adminController.getSalesStats)
router.get('/admin/stats/commission', adminController.getCommissionStats)
router.get('/admin/stats/users', adminController.getUserStats)

// 商品管理接口
router.get('/admin/products', adminController.getProductList)
router.get('/admin/products/:id', adminController.getProductDetail)
router.post('/admin/products', adminController.createProduct)
router.put('/admin/products/:id', adminController.updateProduct)
router.delete('/admin/products/:id', adminController.deleteProduct)
router.put('/admin/products/:id/status', adminController.toggleProductStatus)
router.get('/admin/categories', adminController.getCategoryList)

// 订单管理接口
router.get('/admin/orders', adminController.getOrderList)
router.get('/admin/orders/:id', adminController.getOrderDetail)
router.post('/admin/orders/:id/ship', adminController.shipOrder)
router.post('/admin/orders/:id/cancel', adminController.cancelOrder)

// 分销商管理接口
router.get('/admin/distributors', adminController.getDistributorList)
router.get('/admin/distributors/:id', adminController.getDistributorDetail)
router.post('/admin/distributors/:id/audit', adminController.auditDistributor)
router.put('/admin/distributors/:id/status', adminController.toggleDistributorStatus)
router.put('/admin/distributors/:id/level', adminController.updateDistributorLevel)

// 提现管理接口
router.get('/admin/withdrawals', adminController.getWithdrawalList)
router.get('/admin/withdrawals/:id', adminController.getWithdrawalDetail)
router.post('/admin/withdrawals/:id/audit', adminController.auditWithdrawal)
router.post('/admin/withdrawals/:id/confirm', adminController.confirmWithdrawal)

// 佣金配置接口
router.get('/admin/commission/config', adminController.getCommissionConfig)
router.post('/admin/commission/config', adminController.saveCommissionConfig)

// 图片上传接口
router.post('/upload/single', uploadController.upload.single('file'), uploadController.uploadSingle)
router.post('/upload/multiple', uploadController.upload.array('files', 10), uploadController.uploadMultiple)
router.post('/upload/base64', uploadController.uploadBase64)

module.exports = router
