import { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
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
      toast.success('User updated!');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-medium text-luxe-black">User Management</h1>
        <p className="text-gray-500 text-sm">{pagination.total} users found</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or email..."
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
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 skeleton rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-serif italic">
                    No users found
                  </td>
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

                    {/* Role column - editable */}
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
                            'bg-gray-100 text-gray-700'}`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* Status column - editable */}
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

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {editingId === user._id ? (
                          <>
                            <button
                              onClick={() => saveEdit(user._id)}
                              className="p-1.5 text-green-500 hover:text-green-700 transition-colors"
                              title="Save"
                            >
                              <FiCheck size={16} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              title="Cancel"
                            >
                              <FiX size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEdit(user)}
                            className="p-1.5 text-gray-400 hover:text-gold-500 transition-colors"
                            title="Edit user"
                          >
                            <FiEdit2 size={15} />
                          </button>
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
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 text-sm border transition-all
                  ${page === i + 1 ? 'bg-luxe-black text-white border-luxe-black' : 'border-gray-200 hover:border-luxe-black'}`}
              >
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
