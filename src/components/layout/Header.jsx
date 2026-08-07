import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, ShoppingCart, User, Menu, X, ChevronDown, ChevronRight,
  Zap, Phone, MapPin, Clock
} from 'lucide-react';
import { useCart } from '../../context/useCart';
import { useAuth } from '../../context/useAuth';
import './Header.css';

// Store info
const storeInfo = {
  phone: '+91 98765 43210',
  hours: 'Open 24/7',
  mapLink: 'https://maps.google.com'
};

// Categories for navigation
const categories = [
  { id: 'fans-coolers', name: 'Fans & Coolers', productCount: 45 },
  { id: 'kitchen-appliances', name: 'Kitchen Appliances', productCount: 62 },
  { id: 'wires-cables', name: 'Wires & Cables', productCount: 38 },
  { id: 'switches-accessories', name: 'Switches & Accessories', productCount: 84 }
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const { cartCount, cartItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll for header transformation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  const prevPathRef = useRef(location.pathname);
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;
      requestAnimationFrame(() => {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
      });
    }
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const openShopLocation = () => {
    window.open(storeInfo.mapLink, '_blank');
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { 
      label: 'Shop', 
      path: '/shop',
      dropdown: categories.filter(c => c.id !== 'repair-services' && c.id !== 'spare-parts')
    },
    { 
      label: 'Spare Parts', 
      path: '/spare-parts',
      dropdown: [
        { id: 'capacitors', name: 'Capacitors', productCount: 24 },
        { id: 'bearings', name: 'Bearings', productCount: 18 },
        { id: 'motor-parts', name: 'Motor Parts', productCount: 32 },
        { id: 'switch-parts', name: 'Switch Parts', productCount: 28 },
        { id: 'coils', name: 'Coils & Windings', productCount: 15 }
      ]
    },
    { label: 'Repairs', path: '/repair' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      {/* Top Info Bar */}
      <div className="header-top-bar">
        <div className="container">
          <div className="top-bar-content">
            {/* Left - Contact Info */}
            <div className="top-bar-left">
              <a href={`tel:${storeInfo.phone}`} className="top-bar-item phone-item">
                <Phone size={14} />
                <span>{storeInfo.phone}</span>
              </a>
              <span className="top-bar-divider">|</span>
              <button className="top-bar-item location-btn" onClick={openShopLocation}>
                <MapPin size={14} />
                <span>Find Our Store</span>
              </button>
              <span className="top-bar-divider">|</span>
              <span className="top-bar-item store-hours">
                <Clock size={14} />
                <span>{storeInfo.hours}</span>
              </span>
            </div>

            {/* Right - User Info / Address */}
            <div className="top-bar-right">
              {isAuthenticated && user ? (
                <div className="user-address-info">
                  <MapPin size={14} />
                  <span>Delivering to: <strong>{user.address || 'Set your address'}</strong></span>
                </div>
              ) : (
                <Link to="/login" className="top-bar-login">
                  Sign in for personalized experience →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <Link to="/" className="logo">
              <div className="logo-icon">
                <Zap size={22} />
              </div>
              <div className="logo-text">
                <span className="logo-name">E-Store</span>
                <span className="logo-tagline">Electronics</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="main-nav">
              <ul className="nav-list">
                {navItems.map((item, index) => (
                  <li 
                    key={item.path}
                    className={`nav-item ${item.dropdown ? 'has-dropdown' : ''} ${location.pathname === item.path ? 'active' : ''}`}
                    onMouseEnter={() => item.dropdown && setActiveDropdown(index)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link to={item.path} className="nav-link">
                      {item.label}
                      {item.dropdown && <ChevronDown size={14} />}
                      {item.label === 'Shop' && <span className="nav-badge">Sale</span>}
                    </Link>
                    
                    {/* Mega Menu for Shop */}
                    {item.dropdown && item.label === 'Shop' && (
                      <div className={`mega-menu ${activeDropdown === index ? 'active' : ''}`}>
                        <div className="mega-menu-content">
                          <div className="mega-menu-header">
                            <h3>Shop by Category</h3>
                            <Link to="/shop" className="view-all-link">View All Products →</Link>
                          </div>
                          <div className="mega-menu-grid">
                            {item.dropdown.map((subItem) => (
                              <Link 
                                key={subItem.id}
                                to={`${item.path}/${subItem.id}`}
                                className="mega-menu-item"
                                onClick={() => setActiveDropdown(null)}
                              >
                                <div className="mega-item-icon">
                                  {subItem.id === 'fans-coolers' && '🌀'}
                                  {subItem.id === 'kitchen-appliances' && '🍳'}
                                  {subItem.id === 'wires-cables' && '⚡'}
                                  {subItem.id === 'switches-accessories' && '🔌'}
                                </div>
                                <div className="mega-item-text">
                                  <span className="mega-item-name">{subItem.name}</span>
                                  <span className="mega-item-count">{subItem.productCount} products</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                          <div className="mega-menu-footer">
                            <div className="mega-promo">
                              <span className="promo-badge">🔥 Hot Deal</span>
                              <span>Up to 25% off on ceiling fans!</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Standard Dropdown for other items */}
                    {item.dropdown && item.label !== 'Shop' && (
                      <div className={`dropdown-menu ${activeDropdown === index ? 'active' : ''}`}>
                        <div className="dropdown-content">
                          {item.dropdown.map((subItem) => (
                            <Link 
                              key={subItem.id}
                              to={`${item.path}/${subItem.id}`}
                              className="dropdown-item"
                              onClick={() => setActiveDropdown(null)}
                            >
                              <span className="dropdown-item-name">{subItem.name}</span>
                              <ChevronRight size={14} className="dropdown-arrow" />
                            </Link>
                          ))}
                          <div className="dropdown-footer">
                            <Link to={item.path} className="dropdown-view-all">
                              View All {item.label}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Header Actions */}
            <div className="header-actions">
              {/* Search Toggle */}
              <button 
                className="header-action-btn"
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Account */}
              <Link 
                to={isAuthenticated ? '/account' : '/login'} 
                className="header-action-btn"
                aria-label="Account"
              >
                <User size={20} />
                <span className="action-label">
                  {isAuthenticated ? user?.name?.split(' ')[0] : 'Login'}
                </span>
              </Link>
              
              {/* Cart with Preview */}
              <div 
                className="cart-wrapper"
                onMouseEnter={() => setShowCartPreview(true)}
                onMouseLeave={() => setShowCartPreview(false)}
              >
                <Link to="/cart" className="header-action-btn cart-btn btn-highlighted">
                  <ShoppingCart size={18} />
                  {cartCount > 0 && (
                    <span className="cart-badge">{cartCount}</span>
                  )}
                  <span className="action-label">Cart</span>
                </Link>
                
                {/* Cart Preview Dropdown */}
                {showCartPreview && cartCount > 0 && (
                  <div className="cart-preview-dropdown">
                    <div className="cart-preview-header">
                      <span className="cart-preview-title">Your Cart ({cartCount} items)</span>
                    </div>
                    <div className="cart-preview-items">
                      {cartItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="cart-preview-item">
                          <div className="cart-item-image">
                            {item.image ? <img src={item.image} alt={item.name} /> : '📦'}
                          </div>
                          <div className="cart-item-details">
                            <span className="cart-item-name">{item.name}</span>
                            <span className="cart-item-price">₹{item.price} × {item.quantity}</span>
                          </div>
                        </div>
                      ))}
                      {cartCount > 3 && (
                        <div className="cart-preview-more">+ {cartCount - 3} more items</div>
                      )}
                    </div>
                    <div className="cart-preview-footer">
                      <Link to="/cart" className="cart-preview-btn">View Cart →</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Search Bar */}
      <div className={`search-expand ${showSearch ? 'active' : ''}`}>
        <div className="container">
          <form className="search-form" onSubmit={handleSearch}>
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search fans, mixers, spare parts, capacitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus={showSearch}
            />
            <button type="button" className="search-close" onClick={() => setShowSearch(false)}>
              <X size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Slide Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="logo-icon"><Zap size={20} /></div>
            <span className="logo-name">E-Store</span>
          </Link>
          <button 
            className="mobile-menu-close"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Mobile User Info */}
        {isAuthenticated && user && (
          <div className="mobile-user-info">
            <User size={18} />
            <div>
              <span className="mobile-user-name">Hello, {user.name}</span>
              {user.address && <span className="mobile-user-address">{user.address}</span>}
            </div>
          </div>
        )}

        <nav className="mobile-nav-list">
          {navItems.map((item) => (
            <div key={item.path} className="mobile-nav-group">
              <Link 
                to={item.path}
                className="mobile-nav-link"
                onClick={() => !item.dropdown && setIsMobileMenuOpen(false)}
              >
                {item.label}
                {item.dropdown && <ChevronDown size={16} />}
              </Link>
              {item.dropdown && (
                <div className="mobile-dropdown">
                  {item.dropdown.map((subItem) => (
                    <Link 
                      key={subItem.id}
                      to={`${item.path}/${subItem.id}`}
                      className="mobile-dropdown-item"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <a href={`tel:${storeInfo.phone}`} className="mobile-contact-btn">
            <Phone size={18} />
            <span>{storeInfo.phone}</span>
          </a>
          <button className="mobile-location-btn" onClick={openShopLocation}>
            <MapPin size={18} />
            <span>Find Store</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
