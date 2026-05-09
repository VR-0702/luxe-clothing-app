const express = require('express');
const router = express.Router();
const { getWorkerOrders, getPendingOrders, updateWorkerOrderStatus, getStockOverview, updateStock } = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// All worker routes require login + worker/admin role
router.use(protect, restrictTo('worker', 'admin'));

router.get('/orders', getWorkerOrders);
router.get('/orders/pending', getPendingOrders);
router.put('/orders/:id/status', updateWorkerOrderStatus);
router.get('/stock', getStockOverview);
router.put('/stock/:productId', updateStock);

module.exports = router;
