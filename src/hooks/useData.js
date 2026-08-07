/**
 * Custom hooks for data fetching
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { productsApi, categoriesApi, repairsApi } from '../services/api';

/**
 * Hook for fetching products with filters
 */
export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use ref to track filters and avoid stale closure
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getAll(filtersRef.current);
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters.category, filters.search, filters.featured, fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

/**
 * Hook for fetching a single product
 */
export function useProduct(idOrSlug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch by slug first, then by ID
        const data = idOrSlug.includes('-')
          ? await productsApi.getBySlug(idOrSlug)
          : await productsApi.getById(idOrSlug);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [idOrSlug]);

  return { product, loading, error };
}

/**
 * Hook for fetching categories
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

/**
 * Hook for fetching repair services
 */
export function useRepairServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await repairsApi.getServices();
        setServices(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch repair services');
        console.error('Error fetching repair services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
}

/**
 * Hook for fetching featured products
 */
export function useFeaturedProducts(limit = 8) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productsApi.getFeatured(limit);
        setProducts(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch featured products');
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [limit]);

  return { products, loading, error };
}
