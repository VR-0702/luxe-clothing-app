import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiX, FiUpload, FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];

const emptyVariant = { size: 'M', color: '', colorHex: '#000000', stock: 0, sku: '' };

const ProductForm = () => {
  const { id } = useParams(); // If id exists = Edit mode
  const navigate = useNavigate();
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

  // Load categories
  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || []));
  }, []);

  // Load product if editing
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Variant handlers
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
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      // Append text fields
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'variants') {
          formData.append('variants', JSON.stringify(val));
        } else if (key === 'tags') {
          formData.append('tags', JSON.stringify(val.split(',').map(t => t.trim()).filter(Boolean)));
        } else {
          formData.append(key, val);
        }
      });

      // Append image files
      imageFiles.forEach(file => formData.append('images', file));

      if (isEdit) {
        await api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created!');
      }

      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:text-gold-500 transition-colors">
          <FiArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-medium">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? 'Update product details' : 'Create a new product listing'}</p>
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
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required className="input-luxe" placeholder="e.g. Classic Linen Shirt" />
              </div>
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Short Description</label>
                <input name="shortDescription" value={form.shortDescription} onChange={handleChange} className="input-luxe" placeholder="One-line product tagline" />
              </div>
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Full Description *</label>
                <textarea name="description" value={form.description} onChange={handleChange} required rows={5} className="input-luxe resize-none" placeholder="Detailed product description..." />
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
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Care Instructions</label>
                <textarea name="careInstructions" value={form.careInstructions} onChange={handleChange} rows={2} className="input-luxe resize-none" placeholder="Machine wash cold, tumble dry low..." />
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
                  <select
                    value={variant.size}
                    onChange={e => updateVariant(i, 'size', e.target.value)}
                    className="input-luxe text-sm"
                  >
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    value={variant.color}
                    onChange={e => updateVariant(i, 'color', e.target.value)}
                    placeholder="Color name"
                    className="input-luxe text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={variant.colorHex || '#000000'}
                      onChange={e => updateVariant(i, 'colorHex', e.target.value)}
                      className="w-10 h-10 cursor-pointer border border-gray-200 p-0.5"
                      title="Color hex"
                    />
                  </div>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={e => updateVariant(i, 'stock', Number(e.target.value))}
                    placeholder="Stock"
                    min={0}
                    className="input-luxe text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={form.variants.length === 1}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-30 justify-self-center"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-display text-lg mb-4">Product Images</h2>

            {/* Existing images (edit mode) */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Current Images</p>
                <div className="flex gap-2 flex-wrap">
                  {existingImages.map((img, i) => (
                    <div key={i} className="relative w-20 h-24 overflow-hidden bg-gray-100">
                      <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                      {img.isPrimary && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gold-500 text-xs text-center text-luxe-black py-0.5">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new images */}
            <div>
              <label className="block border-2 border-dashed border-gray-200 p-8 text-center cursor-pointer hover:border-gold-400 transition-colors">
                <FiUpload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload images (max 5, 5MB each)</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP supported</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative w-20 h-24 overflow-hidden bg-gray-100">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center rounded-full text-xs"
                      >
                        <FiX size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Sidebar fields */}
        <div className="space-y-5">
          {/* Pricing */}
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
              {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
                <p className="text-xs text-green-600">
                  {Math.round(((form.price - form.discountPrice) / form.price) * 100)}% discount
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-display text-lg mb-4">Category</h2>
            <select name="category" value={form.category} onChange={handleChange} required className="input-luxe">
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Options */}
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="font-display text-lg mb-4">Options</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={form.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 accent-gold-500"
              />
              <span className="text-sm text-gray-700">Mark as Featured</span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <span className="w-4 h-4 border-2 border-luxe-black border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-outline w-full text-center"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
