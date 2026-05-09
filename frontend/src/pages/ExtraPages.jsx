// =====================================================================
// Profile.jsx
// =====================================================================

import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiSave } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxe-cream">
      <div className="bg-luxe-black text-white py-12 text-center">
        <h1 className="font-display text-4xl font-medium">My Profile</h1>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Profile Info */}
        <div className="bg-white border border-gray-100 p-6">
          <h2 className="font-display text-xl mb-5">Personal Information</h2>
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-luxe-light border border-gray-200 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <FiUser size={24} className="text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-luxe-black">{user?.name}</p>
              <p className="text-sm text-gray-400 capitalize">{user?.role}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Full Name</label>
              <div className="relative">
                <FiUser size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="input-luxe pl-10" />
              </div>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Email</label>
              <div className="relative">
                <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={user?.email} disabled className="input-luxe pl-10 bg-gray-50 cursor-not-allowed text-gray-400" />
              </div>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Phone</label>
              <div className="relative">
                <FiPhone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} className="input-luxe pl-10" placeholder="+91 98765 43210" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <FiSave size={16} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white border border-gray-100 p-6">
          <h2 className="font-display text-xl mb-5">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {[
              { name: 'currentPassword', label: 'Current Password', value: passwords.currentPassword },
              { name: 'newPassword', label: 'New Password', value: passwords.newPassword },
              { name: 'confirmPassword', label: 'Confirm New Password', value: passwords.confirmPassword },
            ].map(({ name, label, value }) => (
              <div key={name}>
                <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">{label}</label>
                <div className="relative">
                  <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={value}
                    onChange={(e) => setPasswords(p => ({ ...p, [name]: e.target.value }))}
                    required
                    minLength={name !== 'currentPassword' ? 6 : 1}
                    className="input-luxe pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwLoading} className="btn-outline flex items-center gap-2">
              <FiLock size={16} /> {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// Wishlist.jsx
// =====================================================================


export const Wishlist = () => {
  const { user } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setWishlistProducts(data.user?.wishlist || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-luxe-cream">
      <div className="bg-luxe-black text-white py-12 text-center">
        <h1 className="font-display text-4xl font-medium">My Wishlist</h1>
        <p className="text-gray-400 font-serif italic mt-1">{wishlistProducts.length} saved items</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <FiHeart size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="font-display text-3xl text-gray-400 mb-3">Nothing saved yet</h2>
            <p className="text-gray-400 font-serif italic mb-6">Heart products you love to save them here</p>
            <Link to="/products" className="btn-primary">Explore Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistProducts.map(product => (
              <ProductCard key={product._id || product} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================================
// About.jsx
// =====================================================================
export const About = () => (
  <div className="min-h-screen bg-luxe-cream animate-fade-in">
    <div className="bg-luxe-black text-white py-20 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
      />
      <p className="text-gold-400 text-xs tracking-[0.4em] uppercase font-sans mb-3 relative">Who We Are</p>
      <h1 className="font-display text-5xl md:text-6xl font-medium relative">Our Story</h1>
    </div>

    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-16">
        <p className="font-serif text-gray-600 text-xl italic leading-relaxed mb-6">
          LUXE was born from a simple belief: that every person deserves to feel extraordinary in what they wear.
        </p>
        <div className="w-20 h-px bg-gold-400 mx-auto" />
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="font-display text-2xl font-medium mb-4">Our Philosophy</h2>
          <p className="text-gray-600 leading-relaxed">
            Founded in 2025, LUXE curates clothing that transcends trends. We believe fashion is a form of self-expression, and our role is to provide the finest canvas for your story. Every piece in our collection is chosen with intention — for its quality, its craftsmanship, and its ability to make you feel like the best version of yourself.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-medium mb-4">Our Commitment</h2>
          <p className="text-gray-600 leading-relaxed">
            We partner exclusively with artisans and manufacturers who share our commitment to quality and ethical practices. From the sourcing of raw materials to the final stitch, we ensure every garment meets our exacting standards — because you deserve nothing less.
          </p>
        </div>
      </div>

      <div className="bg-luxe-black text-white p-12 text-center">
        <p className="font-display text-3xl italic text-gold-400 mb-4">"Elegance is not about being noticed, it's about being remembered."</p>
        <p className="text-gray-500 tracking-widest text-sm">— Giorgio Armani</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
        {[
          { number: '50,000+', label: 'Happy Customers' },
          { number: '500+', label: 'Curated Pieces' },
          { number: '50+', label: 'Artisan Partners' },
          { number: '30', label: 'Day Returns' },
        ].map(item => (
          <div key={item.label}>
            <p className="font-display text-4xl text-gold-500 font-medium mb-1">{item.number}</p>
            <p className="text-xs tracking-widest uppercase text-gray-500 font-sans">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// =====================================================================
// Contact.jsx
// =====================================================================
import { FiMapPin, FiMail as FiMailIcon, FiPhone as FiPhoneIcon } from 'react-icons/fi';

export const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production: send via API
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-luxe-cream">
      <div className="bg-luxe-black text-white py-16 text-center">
        <p className="text-gold-400 text-xs tracking-[0.4em] uppercase font-sans mb-2">Reach Out</p>
        <h1 className="font-display text-5xl font-medium">Contact Us</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-16">
        {/* Contact info */}
        <div>
          <h2 className="font-display text-2xl font-medium mb-6">Get in Touch</h2>
          <p className="text-gray-500 font-serif italic mb-8 leading-relaxed">
            We'd love to hear from you. Whether it's a question about your order, styling advice, or anything else — we're here to help.
          </p>
          <div className="space-y-5">
            {[
              { icon: FiMapPin, title: 'Visit Us', desc: '12 Fashion Street, Mumbai, Maharashtra 400001' },
              { icon: FiPhoneIcon, title: 'Call Us', desc: '+91 98765 43210 (Mon–Sat, 10am–7pm)' },
              { icon: FiMailIcon, title: 'Email Us', desc: 'hello@luxefashion.in' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 border border-gold-300 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-gold-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-white border border-gray-100 p-8">
          {sent ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">✉️</div>
              <h3 className="font-display text-2xl mb-2">Message Sent!</h3>
              <p className="text-gray-500 font-serif italic">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required className="input-luxe" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required className="input-luxe" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Subject</label>
                <input value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} required className="input-luxe" placeholder="How can we help?" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Message</label>
                <textarea value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} required rows={5} className="input-luxe resize-none" placeholder="Tell us more..." />
              </div>
              <button type="submit" className="btn-primary w-full">Send Message</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// FAQ.jsx
// =====================================================================
const FAQS = [
  { q: 'What is your return policy?', a: 'We offer a 30-day return policy on all unused, unwashed items with original tags. Simply log in, go to your orders, and initiate a return request.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive an email with tracking details. You can also track your order in the "My Orders" section of your account.' },
  { q: 'Do you offer free shipping?', a: 'Yes! We offer free shipping on all orders above ₹999. For orders below this amount, a flat shipping fee of ₹99 applies.' },
  { q: 'What payment methods do you accept?', a: 'We accept Credit/Debit cards, UPI (GPay, PhonePe, Paytm), Cash on Delivery, and our secure demo payment for testing.' },
  { q: 'How do I find my size?', a: 'Each product page has a size guide. Generally, we follow standard Indian sizing. If you\'re between sizes, we recommend sizing up.' },
  { q: 'Can I modify or cancel my order?', a: 'Orders can be cancelled within 1 hour of placement. After that, please contact our support team and we\'ll do our best to assist you.' },
  { q: 'Are your products authentic?', a: 'Absolutely. Every product on LUXE is sourced directly from verified manufacturers and artisans. We guarantee 100% authenticity.' },
  { q: 'How do I apply a coupon code?', a: 'On the Cart page, you\'ll see a coupon code field. Enter your code and click "Apply" to see your discount.' },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="min-h-screen bg-luxe-cream">
      <div className="bg-luxe-black text-white py-16 text-center">
        <p className="text-gold-400 text-xs tracking-[0.4em] uppercase font-sans mb-2">Help Center</p>
        <h1 className="font-display text-5xl font-medium">Frequently Asked Questions</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white border border-gray-100">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-serif font-medium text-luxe-black pr-4">{faq.q}</span>
                <span className="text-gold-500 shrink-0 text-lg font-light">{openIndex === i ? '−' : '+'}</span>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-gray-600 leading-relaxed text-sm animate-fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-luxe-black text-white p-8 text-center">
          <h3 className="font-display text-2xl mb-2">Still have questions?</h3>
          <p className="text-gray-400 font-serif italic mb-6">Our team is here to help you</p>
          <Link to="/contact" className="btn-gold inline-block">Contact Support</Link>
        </div>
      </div>
    </div>
  );
};
