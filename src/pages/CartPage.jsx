import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Minus, Plus, Trash2, ShoppingBag, ArrowLeft, 
  Store, CreditCard, AlertCircle, MapPin, Loader, CheckCircle
} from 'lucide-react';
import { useCart } from '../context/useCart';
import { useAuth } from '../context/useAuth';
import Button from '../components/common/Button';
import './CartPage.css';

const storeInfo = {
  address: '123, Main Market Road, Near Bus Stand, City Center',
  hours: 'Open 24/7'
};

const CartPage = () => {
  const { 
    cart, 
    cartTotal, 
    purchaseMode, 
    orderLoading,
    orderError,
    updateQuantity, 
    removeFromCart, 
    setPurchaseMode,
    clearCart,
    createPreBooking,
    createOrder
  } = useCart();
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  const handleCheckout = async () => {
    setCheckoutError(null);
    
    // Require login for checkout
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      if (purchaseMode === 'reserve-pickup') {
        await createPreBooking();
      } else {
        await createOrder();
      }
      setShowSuccess(true);
    } catch (error) {
      setCheckoutError(error.message || 'Checkout failed. Please try again.');
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="success-state">
            <CheckCircle size={80} className="success-icon" />
            <h2>{purchaseMode === 'reserve-pickup' ? 'Items Reserved!' : 'Order Placed!'}</h2>
            <p>
              {purchaseMode === 'reserve-pickup' 
                ? 'Your items have been reserved. Visit our store to complete your purchase.'
                : 'Your order has been placed successfully. We\'ll prepare it for pickup.'}
            </p>
            <div className="success-actions">
              <Link to="/account">
                <Button variant="primary">View My Orders</Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <ShoppingBag size={80} />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop">
              <Button variant="primary" size="large">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="item-count">{cart.length} items</span>
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <div className="image-placeholder">
                    {item.name.charAt(0)}
                  </div>
                </div>
                
                <div className="item-details">
                  <Link to={`/product/${item.id}`} className="item-name">
                    {item.name}
                  </Link>
                  <span className="item-brand">{item.brand}</span>
                  
                  {item.bargainAvailable && (
                    <span className="bargain-tag">💬 Price negotiable at store</span>
                  )}
                </div>

                <div className="item-quantity">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>

                <div className="item-price">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>

                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <div className="cart-actions">
              <Link to="/shop" className="continue-shopping">
                <ArrowLeft size={18} />
                Continue Shopping
              </Link>
              <button className="clear-cart" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>

            {/* Purchase Mode Selection */}
            <div className="purchase-mode-section">
              <h3>How would you like to proceed?</h3>
              
              <label className={`mode-option ${purchaseMode === 'reserve-pickup' ? 'selected' : ''}`}>
                <input 
                  type="radio"
                  name="purchaseMode"
                  value="reserve-pickup"
                  checked={purchaseMode === 'reserve-pickup'}
                  onChange={() => setPurchaseMode('reserve-pickup')}
                />
                <Store size={24} />
                <div className="mode-text">
                  <strong>Reserve & Pay at Store</strong>
                  <span>Items will be kept ready. Pay when you collect.</span>
                </div>
              </label>

              <label className={`mode-option ${purchaseMode === 'pay-online' ? 'selected' : ''}`}>
                <input 
                  type="radio"
                  name="purchaseMode"
                  value="pay-online"
                  checked={purchaseMode === 'pay-online'}
                  onChange={() => setPurchaseMode('pay-online')}
                />
                <CreditCard size={24} />
                <div className="mode-text">
                  <strong>Pay Online & Pick Up</strong>
                  <span>Pay now and collect from store.</span>
                </div>
              </label>
            </div>

            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Store Pickup</span>
                <span className="free">FREE</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Store Visit Hint */}
            <div className="store-hint">
              <AlertCircle size={18} />
              <p>
                <strong>Want better pricing?</strong> Visit our store directly. 
                We're happy to discuss prices face-to-face!
              </p>
            </div>

            {checkoutError && (
              <div className="form-status error">
                <AlertCircle size={18} />
                <span>{checkoutError}</span>
              </div>
            )}

            <Button 
              variant="primary" 
              size="large" 
              fullWidth
              icon={orderLoading ? null : (purchaseMode === 'reserve-pickup' ? Store : CreditCard)}
              onClick={handleCheckout}
              disabled={orderLoading}
            >
              {orderLoading ? (
                <>
                  <Loader className="spinner" size={18} />
                  Processing...
                </>
              ) : (
                purchaseMode === 'reserve-pickup' ? 'Reserve Items' : 'Proceed to Payment'
              )}
            </Button>

            {!isAuthenticated && (
              <p className="login-hint">
                <Link to="/login">Log in</Link> to complete your order
              </p>
            )}

            {/* Store Info */}
            <div className="pickup-info">
              <h4>Pickup Location</h4>
              <div className="pickup-details">
                <MapPin size={18} />
                <div>
                  <p>{storeInfo.address}</p>
                  <p className="store-hours">{storeInfo.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
