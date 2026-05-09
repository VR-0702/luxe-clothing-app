const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, updateUser,
  createWorker, getCoupons, createCoupon, updateCoupon, deleteCoupon
} = require('../controllers/adminController');
const {
  getAllOrders, updateOrderStatus,
  updateStoreSettings, getPickupOrders
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.post('/workers', createWorker);

router.get('/orders', getAllOrders);
router.get('/orders/pickup', getPickupOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Store settings — delivery/pickup on/off
router.put('/settings/store', updateStoreSettings);

module.exports = router;
