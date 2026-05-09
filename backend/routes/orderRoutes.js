const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrder,
  verifyPickupOTP, getStoreSettings
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/settings/store', getStoreSettings); // Public
router.use(protect);
router.post('/', placeOrder);
router.get('/my', getMyOrders);
router.post('/verify-otp', verifyPickupOTP); // Worker/Admin OTP verify
router.get('/:id', getOrder);

module.exports = router;
