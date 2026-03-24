const Router = require('koa-router')
const authController = require('../controllers/authController')
const productController = require('../controllers/productController')
const orderController = require('../controllers/orderController')
const distributorController = require('../controllers/distributorController')
const addressController = require('../controllers/addressController')
const adminController = require('../controllers/adminController')
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
router.get('/admin/stats/dashboard', adminController.getDashboardStats)
router.get('/admin/stats/sales', adminController.getSalesStats)
router.get('/admin/stats/commission', adminController.getCommissionStats)
router.get('/admin/stats/users', adminController.getUserStats)

module.exports = router
