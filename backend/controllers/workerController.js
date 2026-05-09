const Order = require('../models/Order');
const Product = require('../models/Product');

// @route GET /api/worker/orders
// @access Worker - Get orders assigned to this worker
const getWorkerOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { assignedWorker: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .sort('-createdAt');

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/worker/orders/all
// @access Worker - View all pending orders (not yet assigned)
const getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['confirmed', 'processing'] },
      assignedWorker: null
    })
    .populate('customer', 'name email')
    .sort('-createdAt');

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/worker/orders/:id/status
// @access Worker
const updateWorkerOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const allowedStatuses = ['processing', 'packed', 'shipped'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status for workers.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      note: note || `Marked as ${status} by worker`,
      updatedBy: req.user._id
    });

    await order.save();
    res.json({ success: true, message: 'Order updated!', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/worker/stock
// @access Worker
const getStockOverview = async (req, res) => {
  try {
    // Products with low stock (any variant < 5 units)
    const lowStockProducts = await Product.find({
      isActive: true,
      'variants.stock': { $lt: 5 }
    }).populate('category', 'name').select('name images variants totalStock category');

    res.json({ success: true, lowStockProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/worker/stock/:productId
// @access Worker - Update stock for a variant
const updateStock = async (req, res) => {
  try {
    const { size, color, stock } = req.body;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.productId, 'variants.size': size, 'variants.color': color },
      { $set: { 'variants.$.stock': stock } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product or variant not found.' });
    }

    res.json({ success: true, message: 'Stock updated!', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWorkerOrders, getPendingOrders, updateWorkerOrderStatus, getStockOverview, updateStock };
