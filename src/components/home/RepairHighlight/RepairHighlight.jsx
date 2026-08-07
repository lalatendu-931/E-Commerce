import { Link } from 'react-router-dom';
import Button from '../../common/Button';
import { ArrowRight, Check, X, Wrench } from 'lucide-react';
import './RepairHighlight.css';

const repairServices = [
  { id: 1, name: 'Ceiling Fan Repair', priceRange: '₹150 - ₹400' },
  { id: 2, name: 'Table Fan Repair', priceRange: '₹100 - ₹300' },
  { id: 3, name: 'Motor Rewinding', priceRange: '₹200 - ₹800' },
  { id: 4, name: 'Mixer Grinder Repair', priceRange: '₹150 - ₹500' },
  { id: 5, name: 'Iron Repair', priceRange: '₹100 - ₹250' },
  { id: 6, name: 'Induction Cooktop Repair', priceRange: '₹200 - ₹600' }
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

const RepairHighlight = () => {
  const displayServices = repairServices.slice(0, 4);

  return (
    <section className="repair-highlight section">
      <div className="container">
        <div className="repair-content">
          {/* Left Side - Info */}
          <div className="repair-info">
            <div className="section-badge">
              <Wrench size={18} />
              <span>Expert Repair Services</span>
            </div>
            <h2>Get Your Appliances Running Like New</h2>
            <p className="repair-description">
              Our skilled technicians have been repairing electrical appliances for over 25 years. 
              All repairs are done in-store with genuine spare parts. No outsourced work, no home visits — 
              just honest, reliable repairs.
            </p>

            {/* What We Repair */}
            <div className="repair-list">
              <h4><Check size={18} /> What We Repair</h4>
              <ul>
                {displayServices.map((service) => (
                  <li key={service.id}>
                    <span className="repair-name">{service.name}</span>
                    <span className="repair-price">{service.priceRange}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What We Don't Repair */}
            <div className="no-repair-list">
              <h4><X size={18} /> What We Don't Repair</h4>
              <div className="no-repair-tags">
                {notRepairedItems.slice(0, 4).map((item, index) => (
                  <span key={index} className="no-repair-tag">{item}</span>
                ))}
              </div>
            </div>

            <div className="repair-cta">
              <Link to="/repair">
                <Button variant="primary" size="large" icon={ArrowRight} iconPosition="right">
                  View All Repair Services
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="repair-visual">
            <div className="repair-card-stack">
              <div className="repair-card">
                <div className="repair-card-icon">🔧</div>
                <h4>Motor Rewinding</h4>
                <p>Expert coil winding for all fan & motor types</p>
                <span className="repair-time">2-3 Days</span>
              </div>
              <div className="repair-card">
                <div className="repair-card-icon">⚡</div>
                <h4>Fan Repair</h4>
                <p>Complete servicing & part replacement</p>
                <span className="repair-time">Same Day</span>
              </div>
              <div className="repair-card">
                <div className="repair-card-icon">🍳</div>
                <h4>Appliance Fix</h4>
                <p>Mixers, irons, induction & more</p>
                <span className="repair-time">1-2 Days</span>
              </div>
            </div>

            {/* Store Visit Note */}
            <div className="store-note">
              <div className="note-icon">📍</div>
              <p>
                <strong>Bring your appliance to our store.</strong><br/>
                We don't offer home services — all repairs are done by our trusted team in-shop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RepairHighlight;
