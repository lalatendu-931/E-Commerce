import { Link } from 'react-router-dom';
import { 
  Award, Users, Heart, MapPin, 
  Clock, Shield, Wrench, Store
} from 'lucide-react';
import Button from '../components/common/Button';
import './AboutPage.css';

const storeInfo = {
  address: '123, Main Market Road, Near Bus Stand, City Center',
  phone: '+91 98765 43210',
  alternatePhone: '+91 87654 32109',
  hours: 'Open 24/7',
  mapLink: 'https://maps.google.com'
};

const whyChooseUs = [
  { id: 1, icon: '👨‍👩‍👧‍👦', title: 'Family Trust', description: 'Third-generation business serving the community with values passed down through decades.' },
  { id: 2, icon: '🏆', title: '25+ Years Experience', description: 'Quarter century of expertise in electrical products, repairs, and customer service.' },
  { id: 3, icon: '🔧', title: 'In-Store Repairs', description: 'All repairs done by our skilled technicians right here. No outsourcing, no middlemen.' },
  { id: 4, icon: '💬', title: 'Price Discussion', description: 'We believe in relationships over transactions. Visit us for the best prices.' },
  { id: 5, icon: '✓', title: 'Genuine Products', description: '100% authentic products from authorized dealers with proper warranty.' },
  { id: 6, icon: '🤝', title: 'Personal Touch', description: 'We know our regular customers by name. Experience shopping the traditional way.' }
];

const AboutPage = () => {
  return (
    <main className="about-page">
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-label">Trusted Electronics Store</span>
              <h1>E-Commerce Store</h1>
              <p className="hero-tagline">
                Your one-stop destination for quality electronics and expert repairs
              </p>
            </div>
            <div className="hero-visual">
              <div className="shop-preview-grid">
                <div className="preview-card main">
                  <Store size={36} />
                  <span>Our Storefront</span>
                </div>
                <div className="preview-card">
                  <Wrench size={28} />
                  <span>Repair Counter</span>
                </div>
                <div className="preview-card">
                  <span className="emoji-visual">⚡</span>
                  <span>Products Display</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="our-story section">
        <div className="container">
          <div className="story-grid">
            <div className="story-text">
              <span className="section-tag">Our Story</span>
              <h2>From a Small Shop to a Trusted Name</h2>
              <p>
                This e-commerce platform started with a simple belief — <strong>honest service 
                and fair prices build lasting relationships</strong>.
              </p>
              <p>
                Over the years, we've grown from repairing ceiling fans in a tiny 
                shop to becoming a one-stop destination for electrical appliances, 
                spare parts, and expert repair services. But one thing hasn't changed 
                — our commitment to treating every customer like family.
              </p>
              <p>
                Today, as the next generation carries forward this legacy, we combine 
                traditional values with modern convenience. Our website makes it easy 
                to browse and reserve products, but we still believe in the magic of 
                face-to-face service at our store.
              </p>
            </div>
            <div className="story-values">
              <div className="value-card">
                <Heart size={32} />
                <h3>Family Values</h3>
                <p>We run our business like we run our home — with care, honesty, and respect.</p>
              </div>
              <div className="value-card">
                <Shield size={32} />
                <h3>Trust First</h3>
                <p>Every product and repair comes with our personal guarantee of quality.</p>
              </div>
              <div className="value-card">
                <Users size={32} />
                <h3>Community Focus</h3>
                <p>We've served three generations of families in our neighbourhood.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Presence - replaces Timeline */}
      <section className="shop-presence-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-tag">Visit Us</span>
            <h2>See Our Store</h2>
          </div>

          <div className="shop-gallery">
            <div className="gallery-card main">
              <Store size={48} />
              <div className="gallery-text">
                <h3>Main Storefront</h3>
                <p>Located in the heart of the market since 1998</p>
              </div>
            </div>
            <div className="gallery-card">
              <Wrench size={32} />
              <div className="gallery-text">
                <h3>Repair Area</h3>
                <p>Where the magic happens</p>
              </div>
            </div>
            <div className="gallery-card">
              <span className="gallery-emoji">⚡</span>
              <div className="gallery-text">
                <h3>Product Display</h3>
                <p>Wide range of electrical goods</p>
              </div>
            </div>
            <div className="gallery-card highlight">
              <div className="gallery-text">
                <strong>25+</strong>
                <span>Years Serving You</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-us-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-tag">Why Choose Us?</span>
            <h2>What Makes Us Different</h2>
          </div>

          <div className="why-us-grid">
            {whyChooseUs.map((item) => (
              <div key={item.id} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section section">
        <div className="container">
          <div className="section-title">
            <span className="section-tag">The Family</span>
            <h2>Meet The People Behind the Counter</h2>
          </div>

          <div className="team-grid">
            <div className="team-card">
              <div className="member-avatar founder">
                <span>👨‍🔧</span>
              </div>
              <h3>Sri Ramaiah</h3>
              <span className="role">Founder & Master Technician</span>
              <p>25+ years of experience. Can fix any motor or fan you bring him!</p>
            </div>
            <div className="team-card">
              <div className="member-avatar">
                <span>👨‍💼</span>
              </div>
              <h3>Suresh Kumar</h3>
              <span className="role">Store Manager & Son</span>
              <p>Managing day-to-day operations and bringing the business online.</p>
            </div>
            <div className="team-card">
              <div className="member-avatar">
                <span>🔧</span>
              </div>
              <h3>Our Technicians</h3>
              <span className="role">Repair Experts</span>
              <p>Trained in-house, skilled in all kinds of electrical repairs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Us CTA */}
      <section className="visit-cta section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-content">
              <h2>Come Visit Our Store!</h2>
              <p>
                We'd love to meet you in person. Experience our products firsthand, 
                discuss your requirements, and maybe even haggle a bit — it's all part of the fun!
              </p>
              <div className="store-details">
                <div className="detail">
                  <MapPin size={20} />
                  <span>{storeInfo.address}</span>
                </div>
                <div className="detail">
                  <Clock size={20} />
                  <span>{storeInfo.hours}</span>
                </div>
              </div>
              <div className="cta-buttons">
                <a href={storeInfo.mapLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="large" icon={MapPin}>
                    Get Directions
                  </Button>
                </a>
                <Link to="/contact">
                  <Button variant="secondary" size="large">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
