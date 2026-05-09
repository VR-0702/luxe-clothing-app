import { Link } from 'react-router-dom';
import { FiTrash2, FiArrowRight, FiShoppingBag, FiTag } from 'react-icons/fi';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, cartTotal, cartCount, updateQuantity, removeItem, cartLoading } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const shipping = cartTotal >= 999 ? 0 : 99;
  const tax = Math.round(cartTotal * 0.18);
  const discount = appliedCoupon?.discountAmount || 0;
  const total = cartTotal + shipping + tax - discount;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await api.post('/cart/apply-coupon', {
        code: couponCode.trim(),
        cartTotal
      });
      setAppliedCoupon(data.coupon);
      toast.success(`Coupon applied! You save ₹${data.coupon.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxe-cream text-center px-4">
        <div>
          <FiShoppingBag size={48} className="text-gold-400 mx-auto mb-4" />
          <h2 className="font-display text-3xl mb-3">Your Bag</h2>
          <p className="text-gray-500 font-serif italic mb-6">Please login to view your cart</p>
          <Link to="/login" className="btn-primary">Login to Continue</Link>
        </div>
      </div>
    );
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cart?.items?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxe-cream text-center px-4">
        <div>
          <FiShoppingBag size={48} className="text-gold-300 mx-auto mb-4" />
          <h2 className="font-display text-3xl mb-3">Your Bag is Empty</h2>
          <p className="text-gray-500 font-serif italic mb-6">Discover our curated collections and find your perfect piece</p>
          <Link to="/products" className="btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxe-cream">
      <div className="bg-luxe-black text-white py-12 text-center">
        <h1 className="font-display text-4xl font-medium">Shopping Bag</h1>
        <p className="text-gray-400 font-serif italic mt-1">{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Cart items */}
          <div className="lg:col-span-2 space-y-0">
            {cart.items.map((item, i) => {
              const productImg = item.product?.images?.[0]?.url;
              const itemPrice = item.price || item.product?.discountPrice || item.product?.price || 0;
              return (
                <div
                  key={item._id}
                  className={`flex gap-4 py-6 ${i !== 0 ? 'border-t border-gray-200' : ''}`}
                >
                  {/* Image */}
                  <Link to={`/product/${item.product?._id}`} className="shrink-0 w-24 sm:w-32 aspect-[3/4] bg-gray-100 overflow-hidden">
                    {productImg ? (
                      <img src={productImg} alt={item.product?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-2xl">👔</div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product?._id}`}
                      className="font-serif text-luxe-black hover:text-gold-600 transition-colors text-base line-clamp-2 block"
                    >
                      {item.product?.name || 'Product'}
                    </Link>
                    <div className="flex gap-3 mt-1 text-xs text-gray-400 tracking-wide uppercase">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                    <p className="font-medium mt-2">₹{itemPrice.toLocaleString()}</p>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-gray-200 w-fit">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-sm"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total + remove */}
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-sm">₹{(itemPrice * item.quantity).toLocaleString()}</span>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 p-6 sticky top-24">
              <h2 className="font-display text-xl mb-5">Order Summary</h2>

              {/* Coupon */}
              <form onSubmit={handleApplyCoupon} className="mb-5">
                <p className="text-xs tracking-widest uppercase text-gray-500 mb-2 font-sans flex items-center gap-1">
                  <FiTag size={12} /> Coupon Code
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="LUXE10"
                    disabled={!!appliedCoupon}
                    className="input-luxe flex-1 text-sm"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                      className="px-3 text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-3 text-sm bg-luxe-black text-white hover:bg-gold-500 hover:text-luxe-black transition-all"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-1.5">✓ {appliedCoupon.code} applied</p>
                )}
              </form>

              <div className="h-px bg-gray-100 mb-5" />

              {/* Price breakdown */}
              <div className="space-y-3 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between font-medium text-base">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                state={{ coupon: appliedCoupon }}
                className="btn-primary w-full text-center flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout
                <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link to="/products" className="block text-center text-xs text-gray-400 hover:text-luxe-black mt-4 transition-colors">
                ← Continue Shopping
              </Link>

              {shipping > 0 && (
                <p className="text-xs text-center text-gray-400 mt-3 font-serif italic">
                  Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
