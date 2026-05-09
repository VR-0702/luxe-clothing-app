import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name}!`);
      // Redirect based on role
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'worker') navigate('/worker');
      else navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxe-cream flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-luxe-black flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
        />
        <div className="relative text-center">
          <Link to="/" className="font-display text-5xl text-white tracking-[0.25em] hover:text-gold-400 transition-colors">
            LUXE
          </Link>
          <div className="w-16 h-px bg-gold-500 mx-auto my-6" />
          <p className="font-serif text-gray-400 text-xl italic leading-relaxed">
            "Style is a way to say who you are without having to speak."
          </p>
          <p className="text-gray-600 text-sm mt-3 tracking-widest">— Rachel Zoe</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <Link to="/" className="font-display text-3xl tracking-widest text-luxe-black flex justify-center lg:hidden mb-8">
            LUXE
          </Link>

          <h1 className="font-display text-3xl font-medium text-luxe-black mb-1">Welcome Back</h1>
          <p className="text-gray-500 font-serif italic mb-8">Sign in to your LUXE account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Email Address</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input-luxe pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="input-luxe pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            {/* Demo credentials hint */}
            <div className="bg-blue-50 border border-blue-100 p-3 text-xs text-blue-600 font-sans leading-relaxed">
              <strong>Demo accounts:</strong><br />
              Admin: admin@luxe.com / admin123<br />
              Worker: worker@luxe.com / worker123<br />
              Customer: customer@luxe.com / customer123
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-gold-600 hover:text-gold-700 font-medium hover-gold-underline">
              Create Account
            </Link>
          </p>

          <Link to="/" className="block text-center mt-4 text-xs text-gray-400 hover:text-luxe-black transition-colors">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
