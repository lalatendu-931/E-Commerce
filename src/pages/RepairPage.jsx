import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, Clock, CheckCircle, XCircle,
  Phone, MapPin, AlertTriangle, ArrowRight, Shield, Award, Loader
} from 'lucide-react';
import Button from '../components/common/Button';
import { useRepairServices } from '../hooks/useData';
import { repairsApi } from '../services/api';
import './RepairPage.css';

const storeInfo = {
  address: '123, Main Market Road, Near Bus Stand, City Center',
  phone: '+91 98765 43210',
  alternatePhone: '+91 87654 32109',
  hours: 'Open 24/7',
  mapLink: 'https://maps.google.com'
};

// Fallback repair services in case API fails
const fallbackRepairServices = [
  {
    id: 1,
    name: 'Ceiling Fan Repair',
    price_range: '₹150 - ₹400',
    description: 'Complete ceiling fan repair including motor, capacitor, and blade issues.',
    estimated_time: 'Same Day - 2 Days',
    includes: ['Motor repair', 'Capacitor replacement', 'Blade balancing', 'Wiring fix']
  },
  {
    id: 2,
    name: 'Table Fan Repair',
    price_range: '₹100 - ₹300',
    description: 'Table fan servicing and repair for all brands.',
    estimated_time: 'Same Day',
    includes: ['Motor servicing', 'Speed control fix', 'Blade replacement', 'Stand repair']
  },
  {
    id: 3,
    name: 'Motor Rewinding',
    price_range: '₹200 - ₹800',
    description: 'Professional motor rewinding for fans, pumps, and small motors.',
    estimated_time: '2-3 Days',
    includes: ['Coil winding', 'Bearing replacement', 'Testing', 'Warranty']
  },
  {
    id: 4,
    name: 'Mixer Grinder Repair',
    price_range: '₹150 - ₹500',
    description: 'Mixer grinder repair including motor, jar, and blade issues.',
    estimated_time: '1-2 Days',
    includes: ['Motor repair', 'Coupler fix', 'Blade sharpening', 'Jar replacement']
  },
  {
    id: 5,
    name: 'Iron Repair',
    price_range: '₹100 - ₹250',
    description: 'Electric iron repair for dry and steam irons.',
    estimated_time: 'Same Day',
    includes: ['Element replacement', 'Thermostat fix', 'Cord replacement', 'Soleplate cleaning']
  },
  {
    id: 6,
    name: 'Induction Cooktop Repair',
    price_range: '₹200 - ₹600',
    description: 'Induction cooktop repair and servicing.',
    estimated_time: '1-3 Days',
    includes: ['IGBT replacement', 'Coil repair', 'Control panel fix', 'Touch pad repair']
  }
];

const notRepairedItems = [
  'Refrigerators',
  'Washing Machines',
  'Air Conditioners',
  'Televisions',
  'Computers/Laptops',
  'Mobile Phones',
  'Microwave Ovens',
  'Water Purifiers'
];

