import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiShare2, FiStar, FiArrowLeft, FiCalendar } from 'react-icons/fi';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';

const StarRating = ({ value, onChange, interactive = false }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(star => (
      <button key={star} onClick={() => interactive && onChange?.(star)}
        className={`transition-colors ${interactive ? 'cursor-pointer hover:text-gold-500' : 'cursor-default'}`}
        disabled={!interactive}>
        <FiStar size={interactive ? 20 : 14}
          fill={star <= value ? '#D4AF37' : 'none'}
          stroke={star <= value ? '#D4AF37' : '#9ca3af'} />
      </button>
    ))}
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') || 'cart'; // 'cart' or 'pickup'

  const { addToCart } = useCart();
  const { isAuthenticated, toggleWishlist, isInWishlist } = useAuth();
  const { storeSettings } = useStore();
  const { deliveryEnabled, pickupEnabled } = storeSettings;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        if (data.product.variants?.length > 0) setSelectedColor(data.product.variants[0].color);
      } catch { toast.error('Product not found'); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <p className="font-display text-5xl text-gray-200 mb-4">Product Not Found</p>
        <Link to="/products" className="btn-primary">Browse All Products</Link>
      </div>
    </div>
  );

  const availableSizes = product.variants
    ?.filter(v => v.color === selectedColor && v.stock > 0).map(v => v.size) || [];
  const uniqueColors = [...new Map(product.variants?.map(v => [v.color, { color: v.color, hex: v.colorHex }])).values()] || [];
  const selectedVariant = product.variants?.find(v => v.size === selectedSize && v.color === selectedColor);
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const inWishlist = isInWishlist(product._id);
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  const noModeEnabled = !deliveryEnabled && !pickupEnabled;

  const handleAddToCart = async () => {
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    if (!inStock) { toast.error('This variant is out of stock'); return; }
    setAdding(true);
    await addToCart(product._id, selectedSize, selectedColor, quantity);
    setAdding(false);
  };

  const handleBookNow = () => {
    if (!isAuthenticated) { toast.error('Please login to book'); return; }
    if (!selectedSize) { toast.error('Please select a size'); return; }
    if (!selectedColor) { toast.error('Please select a color'); return; }
    if (!inStock) { toast.error('This variant is out of stock'); return; }
    // Cart mein add karo phir checkout pe pickup mode ke saath jao
    addToCart(product._id, selectedSize, selectedColor, quantity).then(() => {
      navigate('/checkout?mode=pickup');
    });
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    await toggleWishlist(product._id);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to write a review'); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/review`, reviewForm);
      toast.success('Review submitted!');
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  return (
    <div className="min-h-screen bg-luxe-cream animate-fade-in">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Link to="/" className="hover:text-gold-500 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-gold-500 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-luxe-black">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16">

          {/* Images */}
          <div className="flex gap-4">
            {product.images?.length > 1 && (
              <div className="hidden sm:flex flex-col gap-2 w-20">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`aspect-square overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-gold-500' : 'border-transparent'}`}>
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex-1 aspect-[3/4] overflow-hidden bg-white relative">
              {product.images?.length > 0
                ? <img src={product.images[selectedImage]?.url} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><span className="text-gray-300 font-serif italic">No Image</span></div>
              }
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2.5 py-1">-{discountPercent}%</div>
              )}
              {/* Mode badge on product image */}
              {!deliveryEnabled && pickupEnabled && (
                <div className="absolute top-4 right-4 bg-gold-500 text-luxe-black text-xs px-3 py-1 font-medium">
                  📍 Pickup Only
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {product.category && (
              <Link to={`/products?category=${product.category.slug}`}
                className="text-xs tracking-widest uppercase text-gold-500 hover:text-gold-600 mb-3">
                {product.category.name}
              </Link>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-medium text-luxe-black mb-2">{product.name}</h1>

            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating value={Math.round(product.ratings.average)} />
                <span className="text-sm text-gray-500">{product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)</span>
              </div>
            )}

            <div className="flex items-end gap-3 mb-6">
              <span className="font-display text-3xl font-medium text-luxe-black">
                ₹{(product.discountPrice || product.price).toLocaleString()}
              </span>
              {product.discountPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
                  <span className="text-sm text-green-600 font-medium">Save ₹{(product.price - product.discountPrice).toLocaleString()}</span>
                </>
              )}
            </div>

            <div className="h-px bg-gray-100 mb-6" />

            {/* Color selection */}
            {uniqueColors.length > 0 && (
              <div className="mb-5">
                <p className="text-xs tracking-widest uppercase text-gray-500 mb-3 font-sans">
                  Color: <span className="text-luxe-black font-medium">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uniqueColors.map(({ color, hex }) => (
                    <button key={color} onClick={() => { setSelectedColor(color); setSelectedSize(''); }} title={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-gold-500 scale-110' : 'border-transparent'}`}
                      style={{ background: hex || color, outline: '1px solid #e5e7eb' }} />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs tracking-widest uppercase text-gray-500 font-sans">Size</p>
                <button className="text-xs text-gold-500 hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['XS','S','M','L','XL','XXL'].map(size => {
                  const isAvailable = availableSizes.includes(size);
                  return (
                    <button key={size} onClick={() => isAvailable && setSelectedSize(size)} disabled={!isAvailable}
                      className={`w-12 h-12 text-sm border transition-all duration-200
                        ${selectedSize === size ? 'bg-luxe-black text-white border-luxe-black'
                          : isAvailable ? 'border-gray-200 text-gray-700 hover:border-luxe-black'
                          : 'border-gray-100 text-gray-300 cursor-not-allowed line-through'}`}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-gray-500 mb-3 font-sans">Quantity</p>
              <div className="flex items-center gap-0 w-fit border border-gray-200">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">−</button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(selectedVariant?.stock || 10, q+1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors">+</button>
              </div>
              {selectedVariant && <p className="text-xs text-gray-400 mt-1.5">{selectedVariant.stock} items in stock</p>}
            </div>

            {/* ACTION BUTTONS — based on store mode */}
            <div className="flex gap-3 mb-6">
              {noModeEnabled ? (
                <div className="flex-1 border border-gray-200 px-6 py-3 text-center text-sm text-gray-400 font-sans">
                  Currently unavailable
                </div>
              ) : (
                <>
                  {/* Delivery — Add to Cart */}
                  {deliveryEnabled && (
                    <button onClick={handleAddToCart} disabled={adding}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50">
                      {adding
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <FiShoppingBag size={16} />}
                      {adding ? 'Adding...' : 'Add to Bag'}
                    </button>
                  )}

                  {/* Pickup — Book Now */}
                  {pickupEnabled && (
                    <button onClick={handleBookNow}
                      className={`flex items-center justify-center gap-2 transition-all duration-200
                        ${deliveryEnabled
                          ? 'px-5 border border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-luxe-black'
                          : 'flex-1 btn-gold'}`}>
                      <FiCalendar size={16} />
                      {deliveryEnabled ? 'Book' : 'Book for Pickup'}
                    </button>
                  )}
                </>
              )}

              {/* Wishlist */}
              <button onClick={handleWishlist}
                className={`w-12 h-12 border flex items-center justify-center transition-all duration-200
                  ${inWishlist ? 'border-red-400 text-red-400 bg-red-50' : 'border-gray-200 text-gray-600 hover:border-luxe-black'}`}>
                <FiHeart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>

              {/* Share */}
              <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
                className="w-12 h-12 border border-gray-200 flex items-center justify-center text-gray-600 hover:border-luxe-black transition-all">
                <FiShare2 size={18} />
              </button>
            </div>

            {/* Mode info banner */}
            {!deliveryEnabled && pickupEnabled && (
              <div className="mb-5 bg-gold-50 border border-gold-200 p-3 flex gap-2">
                <span className="text-gold-600 text-lg">📍</span>
                <div>
                  <p className="text-sm font-medium text-gold-800">Store Pickup Only</p>
                  <p className="text-xs text-gold-700 mt-0.5">{storeSettings.pickupInstructions}</p>
                </div>
              </div>
            )}
            {deliveryEnabled && !pickupEnabled && (
              <div className="mb-5 bg-blue-50 border border-blue-100 p-3 flex gap-2">
                <span className="text-blue-500 text-lg">🚚</span>
                <p className="text-sm text-blue-700">Home Delivery Available — Free over ₹{storeSettings.freeShippingThreshold}</p>
              </div>
            )}
            {deliveryEnabled && pickupEnabled && (
              <div className="mb-5 bg-gray-50 border border-gray-100 p-3 flex gap-2">
                <span className="text-lg">✨</span>
                <p className="text-sm text-gray-600">Add to Cart for delivery, or Book Now for store pickup</p>
              </div>
            )}

            {product.fabric && <p className="text-sm text-gray-500 font-serif italic">Fabric: <span className="text-luxe-black not-italic">{product.fabric}</span></p>}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
              {[
                { icon: '🚚', text: 'Free Shipping' },
                { icon: '↩️', text: '30-Day Returns' },
                { icon: '🔒', text: 'Secure Payment' },
              ].map(item => (
                <div key={item.text} className="text-center">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <p className="text-xs text-gray-500 font-sans">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border-t border-gray-200 pt-8">
          <div className="flex gap-8 mb-8 border-b border-gray-100">
            {['description','care','reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs tracking-widest uppercase font-sans transition-colors border-b-2 -mb-px
                  ${activeTab === tab ? 'text-luxe-black border-gold-500' : 'text-gray-400 border-transparent hover:text-luxe-black'}`}>
                {tab === 'reviews' ? `Reviews (${product.ratings?.count || 0})` : tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="max-w-2xl">
              <p className="font-serif text-gray-700 leading-relaxed text-lg italic mb-4">{product.shortDescription}</p>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}
          {activeTab === 'care' && (
            <div className="max-w-2xl">
              <p className="text-gray-600 leading-relaxed">
                {product.careInstructions || 'Machine wash cold, gentle cycle. Do not bleach. Tumble dry low. Iron on low heat if needed.'}
              </p>
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              {isAuthenticated && (
                <form onSubmit={handleReviewSubmit} className="mb-10 p-6 bg-white border border-gray-100">
                  <h3 className="font-display text-xl mb-4">Write a Review</h3>
                  <div className="mb-4">
                    <p className="text-xs tracking-widests uppercase text-gray-500 mb-2 font-sans">Your Rating</p>
                    <StarRating value={reviewForm.rating} onChange={r => setReviewForm(p => ({ ...p, rating: r }))} interactive />
                  </div>
                  <textarea value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                    placeholder="Share your experience..." rows={4} className="input-luxe resize-none mb-4" />
                  <button type="submit" disabled={submittingReview} className="btn-primary">
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
              <div className="space-y-6">
                {product.reviews?.length === 0
                  ? <p className="text-gray-400 font-serif italic text-center py-8">No reviews yet. Be the first!</p>
                  : product.reviews?.map((review, i) => (
                    <div key={i} className="pb-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{review.user?.name || 'Anonymous'}</p>
                          <StarRating value={review.rating} />
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
