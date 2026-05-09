import { useState, useEffect } from 'react';
import { FiPackage, FiAlertCircle, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const WORKER_STATUSES = ['processing', 'packed', 'shipped'];

const statusClass = (status) => ({
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-purple-50 text-purple-700',
  processing: 'bg-yellow-50 text-yellow-700',
  packed: 'bg-orange-50 text-orange-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
}[status] || 'bg-gray-50 text-gray-700');

// =====================================================================
// WorkerOrders.jsx — Orders assigned to this worker
// =====================================================================
export const WorkerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      const { data } = await api.get(`/worker/orders?${params}`);
      setOrders(data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/worker/orders/${orderId}/status`, { status });
      toast.success(`Order marked as "${status}"`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-luxe-black">My Assigned Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} orders assigned to you</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-gray-500 hover:text-luxe-black border border-gray-200 px-3 py-2 transition-all">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['', ...WORKER_STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 text-xs tracking-widests uppercase border transition-all
              ${filterStatus === s ? 'bg-luxe-black text-white border-luxe-black' : 'border-gray-200 text-gray-600 hover:border-luxe-black'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 p-4">
              <div className="h-5 skeleton rounded w-1/3 mb-2" />
              <div className="h-4 skeleton rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-100 p-16 text-center">
          <FiPackage size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="font-serif italic text-gray-400 text-xl">No orders assigned to you</p>
          <p className="text-gray-400 text-sm mt-2">Check "All Pending" to pick up new orders</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order._id} className="bg-white border border-gray-100">
              {/* Header row */}
              <div
                className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{order.customer?.name}</p>
                  <p className="text-xs text-gray-400">{order.customer?.phone}</p>
                </div>
                <span className={`text-xs px-3 py-1 capitalize ${statusClass(order.status)}`}>
                  {order.status}
                </span>
                <span className="font-medium text-sm">₹{order.pricing?.total?.toLocaleString()}</span>
                {expandedOrder === order._id ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
              </div>

              {/* Expanded */}
              {expandedOrder === order._id && (
                <div className="border-t border-gray-100 p-5 animate-fade-in">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Items */}
                    <div>
                      <h4 className="text-xs tracking-widests uppercase text-gray-500 mb-3 font-sans">Items to Pack</h4>
                      <div className="space-y-3">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex gap-3 p-3 bg-gray-50">
                            <div className="w-12 h-14 bg-gray-200 shrink-0 overflow-hidden">
                              {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">👔</div>}
                            </div>
                            <div>
                              <p className="text-sm font-serif line-clamp-1">{item.name}</p>
                              <p className="text-xs font-medium text-gold-600 mt-0.5">Size: {item.size} | Color: {item.color}</p>
                              <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery info + Actions */}
                    <div>
                      <h4 className="text-xs tracking-widests uppercase text-gray-500 mb-3 font-sans">Delivery Details</h4>
                      <div className="bg-gray-50 p-4 mb-4">
                        <p className="text-sm font-medium">{order.shippingAddress?.name}</p>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {order.shippingAddress?.street}<br />
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                          PIN: {order.shippingAddress?.zipCode}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">📞 {order.shippingAddress?.phone || order.customer?.phone}</p>
                      </div>

                      {/* Status actions */}
                      <h4 className="text-xs tracking-widests uppercase text-gray-500 mb-3 font-sans">Update Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {WORKER_STATUSES.map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusUpdate(order._id, status)}
                            disabled={order.status === status || updatingId === order._id}
                            className={`px-4 py-2 text-xs capitalize border transition-all disabled:opacity-40
                              ${order.status === status
                                ? 'bg-luxe-black text-white border-luxe-black'
                                : 'border-gray-200 text-gray-600 hover:border-luxe-black hover:text-luxe-black'}`}
                          >
                            {updatingId === order._id ? '...' : status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =====================================================================
// WorkerPendingOrders.jsx — All unassigned pending orders
// =====================================================================
export const WorkerPendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/worker/orders/pending')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => toast.error('Failed to load pending orders'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-luxe-black">All Pending Orders</h1>
        <p className="text-gray-500 text-sm">Orders waiting to be processed (not yet assigned)</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white border border-gray-100 p-4 h-16 skeleton" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-100 p-16 text-center">
          <p className="font-serif italic text-gray-400 text-xl">No pending orders right now 🎉</p>
          <p className="text-gray-400 text-sm mt-2">All orders are being processed</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order._id} className="bg-white border border-gray-100 p-4 flex flex-wrap items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-sm">{order.orderNumber}</p>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <p className="text-sm text-gray-600">{order.customer?.name}</p>
              <span className={`text-xs px-3 py-1 capitalize ${statusClass(order.status)}`}>{order.status}</span>
              <span className="font-medium text-sm">₹{order.pricing?.total?.toLocaleString()}</span>
              <span className="text-xs text-gray-400">{order.items?.length} item(s)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =====================================================================
// WorkerStock.jsx — Low stock alerts
// =====================================================================
export const WorkerStock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [stockInput, setStockInput] = useState({});

  useEffect(() => {
    api.get('/worker/stock')
      .then(({ data }) => setProducts(data.lowStockProducts || []))
      .catch(() => toast.error('Failed to load stock data'))
      .finally(() => setLoading(false));
  }, []);

  const handleStockUpdate = async (productId, size, color) => {
    const key = `${productId}-${size}-${color}`;
    const newStock = stockInput[key];
    if (newStock === undefined || newStock === '') {
      toast.error('Please enter a stock value');
      return;
    }
    setUpdatingId(key);
    try {
      await api.put(`/worker/stock/${productId}`, { size, color, stock: Number(newStock) });
      toast.success('Stock updated!');
      // Refresh
      const { data } = await api.get('/worker/stock');
      setProducts(data.lowStockProducts || []);
      setStockInput(prev => ({ ...prev, [key]: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-luxe-black">Stock Alerts</h1>
        <p className="text-gray-500 text-sm">Products with variants having less than 5 units in stock</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white border border-gray-100 p-5 h-24 skeleton" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-100 p-16 text-center">
          <FiAlertCircle size={48} className="text-green-400 mx-auto mb-4" />
          <p className="font-serif italic text-gray-400 text-xl">All stock levels are healthy! 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map(product => {
            const lowVariants = product.variants?.filter(v => v.stock < 5) || [];
            return (
              <div key={product._id} className="bg-white border border-gray-100 p-5">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-16 bg-gray-100 shrink-0 overflow-hidden">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">👔</div>
                    )}
                  </div>
                  <div>
                    <p className="font-serif font-medium text-luxe-black">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category?.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Total Stock: {product.totalStock} units</p>
                  </div>
                </div>

                {/* Low stock variants */}
                <div className="space-y-2">
                  {lowVariants.map(variant => {
                    const key = `${product._id}-${variant.size}-${variant.color}`;
                    return (
                      <div key={key} className="flex flex-wrap items-center gap-3 p-3 bg-red-50 border border-red-100">
                        <span className="text-xs font-medium bg-white border border-gray-200 px-2 py-0.5">{variant.size}</span>
                        <span className="text-xs text-gray-600">{variant.color}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 ${variant.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {variant.stock === 0 ? 'OUT OF STOCK' : `${variant.stock} left`}
                        </span>
                        <div className="flex gap-2 ml-auto">
                          <input
                            type="number"
                            min={0}
                            value={stockInput[key] || ''}
                            onChange={(e) => setStockInput(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder="New stock"
                            className="w-28 border border-gray-200 px-2 py-1 text-xs focus:outline-none focus:border-gold-500"
                          />
                          <button
                            onClick={() => handleStockUpdate(product._id, variant.size, variant.color)}
                            disabled={updatingId === key}
                            className="px-3 py-1 bg-luxe-black text-white text-xs hover:bg-gold-500 hover:text-luxe-black transition-all disabled:opacity-50"
                          >
                            {updatingId === key ? '...' : 'Update'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
