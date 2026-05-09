import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Loading spinner while auth check is pending
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-luxe-cream">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="font-serif text-gray-400 italic">Loading...</p>
    </div>
  </div>
);

// Generic protected route - requires any authenticated user
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;

  return isAuthenticated
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />;
};

// Admin-only route
export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
};

// Worker-only route (also accessible by admin)
export const WorkerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!['worker', 'admin'].includes(user.role)) return <Navigate to="/" replace />;

  return children;
};
