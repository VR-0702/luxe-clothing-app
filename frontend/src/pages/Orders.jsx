import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../api/axios';

const statusClass = (status) => {
  const map = {
    placed: 'status-placed', confirmed: 'status-confirmed',
    processing: 'status-processing', packed: 'status-packed',
    shipped: 'status-shipped', delivered: 'status-delivered',
    cancelled: 'status-cancelled', returned: 'status-returned'
  };
  return map[status] || 'status-placed';
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    api.get('/orders/my')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-luxe-cream">
      <div className="bg-luxe-black text-white py-12 text-center">
        <h1 className="font-display text-4xl font-medium">My Orders</h1>
        <p className="text-gray-400 font-serif italic mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="font-display text-3xl text-gray-400 mb-3">No orders yet</h2>
            <p className="text-gray-400 font-serif italic mb-6">Your order history will appear here</p>
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order._id} className="bg-white border border-gray-100">
                {/* Order header */}
                <div
                  className="flex flex-wrap items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-3 py-1 capitalize font-sans tracking-wide ${statusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="font-medium">₹{order.pricing?.total?.toLocaleString()}</span>
                    {expandedOrder === order._id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedOrder === order._id && (
                  <div className="border-t border-gray-100 p-5 animate-fade-in">
                    <div className="grid sm:grid-cols-2 gap-6 mb-5">
                      {/* Items */}
                      <div>
                        <h4 className="text-xs tracking-widest uppercase text-gray-500 mb-3 font-sans">Items</h4>
                        <div className="space-y-3">
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex gap-3">
                              <div className="w-14 h-18 bg-gray-100 shrink-0 overflow-hidden">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">👔</div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-serif text-luxe-black">{item.name}</p>
                                <p className="text-xs text-gray-400">{item.size} · {item.color} · ×{item.quantity}</p>
                                <p className="text-sm font-medium">₹{item.price?.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping + Pricing */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs tracking-widest uppercase text-gray-500 mb-2 font-sans">Delivery Address</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {order.shippingAddress?.name}<br />
                            {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                            {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs tracking-widest uppercase text-gray-500 mb-2 font-sans">Payment</h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {order.payment?.method} — <span className="font-medium capitalize">{order.payment?.status}</span>
                          </p>
                        </div>

                        <div>
                          <h4 className="text-xs tracking-widest uppercase text-gray-500 mb-2 font-sans">Total</h4>
                          <p className="text-sm text-gray-600">
                            Subtotal: ₹{order.pricing?.subtotal?.toLocaleString()}<br />
                            Shipping: {order.pricing?.shipping === 0 ? 'Free' : `₹${order.pricing?.shipping}`}<br />
                            <span className="font-medium text-luxe-black">Total: ₹{order.pricing?.total?.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status history */}
                    {order.statusHistory?.length > 0 && (
                      <div>
                        <h4 className="text-xs tracking-widest uppercase text-gray-500 mb-3 font-sans">Order Timeline</h4>
                        <div className="space-y-2">
                          {order.statusHistory.map((h, i) => (
                            <div key={i} className="flex gap-3 items-start text-sm">
                              <div className="w-2 h-2 rounded-full bg-gold-400 mt-1.5 shrink-0" />
                              <div>
                                <span className="font-medium capitalize">{h.status}</span>
                                <span className="text-gray-400 ml-2 text-xs">
                                  {new Date(h.updatedAt).toLocaleString('en-IN')}
                                </span>
                                {h.note && <p className="text-gray-500 text-xs mt-0.5">{h.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
