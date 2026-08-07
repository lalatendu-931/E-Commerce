import { 
  Users, Award, Wrench, ShieldCheck, Heart, IndianRupee 
} from 'lucide-react';
import './WhyChooseUs.css';

const whyChooseUs = [
  {
    icon: 'Users',
    title: 'Family Business Trust',
    description: 'Three generations of serving our community with honesty and dedication'
  },
  {
    icon: 'Award',
    title: '25+ Years Experience',
    description: 'Decades of expertise in electrical products and repairs'
  },
  {
    icon: 'Wrench',
    title: 'In-Store Repairs',
    description: 'All repairs done by our skilled technicians right in our shop'
  },
  {
    icon: 'ShieldCheck',
    title: 'Genuine Spare Parts',
    description: 'Only authentic parts used for repairs and replacements'
  },
  {
    icon: 'Heart',
    title: 'No Outsourced Work',
    description: 'Your items never leave our trusted hands'
  },
  {
    icon: 'IndianRupee',
    title: 'Fair Pricing',
    description: 'Transparent pricing with room for friendly discussion'
  }
];

const iconMap = {
  Users: Users,
  Award: Award,
  Wrench: Wrench,
  ShieldCheck: ShieldCheck,
  Heart: Heart,
  IndianRupee: IndianRupee
};

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us section">
      <div className="container">
        <div className="section-title">
          <h2>Why Choose Us?</h2>
          <p>Quality products, trusted service, and expert support</p>
        </div>

        <div className="features-grid">
          {whyChooseUs.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Users;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <IconComponent size={32} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Trust Banner */}
        <div className="trust-banner">
          <div className="trust-content">
            <h3>🏪 Real Store. Real People. Real Service.</h3>
            <p>
              Unlike faceless online platforms, we're a real family-owned shop where you can 
              walk in, talk to us, see the products, and get expert advice. We've been 
              serving our community for over 25 years.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
