import { useState, useEffect } from 'react';
import { FiPlus, FiX, FiUser, FiSave, FiCheck, FiShield } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ALL_PERMISSIONS = [
  { key: 'view_orders',         label: 'Orders Dekhna',        icon: '📦', desc: 'Assigned orders dekh sakta hai' },
  { key: 'update_order_status', label: 'Order Status Update',  icon: '🔄', desc: 'Order ko packed/shipped mark kar sakta hai' },
  { key: 'view_all_orders',     label: 'Sabke Orders Dekhna',  icon: '📋', desc: 'Unassigned pending orders bhi dekh sakta hai' },
  { key: 'manage_stock',        label: 'Stock Manage Karna',   icon: '📊', desc: 'Stock levels dekh aur update kar sakta hai' },
  { key: 'add_products',        label: 'Products Add Karna',   icon: '➕', desc: 'Naye products add kar sakta hai' },
  { key: 'edit_products',       label: 'Products Edit Karna',  icon: '✏️', desc: 'Existing products edit kar sakta hai' },
  { key: 'manage_categories',   label: 'Categories Manage',    icon: '🏷️', desc: 'Categories add/edit kar sakta hai' },
  { key: 'view_customers',      label: 'Customers Dekhna',     icon: '👥', desc: 'Customer list dekh sakta hai' },
];

const PRESETS = {
  packing_staff:     { label: 'Packing Staff',      desc: 'Sirf orders pack karo',           permissions: ['view_orders', 'update_order_status'] },
  warehouse_manager: { label: 'Warehouse Manager',  desc: 'Orders + Stock manage karo',      permissions: ['view_orders', 'update_order_status', 'view_all_orders', 'manage_stock'] },
  product_manager:   { label: 'Product Manager',    desc: 'Products aur categories manage',  permissions: ['add_products', 'edit_products', 'manage_categories', 'manage_stock'] },
  full_access:       { label: 'Full Access',         desc: 'Sab kuch kar sakta hai',          permissions: ALL_PERMISSIONS.map(p => p.key) },
};

