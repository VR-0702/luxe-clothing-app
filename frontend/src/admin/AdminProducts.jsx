import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (search) params.set('search', search);
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setPagination(data.pagination || { pages: 1, total: 0 });
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"? It will be hidden from the store.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deactivated');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-medium text-luxe-black">Products</h1>
          <p className="text-gray-500 text-sm">{pagination.total} total products</p>
        </div>
        <Link to="/admin/products/add" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative mb-5 max-w-md">
        <FiSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="input-luxe pl-10"
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
                <th className="text-left px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Status</th>
                <th className="text-right px-4 py-3 text-xs tracking-widests uppercase text-gray-500 font-sans">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 skeleton rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-serif italic">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-gray-100 shrink-0 overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">👔</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-luxe-black line-clamp-1">{product.name}</p>
                          {product.isFeatured && (
                            <span className="text-xs text-gold-600">✦ Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{product.category?.name || '—'}</td>
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
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${product._id}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                          title="View"
                        >
                          <FiEye size={15} />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="p-1.5 text-gray-400 hover:text-gold-500 transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          disabled={deletingId === product._id}
                          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

export default AdminProducts;
