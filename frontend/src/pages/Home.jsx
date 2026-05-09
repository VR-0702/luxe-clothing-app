import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiArrowDown } from 'react-icons/fi';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const Hero = ({ heroImage }) => (
  <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-luxe-black">
    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #D4AF37 0, #D4AF37 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-white animate-fade-in">
          <p className="text-gold-400 text-xs tracking-[0.4em] uppercase mb-6 font-sans">New Collection 2025</p>
          <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-medium leading-[1.05] mb-6">
            Dress for<br /><em className="text-gold-400 not-italic">the Life</em><br />You Want
          </h1>
          <p className="font-serif text-gray-300 text-xl italic mb-10 max-w-md leading-relaxed">
            Discover curated pieces that speak to your essence — where luxury meets effortless style.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/products" className="btn-gold inline-flex items-center gap-2 group">
              Shop Now <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/about" className="btn-outline border-white text-white hover:bg-white hover:text-luxe-black inline-flex items-center gap-2">Our Story</Link>
          </div>
        </div>
        <div className="hidden lg:block relative">
          <div className="w-full aspect-[3/4] max-w-sm mx-auto relative">
            <div className="absolute -inset-4 border border-gold-600/30" />
            <div className="absolute -inset-2 border border-gold-600/20" />
            <img
              src={heroImage || "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80"}
              alt="LUXE Fashion"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
              <p className="font-serif text-white italic text-sm">New Collection 2025</p>
              <p className="font-display text-gold-400 tracking-widest text-xs uppercase mt-0.5">Est. MMXXV</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 flex flex-col items-center gap-2 animate-bounce">
      <span className="text-xs tracking-widest uppercase font-sans">Scroll</span>
      <FiArrowDown size={16} />
    </div>
  </section>
);

