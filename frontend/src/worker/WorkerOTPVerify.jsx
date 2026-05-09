import { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiX, FiPackage, FiUser, FiPhone } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

// =====================================================================
// WorkerOTPVerify — Worker/Admin OTP scan karke order complete kare
// =====================================================================
const WorkerOTPVerify = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  const [error, setError] = useState('');
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loadingCompleted, setLoadingCompleted] = useState(true);

  // Completed pickup orders load karo
  const fetchCompletedOrders = async () => {
    setLoadingCompleted(true);
    try {
      const { data } = await api.get('/admin/orders/pickup?status=completed');
      setCompletedOrders(data.orders || []);
    } catch {
      // Worker ke liye alternate route try karo
      try {
        const { data } = await api.get('/admin/orders?orderType=pickup&status=completed');
        setCompletedOrders(data.orders || []);
      } catch {}
    } finally {
      setLoadingCompleted(false);
    }
  };

  useEffect(() => { fetchCompletedOrders(); }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim() || !otp.trim()) {
      setError('Order Number aur OTP dono bharo');
      return;
    }
    setError('');
    setVerifying(true);
    setVerifiedOrder(null);

    try {
      const { data } = await api.post('/orders/verify-otp', {
        orderNumber: orderNumber.trim().toUpperCase(),
        otp: otp.trim()
      });

      setVerifiedOrder(data.order);
      toast.success('✅ OTP verified! Order complete ho gaya!');
      setOrderNumber('');
      setOtp('');
      // Completed list refresh karo
      fetchCompletedOrders();
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification fail ho gayi';
      setError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-luxe-black">OTP Verify Karo</h1>
        <p className="text-gray-500 text-sm">Customer ka OTP verify karo aur order complete karo</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* LEFT — OTP Form */}
        <div>
          {/* How it works */}
          <div className="bg-gold-50 border border-gold-200 p-4 mb-5">
            <p className="text-sm font-medium text-gold-800 mb-2">📋 Kaise kaam karta hai?</p>
            <ol className="text-xs text-gold-700 space-y-1 list-decimal list-inside">
              <li>Customer store aaye apna Order Number aur 6-digit OTP lekar</li>
              <li>Neeche form mein Order Number aur OTP enter karo</li>
              <li>"Verify & Complete" click karo</li>
              <li>OTP sahi hoga to customer ka saman aur details dikhega</li>
              <li>Saman do aur order complete ho jayega</li>
            </ol>
          </div>

          {/* OTP Verify Form */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-display text-lg mb-5">OTP Verify Form</h2>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">
                  Order Number
                </label>
                <input
                  value={orderNumber}
                  onChange={e => { setOrderNumber(e.target.value.toUpperCase()); setError(''); }}
                  placeholder="LUXE-1234567890-0001"
                  className="input-luxe font-mono text-sm tracking-wider"
                />
                <p className="text-xs text-gray-400 mt-1">Customer ke order confirmation page pe hoga</p>
              </div>
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">
                  6-Digit OTP
                </label>
                <input
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
                  placeholder="123456"
                  maxLength={6}
                  className="input-luxe font-mono text-3xl text-center tracking-[0.5em] py-4"
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 p-3">
                  <FiX size={16} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button type="submit" disabled={verifying || otp.length !== 6}
                className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60 py-4">
                {verifying
                  ? <><span className="w-5 h-5 border-2 border-luxe-black border-t-transparent rounded-full animate-spin" /> Verify ho raha hai...</>
                  : <><FiCheck size={18} /> Verify &amp; Complete Order</>}
              </button>
            </form>
          </div>

          {/* Success card */}
          {verifiedOrder && (
            <div className="mt-5 bg-green-50 border-2 border-green-400 p-5 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <FiCheck size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">OTP Verified!</p>
                  <p className="text-xs text-green-600">Order #{verifiedOrder.orderNumber}</p>
                </div>
              </div>

              {/* Customer details */}
              <div className="bg-white border border-green-200 p-4 mb-3">
                <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Customer Details</p>
                <div className="flex items-center gap-2 text-sm mb-1">
                  <FiUser size={14} className="text-gray-400" />
                  <span className="font-medium">{verifiedOrder.pickup?.customerName || verifiedOrder.customer?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiPhone size={14} className="text-gray-400" />
                  <span>{verifiedOrder.pickup?.customerPhone || verifiedOrder.customer?.phone}</span>
                </div>
              </div>

              {/* Items to hand over */}
              <div className="bg-white border border-green-200 p-4">
                <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Ye Items Dene Hain</p>
                <div className="space-y-2">
                  {verifiedOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gray-100 overflow-hidden shrink-0">
                        {item.image
                          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300">👔</div>}
                      </div>
                      <div>
                        <p className="text-sm font-serif">{item.name}</p>
                        <p className="text-xs font-medium text-gold-600">Size: {item.size} | Color: {item.color}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-green-100 flex justify-between text-sm font-semibold">
                  <span>Total Paid</span>
                  <span>₹{verifiedOrder.pricing?.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Completed Pickup Orders */}
        <div>
          <div className="bg-white border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg">Completed Pickup Orders</h2>
              <button onClick={fetchCompletedOrders} className="text-xs text-gray-400 hover:text-luxe-black transition-colors">
                Refresh
              </button>
            </div>

            {loadingCompleted ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton rounded" />)}
              </div>
            ) : completedOrders.length === 0 ? (
              <div className="text-center py-10">
                <FiPackage size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-serif italic">Abhi tak koi completed pickup order nahi</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto no-scrollbar">
                {completedOrders.map(order => (
                  <div key={order._id} className="border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium font-mono">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(order.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5">
                        ✓ Completed
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <FiUser size={12} />
                      <span>{order.pickup?.customerName || order.customer?.name}</span>
                      <span>·</span>
                      <FiPhone size={12} />
                      <span>{order.pickup?.customerPhone}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      {order.items?.length} item(s) · ₹{order.pricing?.total?.toLocaleString()}
                    </div>
                    {order.pickup?.otpVerifiedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ Verified: {new Date(order.pickup.otpVerifiedAt).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerOTPVerify;