const RepairPage = () => {
  const { services: apiServices, loading: servicesLoading } = useRepairServices();
  const repairServices = apiServices.length > 0 ? apiServices : fallbackRepairServices;
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    applianceType: '',
    issue: '',
    visitDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      await repairsApi.submitInquiry({
        customer_name: formData.name,
        customer_phone: formData.phone,
        appliance_type: formData.applianceType,
        problem_description: formData.issue,
        preferred_date: formData.visitDate || null
      });
      
      setSubmitStatus({ type: 'success', message: 'Repair inquiry submitted successfully! We\'ll confirm the details soon.' });
      setFormData({ name: '', phone: '', applianceType: '', issue: '', visitDate: '' });
    } catch (error) {
      console.error('Error submitting repair inquiry:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Unable to submit inquiry. Please call us directly or try again later.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="repair-page">
      {/* Hero */}
      <section className="repair-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-label">In-Store Repair Services</span>
              <h1>We Fix What Others Can't</h1>
              <p>
                Bring your fans, motors, and small appliances to our shop. 
                25+ years of hands-on expertise means your appliances leave 
                working like new — with genuine parts and honest pricing.
              </p>
              
              <div className="hero-trust-points">
                <div className="trust-point">
                  <Shield size={18} />
                  <span>No Middlemen or Outsourcing</span>
                </div>
                <div className="trust-point">
                  <Award size={18} />
                  <span>Genuine Spare Parts Only</span>
                </div>
                <div className="trust-point">
                  <Clock size={18} />
                  <span>Same-Day Service Available</span>
                </div>
              </div>

              <div className="hero-ctas">
                <Button 
                  variant="primary" 
                  size="large"
                  icon={ArrowRight}
                  onClick={() => document.getElementById('inquiry-form').scrollIntoView({ behavior: 'smooth' })}
                >
                  Submit Repair Inquiry
                </Button>
                <Link to="/contact">
                  <Button variant="secondary" size="large" icon={MapPin}>
                    Visit Our Store
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-grid">
                <div className="visual-card main">
                  <Wrench size={40} />
                  <span>Repair Bench</span>
                </div>
                <div className="visual-card">
                  <span className="emoji-icon">🔧</span>
                  <span>Tools Ready</span>
                </div>
                <div className="visual-card">
                  <span className="emoji-icon">⚡</span>
                  <span>Expert Team</span>
                </div>
                <div className="visual-card accent">
                  <strong>25+</strong>
                  <span>Years Experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="important-notice">
        <div className="container">
          <div className="notice-card">
            <AlertTriangle size={24} />
            <div className="notice-content">
              <h3>Please Read Before Visiting</h3>
              <ul>
                <li>🏪 <strong>In-Store Service Only:</strong> We do not offer home visits. Please bring your appliance to our shop.</li>
                <li>⏰ <strong>Store Hours:</strong> {storeInfo.hours}</li>
                <li>📞 <strong>Call First:</strong> For complex repairs, please call us to check availability of parts.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Repair Services Grid */}
      <section className="repair-services-section section">
        <div className="container">
          <div className="section-title">
            <h2>What We Repair</h2>
            <p>Comprehensive repair services for electrical appliances and motors</p>
          </div>

          {servicesLoading ? (
            <div className="loading-state">
              <Loader className="spinner" size={32} />
              <p>Loading services...</p>
            </div>
          ) : (
            <div className="services-grid">
              {repairServices.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-header">
                    <h3>{service.name}</h3>
                    <span className="service-price">{service.price_range || service.priceRange}</span>
                  </div>
                  <p className="service-description">{service.description}</p>
                  <div className="service-time">
                    <Clock size={16} />
                    <span>Estimated Time: {service.estimated_time || service.estimatedTime}</span>
                  </div>
                  <div className="service-includes">
                    <h4>What's Included:</h4>
                    <ul>
                      {(service.includes || []).map((item, index) => (
                        <li key={index}>
                          <CheckCircle size={14} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* What We Don't Repair */}
      <section className="not-repaired-section section">
        <div className="container">
          <div className="not-repaired-card">
            <div className="not-repaired-header">
              <XCircle size={32} />
              <div>
                <h2>What We Don't Repair</h2>
                <p>Please note: We specialize in small appliances and motors. The following items are outside our expertise:</p>
              </div>
            </div>
            <div className="not-repaired-list">
              {notRepairedItems.map((item, index) => (
                <span key={index} className="not-repaired-tag">
                  <XCircle size={14} />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="repair-process section pattern-bg">
        <div className="container">
          <div className="section-title">
            <h2>Our Repair Process</h2>
            <p>Simple, transparent, and hassle-free</p>
          </div>

          <div className="process-steps">
            <div className="process-step">
              <div className="step-number">1</div>
              <h3>Bring Your Appliance</h3>
              <p>Visit our store with your faulty appliance. No appointment needed for assessment.</p>
            </div>
            <div className="process-connector"></div>
            <div className="process-step">
              <div className="step-number">2</div>
              <h3>Free Assessment</h3>
              <p>Our technician will diagnose the issue and give you an honest cost estimate.</p>
            </div>
            <div className="process-connector"></div>
            <div className="process-step">
              <div className="step-number">3</div>
              <h3>Repair & Test</h3>
              <p>Once approved, we'll repair using genuine parts and thoroughly test.</p>
            </div>
            <div className="process-connector"></div>
            <div className="process-step">
              <div className="step-number">4</div>
              <h3>Collect & Pay</h3>
              <p>Pick up your repaired appliance and pay. Simple as that!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Store Info & Inquiry Form */}
      <section className="repair-contact section">
        <div className="container">
          <div className="contact-grid">
            {/* Store Info */}
            <div className="store-info-card">
              <h2>Visit Our Store</h2>
              <p>Bring your appliance directly to our shop for assessment and repair.</p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <MapPin size={24} />
                  <div>
                    <h4>Address</h4>
                    <p>{storeInfo.address}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone size={24} />
                  <div>
                    <h4>Phone</h4>
                    <p>{storeInfo.phone}</p>
                    <p>{storeInfo.alternatePhone}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Clock size={24} />
                  <div>
                    <h4>Store Hours</h4>
                    <p>{storeInfo.hours}</p>
                  </div>
                </div>
              </div>

              <a href={storeInfo.mapLink} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" fullWidth icon={MapPin}>
                  Get Directions
                </Button>
              </a>
            </div>

            {/* Inquiry Form */}
            <div id="inquiry-form" className="inquiry-form-card">
              <h2>Submit Repair Inquiry</h2>
              <p>Let us know about your repair needs. We'll confirm availability and estimated costs.</p>
              
              {submitStatus && (
                <div className={`form-status ${submitStatus.type}`}>
                  {submitStatus.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                  <span>{submitStatus.message}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Your Name *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label>Appliance Type *</label>
                  <select 
                    value={formData.applianceType}
                    onChange={(e) => setFormData({...formData, applianceType: e.target.value})}
                    required
                    disabled={submitting}
                  >
                    <option value="">Select appliance</option>
                    <option value="ceiling-fan">Ceiling Fan</option>
                    <option value="table-fan">Table Fan</option>
                    <option value="cooler">Cooler</option>
                    <option value="mixer-grinder">Mixer Grinder</option>
                    <option value="iron">Iron</option>
                    <option value="induction">Induction Cooktop</option>
                    <option value="motor">Motor</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Describe the Issue *</label>
                  <textarea 
                    value={formData.issue}
                    onChange={(e) => setFormData({...formData, issue: e.target.value})}
                    required
                    rows={3}
                    placeholder="Briefly describe what's wrong with your appliance..."
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label>Expected Visit Date</label>
                  <input 
                    type="date" 
                    value={formData.visitDate}
                    onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={submitting}
                  />
                </div>
                <Button type="submit" variant="primary" fullWidth disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader className="spinner" size={16} />
                      Submitting...
                    </>
                  ) : (
                    'Submit Inquiry'
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RepairPage;
