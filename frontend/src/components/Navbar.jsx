import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  FiSearch, FiShoppingBag, FiHeart, FiUser, FiMenu, FiX,
  FiLogOut, FiPackage, FiSettings, FiChevronDown
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin, isWorker } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);

  // Change navbar style on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserDropdown(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'New Arrivals', to: '/products?sort=-createdAt' },
    { label: 'Collections', to: '/products' },
    { label: 'Men', to: '/products?category=men' },
    { label: 'Women', to: '/products?category=women' },
    { label: 'Accessories', to: '/products?category=accessories' },
    { label: 'Sale', to: '/products?sale=true' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100'
        }`}>

        {/* Announcement bar */}
        <div className="bg-luxe-black text-white text-xs text-center py-2 tracking-widest font-sans">
          FREE SHIPPING ON ORDERS ABOVE ₹999 &nbsp;|&nbsp; USE CODE: LUXE10 FOR 10% OFF
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 hover:text-gold-500 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="font-display text-2xl md:text-3xl font-medium tracking-[0.2em] text-luxe-black
                         hover:text-gold-500 transition-colors duration-300"
            >
              LUXE
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-xs tracking-widest uppercase text-gray-600 hover:text-luxe-black
                             hover-gold-underline transition-colors duration-200 font-sans"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Action icons */}
            <div className="flex items-center gap-4">

              {/* Search */}
              <button
                className="p-1.5 hover:text-gold-500 transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <FiSearch size={19} />
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link to="/wishlist" className="p-1.5 hover:text-gold-500 transition-colors" aria-label="Wishlist">
                  <FiHeart size={19} />
                </Link>
              )}

              {/* Cart */}
              <Link to="/cart" className="relative p-1.5 hover:text-gold-500 transition-colors" aria-label="Cart">
                <FiShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-500 text-luxe-black text-xs
                                   w-4 h-4 flex items-center justify-center font-medium rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    className="flex items-center gap-1.5 p-1.5 hover:text-gold-500 transition-colors"
                    onClick={() => setUserDropdown(!userDropdown)}
                  >
                    <FiUser size={19} />
                    <FiChevronDown size={14} className={`transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {userDropdown && (
                    <div className="absolute right-0 top-10 w-52 bg-white border border-gray-100 shadow-lg z-50 animate-slide-up">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-sm text-luxe-black">{user?.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                      </div>
                      <div className="py-1">
                        <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-luxe-light transition-colors">
                          <FiUser size={15} /> My Profile
                        </Link>
                        <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-luxe-light transition-colors">
                          <FiPackage size={15} /> My Orders
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gold-600 hover:bg-luxe-light transition-colors">
                            <FiSettings size={15} /> Admin Panel
                          </Link>
                        )}
                        {isWorker && !isAdmin && (
                          <Link to="/worker" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gold-600 hover:bg-luxe-light transition-colors">
                            <FiSettings size={15} /> Worker Panel
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <FiLogOut size={15} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-xs tracking-widest uppercase px-4 py-2 border border-luxe-black
                             hover:bg-luxe-black hover:text-white transition-all duration-200 font-sans"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white animate-slide-up">
            <div className="max-w-2xl mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, categories..."
                  className="input-luxe flex-1"
                  autoFocus
                />
                <button type="submit" className="btn-primary px-6 py-3">
                  <FiSearch size={16} />
                </button>
              </form>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white animate-slide-in-right">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <span className="font-display text-xl tracking-widest">LUXE</span>
              <button onClick={() => setMobileOpen(false)}><FiX size={20} /></button>
            </div>
            <nav className="p-5 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="py-3 px-2 text-sm tracking-widest uppercase border-b border-gray-50
                             hover:text-gold-500 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar + announcement bar */}
      <div className="h-[72px]" />

      {/* Close dropdown when clicking outside */}
      {userDropdown && (
        <div className="fixed inset-0 z-30" onClick={() => setUserDropdown(false)} />
      )}
    </>
  );
};

export default Navbar;