// =====================================================================
// PermissionEditor — alag component, hooks sahi jagah hain
// =====================================================================
const PermissionEditor = ({ workerId, workerName, currentPerms, onSave, onCancel }) => {
  const [selected, setSelected] = useState(currentPerms);

  const toggle = (key) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const applyPreset = (presetKey) => {
    setSelected(PRESETS[presetKey].permissions);
    toast.success(`"${PRESETS[presetKey].label}" preset apply ho gaya!`);
  };

  return (
    <div className="border-t border-gray-100 p-5 bg-gray-50 animate-fade-in">
      <h3 className="font-sans text-sm font-medium text-luxe-black mb-4">
        <FiShield className="inline mr-1.5 text-gold-500" size={14} />
        {workerName} ke liye Permissions Set Karo
      </h3>

      {/* Quick Presets */}
      <div className="mb-5">
        <p className="text-xs tracking-widest uppercase text-gray-500 mb-2 font-sans">Quick Presets</p>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button key={key} onClick={() => applyPreset(key)} title={preset.desc}
              className="px-3 py-1.5 text-xs border border-gray-200 bg-white hover:border-gold-500 hover:text-gold-600 transition-all">
              {preset.label}
            </button>
          ))}
          <button onClick={() => setSelected([])}
            className="px-3 py-1.5 text-xs border border-red-200 text-red-500 bg-white hover:bg-red-50 transition-all">
            Sab Hatao
          </button>
        </div>
      </div>

      {/* Individual Permissions */}
      <div className="mb-5">
        <p className="text-xs tracking-widest uppercase text-gray-500 mb-3 font-sans">Individual Permissions</p>
        <div className="grid sm:grid-cols-2 gap-2">
          {ALL_PERMISSIONS.map(({ key, label, icon, desc }) => {
            const isSelected = selected.includes(key);
            return (
              <label key={key}
                className={`flex items-start gap-3 p-3 border cursor-pointer transition-all
                  ${isSelected ? 'border-gold-400 bg-gold-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <input type="checkbox" checked={isSelected} onChange={() => toggle(key)} className="mt-0.5 accent-gold-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-luxe-black">{icon} {label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                {isSelected && <FiCheck size={14} className="text-gold-500 mt-0.5 shrink-0" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-4 p-3 bg-white border border-gray-100">
        <p className="text-xs text-gray-500 font-sans">
          <strong className="text-luxe-black">{selected.length}</strong> permissions selected
          {selected.length === 0 && <span className="text-red-500"> — Koi permission nahi hogi</span>}
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={() => onSave(selected)} className="btn-primary flex items-center gap-2">
          <FiSave size={14} /> Permissions Save Karo
        </button>
        <button onClick={onCancel} className="btn-outline">Cancel</button>
      </div>
    </div>
  );
};

// =====================================================================
// WorkerCard — alag component, hooks sahi jagah hain
// =====================================================================
const WorkerCard = ({ worker, perms, workerPerms, onSave, onDeactivate }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white border border-gray-100">
      {/* Worker header */}
      <div className="flex flex-wrap items-center gap-4 p-5">
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
          <span className="text-blue-600 font-medium">{worker.name?.[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-luxe-black">{worker.name}</p>
          <p className="text-xs text-gray-400">{worker.email} {worker.phone && `· ${worker.phone}`}</p>
          <div className="flex gap-1.5 flex-wrap mt-1.5">
            {perms.length === 0 ? (
              <span className="text-xs text-red-400 italic">Koi permission nahi — assign karo</span>
            ) : perms.map(p => {
              const perm = ALL_PERMISSIONS.find(ap => ap.key === p);
              return perm ? (
                <span key={p} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5">
                  {perm.icon} {perm.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 ${worker.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {worker.isActive ? '● Active' : '● Inactive'}
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 hover:border-gold-400 hover:text-gold-600 transition-all"
          >
            <FiShield size={13} /> {isEditing ? 'Cancel' : 'Permissions'}
          </button>
          <button
            onClick={() => onDeactivate(worker._id, worker.isActive)}
            className={`text-xs px-3 py-1.5 border transition-all
              ${worker.isActive ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
          >
            {worker.isActive ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>
      </div>

      {/* Permission editor */}
      {isEditing && (
        <PermissionEditor
          workerId={worker._id}
          workerName={worker.name}
          currentPerms={perms}
          onSave={(newPerms) => {
            onSave(worker._id, newPerms);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

// =====================================================================
// AdminWorkers — main component
// =====================================================================
const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [workerPerms, setWorkerPerms] = useState(() => {
    const saved = localStorage.getItem('luxe_worker_permissions');
    return saved ? JSON.parse(saved) : {};
  });

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users?role=worker&limit=100');
      setWorkers(data.users || []);
    } catch {
      toast.error('Workers load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkers(); }, []);

  const handleSavePerms = (workerId, newPerms) => {
    const updated = { ...workerPerms, [workerId]: newPerms };
    setWorkerPerms(updated);
    localStorage.setItem('luxe_worker_permissions', JSON.stringify(updated));
    toast.success('Permissions save ho gayi!');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password kam se kam 6 characters ka hona chahiye'); return; }
    setCreating(true);
    try {
      await api.post('/admin/workers', form);
      toast.success('Worker account ban gaya!');
      setForm({ name: '', email: '', password: '', phone: '' });
      setShowForm(false);
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Worker create nahi hua');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !isActive });
      toast.success(`Worker ${isActive ? 'deactivate' : 'reactivate'} ho gaya!`);
      fetchWorkers();
    } catch {
      toast.error('Update fail ho gaya');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-luxe-black">Workers / Staff</h1>
          <p className="text-gray-500 text-sm">{workers.length} staff members — Har worker ko alag permissions do</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          {showForm ? <FiX size={16} /> : <FiPlus size={16} />}
          {showForm ? 'Cancel' : 'Add Worker'}
        </button>
      </div>

      {/* Create Worker Form */}
      {showForm && (
        <div className="bg-white border border-gray-100 p-6 mb-6 animate-slide-up">
          <h2 className="font-display text-lg mb-5">Naya Worker Account Banao</h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Pura Naam *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required className="input-luxe" placeholder="Worker ka naam" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required className="input-luxe" placeholder="worker@luxe.com" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Phone</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-luxe" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-500 block mb-1.5 font-sans">Password *</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} className="input-luxe" placeholder="Min. 6 characters" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                {creating && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {creating ? 'Ban raha hai...' : 'Worker Account Banao'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Workers List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white border border-gray-100 p-5 h-24 skeleton" />)}
        </div>
      ) : workers.length === 0 ? (
        <div className="bg-white border border-gray-100 p-16 text-center">
          <FiUser size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="font-serif italic text-gray-400 text-xl">Koi worker nahi hai abhi</p>
          <p className="text-gray-400 text-sm mt-2">Upar "Add Worker" button se pehla worker banao</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workers.map(worker => (
            <WorkerCard
              key={worker._id}
              worker={worker}
              perms={workerPerms[worker._id] || []}
              workerPerms={workerPerms}
              onSave={handleSavePerms}
              onDeactivate={handleDeactivate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminWorkers;
