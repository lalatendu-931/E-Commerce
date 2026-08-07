import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Grid3X3, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/useCart';
import { useAuth } from '../../context/useAuth';
import './MobileNav.css';

const MobileNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Grid3X3, label: 'Categories', path: '/shop' },
    { icon: Search, label: 'Search', path: '#search', isSearch: true },
    { icon: ShoppingCart, label: 'Cart', path: '/cart', badge: cartCount },
    { icon: User, label: 'Account', path: isAuthenticated ? '/account' : '/login' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item) => {
    if (item.isSearch) {
      setShowSearch(!showSearch);
      return;
    }
  };

  return (
    <>
      {/* Mobile Search Overlay */}
      {showSearch && (
        <div className="mobile-search-overlay" onClick={() => setShowSearch(false)}>
          <div className="mobile-search-container" onClick={(e) => e.stopPropagation()}>
            <input 
              type="search" 
              placeholder="Search fans, mixers, spare parts..."
              autoFocus
            />
            <button onClick={() => setShowSearch(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="mobile-nav">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.isSearch ? '#' : item.path}
            className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
          >
            <div className="mobile-nav-icon">
              <item.icon size={22} strokeWidth={isActive(item.path) ? 2.5 : 1.5} />
              {item.badge > 0 && (
                <span className="mobile-nav-badge">{item.badge}</span>
              )}
            </div>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
};

export default MobileNav;
