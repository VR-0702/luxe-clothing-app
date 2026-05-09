import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { FiCreditCard, FiSmartphone, FiTruck, FiCheck, FiShoppingBag, FiMapPin } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'demo', label: 'Demo Payment',       desc: 'Instant confirmation (test mode)', icon: FiCheck },
  { id: 'cod',  label: 'Cash on Delivery',   desc: 'Pay when your order arrives',      icon: FiTruck },
  { id: 'card', label: 'Credit/Debit Card',  desc: 'Visa, Mastercard, RuPay',          icon: FiCreditCard },
  { id: 'upi',  label: 'UPI',                desc: 'GPay, PhonePe, Paytm',             icon: FiSmartphone },
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { storeSettings } = useStore();

  const coupon = location.state?.coupon;
  const urlMode = searchParams.get('mode'); // 'pickup' from product page "Book Now"

  const { deliveryEnabled, pickupEnabled } = storeSettings;

  // Default mode decide karo
  const getDefaultMode = () => {
    if (urlMode === 'pickup' && pickupEnabled) return 'pickup';
    if (deliveryEnabled) return 'delivery';
    if (pickupEnabled) return 'pickup';
    return 'delivery';
  };

  const [orderType, setOrderType] = useState(getDefaultMode);
  const [paymentMethod, setPaymentMethod] = useState('demo');
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState({
    name: user?.name || '', phone: user?.phone || '',
    street: '', city: '', state: '', zipCode: '', country: 'India',
  });
  const [pickupDetails, setPickupDetails] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    scheduledDate: '',
  });

  useEffect(() => {
    setOrderType(getDefaultMode());
  }, [storeSettings, urlMode]);

  const shipping = orderType === 'pickup' ? 0
    : cartTotal >= (storeSettings.freeShippingThreshold || 999) ? 0
    : (storeSettings.shippingCost || 99);
  const tax = Math.round(cartTotal * ((storeSettings.taxRate || 18) / 100));
  const discount = coupon?.discountAmount || 0;
  const total = cartTotal + shipping + tax - discount;

  const bothEnabled = deliveryEnabled && pickupEnabled;

  const handlePlaceOrder = async () => {
    if (orderType === 'delivery') {
      if (!['name','phone','street','city','state','zipCode'].every(f => address[f]?.trim())) {
        toast.error('Please fill in all address fields');
        return;
      }
    }
    if (orderType === 'pickup') {
      if (!pickupDetails.customerName || !pickupDetails.customerPhone) {
        toast.error('Please fill in your name and phone');
        return;
      }
    }
    if (!cart?.items?.length) { toast.error('Your cart is empty'); return; }

    setPlacing(true);
    try {
      const { data } = await api.post('/orders', {
        orderType,
        shippingAddress: orderType === 'delivery' ? address : undefined,
        pickupDetails: orderType === 'pickup' ? pickupDetails : undefined,
        payment: { method: paymentMethod },
        couponCode: coupon?.code,
      });
      await clearCart();
      navigate('/order-success', { state: { order: data.order } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxe-cream">
      <div className="bg-luxe-black text-white py-12 text-center">
        <h1 className="font-display text-4xl font-medium">
          {orderType === 'pickup' ? 'Book for Pickup' : 'Checkout'}
        </h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">

            {/* Order type selector — sirf tab jab dono enabled hon */}
            {bothEnabled && (
              <div className="bg-white border border-gray-100 p-6">
                <h2 className="font-display text-xl mb-4">Order Type Choose Karo</h2>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex flex-col items-center gap-2 p-4 border-2 cursor-pointer transition-all
                    ${orderType === 'delivery' ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="orderType" value="delivery" checked={orderType === 'delivery'} onChange={() => setOrderType('delivery')} className="hidden" />
                    <FiTruck size={26} className={orderType === 'delivery' ? 'text-gold-600' : 'text-gray-400'} />
                    <span className="font-medium text-sm">Home Delivery</span>
                    <span className="text-xs text-gray-400 text-center">Ghar pe deliver hoga</span>
                  </label>
                  <label className={`flex flex-col items-center gap-2 p-4 border-2 cursor-pointer transition-all
                    ${orderType === 'pickup' ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="orderType" value="pickup" checked={orderType === 'pickup'} onChange={() => setOrderType('pickup')} className="hidden" />
                    <FiShoppingBag size={26} className={orderType === 'pickup' ? 'text-gold-600' : 'text-gray-400'} />
                    <span className="font-medium text-sm">Store Pickup</span>
                    <span className="text-xs text-gray-400 text-center">Store se le jao</span>
                  </label>
                </div>
              </div>
            )}

            {/* Only pickup — show banner */}
            {!deliveryEnabled && pickupEnabled && (
              <div className="bg-gold-50 border border-gold-200 p-4 flex gap-3">
                <FiShoppingBag size={20} className="text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gold-800 text-sm">Store Pickup Only</p>
                  <p className="text-xs text-gold-700 mt-0.5">{storeSettings.pickupInstructions}</p>
                </div>
              </div>
            )}

            {/* Delivery address */}
            {orderType === 'delivery' && deliveryEnabled && (
              <div className="bg-white border border-gray-100 p-6">
                <h2 className="font-display text-xl mb-5">
                  <FiTruck className="inline mr-2 text-gold-500" size={18} />Shipping Address
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Full Name *</label>
                    <input value={address.name} onChange={e => setAddress(p=>({...p,name:e.target.value}))} className="input-luxe" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Phone *</label>
                    <input value={address.phone} onChange={e => setAddress(p=>({...p,phone:e.target.value}))} className="input-luxe" placeholder="+91 98765 43210" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Street *</label>
                    <input value={address.street} onChange={e => setAddress(p=>({...p,street:e.target.value}))} className="input-luxe" placeholder="House No., Street, Area" />
                  </div>
                  <div>
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">City *</label>
                    <input value={address.city} onChange={e => setAddress(p=>({...p,city:e.target.value}))} className="input-luxe" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">State *</label>
                    <input value={address.state} onChange={e => setAddress(p=>({...p,state:e.target.value}))} className="input-luxe" placeholder="Maharashtra" />
                  </div>
                  <div>
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">PIN Code *</label>
                    <input value={address.zipCode} onChange={e => setAddress(p=>({...p,zipCode:e.target.value}))} className="input-luxe" placeholder="400001" />
                  </div>
                  <div>
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Country</label>
                    <input value={address.country} onChange={e => setAddress(p=>({...p,country:e.target.value}))} className="input-luxe" />
                  </div>
                </div>
              </div>
            )}

            {/* Pickup details */}
            {orderType === 'pickup' && pickupEnabled && (
              <div className="bg-white border border-gray-100 p-6">
                <h2 className="font-display text-xl mb-3">
                  <FiShoppingBag className="inline mr-2 text-gold-500" size={18} />Pickup Details
                </h2>
                <div className="bg-gold-50 border border-gold-200 p-4 mb-5 rounded">
                  <p className="text-sm font-medium text-gold-800 mb-1"><FiMapPin className="inline mr-1" size={14} />Store Location</p>
                  <p className="text-sm text-gold-700">{storeSettings.pickupInstructions}</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Aapka Naam *</label>
                    <input value={pickupDetails.customerName} onChange={e => setPickupDetails(p=>({...p,customerName:e.target.value}))} className="input-luxe" placeholder="Aapka pura naam" />
                  </div>
                  <div>
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Phone *</label>
                    <input value={pickupDetails.customerPhone} onChange={e => setPickupDetails(p=>({...p,customerPhone:e.target.value}))} className="input-luxe" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Pickup Date (Optional)</label>
                    <input type="date" value={pickupDetails.scheduledDate} onChange={e => setPickupDetails(p=>({...p,scheduledDate:e.target.value}))} className="input-luxe" min={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>
                <div className="mt-4 bg-blue-50 border border-blue-100 p-3">
                  <p className="text-xs text-blue-700">📱 Book karne ke baad aapko <strong>6-digit OTP</strong> milega. Store aane par worker ko ye OTP dikhao.</p>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="font-display text-xl mb-5">Payment Method</h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ id, label, desc, icon: Icon }) => (
                  <label key={id} className={`flex items-center gap-4 p-4 border cursor-pointer transition-all
                    ${paymentMethod === id ? 'border-gold-500 bg-gold-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="payment" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} className="accent-gold-500" />
                    <Icon size={20} className={paymentMethod === id ? 'text-gold-500' : 'text-gray-400'} />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              {paymentMethod === 'demo' && (
                <div className="mt-4 bg-blue-50 border border-blue-100 p-3">
                  <p className="text-xs text-blue-700">🔵 Demo Mode: Koi real payment nahi hoga.</p>
                </div>
              )}
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white border border-gray-100 p-6 sticky top-24">
              <h2 className="font-display text-xl mb-5">Order Summary</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium mb-4 ${orderType === 'pickup' ? 'bg-gold-50 text-gold-700 border border-gold-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                {orderType === 'pickup' ? <><FiShoppingBag size={12} /> Store Pickup</> : <><FiTruck size={12} /> Home Delivery</>}
              </div>

              <div className="space-y-3 mb-5 max-h-60 overflow-y-auto no-scrollbar">
                {cart?.items?.map(item => {
                  const price = item.price || item.product?.discountPrice || item.product?.price || 0;
                  return (
                    <div key={item._id} className="flex gap-3">
                      <div className="w-14 h-18 bg-gray-100 shrink-0 overflow-hidden">
                        {item.product?.images?.[0]?.url
                          ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300">👔</div>}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-serif line-clamp-1">{item.product?.name}</p>
                        <p className="text-xs text-gray-400">{item.size} · {item.color} · ×{item.quantity}</p>
                        <p className="text-sm font-medium">₹{(price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-gray-100 mb-4" />
              <div className="space-y-2.5 text-sm mb-5">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount}</span></div>}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{orderType === 'pickup' ? <span className="text-green-600">Free (Pickup)</span> : shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-600"><span>GST ({storeSettings.taxRate || 18}%)</span><span>₹{tax}</span></div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between font-semibold text-base"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              </div>

              <button onClick={handlePlaceOrder} disabled={placing}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60">
                {placing && <span className="w-4 h-4 border-2 border-luxe-black border-t-transparent rounded-full animate-spin" />}
                {placing ? 'Placing...' : orderType === 'pickup' ? `Book & Get OTP · ₹${total.toLocaleString()}` : `Place Order · ₹${total.toLocaleString()}`}
              </button>
              <p className="text-xs text-center text-gray-400 mt-3 font-serif italic">
                By placing this order you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
