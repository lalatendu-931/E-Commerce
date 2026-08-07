import { useState, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, Grid, List, ChevronDown, X, SlidersHorizontal,
  ChevronRight, Loader
} from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import Button from '../components/common/Button';
import { useProducts, useCategories } from '../hooks/useData';
import './ShopPage.css';

const ShopPage = () => {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  // Fetch data from API
  const { products, loading: productsLoading, error: productsError } = useProducts({
    category: categoryId,
    search: searchQuery
  });
  const { categories, loading: categoriesLoading } = useCategories();

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    brands: [],
    inStock: false
  });

  // Find current category from API data
  const currentCategory = categoryId 
    ? categories.find(c => c.slug === categoryId || c.id === categoryId)
    : null;

  // Filter and sort products (client-side filtering for remaining filters)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by price range
    result = result.filter(p => 
      p.price >= filters.priceRange[0] && 
      p.price <= filters.priceRange[1]
    );

    // Filter by brands
    if (filters.brands.length > 0) {
      result = result.filter(p => filters.brands.includes(p.brand));
    }

    // Filter by stock
    if (filters.inStock) {
      result = result.filter(p => p.stock_quantity > 0 || p.inStock);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        // Featured - prioritize featured products
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, filters, sortBy]);

  // Get unique brands from products
  const availableBrands = useMemo(() => {
    const brands = new Set(products.filter(p => p.brand).map(p => p.brand));
    return Array.from(brands);
  }, [products]);

  const toggleBrand = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      brands: [],
      inStock: false
    });
  };

  // Filter out repair-services from categories for sidebar display
  const shopCategories = categories.filter(c => c.slug !== 'repair-services');

  // Loading state
  if (productsLoading && products.length === 0) {
    return (
      <main className="shop-page">
        <div className="container">
          <div className="loading-state">
            <Loader className="spinner" size={40} />
            <p>Loading products...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (productsError) {
    return (
      <main className="shop-page">
        <div className="container">
          <div className="error-state">
            <h3>Error loading products</h3>
            <p>{productsError}</p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shop-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <ChevronRight size={16} />
          <Link to="/shop">Shop</Link>
          {currentCategory && (
            <>
              <ChevronRight size={16} />
              <span>{currentCategory.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="shop-header pattern-bg">
        <div className="container">
          <h1>{currentCategory ? currentCategory.name : searchQuery ? `Search: "${searchQuery}"` : 'Shop All Products'}</h1>
          <p>
            {currentCategory 
              ? currentCategory.description 
              : 'Browse our complete collection of electrical products'}
          </p>
        </div>
      </div>

      <div className="container">
        <div className="shop-layout">
          {/* Sidebar Filters */}
          <aside className={`shop-sidebar ${showFilters ? 'show' : ''}`}>
            <div className="sidebar-header">
              <h3><Filter size={18} /> Filters</h3>
              <button className="close-filters" onClick={() => setShowFilters(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Categories */}
            <div className="filter-section">
              <h4>Categories</h4>
              <ul className="category-list">
                <li>
                  <Link 
                    to="/shop" 
                    className={!categoryId ? 'active' : ''}
                  >
                    All Products
                    <span>{products.length}</span>
                  </Link>
                </li>
                {shopCategories.map(cat => (
                  <li key={cat.id}>
                    <Link 
                      to={`/shop/${cat.slug}`}
                      className={categoryId === cat.slug || categoryId === cat.id ? 'active' : ''}
                    >
                      {cat.name}
                      <span>{cat.product_count || 0}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-range">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [0, parseInt(e.target.value)]
                  }))}
                />
                <div className="price-labels">
                  <span>₹0</span>
                  <span>₹{filters.priceRange[1].toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Brands */}
            <div className="filter-section">
              <h4>Brands</h4>
              <div className="brand-filters">
                {availableBrands.map(brand => (
                  <label key={brand} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => toggleBrand(brand)}
                    />
                    <span className="checkmark"></span>
                    {brand}
                  </label>
                ))}
              </div>
            </div>

            {/* In Stock */}
            <div className="filter-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    inStock: e.target.checked
                  }))}
                />
                <span className="checkmark"></span>
                In Stock Only
              </label>
            </div>

            {/* Clear Filters */}
            <Button variant="outline" fullWidth onClick={clearFilters}>
              Clear All Filters
            </Button>

            {/* Store Visit CTA */}
            <div className="sidebar-cta">
              <p>💬 <strong>Can't find what you need?</strong></p>
              <p>Visit our store or call us. We have more products than what's listed here!</p>
            </div>
          </aside>

          {/* Main Content */}
          <div className="shop-content">
            {/* Toolbar */}
            <div className="shop-toolbar">
              <div className="toolbar-left">
                <button 
                  className="filter-toggle"
                  onClick={() => setShowFilters(true)}
                >
                  <SlidersHorizontal size={18} />
                  Filters
                </button>
                <span className="product-count">
                  {filteredProducts.length} products found
                </span>
              </div>

              <div className="toolbar-right">
                <div className="sort-select">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="newest">Newest</option>
                  </select>
                  <ChevronDown size={16} />
                </div>

                <div className="view-toggle">
                  <button 
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={18} />
                  </button>
                  <button 
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className={`products-grid ${viewMode}`}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <div className="no-products-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Bargain Notice */}
            <div className="bargain-notice">
              <div className="notice-icon">💰</div>
              <div className="notice-content">
                <h4>Looking for Better Prices?</h4>
                <p>
                  Prices shown are our standard rates. Visit our store for potential discounts 
                  and deals. We believe in fair pricing and are always open to honest discussion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ShopPage;
