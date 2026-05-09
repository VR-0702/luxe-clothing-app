import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid, FiShoppingBag, FiPackage, FiUsers, FiTag,
  FiSettings, FiLogOut, FiMenu, FiX, FiChevronRight,
  FiLayers, FiTruck
} from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: FiGrid, exact: true },
  { label: 'Products', to: '/admin/products', icon: FiShoppingBag },
  { label: 'Categories', to: '/admin/categories', icon: FiLayers },
  { label: 'Orders', to: '/admin/orders', icon: FiPackage },
  { label: 'Customers', to: '/admin/users', icon: FiUsers },
  { label: 'Workers', to: '/admin/workers', icon: FiTruck },
  { label: 'Coupons', to: '/admin/coupons', icon: FiTag },
  { label: 'Settings', to: '/admin/settings', icon: FiSettings },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-luxe-black text-white flex flex-col
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <Link to="/" className="font-display text-2xl tracking-[0.2em] text-white hover:text-gold-400 transition-colors">
            LUXE
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <FiX size={20} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-xs tracking-widest uppercase text-gold-400 font-sans">Admin Panel</p>
          <p className="text-sm text-white mt-1">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map(({ label, to, icon: Icon, exact }) => (
              <Link
                key={label}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-200 group
                  ${isActive(to, exact)
                    ? 'bg-gold-500 text-luxe-black font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {isActive(to, exact) && (
                  <FiChevronRight size={14} className="ml-auto" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Bottom: logout + store link */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            🏪 View Store
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-luxe-black"
          >
            <FiMenu size={22} />
          </button>
          <div className="text-xs text-gray-400 tracking-widest uppercase font-sans hidden lg:block">
            {navItems.find(n => isActive(n.to, n.exact))?.label || 'Admin'}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold-100 border border-gold-300 flex items-center justify-center">
              <span className="text-gold-600 font-medium text-sm">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
