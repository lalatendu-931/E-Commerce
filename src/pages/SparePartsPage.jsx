import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, Search, Filter, X, AlertCircle, Store, 
  Phone, Info
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import Button from '../components/common/Button';
import './SparePartsPage.css';

const storeInfo = {
  phone: '+91 98765 43210'
};

const products = [
  {
    id: 'sp-11',
    name: 'Ceiling Fan Capacitor 2.5µF',
    brand: 'Generic',
    category: 'spare-parts',
    price: 45,
    originalPrice: 65,
    image: '/src/assets/products/capacitor.png',
    rating: 4.0,
    reviews: 34,
    inStock: true,
    type: 'fan'
  },
  {
    id: 'sp-12',
    name: 'Fan Motor Winding Wire 500g',
    brand: 'Magnum',
    category: 'spare-parts',
    price: 450,
    originalPrice: 550,
    image: '/src/assets/products/winding-wire.png',
    rating: 4.2,
    reviews: 28,
    inStock: true,
    type: 'motor'
  }
];

const SparePartsPage = () => {
  // Filter only spare parts
  const spareParts = useMemo(() => 
    products.filter(p => p.category === 'spare-parts'), 
    []
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Mock spare part types
  const partTypes = [
    { id: 'all', name: 'All Parts' },
    { id: 'fan', name: 'Fan Parts' },
    { id: 'motor', name: 'Motor Parts' },
    { id: 'cooler', name: 'Cooler Parts' },
    { id: 'mixer', name: 'Mixer Parts' },
    { id: 'switches', name: 'Switches & Regulators' },
    { id: 'cables', name: 'Wires & Cables' }
  ];

  // Filter parts
  const filteredParts = useMemo(() => {
    // Mock additional spare parts for variety
    const additionalParts = [
      {
        id: 'sp-1',
        name: 'Ceiling Fan Capacitor 2.5µF',
        brand: 'Generic',
        price: 45,
        mrp: 65,
        discount: 31,
        inStock: true,
        category: 'spare-parts',
        type: 'fan'
      },
      {
        id: 'sp-2',
        name: 'Fan Regulator 5 Step',
        brand: 'Anchor',
        price: 180,
        mrp: 220,
        discount: 18,
        inStock: true,
        category: 'spare-parts',
        type: 'switches'
      },
      {
        id: 'sp-3',
        name: 'Motor Winding Wire (500g)',
        brand: 'Magnum',
        price: 450,
        mrp: 550,
        discount: 18,
        inStock: true,
        category: 'spare-parts',
        type: 'motor'
      },
      {
        id: 'sp-4',
        name: 'Cooler Pump Motor',
        brand: 'Generic',
        price: 320,
        mrp: 400,
        discount: 20,
        inStock: true,
        category: 'spare-parts',
        type: 'cooler'
      },
      {
        id: 'sp-5',
        name: 'Mixer Blade Assembly',
        brand: 'Generic',
        price: 150,
        mrp: 200,
        discount: 25,
        inStock: false,
        category: 'spare-parts',
        type: 'mixer'
      },
      {
        id: 'sp-6',
        name: 'Fan Blade Set (3 Blade)',
        brand: 'Generic',
        price: 280,
        mrp: 350,
        discount: 20,
        inStock: true,
        category: 'spare-parts',
        type: 'fan'
      },
      {
        id: 'sp-7',
        name: 'Motor Bearing 6204',
        brand: 'SKF',
        price: 180,
        mrp: 250,
        discount: 28,
        inStock: true,
        category: 'spare-parts',
        type: 'motor'
      },
      {
        id: 'sp-8',
        name: 'Cooler Honeycomb Pad (Large)',
        brand: 'Generic',
        price: 120,
        mrp: 150,
        discount: 20,
        inStock: true,
        category: 'spare-parts',
        type: 'cooler'
      }
    ];

    const allParts = [...spareParts, ...additionalParts];
    return allParts.filter(part => {
      const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           part.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || part.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [spareParts, searchTerm, selectedType]);

  return (
    <main className="spare-parts-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <ChevronRight size={16} />
          <span>Spare Parts</span>
        </div>
      </div>

      {/* Hero */}
      <section className="spare-hero">
        <div className="container">
          <h1>Spare Parts & Components</h1>
          <p>
            Find replacement parts for your electrical appliances. 
            If you can't find what you need, just give us a call!
          </p>
        </div>
      </section>

      {/* Notice */}
      <section className="spare-notice">
        <div className="container">
          <div className="notice-card">
            <Info size={24} />
            <div className="notice-text">
              <strong>Need help identifying the right part?</strong>
              <p>
                Bring your appliance to our store and our technicians will help you 
                identify the exact spare part you need. Many parts are not listed online 
                but are available in-store.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="spare-content section">
        <div className="container">
          <div className="spare-layout">
            {/* Sidebar */}
            <aside className="spare-sidebar">
              {/* Search */}
              <div className="sidebar-section">
                <h3>Search Parts</h3>
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by name or brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Part Types */}
              <div className="sidebar-section">
                <h3>Part Type</h3>
                <div className="type-list">
                  {partTypes.map((type) => (
                    <button
                      key={type.id}
                      className={`type-btn ${selectedType === type.id ? 'active' : ''}`}
                      onClick={() => setSelectedType(type.id)}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Store Contact */}
              <div className="sidebar-section store-contact">
                <h3>Can't Find Your Part?</h3>
                <p>Call us or visit the store with your appliance. We have many parts not listed here.</p>
                <a href={`tel:${storeInfo.phone}`}>
                  <Button variant="primary" fullWidth icon={Phone}>
                    Call: {storeInfo.phone}
                  </Button>
                </a>
              </div>
            </aside>

            {/* Parts Grid */}
            <div className="spare-main">
              <div className="results-header">
                <span className="results-count">
                  {filteredParts.length} parts found
                </span>
                {selectedType !== 'all' && (
                  <button 
                    className="clear-filter"
                    onClick={() => setSelectedType('all')}
                  >
                    Clear filter
                  </button>
                )}
              </div>

              {filteredParts.length === 0 ? (
                <div className="no-results">
                  <AlertCircle size={48} />
                  <h3>No parts found</h3>
                  <p>Try a different search term or contact us for assistance.</p>
                </div>
              ) : (
                <div className="parts-grid">
                  {filteredParts.map((part) => (
                    <div key={part.id} className="part-card">
                      <div className="part-image">
                        <span>{part.name.charAt(0)}</span>
                      </div>
                      <div className="part-info">
                        <h4>{part.name}</h4>
                        <span className="part-brand">{part.brand}</span>
                        <div className="part-pricing">
                          <span className="part-price">₹{part.price}</span>
                          {part.mrp > part.price && (
                            <>
                              <span className="part-mrp">₹{part.mrp}</span>
                              <span className="part-discount">{part.discount}% off</span>
                            </>
                          )}
                        </div>
                        <div className="part-stock">
                          {part.inStock ? (
                            <span className="in-stock">✓ In Stock</span>
                          ) : (
                            <span className="out-of-stock">Out of Stock</span>
                          )}
                        </div>
                        <div className="part-actions">
                          <Button variant="outline" size="small" fullWidth>
                            Reserve at Store
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Visit Store CTA */}
              <div className="visit-store-cta">
                <Store size={32} />
                <div className="cta-text">
                  <h3>Extensive Stock Available In-Store</h3>
                  <p>
                    Our physical store has hundreds of spare parts not listed online. 
                    Visit us for the widest selection and expert help.
                  </p>
                </div>
                <Link to="/contact">
                  <Button variant="secondary">Get Directions</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SparePartsPage;
