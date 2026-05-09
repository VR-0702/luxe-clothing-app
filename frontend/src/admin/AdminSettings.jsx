import { useState, useEffect } from 'react';
import { FiSave, FiUpload, FiImage, FiTag, FiToggleLeft, FiToggleRight, FiInfo, FiTruck, FiShoppingBag } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('modes');
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Store modes
  const [storeSettings, setStoreSettings] = useState({
    deliveryEnabled: true,
    pickupEnabled: false,
    pickupInstructions: 'Store address: 12 Fashion Street, Mumbai. Timing: 10am - 7pm (Mon-Sat)',
    freeShippingThreshold: 999,
    shippingCost: 99,
    taxRate: 18,
  });

  // Hero image
  const [heroPreview, setHeroPreview] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');

  // Sale settings
  const [sale, setSale] = useState({
    isActive: false,
    label: 'LIMITED TIME SALE',
    title: 'End of Season Sale',
    subtitle: 'Up to 50% off on selected styles',
    endDate: '',
  });

  // Load settings
  useEffect(() => {
    // Backend se store settings load karo
    api.get('/orders/settings/store')
      .then(({ data }) => {
        if (data.settings) setStoreSettings(prev => ({ ...prev, ...data.settings }));
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));

    // LocalStorage se hero/sale settings load karo
    const saved = localStorage.getItem('luxe_site_settings');
    if (saved) {
      const s = JSON.parse(saved);
      if (s.heroImage) { setHeroImageUrl(s.heroImage); setHeroPreview(s.heroImage); }
      if (s.sale) setSale(s.sale);
    }
  }, []);

  // Store settings save karo (backend)
  const saveStoreSettings = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings/store', storeSettings);
      toast.success('Store settings save ho gayi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save nahi hua');
    } finally {
      setSaving(false);
    }
  };

  // Hero/Sale settings save karo (localStorage)
  const saveLocalSettings = () => {
    setSaving(true);
    const settings = { heroImage: heroPreview || heroImageUrl, sale };
    localStorage.setItem('luxe_site_settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('luxe_settings_updated'));
    setTimeout(() => {
      setSaving(false);
      toast.success('Settings save ho gayi!');
    }, 400);
  };

  const tabs = [
    { id: 'modes',  label: 'Delivery & Pickup', icon: FiTruck },
    { id: 'hero',   label: 'Hero Image',         icon: FiImage },
    { id: 'sale',   label: 'Sale Page',           icon: FiTag },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-luxe-black">Store Settings</h1>
        <p className="text-gray-500 text-sm">Delivery, Pickup, Hero Image aur Sale manage karo</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all
              ${activeTab === id ? 'border-gold-500 text-luxe-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ====== DELIVERY & PICKUP TAB ====== */}
      {activeTab === 'modes' && (
        <div className="max-w-2xl space-y-5 animate-fade-in">

          {/* Delivery Toggle */}
          <div className="bg-white border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FiTruck size={18} className="text-blue-500" />
                  <h2 className="font-display text-lg">Delivery Mode</h2>
                </div>
                <p className="text-sm text-gray-400">Customer ghar baith ke order kare aur delivery pa sake</p>
                <p className="text-xs text-gray-400 mt-1">
                  Off karne par: Checkout mein delivery option nahi dikhega
                </p>
              </div>
              <button
                onClick={() => setStoreSettings(p => ({ ...p, deliveryEnabled: !p.deliveryEnabled }))}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-all shrink-0 ml-4
                  ${storeSettings.deliveryEnabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {storeSettings.deliveryEnabled
                  ? <><FiToggleRight size={22} className="text-green-600" /> ON</>
                  : <><FiToggleLeft size={22} /> OFF</>}
              </button>
            </div>

            {/* Delivery sub-settings */}
            {storeSettings.deliveryEnabled && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1 font-sans">Free Shipping Limit (₹)</label>
                  <input type="number" value={storeSettings.freeShippingThreshold}
                    onChange={e => setStoreSettings(p => ({ ...p, freeShippingThreshold: Number(e.target.value) }))}
                    className="input-luxe text-sm" />
                </div>
                <div>
                  <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1 font-sans">Shipping Cost (₹)</label>
                  <input type="number" value={storeSettings.shippingCost}
                    onChange={e => setStoreSettings(p => ({ ...p, shippingCost: Number(e.target.value) }))}
                    className="input-luxe text-sm" />
                </div>
                <div>
                  <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1 font-sans">Tax/GST (%)</label>
                  <input type="number" value={storeSettings.taxRate}
                    onChange={e => setStoreSettings(p => ({ ...p, taxRate: Number(e.target.value) }))}
                    className="input-luxe text-sm" />
                </div>
              </div>
            )}
          </div>

          {/* Pickup/Booking Toggle */}
          <div className="bg-white border border-gray-100 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FiShoppingBag size={18} className="text-gold-500" />
                  <h2 className="font-display text-lg">Store Pickup / Booking Mode</h2>
                </div>
                <p className="text-sm text-gray-400">Customer online book kare, store aake OTP dekar saman le</p>
                <p className="text-xs text-gray-400 mt-1">
                  On karne par: Checkout mein "Store Pickup" option dikhega
                </p>
              </div>
              <button
                onClick={() => setStoreSettings(p => ({ ...p, pickupEnabled: !p.pickupEnabled }))}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-all shrink-0 ml-4
                  ${storeSettings.pickupEnabled ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {storeSettings.pickupEnabled
                  ? <><FiToggleRight size={22} className="text-green-600" /> ON</>
                  : <><FiToggleLeft size={22} /> OFF</>}
              </button>
            </div>

            {/* Pickup sub-settings */}
            {storeSettings.pickupEnabled && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">
                  Pickup Instructions (Customer ko dikhegi)
                </label>
                <textarea
                  value={storeSettings.pickupInstructions}
                  onChange={e => setStoreSettings(p => ({ ...p, pickupInstructions: e.target.value }))}
                  rows={3}
                  className="input-luxe resize-none text-sm"
                  placeholder="Store address, timings, etc."
                />
                <div className="mt-3 bg-gold-50 border border-gold-100 p-3">
                  <p className="text-xs text-gold-700 font-sans">
                    <strong>OTP System:</strong> Customer order place karte waqt unique 6-digit OTP milega. Worker/Admin ko OTP verify karna hoga saman dene se pehle.
                  </p>
                </div>
              </div>
            )}

            {/* Warning if both disabled */}
            {!storeSettings.deliveryEnabled && !storeSettings.pickupEnabled && (
              <div className="mt-4 bg-red-50 border border-red-200 p-3 flex gap-2">
                <FiInfo size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">⚠️ Dono off hain! Customers order nahi kar payenge. Kam se kam ek on rakhna zaroori hai.</p>
              </div>
            )}
          </div>

          {/* Current status summary */}
          <div className="bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Current Status</p>
            <div className="flex gap-3">
              <span className={`text-xs px-3 py-1.5 font-medium flex items-center gap-1 ${storeSettings.deliveryEnabled ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                <FiTruck size={12} /> Delivery {storeSettings.deliveryEnabled ? 'ON' : 'OFF'}
              </span>
              <span className={`text-xs px-3 py-1.5 font-medium flex items-center gap-1 ${storeSettings.pickupEnabled ? 'bg-gold-50 text-gold-700 border border-gold-200' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                <FiShoppingBag size={12} /> Store Pickup {storeSettings.pickupEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          <button onClick={saveStoreSettings} disabled={saving} className="btn-gold flex items-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-luxe-black border-t-transparent rounded-full animate-spin" /> : <FiSave size={16} />}
            {saving ? 'Saving...' : 'Save Store Settings'}
          </button>
        </div>
      )}

      {/* ====== HERO IMAGE TAB ====== */}
      {activeTab === 'hero' && (
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-display text-lg mb-2">Hero Section Image</h2>
            <p className="text-sm text-gray-400 mb-5">Home page ke right side wali photo change karo</p>

            {heroPreview && (
              <div className="mb-5">
                <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Current Preview</p>
                <div className="w-48 aspect-[3/4] overflow-hidden border border-gray-200 relative">
                  <img src={heroPreview} alt="Hero Preview" className="w-full h-full object-cover object-top" />
                  <button onClick={() => { setHeroPreview(''); setHeroImageUrl(''); }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white text-xs flex items-center justify-center">✕</button>
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Option 1 — Photo Upload Karo</p>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 p-8 cursor-pointer hover:border-gold-400 transition-colors">
                <FiUpload size={28} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click karke photo choose karo</p>
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => setHeroPreview(ev.target.result);
                  reader.readAsDataURL(file);
                }} className="hidden" />
              </label>
            </div>

            <div className="mb-4">
              <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Option 2 — Image URL Paste Karo</p>
              <input type="url" value={heroImageUrl}
                onChange={e => { setHeroImageUrl(e.target.value); setHeroPreview(e.target.value); }}
                placeholder="https://example.com/photo.jpg" className="input-luxe text-sm" />
            </div>

            <div className="bg-gray-50 p-4">
              <p className="text-xs font-sans text-gray-500 mb-2">Sample Photos:</p>
              <div className="space-y-1.5">
                {[
                  { label: 'Women Fashion', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600' },
                  { label: 'Men Suit',      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600' },
                  { label: 'Model Look',    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600' },
                  { label: 'Indian Ethnic', url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600' },
                ].map(({ label, url }) => (
                  <button key={label} onClick={() => { setHeroImageUrl(url); setHeroPreview(url); }}
                    className="block text-left w-full text-xs text-gold-600 hover:underline">→ {label}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={saveLocalSettings} disabled={saving} className="btn-gold flex items-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-luxe-black border-t-transparent rounded-full animate-spin" /> : <FiSave size={16} />}
            Save Hero Image
          </button>
        </div>
      )}

      {/* ====== SALE TAB ====== */}
      {activeTab === 'sale' && (
        <div className="max-w-2xl animate-fade-in">
          <div className="bg-white border border-gray-100 p-6 mb-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display text-lg">Sale Section</h2>
                <p className="text-sm text-gray-400">Home page par Sale section on/off karo</p>
              </div>
              <button onClick={() => setSale(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-all
                  ${sale.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                {sale.isActive ? <><FiToggleRight size={20} className="text-green-600" /> ACTIVE</> : <><FiToggleLeft size={20} /> INACTIVE</>}
              </button>
            </div>
            <div className={`space-y-4 ${!sale.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Sale Label</label>
                <input value={sale.label} onChange={e => setSale(p => ({ ...p, label: e.target.value }))} className="input-luxe" placeholder="LIMITED TIME SALE" />
              </div>
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Sale Title</label>
                <input value={sale.title} onChange={e => setSale(p => ({ ...p, title: e.target.value }))} className="input-luxe" />
              </div>
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Subtitle</label>
                <input value={sale.subtitle} onChange={e => setSale(p => ({ ...p, subtitle: e.target.value }))} className="input-luxe" />
              </div>
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Sale End Date (countdown ke liye)</label>
                <input type="datetime-local" value={sale.endDate} onChange={e => setSale(p => ({ ...p, endDate: e.target.value }))} className="input-luxe" />
              </div>
            </div>
          </div>
          <button onClick={saveLocalSettings} disabled={saving} className="btn-gold flex items-center gap-2">
            {saving ? <span className="w-4 h-4 border-2 border-luxe-black border-t-transparent rounded-full animate-spin" /> : <FiSave size={16} />}
            Save Sale Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
