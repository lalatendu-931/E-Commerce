import { Link } from 'react-router-dom';
import { ArrowRight, Loader } from 'lucide-react';
import { useCategories } from '../../../hooks/useData';
import './CategoryShowcase.css';

// Category images fallback - add your custom images to /src/assets/categories/
const categoryImages = {
  'fans': '/src/assets/categories/fans-coolers.png',
  'fans-coolers': '/src/assets/categories/fans-coolers.png',
  'kitchen': '/src/assets/categories/kitchen-appliances.png',
  'kitchen-appliances': '/src/assets/categories/kitchen-appliances.png',
  'irons': '/src/assets/categories/irons-steamers.png',
  'irons-steamers': '/src/assets/categories/irons-steamers.png',
  'wires-cables': '/src/assets/categories/wires-cables.png',
  'switches-accessories': '/src/assets/categories/switches-accessories.png',
  'spare-parts': '/src/assets/categories/spare-parts.png',
  'motors': '/src/assets/categories/motors.png',
  'repair-services': '/src/assets/categories/repair-services.png',
};

const categoryIcons = {
  'fans': '🌀',
  'fans-coolers': '🌀',
  'kitchen': '🍳',
  'kitchen-appliances': '🍳',
  'irons': '👔',
  'irons-steamers': '👔',
  'wires-cables': '🔌',
  'switches-accessories': '💡',
  'spare-parts': '⚙️',
  'motors': '🔄',
  'repair-services': '🔧',
};

const CategoryShowcase = () => {
  const { categories, loading, error } = useCategories();

  // Filter out repair-services from categories display
  const displayCategories = categories.filter(c => c.slug !== 'repair-services');

  if (loading) {
    return (
      <section className="category-showcase section">
        <div className="container">
          <div className="section-header">
            <div className="header-content">
              <span className="section-label">Browse Categories</span>
              <h2>Shop by Category</h2>
            </div>
          </div>
          <div className="loading-state">
            <Loader className="spinner" size={32} />
            <p>Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="category-showcase section">
        <div className="container">
          <div className="section-header">
            <div className="header-content">
              <span className="section-label">Browse Categories</span>
              <h2>Shop by Category</h2>
            </div>
          </div>
          <div className="error-state">
            <p>Unable to load categories. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="category-showcase section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="header-content">
            <span className="section-label">Browse Categories</span>
            <h2>Shop by Category</h2>
            <p>Find everything electrical under one roof — from fans to spare parts</p>
          </div>
          <Link to="/shop" className="view-all-link">
            View All Products
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="categories-grid">
          {displayCategories.map((category, index) => (
            <Link 
              key={category.id}
              to={`/shop/${category.slug}`}
              className={`category-card ${index === 0 ? 'featured' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="category-image-wrapper">
                <img 
                  src={category.image_url || categoryImages[category.slug] || categoryImages['fans']} 
                  alt={category.name}
                  className="category-image"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = categoryImages['fans'];
                  }}
                />
                <div className="category-overlay"></div>
              </div>
              
              <div className="category-content">
                <span className="category-icon">{categoryIcons[category.slug] || '📦'}</span>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-count">{category.product_count || 0}+ Products</p>
                
                {/* Description preview */}
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
              </div>

              <span className="category-arrow">
                <ArrowRight size={18} />
              </span>
            </Link>
          ))}
        </div>

        {/* Repair Services Card - Standalone */}
        <div className="repair-promo">
          <div className="repair-promo-content">
            <span className="promo-icon">🔧</span>
            <div className="promo-text">
              <h3>Expert Repair Services</h3>
              <p>Get your appliances fixed by our skilled technicians. Quality repairs, fair prices.</p>
            </div>
            <Link to="/repair" className="promo-cta">
              Book Repair
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
