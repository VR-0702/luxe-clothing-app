import { Link, useLocation, Navigate } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiShoppingBag } from 'react-icons/fi';

export const OrderSuccess = () => {
  const location = useLocation();
  const order = location.state?.order;
  if (!order) return <Navigate to="/" replace />;

  const isPickup = order.orderType === 'pickup';

  return (
    <div className="min-h-screen bg-luxe-cream flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg w-full">
        <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="font-display text-4xl mb-2">
          {isPickup ? 'Booking Confirmed!' : 'Order Confirmed!'}
        </h1>
        <p className="text-gray-500 font-serif italic mb-2">
          {isPickup ? 'Aapki booking ho gayi! Store aane par OTP dikhao.' : 'Thank you for shopping with LUXE.'}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Order Number: <span className="font-medium text-luxe-black">{order.orderNumber}</span>
        </p>

        {/* OTP BOX — Pickup orders ke liye */}
        {isPickup && order.pickup?.otp && (
          <div className="bg-gold-50 border-2 border-gold-400 p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-400 to-gold-600" />
            <p className="text-xs tracking-widest uppercase text-gold-600 font-sans mb-2">Aapka Pickup OTP</p>
            <p className="font-display text-6xl font-medium text-luxe-black tracking-[0.3em] mb-3">
              {order.pickup.otp}
            </p>
            <p className="text-xs text-gray-500">
              Ye OTP store par worker/admin ko dikhao apna saman lene ke liye.<br />
              <strong>Kisi ke saath share mat karo!</strong>
            </p>
            {order.pickup?.scheduledDate && (
              <p className="text-xs text-gold-700 mt-2 font-medium">
                📅 Pickup Date: {new Date(order.pickup.scheduledDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            )}
          </div>
        )}

        {/* Pickup instructions */}
        {isPickup && (
          <div className="bg-blue-50 border border-blue-100 p-4 mb-6 text-left">
            <p className="text-sm font-medium text-blue-800 mb-2">📍 Pickup Instructions:</p>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Store aao apna OTP lekar</li>
              <li>Worker/Admin ko ye 6-digit OTP batao</li>
              <li>Wo verify karenge aur saman denge</li>
              <li>OTP sirf ek baar kaam karta hai</li>
            </ul>
          </div>
        )}

        {/* Order items */}
        <div className="bg-white border border-gray-100 p-5 mb-6 text-left">
          <h3 className="font-medium mb-3 text-sm tracking-widest uppercase text-gray-500">Order Summary</h3>
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-600">{item.name} × {item.quantity}</span>
              <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold mt-3 pt-2 border-t border-gray-100">
            <span>Total</span>
            <span>₹{order.pricing?.total?.toLocaleString()}</span>
          </div>
        </div>

        {!isPickup && order.estimatedDelivery && (
          <p className="text-sm text-gray-500 mb-6">
            Estimated delivery: <span className="font-medium">
              {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-primary flex items-center gap-2">
            <FiPackage size={16} /> My Orders
          </Link>
          <Link to="/products" className="btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};
