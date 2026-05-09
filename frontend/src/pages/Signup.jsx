import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success('Account created! Welcome to LUXE ✨');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxe-cream flex">
      {/* Left panel */}
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
            "Fashion is the armor to survive the reality of everyday life."
          </p>
          <p className="text-gray-600 text-sm mt-3 tracking-widest">— Bill Cunningham</p>
        </div>
      </div>

      {/* Right signup form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <Link to="/" className="font-display text-3xl tracking-widest text-luxe-black flex justify-center lg:hidden mb-8">
            LUXE
          </Link>

          <h1 className="font-display text-3xl font-medium text-luxe-black mb-1">Create Account</h1>
          <p className="text-gray-500 font-serif italic mb-8">Join the LUXE community today</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Full Name</label>
              <div className="relative">
                <FiUser size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="input-luxe pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                />
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Phone (Optional)</label>
              <div className="relative">
                <FiPhone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="input-luxe pl-10"
                  placeholder="+91 98765 43210"
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
                  minLength={6}
                  className="input-luxe pl-10 pr-10"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Confirm Password</label>
              <div className="relative">
                <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input-luxe pl-10"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-600 hover:text-gold-700 font-medium">Sign In</Link>
          </p>

          <Link to="/" className="block text-center mt-4 text-xs text-gray-400 hover:text-luxe-black transition-colors">
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
