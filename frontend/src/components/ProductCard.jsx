import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiEye, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { isAuthenticated, toggleWishlist, isInWishlist } = useAuth();
  const { addToCart } = useCart();
  const { storeSettings } = useStore();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  if (!product) return null;

  const { deliveryEnabled, pickupEnabled } = storeSettings;

  const primaryImage = product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url;
  const secondaryImage = product.images?.[1]?.url;
  const inWishlist = isInWishlist(product._id);

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const colors = [...new Set(product.variants?.map(v => v.color) || [])];
  const isOutOfStock = product.totalStock === 0;

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to save to wishlist'); return; }
    setWishlistLoading(true);
    await toggleWishlist(product._id);
    setWishlistLoading(false);
  };

  // Quick Add to Cart
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (isOutOfStock || !deliveryEnabled) return;
    const firstVariant = product.variants?.[0];
    await addToCart(product._id, firstVariant?.size, firstVariant?.color, 1);
  };

  // Quick Book — booking page pe le jao
  const handleQuickBook = (e) => {
    e.preventDefault();
    if (isOutOfStock || !pickupEnabled) return;
    if (!isAuthenticated) { toast.error('Please login to book'); return; }
    navigate(`/product/${product._id}?mode=pickup`);
  };

  // Koi bhi mode enabled nahi — no action buttons
  const noModeEnabled = !deliveryEnabled && !pickupEnabled;

  return (
    <div
      className="group relative bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <Link to={`/product/${product._id}`} className="block relative overflow-hidden aspect-[3/4]">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700
              ${hovered && secondaryImage ? 'opacity-0' : 'opacity-100'}`}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-300 font-serif italic text-sm">No Image</span>
          </div>
        )}

        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700
              ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 font-medium">-{discountPercent}%</span>
          )}
          {product.isFeatured && <span className="badge-gold">Featured</span>}
          {isOutOfStock && <span className="bg-gray-800 text-white text-xs px-2 py-0.5">Sold Out</span>}
          {/* Pickup only badge */}
          {!deliveryEnabled && pickupEnabled && (
            <span className="bg-gold-500 text-luxe-black text-xs px-2 py-0.5 font-medium">Pickup Only</span>
          )}
        </div>

        {/* Action icon buttons — right side */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300
          ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>

          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className={`w-8 h-8 flex items-center justify-center bg-white shadow-sm
              hover:bg-luxe-black hover:text-white transition-all duration-200
              ${inWishlist ? 'text-red-500' : 'text-gray-600'}`}
            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <FiHeart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>

          {/* Quick view */}
          <button
            onClick={(e) => { e.preventDefault(); navigate(`/product/${product._id}`); }}
            className="w-8 h-8 flex items-center justify-center bg-white shadow-sm
              hover:bg-luxe-black hover:text-white transition-all duration-200 text-gray-600"
            title="View details"
          >
            <FiEye size={15} />
          </button>
        </div>

        {/* Bottom action bar — delivery / pickup / both */}
        {!isOutOfStock && !noModeEnabled && (
          <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300
            ${hovered ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-full'}`}>

            {/* BOTH enabled — two buttons */}
            {deliveryEnabled && pickupEnabled && (
              <div className="flex">
                <button
                  onClick={handleQuickAdd}
                  className="flex-1 bg-luxe-black text-white py-2.5 text-xs tracking-widest uppercase
                    hover:bg-gold-500 hover:text-luxe-black transition-all duration-200 flex items-center justify-center gap-1.5"
                >
                  <FiShoppingBag size={12} /> Add to Cart
                </button>
                <button
                  onClick={handleQuickBook}
                  className="flex-1 bg-gold-500 text-luxe-black py-2.5 text-xs tracking-widest uppercase
                    hover:bg-gold-600 transition-all duration-200 flex items-center justify-center gap-1.5 border-l border-gold-600"
                >
                  <FiCalendar size={12} /> Book Now
                </button>
              </div>
            )}

            {/* ONLY delivery */}
            {deliveryEnabled && !pickupEnabled && (
              <button
                onClick={handleQuickAdd}
                className="w-full bg-luxe-black text-white py-3 text-xs tracking-widest uppercase
                  hover:bg-gold-500 hover:text-luxe-black transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FiShoppingBag size={14} /> Quick Add
              </button>
            )}

            {/* ONLY pickup */}
            {!deliveryEnabled && pickupEnabled && (
              <button
                onClick={handleQuickBook}
                className="w-full bg-gold-500 text-luxe-black py-3 text-xs tracking-widest uppercase
                  hover:bg-gold-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <FiCalendar size={14} /> Book for Pickup
              </button>
            )}
          </div>
        )}
      </Link>

      {/* Product info */}
      <div className="p-3 pb-4">
        {product.category && (
          <p className="text-xs text-gray-400 tracking-widest uppercase mb-1 font-sans">{product.category.name}</p>
        )}
        <Link to={`/product/${product._id}`}
          className="font-serif text-luxe-black hover:text-gold-600 transition-colors line-clamp-1 block">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-medium text-luxe-black">
            ₹{(product.discountPrice || product.price).toLocaleString()}
          </span>
          {product.discountPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
          )}
        </div>
        {colors.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {colors.slice(0, 4).map((color) => (
              <div key={color}
                className="w-3 h-3 rounded-full border border-gray-200"
                style={{ background: product.variants?.find(v => v.color === color)?.colorHex || color }}
                title={color}
              />
            ))}
            {colors.length > 4 && <span className="text-xs text-gray-400">+{colors.length - 4}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
