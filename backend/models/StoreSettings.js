const mongoose = require('mongoose');

// Store ke global settings — delivery on/off, pickup on/off, etc.
const storeSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'main', unique: true }, // Sirf ek document hoga

  // Delivery feature
  deliveryEnabled: { type: Boolean, default: true },

  // Store Pickup / Booking feature
  pickupEnabled: { type: Boolean, default: false },
  pickupInstructions: {
    type: String,
    default: 'Store address: 12 Fashion Street, Mumbai. Timing: 10am - 7pm (Mon-Sat)'
  },

  // Store info
  storeName: { type: String, default: 'LUXE Fashion' },
  storePhone: { type: String, default: '+91 98765 43210' },
  storeAddress: { type: String, default: '12 Fashion Street, Mumbai' },
  storeEmail: { type: String, default: 'hello@luxefashion.in' },

  // Shipping
  freeShippingThreshold: { type: Number, default: 999 },
  shippingCost: { type: Number, default: 99 },
  taxRate: { type: Number, default: 18 },

}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
