import { Star, Quote, MapPin, Phone, Clock } from 'lucide-react';
import Button from '../../common/Button';
import './StorePresence.css';

const storeInfo = {
  address: '123, Main Market Road, Near Bus Stand, City Center',
  phone: '+91 98765 43210',
  alternatePhone: '+91 87654 32109',
  hours: 'Open 24/7',
  mapLink: 'https://maps.google.com'
};

const testimonials = [
  {
    id: 1,
    name: 'Ramesh Kumar',
    location: 'City Center',
    rating: 5,
    text: 'Been buying from this store for years. Best prices and genuine products always!'
  },
  {
    id: 2,
    name: 'Sunita Devi',
    location: 'Old Town',
    rating: 5,
    text: 'They repaired my old Bajaj mixer that others said was beyond repair. Still running perfectly!'
  },
  {
    id: 3,
    name: 'Mohammed Irfan',
    location: 'New Colony',
    rating: 5,
    text: 'Honest shop with honest people. Never tried to sell me things I dont need.'
  }
];

const StorePresence = () => {
  return (
    <section className="store-presence section">
      <div className="container">
        <div className="store-presence-grid">
          {/* Store Info */}
          <div className="store-info-card">
            <div className="store-header">
              <h2>Visit Our Store</h2>
              <p>Experience the difference of shopping at a real family-owned electrical store</p>
            </div>

            <div className="store-details">
              <div className="store-detail">
                <MapPin size={24} />
                <div>
                  <h4>Location</h4>
                  <p>{storeInfo.address}</p>
                </div>
              </div>
              <div className="store-detail">
                <Phone size={24} />
                <div>
                  <h4>Contact</h4>
                  <p>{storeInfo.phone}</p>
                  <p>{storeInfo.alternatePhone}</p>
                </div>
              </div>
              <div className="store-detail">
                <Clock size={24} />
                <div>
                  <h4>Store Hours</h4>
                  <p>{storeInfo.hours}</p>
                  <span className="open-badge">Open Now</span>
                </div>
              </div>
            </div>

            <div className="store-benefits">
              <h4>Why Visit Us?</h4>
              <ul>
                <li>✓ See products before you buy</li>
                <li>✓ Get expert advice face-to-face</li>
                <li>✓ Discuss pricing directly</li>
                <li>✓ Instant repairs and replacements</li>
                <li>✓ Build a lasting relationship</li>
              </ul>
            </div>

            <a href={storeInfo.mapLink} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="large" fullWidth icon={MapPin}>
                Get Directions
              </Button>
            </a>
          </div>

          {/* Testimonials */}
          <div className="testimonials-section">
            <h3>What Our Customers Say</h3>
            
            <div className="testimonials-list">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-card">
                  <Quote className="quote-icon" size={24} />
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="testimonial-footer">
                    <div className="testimonial-author">
                      <div className="author-avatar">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="author-info">
                        <span className="author-name">{testimonial.name}</span>
                        <span className="author-location">{testimonial.location}</span>
                      </div>
                    </div>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#FFB703" color="#FFB703" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Stats */}
            <div className="trust-stats">
              <div className="stat">
                <span className="stat-number">25+</span>
                <span className="stat-label">Years of Service</span>
              </div>
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Repairs Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorePresence;
