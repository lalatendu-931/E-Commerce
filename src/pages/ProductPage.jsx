import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight, Star, Minus, Plus, ShoppingCart, Heart,
  Truck, Shield, RotateCcw, MessageCircle, MapPin, Phone,
  Calendar, Store, CreditCard, Clock, Loader
} from 'lucide-react';
import { useCart } from '../context/useCart';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProductCard from '../components/common/ProductCard';
import { useProduct, useProducts } from '../hooks/useData';
import './ProductPage.css';

const storeInfo = {
  address: '123, Main Market Road, Near Bus Stand, City Center',
  phone: '+91 98765 43210',
  hours: 'Open 24/7'
};

const ProductPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  
  // Fetch product data from API
  const { product, loading, error } = useProduct(productId);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedAction, setSelectedAction] = useState('reserve'); // 'reserve' or 'cart'
  const [showPreBooking, setShowPreBooking] = useState(false);
  const [preBookDate, setPreBookDate] = useState('');

  // Loading state
  if (loading) {
    return (
      <main className="product-page">
        <div className="container">
          <div className="loading-state">
            <Loader className="spinner" size={40} />
            <p>Loading product...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <main className="product-page">
        <div className="container">
          <div className="not-found">
            <h2>Product Not Found</h2>
            <p>{error || "The product you're looking for doesn't exist."}</p>
            <Link to="/shop">
              <Button variant="primary">Back to Shop</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Handle both API format and mock format
  const originalPrice = product.original_price || product.originalPrice;
  const inStock = product.stock_quantity > 0 || product.inStock;
  const bargainAvailable = product.bargain_available || product.bargainAvailable;
  const rating = product.rating || 4.0;
  const reviews = product.review_count || product.reviews || 0;
  const features = product.features || [];
  const specifications = product.specifications || {};
  const categorySlug = product.category?.slug || product.category;

  const discount = originalPrice 
    ? Math.round((1 - product.price / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const handlePreBookSubmit = (e) => {
    e.preventDefault();
    // Mock pre-booking submission
    alert(`Pre-booking submitted for ${product.name} on ${preBookDate}. We'll confirm availability soon!`);
    setShowPreBooking(false);
  };

  return (
    <main className="product-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <ChevronRight size={16} />
          <Link to="/shop">Shop</Link>
          <ChevronRight size={16} />
          <Link to={`/shop/${categorySlug}`}>{(categorySlug || '').replace('-', ' ')}</Link>
          <ChevronRight size={16} />
          <span>{product.name}</span>
        </div>
      </div>

      <div className="container">
        <div className="product-layout">
          {/* Product Images */}
          <div className="product-gallery">
            <div className="main-image">
              <div className="image-placeholder">
                <span>{product.name.charAt(0)}</span>
              </div>
              {discount > 0 && (
                <Badge variant="discount" className="product-badge">{discount}% OFF</Badge>
              )}
            </div>
            <div className="thumbnail-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="thumbnail">
                  <div className="thumbnail-placeholder"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <span className="product-brand">{product.brand}</span>
              <h1 className="product-title">{product.name}</h1>
              
              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i < Math.floor(rating) ? '#FFB703' : 'none'}
                      color="#FFB703"
                    />
                  ))}
                </div>
                <span className="rating-text">{rating.toFixed(1)} ({reviews} reviews)</span>
              </div>
            </div>

            <div className="product-pricing">
              <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
              {originalPrice && originalPrice > product.price && (
                <>
                  <span className="original-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                  <Badge variant="success">You Save ₹{(originalPrice - product.price).toLocaleString('en-IN')}</Badge>
                </>
              )}
            </div>

            {/* Bargain Message */}
            {bargainAvailable && (
              <div className="bargain-message">
                <MessageCircle size={20} />
                <div>
                  <strong>Price Negotiable at Store</strong>
                  <p>For the best pricing, visit us and have a chat. We value relationships over transactions.</p>
                </div>
              </div>
            )}

            <div className="product-stock">
              {inStock ? (
                <span className="in-stock"><span className="dot"></span> In Stock</span>
              ) : (
                <span className="out-of-stock"><span className="dot"></span> Out of Stock</span>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            {/* Features */}
            {features.length > 0 && (
              <div className="product-features">
                <h4>Key Features</h4>
                <ul>
                  {features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purchase Options */}
            <div className="purchase-options">
              <h4>How would you like to proceed?</h4>
              <div className="option-cards">
                <label className={`option-card ${selectedAction === 'reserve' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="action" 
                    value="reserve"
                    checked={selectedAction === 'reserve'}
                    onChange={() => setSelectedAction('reserve')}
                  />
                  <Store size={24} />
                  <div className="option-text">
                    <strong>Reserve & Pick Up</strong>
                    <span>Pay at store when you collect</span>
                  </div>
                </label>
                <label className={`option-card ${selectedAction === 'cart' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="action" 
                    value="cart"
                    checked={selectedAction === 'cart'}
                    onChange={() => setSelectedAction('cart')}
                  />
                  <CreditCard size={24} />
                  <div className="option-text">
                    <strong>Add to Cart</strong>
                    <span>Pay online & pick up</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Quantity & Actions */}
            <div className="product-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={18} />
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>
                  <Plus size={18} />
                </button>
              </div>

              <Button 
                variant="primary" 
                size="large" 
                icon={selectedAction === 'reserve' ? Store : ShoppingCart}
                onClick={handleAddToCart}
              >
                {selectedAction === 'reserve' ? 'Reserve Now' : 'Add to Cart'}
              </Button>

              <button className="wishlist-btn">
                <Heart size={22} />
              </button>
            </div>

            {/* Pre-Book Option */}
            <div className="pre-book-section">
              <button 
                className="pre-book-toggle"
                onClick={() => setShowPreBooking(!showPreBooking)}
              >
                <Calendar size={18} />
                Planning to visit on a specific date? Pre-book this item
              </button>
              
              {showPreBooking && (
                <form className="pre-book-form" onSubmit={handlePreBookSubmit}>
                  <p>We'll confirm availability and keep it ready for you.</p>
                  <div className="form-row">
                    <input 
                      type="date" 
                      value={preBookDate}
                      onChange={(e) => setPreBookDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Button type="submit" variant="secondary">
                      Pre-Book
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Store Info */}
            <div className="store-pickup-info">
              <h4>Store Pickup Information</h4>
              <div className="info-items">
                <div className="info-item">
                  <MapPin size={18} />
                  <span>{storeInfo.address}</span>
                </div>
                <div className="info-item">
                  <Phone size={18} />
                  <span>{storeInfo.phone}</span>
                </div>
                <div className="info-item">
                  <Clock size={18} />
                  <span>{storeInfo.hours}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <Shield size={20} />
                <span>Genuine Products</span>
              </div>
              <div className="trust-badge">
                <RotateCcw size={20} />
                <span>Easy Returns</span>
              </div>
              <div className="trust-badge">
                <Truck size={20} />
                <span>Store Pickup</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {Object.keys(specifications).length > 0 && (
          <div className="product-details section">
            <h2>Specifications</h2>
            <div className="specifications-table">
              {Object.entries(specifications).map(([key, value]) => (
                <div key={key} className="spec-row">
                  <span className="spec-key">{key}</span>
                  <span className="spec-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products - TODO: Fetch from API */}
      </div>
    </main>
  );
};

export default ProductPage;
