import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, MapPin, Phone, Mail, Clock, 
  MessageSquare, Send
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './ContactPage.css';

const storeInfo = {
  address: '123, Main Market Road, Near Bus Stand, City Center',
  phone: '+91 98765 43210',
  alternatePhone: '+91 87654 32109',
  email: 'contact@ecommerce-store.com',
  hours: 'Open 24/7',
  mapLink: 'https://maps.google.com'
};

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock submission
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  const faqs = [
    {
      q: 'What are your store hours?',
      a: `We're open ${storeInfo.hours}. We're closed on Sundays.`
    },
    {
      q: 'Do you offer home delivery?',
      a: 'Currently, we operate on a store-pickup model. You can browse online and reserve items, then collect them from our store.'
    },
    {
      q: 'Can I negotiate prices at your store?',
      a: 'Absolutely! We believe in the traditional Indian shopping experience. Visit us and we can discuss the best prices face-to-face.'
    },
    {
      q: 'Do you repair items at home?',
      a: 'No, we provide in-store repair services only. Please bring your appliances to our shop for assessment and repair.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept cash, all major UPI apps (GPay, PhonePe, Paytm), debit/credit cards, and bank transfers.'
    }
  ];

  return (
    <main className="contact-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <ChevronRight size={16} />
          <span>Contact Us</span>
        </div>
      </div>

      {/* Hero */}
      <section className="contact-hero">
        <div className="container">
          <h1>Get in Touch</h1>
          <p>Have questions? We'd love to hear from you. Visit our store or reach out below.</p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="contact-main section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h2>Contact Information</h2>
              <p>
                Prefer talking in person? Just drop by our store! We're always happy 
                to help you find the right product or discuss your repair needs.
              </p>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="info-content">
                    <h3>Visit Our Store</h3>
                    <p>{storeInfo.address}</p>
                    <a 
                      href={storeInfo.mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="info-link"
                    >
                      Get Directions →
                    </a>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Phone size={24} />
                  </div>
                  <div className="info-content">
                    <h3>Call Us</h3>
                    <p>{storeInfo.phone}</p>
                    <p>{storeInfo.alternatePhone}</p>
                    <a href={`tel:${storeInfo.phone}`} className="info-link">
                      Call Now →
                    </a>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Clock size={24} />
                  </div>
                  <div className="info-content">
                    <h3>Store Hours</h3>
                    <p>{storeInfo.hours}</p>
                    <p className="closed-note">Closed on Sundays</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <Mail size={24} />
                  </div>
                  <div className="info-content">
                    <h3>Email Us</h3>
                    <p>{storeInfo.email}</p>
                    <span className="response-time">We respond within 24 hours</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <div className="whatsapp-cta">
                <MessageSquare size={28} />
                <div className="wa-text">
                  <strong>Prefer WhatsApp?</strong>
                  <span>Message us directly for quick responses</span>
                </div>
                <a 
                  href={`https://wa.me/91${storeInfo.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="success" size="small">
                    WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-card">
              <h2>Send us a Message</h2>
              <p>Fill out the form and we'll get back to you shortly.</p>

              {submitted ? (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <Input
                      label="Your Name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your name"
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Your phone number"
                      required
                    />
                  </div>

                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Your email (optional)"
                  />

                  <div className="form-group">
                    <label>Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="repair-inquiry">Repair Inquiry</option>
                      <option value="order-status">Order Status</option>
                      <option value="bulk-order">Bulk/Wholesale Order</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tell us how we can help..."
                      rows={5}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    size="large" 
                    fullWidth
                    icon={Send}
                  >
                    Send Message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - New Two Column Layout */}
      <section className="map-section section">
        <div className="container">
          <div className="map-grid">
            <div className="map-info">
              <h2>Visit Our Store</h2>
              <p>Come see our products in person and experience traditional shopping at its best.</p>
              
              <div className="map-details">
                <div className="map-detail-item">
                  <MapPin size={20} />
                  <div>
                    <strong>Address</strong>
                    <span>{storeInfo.address}</span>
                  </div>
                </div>
                <div className="map-detail-item">
                  <Phone size={20} />
                  <div>
                    <strong>Phone</strong>
                    <span>{storeInfo.phone}</span>
                  </div>
                </div>
                <div className="map-detail-item">
                  <Clock size={20} />
                  <div>
                    <strong>Store Hours</strong>
                    <span>{storeInfo.hours} (Closed Sundays)</span>
                  </div>
                </div>
              </div>

              <a 
                href={storeInfo.mapLink} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="primary" icon={MapPin}>
                  Get Directions
                </Button>
              </a>
            </div>

            <div className="map-embed">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.5!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzE4LjIiTiA3N8KwMzUnNDAuNiJF!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: 'var(--radius-lg)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="E-Commerce Store Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="faq-section section">
        <div className="container">
          <div className="section-title">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
          </div>

          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card">
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
