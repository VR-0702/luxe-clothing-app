const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  size: String,
  color: String,
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],

  // ORDER TYPE — delivery ya store pickup
  orderType: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },

  // Delivery address (sirf delivery orders ke liye)
  shippingAddress: {
    name: String, phone: String, street: String,
    city: String, state: String, zipCode: String,
    country: { type: String, default: 'India' }
  },

  // Store Pickup OTP system
  pickup: {
    otp: String,               // 6-digit unique OTP
    otpVerified: Boolean,      // OTP verify hua ya nahi
    otpVerifiedAt: Date,       // Kab verify hua
    otpVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Kisne verify kiya
    customerName: String,      // Pickup ke liye naam
    customerPhone: String,     // Pickup ke liye phone
    scheduledDate: Date,       // Kab aayega customer
  },

  pricing: {
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: Number
  },
  coupon: { code: String, discountAmount: Number },
  payment: {
    method: { type: String, enum: ['demo', 'cod', 'card', 'upi'], default: 'demo' },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    transactionId: String,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'packed', 'ready_for_pickup', 'shipped', 'delivered', 'completed', 'cancelled', 'returned'],
    default: 'placed'
  },
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now }
  }],
  assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  estimatedDelivery: Date
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `LUXE-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
