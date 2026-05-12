import { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiCheck, FiX, FiTrash2, FiUserPlus } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('customer');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', isActive: true });
  const [deletingId, setDeletingId] = useState(null);

  // Add new user form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '', role: 'customer' });
  const [adding, setAdding] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (roleFilter) params.set('role', roleFilter);
      if (search) params.set('search', search);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users || []);
      setPagination(data.pagination || { pages: 1, total: 0 });
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, search]);

  const startEdit = (user) => {
    setEditingId(user._id);
    setEditForm({ role: user.role, isActive: user.isActive });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}`, editForm);
      toast.success('User update ho gaya!');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update fail ho gaya');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`"${userName}" ko permanently delete karna chahte ho? Ye action undo nahi ho sakta!`)) return;
    setDeletingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success(`${userName} delete ho gaya!`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete fail ho gaya');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (addForm.password.length < 6) { toast.error('Password kam se kam 6 characters ka hona chahiye'); return; }
    setAdding(true);
    try {
      // Worker ke liye alag route, baaki ke liye register
      if (addForm.role === 'worker') {
        await api.post('/admin/workers', addForm);
      } else {
        await api.post('/auth/register', addForm);
        // Role update karo agar admin hai
        if (addForm.role === 'admin') {
          const { data } = await api.get(`/admin/users?search=${addForm.email}`);
          if (data.users?.[0]) {
            await api.put(`/admin/users/${data.users[0]._id}`, { role: 'admin', isActive: true });
          }
        }
      }
      toast.success(`${addForm.role} account ban gaya!`);
      setAddForm({ name: '', email: '', password: '', phone: '', role: 'customer' });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'User create nahi hua');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-luxe-black">User Management</h1>
          <p className="text-gray-500 text-sm">{pagination.total} users found</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          {showAddForm ? <FiX size={16} /> : <FiUserPlus size={16} />}
          {showAddForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-100 p-6 mb-6 animate-slide-up">
          <h2 className="font-display text-lg mb-4">Naya User Banao</h2>
          <form onSubmit={handleAddUser} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Naam *</label>
              <input value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} required className="input-luxe" placeholder="Full name" />
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Email *</label>
              <input type="email" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} required className="input-luxe" placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Phone</label>
              <input value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} className="input-luxe" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Password *</label>
              <input type="password" value={addForm.password} onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))} required minLength={6} className="input-luxe" placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="text-xs tracking-widests uppercase text-gray-500 block mb-1.5 font-sans">Role *</label>
              <select value={addForm.role} onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))} className="input-luxe">
                <option value="customer">Customer</option>
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex items-end gap-3">
              <button type="submit" disabled={adding} className="btn-primary flex items-center gap-2 flex-1 justify-center">
                {adding && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {adding ? 'Ban raha hai...' : 'User Banao'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Naam ya email se dhundo..."
            className="input-luxe pl-9 text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['', 'customer', 'worker', 'admin'].map(role => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1); }}
              className={`px-4 py-2 text-xs tracking-widests uppercase border transition-all
                ${roleFilter === role ? 'bg-luxe-black text-white border-luxe-black' : 'border-gray-200 text-gray-600 hover:border-luxe-black'}`}
            >
              {role || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">User</th>
                <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Phone</th>
                <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Role</th>
                <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Status</th>
                <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Joined</th>
                <th className="text-right px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 skeleton rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-serif italic">No users found</td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold-100 border border-gold-200 flex items-center justify-center shrink-0">
                          <span className="text-gold-600 font-medium text-sm">{user.name?.[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-luxe-black">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.phone || '—'}</td>

                    {/* Role — editable */}
                    <td className="px-4 py-3">
                      {editingId === user._id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                          className="border border-gold-400 px-2 py-1 text-xs bg-white focus:outline-none"
                        >
                          {['customer', 'worker', 'admin'].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 capitalize
                          ${user.role === 'admin' ? 'bg-gold-100 text-gold-700' :
                            user.role === 'worker' ? 'bg-blue-50 text-blue-700' :
                            'bg-gray-100 text-gray-700'}`}>
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* Status — editable */}
                    <td className="px-4 py-3">
                      {editingId === user._id ? (
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="accent-gold-500"
                          />
                          <span className="text-xs">{editForm.isActive ? 'Active' : 'Inactive'}</span>
                        </label>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === user._id ? (
                          <>
                            <button onClick={() => saveEdit(user._id)} className="p-1.5 text-green-500 hover:text-green-700 transition-colors" title="Save">
                              <FiCheck size={16} />
                            </button>
                            <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Cancel">
                              <FiX size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(user)} className="p-1.5 text-gray-400 hover:text-gold-500 transition-colors" title="Edit">
                              <FiEdit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id, user.name)}
                              disabled={deletingId === user._id}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              {deletingId === user._id
                                ? <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                                : <FiTrash2 size={15} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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

export default AdminUsers;
