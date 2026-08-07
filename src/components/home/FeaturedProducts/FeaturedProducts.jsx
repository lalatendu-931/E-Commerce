import { Link } from 'react-router-dom';
import ProductCard from '../../common/ProductCard';
import Button from '../../common/Button';
import { ArrowRight, Loader } from 'lucide-react';
import { useFeaturedProducts } from '../../../hooks/useData';
import './FeaturedProducts.css';

const FeaturedProducts = () => {
  const { products, loading, error } = useFeaturedProducts(8);

  if (loading) {
    return (
      <section className="featured-products section pattern-bg">
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              <h2>Featured Products</h2>
              <p>Best selling items loved by our customers</p>
            </div>
          </div>
          <div className="loading-state">
            <Loader className="spinner" size={32} />
            <p>Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="featured-products section pattern-bg">
        <div className="container">
          <div className="section-header">
            <div className="section-title">
              <h2>Featured Products</h2>
              <p>Best selling items loved by our customers</p>
            </div>
          </div>
          <div className="error-state">
            <p>Unable to load products. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="featured-products section pattern-bg">
      <div className="container">
        <div className="section-header">
          <div className="section-title">
            <h2>Featured Products</h2>
            <p>Best selling items loved by our customers</p>
          </div>
          <Link to="/shop" className="view-all-link">
            <Button variant="outline" icon={ArrowRight} iconPosition="right">
              View All Products
            </Button>
          </Link>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Store Visit CTA */}
        <div className="store-visit-cta">
          <div className="cta-icon">💬</div>
          <div className="cta-message">
            <h4>Want Better Prices?</h4>
            <p>Visit our store and talk to us directly. We value face-to-face relationships and can often offer better deals in person!</p>
          </div>
          <Link to="/contact">
            <Button variant="secondary">Get Directions</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
