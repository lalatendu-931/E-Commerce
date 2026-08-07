import { Link } from 'react-router-dom';
import { ShoppingCart, Star, MessageCircle, Heart } from 'lucide-react';
import { useCart } from '../../context/useCart';
import './ProductCard.css';

// Fallback product images based on category
const getCategoryImage = (category) => {
  const categorySlug = typeof category === 'object' ? category?.slug : category;
  const imageMap = {
    'fans': '/src/assets/products/fan-placeholder.png',
    'fans-coolers': '/src/assets/products/fan-placeholder.png',
    'kitchen': '/src/assets/products/kitchen-placeholder.png',
    'kitchen-appliances': '/src/assets/products/kitchen-placeholder.png',
    'irons': '/src/assets/products/iron-placeholder.png',
    'irons-steamers': '/src/assets/products/iron-placeholder.png',
    'spare-parts': '/src/assets/products/parts-placeholder.png',
    'motors': '/src/assets/products/motor-placeholder.png',
    'wires-cables': '/src/assets/products/wires-placeholder.png',
    'switches-accessories': '/src/assets/products/switches-placeholder.png',
  };
  return imageMap[categorySlug] || '/src/assets/products/fan-placeholder.png';
};

const ProductCard = ({ product, showQuickAdd = true }) => {
  const { addToCart } = useCart();

  // Handle both API format (original_price, stock_quantity) and mock format (originalPrice, inStock)
  const originalPrice = product.original_price || product.originalPrice;
  const inStock = product.stock_quantity > 0 || product.inStock;
  const isFeatured = product.is_featured || product.tags?.includes('featured');
  const isBestseller = product.is_bestseller || product.tags?.includes('bestseller');
  const rating = product.rating || 4.0;
  const reviews = product.review_count || product.reviews || 0;
  
  const discount = originalPrice 
    ? Math.round((1 - product.price / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement wishlist
  };

  // Use product image or fallback based on category
  const categorySlug = product.category?.slug || product.category;
  const productImage = product.image_url || product.image || getCategoryImage(categorySlug);

  return (
    <Link to={`/product/${product.slug || product.id}`} className="product-card">
      {/* Image Section */}
      <div className="product-image-wrapper">
        <img 
          src={productImage}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.src = getCategoryImage(categorySlug);
          }}
        />
        
        {/* Badges */}
        <div className="product-badges">
          {discount > 0 && (
            <span className="badge badge-discount">-{discount}%</span>
          )}
          {isBestseller && (
            <span className="badge badge-bestseller">Bestseller</span>
          )}
          {isFeatured && (
            <span className="badge badge-new">Featured</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="wishlist-btn" onClick={handleWishlist} aria-label="Add to wishlist">
          <Heart size={18} />
        </button>

        {/* Quick Add */}
        {showQuickAdd && inStock && (
          <button className="quick-add-btn" onClick={handleAddToCart}>
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </button>
        )}
      </div>

      {/* Info Section */}
      <div className="product-info">
        <span className="product-brand">{product.brand}</span>
        <h3 className="product-name">{product.name}</h3>
        
        {/* Rating */}
        <div className="product-rating">
          <div className="rating-stars">
            <Star size={14} fill="#FFB703" color="#FFB703" />
            <span className="rating-value">{rating.toFixed(1)}</span>
          </div>
          <span className="rating-count">({reviews} reviews)</span>
        </div>

        {/* Price */}
        <div className="product-price">
          <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
          {originalPrice && originalPrice > product.price && (
            <span className="original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Bargain hint */}
        {product.bargain_available && (
          <div className="bargain-hint">
            <MessageCircle size={12} />
            <span>Price negotiable in-store</span>
          </div>
        )}

        {/* Stock Status */}
        <div className="product-stock">
          {inStock ? (
            <span className="in-stock">● In Stock</span>
          ) : (
            <span className="out-of-stock">● Out of Stock</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