const CategoryStrip = ({ categories }) => (
  <section className="py-16 bg-luxe-light">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.length > 0 ? categories.slice(0, 5).map((cat) => (
          <Link key={cat._id} to={`/products?category=${cat.slug}`} className="group relative overflow-hidden bg-white border border-gray-100 hover:border-gold-400 transition-all duration-300">
            <div className="aspect-square bg-gray-50 flex items-center justify-center p-6">
              {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="text-4xl opacity-50">👔</div>}
            </div>
            <div className="p-3 text-center">
              <p className="text-xs tracking-widest uppercase font-sans text-gray-700 group-hover:text-gold-600 transition-colors">{cat.name}</p>
            </div>
          </Link>
        )) : ['Men', 'Women', 'Kids', 'Accessories', 'Footwear'].map((name) => (
          <Link key={name} to={`/products?category=${name.toLowerCase()}`} className="group bg-white border border-gray-100 hover:border-gold-400 transition-all duration-300">
            <div className="aspect-square bg-gray-50 flex items-center justify-center">
              <span className="text-4xl">{name === 'Men' ? '👔' : name === 'Women' ? '👗' : name === 'Kids' ? '🧒' : name === 'Accessories' ? '👜' : '👟'}</span>
            </div>
            <div className="p-3 text-center">
              <p className="text-xs tracking-widest uppercase font-sans text-gray-700 group-hover:text-gold-600 transition-colors">{name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const MarqueeStrip = () => (
  <div className="bg-gold-500 py-3 overflow-hidden">
    <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
      {[...Array(4)].map((_, i) => (
        <span key={i} className="flex items-center gap-8 mx-8 text-xs tracking-[0.3em] uppercase font-sans text-luxe-black font-medium">
          <span>New Arrivals</span><span>✦</span><span>Free Shipping Over Rs.999</span><span>✦</span><span>Premium Quality</span><span>✦</span><span>Luxury Fashion</span><span>✦</span>
        </span>
      ))}
    </div>
  </div>
);

const FeaturedProducts = ({ products }) => (
  <section className="py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <p className="text-gold-500 text-xs tracking-[0.4em] uppercase font-sans mb-3">Handpicked for You</p>
        <h2 className="section-title mb-3">Featured Collection</h2>
        <p className="section-subtitle">Pieces that define contemporary luxury</p>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[{name:'Classic Linen Shirt',price:2999,cat:'Men'},{name:'Silk Evening Gown',price:8999,cat:'Women'},{name:'Cashmere Blazer',price:12999,cat:'Men'},{name:'Embroidered Kurta',price:4499,cat:'Women'}].map((item, i) => (
            <div key={i} className="bg-white group">
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><span className="text-5xl opacity-30">👔</span></div>
              <div className="p-3">
                <p className="text-xs text-gray-400 tracking-widest uppercase">{item.cat}</p>
                <p className="font-serif text-luxe-black mt-1">{item.name}</p>
                <p className="font-medium mt-1">Rs.{item.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-center mt-12">
        <Link to="/products" className="btn-outline inline-flex items-center gap-2 group">
          View All Products <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  </section>
);

// Sale Countdown Timer
const SaleCountdown = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate) - new Date();
      if (diff <= 0) return setTimeLeft({ expired: true });
      setTimeLeft({ days: Math.floor(diff / (1000*60*60*24)), hours: Math.floor((diff/(1000*60*60))%24), mins: Math.floor((diff/1000/60)%60), secs: Math.floor((diff/1000)%60) });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endDate]);
  if (timeLeft.expired) return <p className="text-red-400 text-sm mt-3">Sale has ended!</p>;
  return (
    <div className="flex justify-center gap-3 mt-6">
      {[{label:'Days',val:timeLeft.days},{label:'Hours',val:timeLeft.hours},{label:'Mins',val:timeLeft.mins},{label:'Secs',val:timeLeft.secs}].map(({label,val})=>(
        <div key={label} className="text-center">
          <div className="w-14 h-14 bg-red-500 flex items-center justify-center mb-1">
            <span className="font-display text-2xl text-white font-medium">{String(val??0).padStart(2,'0')}</span>
          </div>
          <p className="text-xs text-gray-400 tracking-widest uppercase font-sans">{label}</p>
        </div>
      ))}
    </div>
  );
};

// Sale Section — Admin se on/off hoti hai
const SaleSection = ({ saleProducts, saleSettings }) => {
  if (!saleSettings?.isActive || saleProducts.length === 0) return null;
  return (
    <section className="py-20 bg-luxe-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-16 bg-red-500" />
            <span className="text-red-400 text-xs tracking-[0.4em] uppercase font-sans font-bold animate-pulse">
              {saleSettings.label || 'LIMITED TIME SALE'}
            </span>
            <div className="h-px w-16 bg-red-500" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-white mb-3">
            {saleSettings.title || 'End of Season Sale'}
          </h2>
          <p className="font-serif text-gray-400 italic text-lg">{saleSettings.subtitle || 'Up to 50% off on selected styles'}</p>
          {saleSettings.endDate && <SaleCountdown endDate={saleSettings.endDate} />}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {saleProducts.slice(0, 8).map((product) => (
            <div key={product._id} className="relative">
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 tracking-wide">SALE</div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/products?sale=true" className="btn-gold inline-flex items-center gap-2 group">
            View All Sale Items <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

const BrandValues = () => (
  <section className="py-16 bg-luxe-black text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {[{icon:'🌿',title:'Sustainably Sourced',desc:'Materials chosen with care for our planet'},{icon:'✂️',title:'Master Craftsmanship',desc:'Every stitch tells a story of precision'},{icon:'🚚',title:'Free Shipping',desc:'On all orders above Rs.999 across India'},{icon:'↩️',title:'Easy Returns',desc:'No-hassle 30-day return policy'}].map((item) => (
          <div key={item.title}>
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-display text-base font-medium text-gold-400 mb-2">{item.title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed font-sans">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, saleRes] = await Promise.all([
          api.get('/products?featured=true&limit=8'),
          api.get('/categories'),
          api.get('/products?limit=8&sort=-createdAt'),
        ]);
        setFeaturedProducts(productsRes.data.products || []);
        setCategories(categoriesRes.data.categories || []);
        setSaleProducts((saleRes.data.products || []).filter(p => p.discountPrice));
        // Settings load karo
        const settingsRaw = localStorage.getItem('luxe_site_settings');
        if (settingsRaw) setSiteSettings(JSON.parse(settingsRaw));
      } catch (error) {
        console.error('Failed to load home data:', error.message);
      }
    };
    fetchData();
    // Listen for settings changes from admin
    window.addEventListener('luxe_settings_updated', () => {
      const s = localStorage.getItem('luxe_site_settings');
      if (s) setSiteSettings(JSON.parse(s));
    });
  }, []);

  return (
    <div className="animate-fade-in">
      <Hero heroImage={siteSettings?.heroImage} />
      <CategoryStrip categories={categories} />
      <MarqueeStrip />
      <FeaturedProducts products={featuredProducts} />
      <SaleSection saleProducts={saleProducts} saleSettings={siteSettings?.sale} />
      <BrandValues />
    </div>
  );
};

const style = document.createElement('style');
style.textContent = '@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }';
document.head.appendChild(style);

export default Home;
