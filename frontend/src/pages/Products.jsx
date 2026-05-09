import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiGrid, FiList } from 'react-icons/fi';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const SORT_OPTIONS = [
  { label: 'Latest', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: '-price' },
  { label: 'Top Rated', value: '-ratings.average' },
];

const SkeletonCard = () => (
  <div className="bg-white animate-pulse">
    <div className="aspect-[3/4] skeleton" />
    <div className="p-3 space-y-2">
      <div className="h-3 skeleton w-1/3" />
      <div className="h-4 skeleton w-2/3" />
      <div className="h-4 skeleton w-1/4" />
    </div>
  </div>
);

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    size: searchParams.get('size') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set('limit', '12');

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.products || []);
      setPagination(data.pagination || { total: 0, pages: 1, page: 1 });
    } catch (err) {
      console.error('Failed to fetch products:', err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params);
  }, [filters]);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || []));
  }, []);

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', size: '', sort: '-createdAt', page: 1 });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.size || filters.search;

  return (
    <div className="min-h-screen bg-luxe-cream">
      {/* Page Header */}
      <div className="bg-luxe-black text-white py-14 text-center">
        <p className="text-gold-400 text-xs tracking-[0.4em] uppercase font-sans mb-2">Explore</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium">
          {filters.search ? `Search: "${filters.search}"` : 'All Collections'}
        </h1>
        <p className="text-gray-400 font-serif italic mt-2">
          {loading ? '...' : `${pagination.total} pieces curated for you`}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 text-sm tracking-widest uppercase hover:text-gold-500 transition-colors"
          >
            <FiFilter size={16} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-gold-500 rounded-full" />
            )}
          </button>

          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
              >
                <FiX size={14} /> Clear filters
              </button>
            )}
            <select
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="text-sm border-b border-gray-300 bg-transparent focus:outline-none focus:border-gold-500 py-1 pr-6 cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filters */}
          <aside className={`shrink-0 w-64 transition-all duration-300 ${filterOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="sticky top-24 space-y-6">

              {/* Categories */}
              <div>
                <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-3 font-sans">Category</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilter('category', '')}
                    className={`block text-sm w-full text-left py-1 hover:text-gold-500 transition-colors
                      ${!filters.category ? 'text-gold-500 font-medium' : 'text-gray-600'}`}
                  >
                    All Categories
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat._id}
                      onClick={() => setFilter('category', cat.slug)}
                      className={`block text-sm w-full text-left py-1 hover:text-gold-500 transition-colors
                        ${filters.category === cat.slug ? 'text-gold-500 font-medium' : 'text-gray-600'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div>
                <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-3 font-sans">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilter('minPrice', e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilter('maxPrice', e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Size filter */}
              <div>
                <h3 className="text-xs tracking-widest uppercase text-gray-500 mb-3 font-sans">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => setFilter('size', filters.size === size ? '' : size)}
                      className={`w-10 h-10 text-xs border transition-all duration-200
                        ${filters.size === size
                          ? 'bg-luxe-black text-white border-luxe-black'
                          : 'border-gray-200 text-gray-600 hover:border-luxe-black'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <p className="font-display text-4xl text-gray-200 mb-4">No products found</p>
                <p className="text-gray-400 font-serif italic mb-6">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn-outline">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                  {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setFilters(prev => ({ ...prev, page: i + 1 }))}
                        className={`w-10 h-10 text-sm border transition-all duration-200
                          ${filters.page === i + 1
                            ? 'bg-luxe-black text-white border-luxe-black'
                            : 'border-gray-200 text-gray-600 hover:border-luxe-black'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;
