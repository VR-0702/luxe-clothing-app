import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiTag } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

// =====================================================================
// AdminCategories.jsx
// =====================================================================
export const AdminCategories = () => {
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
      toast.error('Failed to load categories');
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
        toast.success('Category updated!');
      } else {
        await api.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created!');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deactivated');
      fetchCategories();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-luxe-black">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary flex items-center gap-2">
          {showForm && !editingId ? <FiX size={16} /> : <FiPlus size={16} />}
          {showForm && !editingId ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 p-6 mb-6 animate-slide-up">
          <h2 className="font-display text-lg mb-4">{editingId ? 'Edit Category' : 'New Category'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="input-luxe" placeholder="e.g. Men's Shirts" />
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} className="input-luxe" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-luxe" placeholder="Optional description" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Category Image</label>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="text-sm text-gray-500" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Categories grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 p-5 h-24 skeleton" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="bg-white border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-14 h-14 object-cover shrink-0 bg-gray-100" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 flex items-center justify-center shrink-0 text-2xl">🏷️</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-luxe-black">{cat.name}</p>
                <p className="text-xs text-gray-400 truncate">{cat.description || 'No description'}</p>
                <span className={`text-xs px-1.5 py-0.5 ${cat.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(cat)} className="p-1.5 text-gray-400 hover:text-gold-500 transition-colors">
                  <FiEdit2 size={14} />
                </button>
                <button onClick={() => handleDelete(cat._id, cat.name)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// =====================================================================
// AdminCoupons.jsx
// =====================================================================
export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage',
    discountValue: '', minOrderAmount: 0, maxDiscount: '',
    usageLimit: '', validUntil: '', isActive: true
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/coupons');
      setCoupons(data.coupons || []);
    } catch {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/coupons', form);
      toast.success('Coupon created!');
      setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: 0, maxDiscount: '', usageLimit: '', validUntil: '', isActive: true });
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await api.put(`/admin/coupons/${id}`, { isActive: !isActive });
      toast.success('Coupon updated!');
      fetchCoupons();
    } catch {
      toast.error('Failed to update coupon');
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch {
      toast.error('Failed to delete coupon');
    }
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-luxe-black">Coupons & Discounts</h1>
          <p className="text-gray-500 text-sm">{coupons.length} coupons</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? <FiX size={16} /> : <FiPlus size={16} />}
          {showForm ? 'Cancel' : 'Create Coupon'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-gray-100 p-6 mb-6 animate-slide-up">
          <h2 className="font-display text-lg mb-4">New Coupon</h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Coupon Code *</label>
              <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} required className="input-luxe font-mono" placeholder="LUXE10" />
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Discount Type *</label>
              <select value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))} className="input-luxe">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">
                {form.discountType === 'percentage' ? 'Discount %' : 'Discount ₹'} *
              </label>
              <input type="number" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: e.target.value }))} required min={0} className="input-luxe" placeholder={form.discountType === 'percentage' ? '10' : '500'} />
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Min Order Amount (₹)</label>
              <input type="number" value={form.minOrderAmount} onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))} min={0} className="input-luxe" placeholder="0" />
            </div>
            {form.discountType === 'percentage' && (
              <div>
                <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Max Discount Cap (₹)</label>
                <input type="number" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))} min={0} className="input-luxe" placeholder="Optional" />
              </div>
            )}
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Usage Limit</label>
              <input type="number" value={form.usageLimit} onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))} min={1} className="input-luxe" placeholder="Unlimited" />
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Valid Until *</label>
              <input type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} required className="input-luxe" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="input-luxe" placeholder="Internal note about this coupon" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saving ? 'Creating...' : 'Create Coupon'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons table */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Code</th>
              <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Discount</th>
              <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Min Order</th>
              <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Usage</th>
              <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Valid Until</th>
              <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Status</th>
              <th className="text-right px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 skeleton rounded" /></td>
                  ))}
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <FiTag size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 font-serif italic">No coupons yet</p>
                </td>
              </tr>
            ) : (
              coupons.map(coupon => {
                const expired = isExpired(coupon.validUntil);
                return (
                  <tr key={coupon._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium text-luxe-black bg-gold-50 border border-gold-200 px-2 py-0.5 text-sm">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                      {coupon.maxDiscount && <span className="text-xs text-gray-400 ml-1">(max ₹{coupon.maxDiscount})</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : 'None'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {coupon.usedCount}/{coupon.usageLimit || '∞'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={expired ? 'text-red-500' : 'text-gray-500'}>
                        {new Date(coupon.validUntil).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 ${
                        expired ? 'bg-orange-50 text-orange-700' :
                        coupon.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(coupon._id, coupon.isActive)}
                          className={`p-1.5 transition-colors ${coupon.isActive ? 'text-gray-400 hover:text-red-500' : 'text-gray-400 hover:text-green-500'}`}
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {coupon.isActive ? <FiX size={15} /> : <FiCheck size={15} />}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id, coupon.code)}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
