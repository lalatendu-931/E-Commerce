/**
 * API Service Layer for E-Commerce Website
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/**
 * Base fetch wrapper with error handling
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('ecommerce-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new ApiError(
        data.detail || data.message || 'An error occurred',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network error', 0, null);
  }
}

// ============ Auth API ============
export const authApi = {
  async register(email, password, name, phone = null) {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
    });
  },

  async login(email, password) {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async loginWithGoogle(googleToken) {
    return fetchApi('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken }),
    });
  },

  async logout() {
    return fetchApi('/auth/logout', { method: 'POST' });
  },

  async refreshToken(refreshToken) {
    return fetchApi('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  async getProfile() {
    return fetchApi('/users/me');
  },

  async updateProfile(data) {
    return fetchApi('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// ============ Products API ============
export const productsApi = {
  async getAll(params = {}) {
    const queryString = new URLSearchParams();
    
    if (params.category) queryString.append('category_id', params.category);
    if (params.search) queryString.append('search', params.search);
    if (params.brand) queryString.append('brand', params.brand);
    if (params.minPrice) queryString.append('min_price', params.minPrice);
    if (params.maxPrice) queryString.append('max_price', params.maxPrice);
    if (params.inStock) queryString.append('in_stock', params.inStock);
    if (params.featured) queryString.append('is_featured', params.featured);
    if (params.bestseller) queryString.append('is_bestseller', params.bestseller);
    if (params.sortBy) queryString.append('sort_by', params.sortBy);
    if (params.sortOrder) queryString.append('sort_order', params.sortOrder);
    if (params.skip) queryString.append('skip', params.skip);
    if (params.limit) queryString.append('limit', params.limit);

    const query = queryString.toString();
    return fetchApi(`/products${query ? `?${query}` : ''}`);
  },

  async getById(id) {
    return fetchApi(`/products/${id}`);
  },

  async getBySlug(slug) {
    return fetchApi(`/products/slug/${slug}`);
  },

  async getFeatured(limit = 8) {
    return fetchApi(`/products?is_featured=true&limit=${limit}`);
  },

  async getBestsellers(limit = 8) {
    return fetchApi(`/products?is_bestseller=true&limit=${limit}`);
  },

  async search(query) {
    return fetchApi(`/products?search=${encodeURIComponent(query)}`);
  },
};

// ============ Categories API ============
export const categoriesApi = {
  async getAll() {
    return fetchApi('/products/categories/');
  },

  async getById(id) {
    return fetchApi(`/products/categories/${id}`);
  },

  async getBySlug(slug) {
    return fetchApi(`/products/categories/slug/${slug}`);
  },
};

// ============ Orders API ============
export const ordersApi = {
  async create(orderData) {
    return fetchApi('/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getMyOrders(skip = 0, limit = 20) {
    return fetchApi(`/orders/my-orders?skip=${skip}&limit=${limit}`);
  },

  async getById(id) {
    return fetchApi(`/orders/${id}`);
  },

  async cancel(id) {
    return fetchApi(`/orders/${id}/cancel`, { method: 'POST' });
  },
};

// ============ Pre-bookings API ============
export const prebookingsApi = {
  async create(bookingData) {
    return fetchApi('/prebookings/', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async getMyBookings(skip = 0, limit = 20) {
    return fetchApi(`/prebookings/my-bookings?skip=${skip}&limit=${limit}`);
  },

  async getById(id) {
    return fetchApi(`/prebookings/${id}`);
  },

  async confirm(id) {
    return fetchApi(`/prebookings/${id}/confirm`, { method: 'POST' });
  },

  async cancel(id) {
    return fetchApi(`/prebookings/${id}/cancel`, { method: 'POST' });
  },
};

// ============ Repairs API ============
export const repairsApi = {
  async submit(inquiryData) {
    return fetchApi('/repairs/', {
      method: 'POST',
      body: JSON.stringify(inquiryData),
    });
  },

  async getMyInquiries(skip = 0, limit = 20) {
    return fetchApi(`/repairs/my-inquiries?skip=${skip}&limit=${limit}`);
  },

  async getById(id) {
    return fetchApi(`/repairs/${id}`);
  },

  async getServices() {
    return fetchApi('/repairs/services');
  },

  async getApplianceTypes() {
    return fetchApi('/repairs/appliance-types');
  },

  async approve(id) {
    return fetchApi(`/repairs/${id}/approve`, { method: 'POST' });
  },
};

// Export all APIs
export default {
  auth: authApi,
  products: productsApi,
  categories: categoriesApi,
  orders: ordersApi,
  prebookings: prebookingsApi,
  repairs: repairsApi,
};
