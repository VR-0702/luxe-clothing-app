import { useState, useEffect } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['placed', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

const statusClass = (status) => {
  const map = {
    placed: 'bg-blue-50 text-blue-700 border border-blue-200',
    confirmed: 'bg-purple-50 text-purple-700 border border-purple-200',
    processing: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    packed: 'bg-orange-50 text-orange-700 border border-orange-200',
    shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    delivered: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
    returned: 'bg-gray-50 text-gray-700 border border-gray-200',
  };
  return map[status] || 'bg-gray-50 text-gray-700';
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [workers, setWorkers] = useState([]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (filterStatus) params.set('status', filterStatus);
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/orders?${params}`);
      setOrders(data.orders || []);
      setPagination(data.pagination || { pages: 1, total: 0 });
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, filterStatus, search]);

  useEffect(() => {
    // Load workers for assignment
    api.get('/admin/users?role=worker&limit=100')
      .then(({ data }) => setWorkers(data.users || []))
      .catch(() => {});
  }, []);

  const handleStatusUpdate = async (orderId, status, assignedWorker = null) => {
    setUpdatingId(orderId);
    try {
      const payload = { status };
      if (assignedWorker) payload.assignedWorker = assignedWorker;
      await api.put(`/admin/orders/${orderId}/status`, payload);
      toast.success(`Order status updated to "${status}"`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-luxe-black">Orders</h1>
          <p className="text-gray-500 text-sm">{pagination.total} total orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 text-sm text-gray-500 hover:text-luxe-black border border-gray-200 px-3 py-2 hover:border-gray-400 transition-all">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order number..."
            className="input-luxe pl-9 text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="input-luxe max-w-[180px] text-sm"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {/* Orders list */}
      <div className="space-y-2">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 p-4">
              <div className="h-5 skeleton rounded w-1/3 mb-2" />
              <div className="h-4 skeleton rounded w-1/2" />
            </div>
          ))
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-100 p-16 text-center">
            <p className="font-serif italic text-gray-400 text-xl">No orders found</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order._id} className="bg-white border border-gray-100">
              {/* Order row */}
              <div
                className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                {/* Order number + date */}
                <div className="min-w-[180px]">
                  <p className="font-medium text-sm text-luxe-black">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Customer */}
                <div className="flex-1 min-w-[140px]">
                  <p className="text-sm text-gray-700">{order.customer?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400">{order.customer?.email}</p>
                </div>

                {/* Items count */}
                <div className="text-sm text-gray-500 min-w-[80px]">
                  {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                </div>

                {/* Total */}
                <div className="font-medium text-sm min-w-[80px]">
                  ₹{order.pricing?.total?.toLocaleString()}
                </div>

                {/* Status badge */}
                <span className={`text-xs px-3 py-1 capitalize font-sans tracking-wide ${statusClass(order.status)}`}>
                  {order.status}
                </span>

                {/* Worker */}
                {order.assignedWorker && (
                  <span className="text-xs text-gray-400">👷 {order.assignedWorker?.name}</span>
                )}

                {/* Expand icon */}
                {expandedOrder === order._id ? (
                  <FiChevronUp size={16} className="text-gray-400 ml-auto" />
                ) : (
                  <FiChevronDown size={16} className="text-gray-400 ml-auto" />
                )}
              </div>

              {/* Expanded detail */}
              {expandedOrder === order._id && (
                <div className="border-t border-gray-100 p-5 grid md:grid-cols-2 gap-6 animate-fade-in">
                  {/* Items */}
                  <div>
                    <h4 className="text-xs tracking-widests uppercase text-gray-500 mb-3 font-sans">Items Ordered</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="w-12 h-14 bg-gray-100 shrink-0 overflow-hidden">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">👔</div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-serif line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.size} · {item.color} · ×{item.quantity}</p>
                            <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping address */}
                    <div className="mt-4">
                      <h4 className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Shipping To</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {order.shippingAddress?.name} · {order.shippingAddress?.phone}<br />
                        {order.shippingAddress?.street}, {order.shippingAddress?.city}<br />
                        {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}
                      </p>
                    </div>
                  </div>

                  {/* Admin controls */}
                  <div>
                    <h4 className="text-xs tracking-widests uppercase text-gray-500 mb-3 font-sans">Order Management</h4>

                    {/* Pricing summary */}
                    <div className="bg-gray-50 p-3 mb-4 text-sm space-y-1">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span><span>₹{order.pricing?.subtotal?.toLocaleString()}</span>
                      </div>
                      {order.pricing?.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span><span>-₹{order.pricing.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span><span>{order.pricing?.shipping === 0 ? 'Free' : `₹${order.pricing?.shipping}`}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-luxe-black border-t border-gray-200 pt-1 mt-1">
                        <span>Total</span><span>₹{order.pricing?.total?.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Payment info */}
                    <div className="mb-4">
                      <p className="text-xs tracking-widests uppercase text-gray-500 mb-1 font-sans">Payment</p>
                      <p className="text-sm capitalize">
                        {order.payment?.method} —{' '}
                        <span className={`font-medium ${order.payment?.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                          {order.payment?.status}
                        </span>
                      </p>
                    </div>

                    {/* Update Status */}
                    <div className="mb-3">
                      <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Update Status</label>
                      <div className="flex gap-2">
                        <select
                          defaultValue={order.status}
                          id={`status-select-${order._id}`}
                          className="input-luxe text-sm flex-1"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            const sel = document.getElementById(`status-select-${order._id}`);
                            handleStatusUpdate(order._id, sel.value);
                          }}
                          disabled={updatingId === order._id}
                          className="px-3 py-2 bg-luxe-black text-white text-xs hover:bg-gold-500 hover:text-luxe-black transition-all disabled:opacity-50"
                        >
                          {updatingId === order._id ? '...' : 'Update'}
                        </button>
                      </div>
                    </div>

                    {/* Assign Worker */}
                    {workers.length > 0 && (
                      <div>
                        <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Assign Worker</label>
                        <div className="flex gap-2">
                          <select
                            id={`worker-select-${order._id}`}
                            defaultValue={order.assignedWorker?._id || ''}
                            className="input-luxe text-sm flex-1"
                          >
                            <option value="">Unassigned</option>
                            {workers.map(w => (
                              <option key={w._id} value={w._id}>{w.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const sel = document.getElementById(`worker-select-${order._id}`);
                              const statusSel = document.getElementById(`status-select-${order._id}`);
                              handleStatusUpdate(order._id, statusSel.value, sel.value || null);
                            }}
                            className="px-3 py-2 bg-gray-100 text-gray-700 text-xs hover:bg-gray-200 transition-all"
                          >
                            Assign
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Status history */}
                    {order.statusHistory?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Status History</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {[...order.statusHistory].reverse().map((h, i) => (
                            <div key={i} className="flex gap-2 text-xs text-gray-500">
                              <span className="w-2 h-2 rounded-full bg-gold-400 mt-1 shrink-0" />
                              <span className="capitalize font-medium text-gray-700">{h.status}</span>
                              <span>·</span>
                              <span>{new Date(h.updatedAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 text-sm border transition-all
                ${page === i + 1 ? 'bg-luxe-black text-white border-luxe-black' : 'border-gray-200 hover:border-luxe-black'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
