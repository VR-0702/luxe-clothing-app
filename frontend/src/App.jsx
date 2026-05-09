import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute, WorkerRoute } from './components/ProtectedRoute';

// Customer pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Profile, Wishlist, About, Contact, FAQ } from './pages/ExtraPages';

// Admin pages
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import ProductForm from './admin/ProductForm';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';
import AdminWorkers from './admin/AdminWorkers';
import { AdminCategories, AdminCoupons } from './admin/AdminCouponsCategories';
import AdminSettings from './admin/AdminSettings';

// Worker pages
import { WorkerLayout } from './worker/WorkerLayout';
import { WorkerOrders, WorkerPendingOrders, WorkerStock } from './worker/WorkerPages';
import { WorkerProducts, WorkerProductForm, WorkerCategories } from './worker/WorkerProductPages';
import WorkerOTPVerify from './worker/WorkerOTPVerify';

const CustomerLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-luxe-cream">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-luxe-cream text-center px-4">
    <div>
      <p className="font-display text-9xl text-gold-400 font-medium">404</p>
      <h1 className="font-display text-3xl text-luxe-black mb-3">Page Not Found</h1>
      <p className="text-gray-500 font-serif italic mb-6">The page you're looking for doesn't exist.</p>
      <a href="/" className="btn-primary inline-block">Return Home</a>
    </div>
  </div>
);

const App = () => (
  <Routes>
    {/* PUBLIC */}
    <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
    <Route path="/products" element={<CustomerLayout><Products /></CustomerLayout>} />
    <Route path="/product/:id" element={<CustomerLayout><ProductDetails /></CustomerLayout>} />
    <Route path="/about" element={<CustomerLayout><About /></CustomerLayout>} />
    <Route path="/contact" element={<CustomerLayout><Contact /></CustomerLayout>} />
    <Route path="/faq" element={<CustomerLayout><FAQ /></CustomerLayout>} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    {/* PROTECTED CUSTOMER */}
    <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
    <Route path="/wishlist" element={<ProtectedRoute><CustomerLayout><Wishlist /></CustomerLayout></ProtectedRoute>} />
    <Route path="/checkout" element={<ProtectedRoute><CustomerLayout><Checkout /></CustomerLayout></ProtectedRoute>} />
    <Route path="/order-success" element={<ProtectedRoute><CustomerLayout><OrderSuccess /></CustomerLayout></ProtectedRoute>} />
    <Route path="/orders" element={<ProtectedRoute><CustomerLayout><Orders /></CustomerLayout></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><CustomerLayout><Profile /></CustomerLayout></ProtectedRoute>} />

    {/* ADMIN */}
    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="products/add" element={<ProductForm />} />
      <Route path="products/edit/:id" element={<ProductForm />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="workers" element={<AdminWorkers />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="coupons" element={<AdminCoupons />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>

    {/* WORKER */}
    <Route path="/worker" element={<WorkerRoute><WorkerLayout /></WorkerRoute>}>
      <Route index element={<WorkerOrders />} />
      <Route path="pending" element={<WorkerPendingOrders />} />
      <Route path="otp-verify" element={<WorkerOTPVerify />} />
      <Route path="stock" element={<WorkerStock />} />
      <Route path="products" element={<WorkerProducts />} />
      <Route path="products/add" element={<WorkerProductForm />} />
      <Route path="products/edit/:id" element={<WorkerProductForm />} />
      <Route path="categories" element={<WorkerCategories />} />
    </Route>

    {/* 404 */}
    <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
  </Routes>
);

export default App;
