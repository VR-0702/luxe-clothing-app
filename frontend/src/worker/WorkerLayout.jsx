import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiPackage, FiList, FiAlertCircle, FiShoppingBag,
  FiLayers, FiLogOut, FiMenu, FiX, FiChevronRight,
  FiShield, FiKey
} from 'react-icons/fi';

export const useWorkerPermissions = () => {
  const { user } = useAuth();
  const saved = localStorage.getItem('luxe_worker_permissions');
  const allPerms = saved ? JSON.parse(saved) : {};
  const myPerms = user ? (allPerms[user._id] || []) : [];
  return {
    can: (permission) => user?.role === 'admin' || myPerms.includes(permission),
    perms: myPerms,
  };
};

export const WorkerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { can } = useWorkerPermissions();

  const isActive = (to, exact) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const navItems = [
    { label: 'Mere Orders',    to: '/worker',                icon: FiPackage,     exact: true,  perm: 'view_orders' },
    { label: 'Pending Orders', to: '/worker/pending',        icon: FiList,        exact: false, perm: 'view_all_orders' },
    { label: 'OTP Verify',     to: '/worker/otp-verify',     icon: FiKey,         exact: false, perm: 'update_order_status' },
    { label: 'Stock Alerts',   to: '/worker/stock',          icon: FiAlertCircle, exact: false, perm: 'manage_stock' },
    { label: 'Products',       to: '/worker/products',       icon: FiShoppingBag, exact: false, perm: 'add_products' },
    { label: 'Categories',     to: '/worker/categories',     icon: FiLayers,      exact: false, perm: 'manage_categories' },
  ].filter(item => can(item.perm));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-luxe-black text-white flex flex-col
        transform transition-transform duration-300 lg:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <Link to="/" className="font-display text-xl tracking-widest text-white hover:text-gold-400 transition-colors">LUXE</Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><FiX size={18} /></button>
        </div>

        <div className="px-4 py-3 border-b border-gray-800">
          <p className="text-xs tracking-widest uppercase text-blue-400 font-sans">Worker Panel</p>
          <p className="text-sm text-white mt-1">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.length === 0 ? (
            <div className="text-center py-8">
              <FiShield size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">Koi permission nahi.<br />Admin se baat karo.</p>
            </div>
          ) : (
            navItems.map(({ label, to, icon: Icon, exact }) => (
              <Link key={label} to={to} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-all
                  ${isActive(to, exact)
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <Icon size={16} />
                <span>{label}</span>
                {isActive(to, exact) && <FiChevronRight size={14} className="ml-auto" />}
              </Link>
            ))
          )}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            🏪 Store Dekho
          </Link>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
            <FiLogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><FiMenu size={22} /></button>
          <p className="text-xs tracking-widest uppercase text-gray-400 font-sans hidden lg:block">Worker Panel</p>
          <div className="w-8 h-8 bg-blue-50 border border-blue-200 flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
