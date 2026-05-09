const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const StoreSettings = require('../models/StoreSettings');

// 6-digit random OTP generate karo
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @route POST /api/orders
// @access Private (customer)
const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, payment, couponCode, notes, orderType, pickupDetails } = req.body;

    // Store settings check karo
    const settings = await StoreSettings.findOne({ key: 'main' });

    // Validate order type based on settings
    if (orderType === 'delivery' && settings && !settings.deliveryEnabled) {
      return res.status(400).json({ success: false, message: 'Delivery is currently disabled.' });
    }
    if (orderType === 'pickup' && settings && !settings.pickupEnabled) {
      return res.status(400).json({ success: false, message: 'Store pickup is currently disabled.' });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name images price discountPrice variants');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0]?.url || '',
      price: item.product.discountPrice || item.product.price,
      size: item.size, color: item.color, quantity: item.quantity
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Pickup orders mein shipping nahi hota
    const shipping = orderType === 'pickup' ? 0 : (subtotal >= (settings?.freeShippingThreshold || 999) ? 0 : (settings?.shippingCost || 99));
    const taxRate = settings?.taxRate || 18;
    const tax = Math.round(subtotal * taxRate / 100);
    let discount = 0;

    let couponData = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        if (coupon.discountType === 'percentage') {
          discount = Math.round((subtotal * coupon.discountValue) / 100);
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else {
          discount = coupon.discountValue;
        }
        couponData = { code: coupon.code, discountAmount: discount };
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }

    const total = subtotal + shipping + tax - discount;

    // Pickup ke liye OTP generate karo
    const pickupData = orderType === 'pickup' ? {
      otp: generateOTP(),
      otpVerified: false,
      customerName: pickupDetails?.customerName || shippingAddress?.name || req.user.name,
      customerPhone: pickupDetails?.customerPhone || shippingAddress?.phone || '',
      scheduledDate: pickupDetails?.scheduledDate ? new Date(pickupDetails.scheduledDate) : null,
    } : undefined;

    const order = await Order.create({
      customer: req.user._id,
      orderType: orderType || 'delivery',
      items,
      shippingAddress: orderType !== 'pickup' ? shippingAddress : undefined,
      pickup: pickupData,
      pricing: { subtotal, discount, shipping, tax, total },
      coupon: couponData,
      payment: {
        method: payment?.method || 'demo',
        status: payment?.method === 'demo' ? 'paid' : 'pending',
        transactionId: payment?.method === 'demo' ? `DEMO-${Date.now()}` : null,
        paidAt: payment?.method === 'demo' ? new Date() : null
      },
      notes,
      statusHistory: [{
        status: 'placed',
        note: orderType === 'pickup' ? 'Pickup order placed — OTP generated' : 'Order placed by customer'
      }],
      estimatedDelivery: orderType !== 'pickup' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined
    });

    // Reduce stock
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.product._id, 'variants.size': item.size, 'variants.color': item.color },
        { $inc: { 'variants.$.stock': -item.quantity } }
      );
    }

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    await order.populate('customer', 'name email phone');

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort('-createdAt')
      .populate('items.product', 'name images');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('assignedWorker', 'name email')
      .populate('pickup.otpVerifiedBy', 'name');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (req.user.role === 'customer' && order.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search, orderType } = req.query;
    const query = {};
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;
    if (search) query.$or = [{ orderNumber: { $regex: search, $options: 'i' } }];

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('assignedWorker', 'name')
      .sort('-createdAt').skip(skip).limit(Number(limit));

    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, assignedWorker } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (req.user.role === 'worker') {
      const allowedStatuses = ['processing', 'packed', 'ready_for_pickup', 'shipped'];
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({ success: false, message: `Workers can only set: ${allowedStatuses.join(', ')}` });
      }
    }

    order.status = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id });
    if (assignedWorker) order.assignedWorker = assignedWorker;
    await order.save();

    res.json({ success: true, message: 'Order status updated!', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/orders/verify-otp
// @access Worker / Admin — OTP verify karke pickup complete karo
const verifyPickupOTP = async (req, res) => {
  try {
    const { otp, orderNumber } = req.body;

    if (!otp || !orderNumber) {
      return res.status(400).json({ success: false, message: 'OTP aur Order Number dono required hain.' });
    }

    // Order dhundo by orderNumber
    const order = await Order.findOne({ orderNumber: orderNumber.trim().toUpperCase() })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order nahi mila. Order number check karo.' });
    }

    if (order.orderType !== 'pickup') {
      return res.status(400).json({ success: false, message: 'Ye ek delivery order hai, pickup order nahi.' });
    }

    if (order.pickup?.otpVerified) {
      return res.status(400).json({ success: false, message: 'Is order ka OTP pehle hi verify ho chuka hai.' });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: `Ye order already ${order.status} hai.` });
    }

    // OTP match karo
    if (order.pickup?.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Galat OTP! Dobara check karo.' });
    }

    // OTP sahi hai — order complete karo
    order.pickup.otpVerified = true;
    order.pickup.otpVerifiedAt = new Date();
    order.pickup.otpVerifiedBy = req.user._id;
    order.status = 'completed';
    order.statusHistory.push({
      status: 'completed',
      note: `OTP verified & order handed over by ${req.user.name}`,
      updatedBy: req.user._id
    });

    await order.save();
    await order.populate('pickup.otpVerifiedBy', 'name');

    res.json({
      success: true,
      message: '✅ OTP sahi hai! Order complete ho gaya.',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/settings/store
// @access Public — frontend ke liye
const getStoreSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne({ key: 'main' });
    if (!settings) {
      // Default settings create karo pehli baar
      settings = await StoreSettings.create({ key: 'main' });
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/admin/settings/store
// @access Admin
const updateStoreSettings = async (req, res) => {
  try {
    const settings = await StoreSettings.findOneAndUpdate(
      { key: 'main' },
      { ...req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Settings save ho gayi!', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/admin/orders/pickup — Sabke pickup orders
const getPickupOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { orderType: 'pickup' };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .sort('-createdAt');

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder, getMyOrders, getOrder,
  getAllOrders, updateOrderStatus,
  verifyPickupOTP, getStoreSettings, updateStoreSettings,
  getPickupOrders
};
