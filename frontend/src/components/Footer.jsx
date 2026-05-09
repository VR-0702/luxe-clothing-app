import { Link } from 'react-router-dom';
import {
  FiInstagram, FiFacebook, FiTwitter, FiYoutube,
  FiMail, FiPhone, FiMapPin
} from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-luxe-black text-white mt-24">

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to="/" className="font-display text-3xl tracking-[0.25em] text-white hover:text-gold-400 transition-colors">
              LUXE
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed font-serif italic">
              Curating the finest in contemporary fashion. Elegance is not a privilege; it's a philosophy.
            </p>
            <div className="flex gap-4 mt-6">
              {[
                { icon: FiInstagram, href: '#', label: 'Instagram' },
                { icon: FiFacebook, href: '#', label: 'Facebook' },
                { icon: FiTwitter, href: '#', label: 'Twitter' },
                { icon: FiYoutube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  className="w-9 h-9 border border-gray-700 flex items-center justify-center
                             hover:border-gold-500 hover:text-gold-500 transition-all duration-200"
                  aria-label={label}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-gold-400 mb-5 font-sans">Shop</h3>
            <ul className="space-y-3">
              {[
                ['New Arrivals', '/products?sort=-createdAt'],
                ['Women\'s Collection', '/products?category=women'],
                ['Men\'s Collection', '/products?category=men'],
                ['Accessories', '/products?category=accessories'],
                ['Sale', '/products?sale=true'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white hover-gold-underline transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-gold-400 mb-5 font-sans">Help</h3>
            <ul className="space-y-3">
              {[
                ['FAQ', '/faq'],
                ['Size Guide', '/size-guide'],
                ['Shipping Policy', '/shipping'],
                ['Return Policy', '/returns'],
                ['Contact Us', '/contact'],
                ['About LUXE', '/about'],
              ].map(([label, to]) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-400 hover:text-white hover-gold-underline transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h3 className="text-xs tracking-widest uppercase text-gold-400 mb-5 font-sans">Get in Touch</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm text-gray-400">
                <FiMapPin size={14} className="mt-0.5 shrink-0 text-gold-400" />
                12 Fashion Street, Mumbai, India 400001
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <FiPhone size={14} className="shrink-0 text-gold-400" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-400">
                <FiMail size={14} className="shrink-0 text-gold-400" />
                hello@luxefashion.in
              </li>
            </ul>

            {/* Newsletter */}
            <h4 className="text-xs tracking-widest uppercase text-gray-500 mb-3 font-sans">Newsletter</h4>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-gray-900 border border-gray-700 px-3 py-2 text-sm text-white
                           placeholder-gray-600 focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-gold-500 text-luxe-black px-4 py-2 text-xs tracking-widest hover:bg-gold-400 transition-colors"
              >
                JOIN
              </button>
            </form>
          </div>
        </div>

        {/* Gold divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gold-600 to-transparent mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600 font-sans tracking-wide">
            © {currentYear} LUXE Fashion. All rights reserved.
          </p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <Link key={item} to="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
