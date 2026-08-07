import { Link } from 'react-router-dom';
import { 
  Phone, Mail, MapPin, Clock, 
  Facebook, Instagram, MessageCircle,
  Zap, ChevronRight
} from 'lucide-react';
import './Footer.css';

// Store info
const storeInfo = {
  address: '123, Main Market Road, Near Bus Stand, City Center',
  phone: '+91 98765 43210',
  alternatePhone: '+91 87654 32109',
  email: 'contact@ecommerce-store.com',
  hours: 'Open 24/7',
  mapLink: 'https://maps.google.com',
  socialMedia: {
    whatsapp: '919876543210',
    instagram: 'ecommercestore',
    facebook: 'ecommercestore'
  }
};

// Categories
const categories = [
  { id: 'fans-coolers', name: 'Fans & Coolers' },
  { id: 'kitchen-appliances', name: 'Kitchen Appliances' },
  { id: 'wires-cables', name: 'Wires & Cables' },
  { id: 'switches-accessories', name: 'Switches & Accessories' },
  { id: 'spare-parts', name: 'Spare Parts' }
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop All', path: '/shop' },
    { label: 'Spare Parts', path: '/spare-parts' },
    { label: 'Repair Services', path: '/repair' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const shopCategories = categories.slice(0, 5);

  return (
    <footer className="footer">
      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* About Section */}
            <div className="footer-section footer-about">
              <Link to="/" className="footer-logo">
                <div className="footer-logo-icon">
                  <Zap size={24} />
                </div>
                <div className="footer-logo-text">
                  <span className="footer-logo-name">E-Store</span>
                  <span className="footer-logo-tagline">Electronics</span>
                </div>
              </Link>
              <p className="footer-description">
                Your trusted online electronics store. 
                We offer quality electronics, genuine spare parts, and expert repair services 
                under one roof.
              </p>
              <div className="footer-social">
                <a 
                  href={`https://wa.me/${storeInfo.socialMedia.whatsapp}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link whatsapp"
                >
                  <MessageCircle size={20} />
                </a>
                <a 
                  href={`https://instagram.com/${storeInfo.socialMedia.instagram}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href={`https://facebook.com/${storeInfo.socialMedia.facebook}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link facebook"
                >
                  <Facebook size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4 className="footer-title">Quick Links</h4>
              <ul className="footer-links">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>
                      <ChevronRight size={14} />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Shop Categories */}
            <div className="footer-section">
              <h4 className="footer-title">Shop Categories</h4>
              <ul className="footer-links">
                {shopCategories.map((category) => (
                  <li key={category.id}>
                    <Link to={`/shop/${category.id}`}>
                      <ChevronRight size={14} />
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section footer-contact">
              <h4 className="footer-title">Visit Our Store</h4>
              <ul className="contact-list">
                <li>
                  <MapPin size={18} />
                  <span>{storeInfo.address}</span>
                </li>
                <li>
                  <Phone size={18} />
                  <div className="phone-numbers">
                    <a href={`tel:${storeInfo.phone}`}>{storeInfo.phone}</a>
                    <a href={`tel:${storeInfo.alternatePhone}`}>{storeInfo.alternatePhone}</a>
                  </div>
                </li>
                <li>
                  <Mail size={18} />
                  <a href={`mailto:${storeInfo.email}`}>{storeInfo.email}</a>
                </li>
                <li>
                  <Clock size={18} />
                  <span>{storeInfo.hours}</span>
                </li>
              </ul>

              <a 
                href={storeInfo.mapLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-btn"
              >
                <MapPin size={16} />
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Store USP Banner */}
      <div className="footer-usp">
        <div className="container">
          <div className="usp-grid">
            <div className="usp-item">
              <span className="usp-icon">🏪</span>
              <span>Visit Store for Best Prices</span>
            </div>
            <div className="usp-item">
              <span className="usp-icon">🔧</span>
              <span>In-Store Expert Repairs</span>
            </div>
            <div className="usp-item">
              <span className="usp-icon">✅</span>
              <span>Genuine Spare Parts Only</span>
            </div>
            <div className="usp-item">
              <span className="usp-icon">👨‍👩‍👦</span>
              <span>Family Business Since 1998</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} E-Commerce Store. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
