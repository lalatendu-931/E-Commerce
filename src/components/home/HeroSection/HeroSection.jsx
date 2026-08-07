import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Shield, Clock, Wrench } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  // Featured products for visual display
  const heroProducts = [
    {
      id: 1,
      name: 'Premium Ceiling Fan',
      image: '/src/assets/products/ceiling-fan.png',
    },
    {
      id: 2,
      name: 'Air Cooler',
      image: '/src/assets/products/cooler.png',
    },
    {
      id: 3,
      name: 'Mixer Grinder',
      image: '/src/assets/products/mixer.png',
    }
  ];

  return (
    <section className="hero-section">
      {/* Parallax Background Elements */}
      <div className="hero-bg-layer">
        <div className="hero-bg-gradient"></div>
        <div className="hero-bg-pattern"></div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="hero-grid">
          {/* Left Content */}
          <div className="hero-content">
            {/* Trust Badge */}
            <div className="hero-trust-badge">
              <Shield size={16} />
              <span>Family-run store since 1998</span>
            </div>

            {/* Main Headline */}
            <h1 className="hero-headline">
              Cooling & Electrical Solutions{' '}
              <span className="highlight">You Can Trust</span>
            </h1>

            {/* Subtext */}
            <p className="hero-description">
              Your neighbourhood electrical store for quality fans, kitchen appliances, 
              genuine spare parts, and expert repairs — all under one roof.
            </p>

            {/* CTAs */}
            <div className="hero-cta-group">
              <Link to="/shop" className="hero-cta hero-cta-primary">
                <span>Shop Products</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="hero-cta hero-cta-secondary">
                <MapPin size={18} />
                <span>Reserve & Pick Up</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="hero-trust-row">
              <div className="trust-item">
                <Clock size={16} />
                <span>Open 24/7</span>
              </div>
              <div className="trust-item">
                <Wrench size={16} />
                <span>In-store Repairs</span>
              </div>
              <div className="trust-item">
                <Shield size={16} />
                <span>Genuine Parts</span>
              </div>
            </div>
          </div>

          {/* Right - Product Visuals */}
          <div className="hero-product-visual">
            <div className="hero-products-stack">
              {/* Main Product */}
              <div className="hero-main-product">
                <img 
                  src={heroProducts[0].image} 
                  alt={heroProducts[0].name}
                  className="hero-product-image main"
                />
              </div>
              
              {/* Secondary Products */}
              <div className="hero-secondary-products">
                <div className="hero-product-small">
                  <img 
                    src={heroProducts[1].image} 
                    alt={heroProducts[1].name}
                    className="hero-product-image secondary"
                  />
                </div>
                <div className="hero-product-small">
                  <img 
                    src={heroProducts[2].image} 
                    alt={heroProducts[2].name}
                    className="hero-product-image secondary"
                  />
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="hero-visual-bg"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
