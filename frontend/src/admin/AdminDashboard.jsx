import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiShoppingBag, FiUsers, FiPackage, FiDollarSign,
  FiTrendingUp, FiArrowRight, FiAlertCircle
} from 'react-icons/fi';
import api from '../api/axios';

const StatCard = ({ icon: Icon, label, value, sub, color = 'gold' }) => (
  <div className="bg-white border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 flex items-center justify-center
        ${color === 'gold' ? 'bg-gold-50 text-gold-600' :
          color === 'green' ? 'bg-green-50 text-green-600' :
          color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
        <Icon size={22} />
      </div>
    </div>
    <p className="text-2xl font-display font-medium text-luxe-black mb-1">{value}</p>
    <p className="text-xs tracking-widest uppercase text-gray-400 font-sans">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColors = {
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-purple-100 text-purple-800',
    processing: 'bg-yellow-100 text-yellow-800',
    packed: 'bg-orange-100 text-orange-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-luxe-black">Dashboard</h1>
        <p className="text-gray-500 font-serif italic mt-1">Welcome back. Here's what's happening.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FiDollarSign}
          label="Total Revenue"
          value={`₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`}
          color="gold"
        />
        <StatCard
          icon={FiPackage}
          label="Total Orders"
          value={stats?.totalOrders || 0}
          color="blue"
        />
        <StatCard
          icon={FiShoppingBag}
          label="Products"
          value={stats?.totalProducts || 0}
          color="purple"
        />
        <StatCard
          icon={FiUsers}
          label="Customers"
          value={stats?.totalUsers || 0}
          color="green"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-medium">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-gold-500 hover:text-gold-600 flex items-center gap-1">
              View all <FiArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.recentOrders?.length > 0 ? (
              stats.recentOrders.map(order => (
                <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-luxe-black">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.customer?.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {order.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">₹{order.pricing?.total?.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-6 font-serif italic">No orders yet</p>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white border border-gray-100 p-6">
          <h2 className="font-display text-lg font-medium mb-5">Orders by Status</h2>
          <div className="space-y-3">
            {stats?.ordersByStatus?.length > 0 ? (
              stats.ordersByStatus.map(item => (
                <div key={item._id} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 capitalize min-w-24 text-center ${statusColors[item._id] || 'bg-gray-100 text-gray-800'}`}>
                    {item._id}
                  </span>
                  <div className="flex-1 bg-gray-100 h-2">
                    <div
                      className="h-2 bg-gold-400 transition-all duration-500"
                      style={{ width: `${Math.min((item.count / (stats?.totalOrders || 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 min-w-6">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-6 font-serif italic">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-luxe-black text-white p-6">
        <h2 className="font-sans text-sm tracking-widest uppercase text-gold-400 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Product', to: '/admin/products/add', icon: '➕' },
            { label: 'View Orders', to: '/admin/orders', icon: '📦' },
            { label: 'Manage Users', to: '/admin/users', icon: '👥' },
            { label: 'Coupons', to: '/admin/coupons', icon: '🏷️' },
          ].map(action => (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-center gap-2 p-4 border border-gray-700 hover:border-gold-500 hover:text-gold-400 transition-all duration-200 text-center"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs tracking-wide font-sans">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
