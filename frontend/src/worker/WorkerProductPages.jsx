import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiEdit2, FiArrowLeft, FiUpload, FiX, FiSearch } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useWorkerPermissions } from './WorkerLayout';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
const emptyVariant = { size: 'M', color: '', colorHex: '#000000', stock: 0 };

// =====================================================================
// WorkerProducts — Products list (add/edit permission ke saath)
// =====================================================================
export const WorkerProducts = () => {
  const { can } = useWorkerPermissions();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set('search', search);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setPagination(data.pagination || { pages: 1, total: 0 });
    } catch {
      toast.error('Products load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-luxe-black">Products</h1>
          <p className="text-gray-500 text-sm">{pagination.total} products</p>
        </div>
        {/* Sirf tab dikhao jab add_products permission ho */}
        {can('add_products') && (
          <Link to="/worker/products/add" className="btn-primary flex items-center gap-2">
            <FiPlus size={16} /> Product Add Karo
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <FiSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Product dhundo..."
          className="input-luxe pl-10 text-sm"
        />
      </div>

      {/* Products table */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-gray-500 font-sans">Product</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-gray-500 font-sans">Category</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-gray-500 font-sans">Price</th>
                <th className="text-left px-4 py-3 text-xs tracking-widest uppercase text-gray-500 font-sans">Stock</th>
                {can('edit_products') && (
                  <th className="text-right px-4 py-3 text-xs tracking-widest uppercase text-gray-500 font-sans">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 skeleton rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400 font-serif italic">
                    Koi product nahi mila
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-gray-100 shrink-0 overflow-hidden">
                          {product.images?.[0]?.url
                            ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-gray-300">👔</div>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-luxe-black line-clamp-1">{product.name}</p>
                          {product.isFeatured && <span className="text-xs text-gold-600">✦ Featured</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{product.category?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium">₹{(product.discountPrice || product.price)?.toLocaleString()}</span>
                      {product.discountPrice && (
                        <span className="text-xs text-gray-400 line-through ml-1">₹{product.price?.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${product.totalStock === 0 ? 'text-red-500' : product.totalStock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                        {product.totalStock === 0 ? 'Out of Stock' : `${product.totalStock} units`}
                      </span>
                    </td>
                    {can('edit_products') && (
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/worker/products/edit/${product._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 hover:border-gold-400 hover:text-gold-600 transition-all"
                        >
                          <FiEdit2 size={12} /> Edit
                        </Link>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 text-sm border transition-all ${page === i + 1 ? 'bg-luxe-black text-white border-luxe-black' : 'border-gray-200 hover:border-luxe-black'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================================
// WorkerProductForm — Add / Edit product (worker ke liye)
// =====================================================================
export const WorkerProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useWorkerPermissions();
  const isEdit = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [form, setForm] = useState({
    name: '', description: '', shortDescription: '',
    price: '', discountPrice: '', category: '',
    fabric: '', careInstructions: '', tags: '',
    isFeatured: false,
    variants: [{ ...emptyVariant }],
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || []));
  }, []);

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(({ data }) => {
        const p = data.product;
        setForm({
          name: p.name, description: p.description,
          shortDescription: p.shortDescription || '',
          price: p.price, discountPrice: p.discountPrice || '',
          category: p.category?._id || '',
          fabric: p.fabric || '', careInstructions: p.careInstructions || '',
          tags: p.tags?.join(', ') || '',
          isFeatured: p.isFeatured,
          variants: p.variants?.length > 0 ? p.variants : [{ ...emptyVariant }],
        });
        setExistingImages(p.images || []);
      });
    }
  }, [id]);

  // Permission check
  if (isEdit && !can('edit_products')) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-3xl text-gray-300 mb-3">Permission Nahi Hai</p>
        <p className="text-gray-400 font-serif italic mb-6">Products edit karne ki permission nahi hai. Admin se baat karo.</p>
        <Link to="/worker/products" className="btn-outline">Wapas Jao</Link>
      </div>
    );
  }

  if (!isEdit && !can('add_products')) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-3xl text-gray-300 mb-3">Permission Nahi Hai</p>
        <p className="text-gray-400 font-serif italic mb-6">Products add karne ki permission nahi hai. Admin se baat karo.</p>
        <Link to="/worker/products" className="btn-outline">Wapas Jao</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const addVariant = () => setForm(prev => ({ ...prev, variants: [...prev.variants, { ...emptyVariant }] }));
  const removeVariant = (i) => setForm(prev => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));
  const updateVariant = (i, key, value) => {
    setForm(prev => {
      const variants = [...prev.variants];
      variants[i] = { ...variants[i], [key]: value };
      return { ...prev, variants };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.description || !form.price || !form.category) {
      toast.error('Saare required fields bharo');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'variants') formData.append('variants', JSON.stringify(val));
        else if (key === 'tags') formData.append('tags', JSON.stringify(val.split(',').map(t => t.trim()).filter(Boolean)));
        else formData.append(key, val);
      });
      imageFiles.forEach(file => formData.append('images', file));

      if (isEdit) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product update ho gaya!');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product add ho gaya!');
      }
      navigate('/worker/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save nahi hua');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/worker/products')} className="p-2 hover:text-gold-500 transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-medium">{isEdit ? 'Product Edit Karo' : 'Naya Product Add Karo'}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? 'Product details update karo' : 'Naya product store mein add karo'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Left: Main fields */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-display text-lg mb-4">Product Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required className="input-luxe" placeholder="e.g. Classic Linen Shirt" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Short Description</label>
                <input name="shortDescription" value={form.shortDescription} onChange={handleChange} className="input-luxe" placeholder="Ek line mein product explain karo" />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Full Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className="input-luxe resize-none" placeholder="Product ki poori jaankari..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Fabric</label>
                  <input name="fabric" value={form.fabric} onChange={handleChange} className="input-luxe" placeholder="e.g. 100% Cotton" />
                </div>
                <div>
                  <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Tags (comma separated)</label>
                  <input name="tags" value={form.tags} onChange={handleChange} className="input-luxe" placeholder="shirt, casual, summer" />
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-white border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg">Variants (Size × Color × Stock)</h2>
              <button type="button" onClick={addVariant} className="flex items-center gap-1.5 text-sm text-gold-600 hover:text-gold-700">
                <FiPlus size={14} /> Add Variant
              </button>
            </div>
            <div className="space-y-3">
              {form.variants.map((variant, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-center p-3 bg-gray-50 border border-gray-100">
                  <select value={variant.size} onChange={e => updateVariant(i, 'size', e.target.value)} className="input-luxe text-sm">
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input value={variant.color} onChange={e => updateVariant(i, 'color', e.target.value)} placeholder="Color name" className="input-luxe text-sm" />
                  <input type="color" value={variant.colorHex || '#000000'} onChange={e => updateVariant(i, 'colorHex', e.target.value)} className="w-10 h-10 cursor-pointer border border-gray-200 p-0.5" title="Color choose karo" />
                  <input type="number" value={variant.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} placeholder="Stock" min={0} className="input-luxe text-sm" />
                  <button type="button" onClick={() => removeVariant(i)} disabled={form.variants.length === 1} className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 justify-self-center">
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-display text-lg mb-4">Product Images</h2>
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Current Images</p>
                <div className="flex gap-2 flex-wrap">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative w-20 h-24 overflow-hidden bg-gray-100">
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      {img.isPrimary && <div className="absolute bottom-0 left-0 right-0 bg-gold-500 text-xs text-center text-luxe-black py-0.5">Main</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 p-8 text-center cursor-pointer hover:border-gold-400 transition-colors">
              <FiUpload size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click karke photos upload karo (max 5)</p>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-24 overflow-hidden bg-gray-100">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImagePreviews(p => p.filter((_, idx) => idx !== i)); setImageFiles(p => p.filter((_, idx) => idx !== i)); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center rounded-full text-xs">
                      <FiX size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-display text-lg mb-4">Pricing</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Original Price (₹) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} required min={0} className="input-luxe" placeholder="2999" />
              </div>
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Sale Price (₹)</label>
                <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} min={0} className="input-luxe" placeholder="Optional" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-display text-lg mb-4">Category *</h2>
            <select name="category" value={form.category} onChange={handleChange} required className="input-luxe">
              <option value="">Category Choose Karo</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>

          <div className="bg-white border border-gray-100 p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-gold-500" />
              <span className="text-sm text-gray-700">Featured Product Mark Karo</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60">
            {loading && <span className="w-4 h-4 border-2 border-luxe-black border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Save ho raha hai...' : isEdit ? 'Update Karo' : 'Product Add Karo'}
          </button>
          <button type="button" onClick={() => navigate('/worker/products')} className="btn-outline w-full">Cancel</button>
        </div>
      </form>
    </div>
  );
};

// =====================================================================
// WorkerCategories — Categories dekho / manage karo
// =====================================================================
export const WorkerCategories = () => {
  const { can } = useWorkerPermissions();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0 });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch {
      toast.error('Categories load nahi hui');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', sortOrder: 0 });
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0 });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);
      if (editingId) {
        await api.put(`/categories/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category update ho gayi!');
      } else {
        await api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category add ho gayi!');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save nahi hua');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-luxe-black">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories</p>
        </div>
        {can('manage_categories') && (
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
            {showForm && !editingId ? <FiX size={16} /> : <FiPlus size={16} />}
            {showForm && !editingId ? 'Cancel' : 'Category Add Karo'}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && can('manage_categories') && (
        <div className="bg-white border border-gray-100 p-6 mb-6 animate-slide-up">
          <h2 className="font-display text-lg mb-4">{editingId ? 'Category Edit Karo' : 'Nayi Category'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Naam *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="input-luxe" placeholder="e.g. Men's Shirts" />
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} className="input-luxe" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-luxe" placeholder="Optional" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Category Image</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="text-sm text-gray-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? 'Save ho raha hai...' : editingId ? 'Update Karo' : 'Category Banao'}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Categories grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white border border-gray-100 p-5 h-24 skeleton" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="bg-white border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              {cat.image
                ? <img src={cat.image} alt={cat.name} className="w-14 h-14 object-cover shrink-0" />
                : <div className="w-14 h-14 bg-gray-100 flex items-center justify-center shrink-0 text-2xl">🏷️</div>
              }
              <div className="flex-1 min-w-0">
                <p className="font-medium text-luxe-black">{cat.name}</p>
                <p className="text-xs text-gray-400 truncate">{cat.description || 'No description'}</p>
                <span className={`text-xs px-1.5 py-0.5 ${cat.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {can('manage_categories') && (
                <button onClick={() => startEdit(cat)} className="p-1.5 text-gray-400 hover:text-gold-500 transition-colors shrink-0">
                  <FiEdit2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No permission message */}
      {!can('manage_categories') && (
        <div className="mt-4 bg-yellow-50 border border-yellow-100 p-4 text-sm text-yellow-700">
          ⚠️ Categories edit karne ki permission nahi hai. Admin se request karo.
        </div>
      )}
    </div>
  );
};
