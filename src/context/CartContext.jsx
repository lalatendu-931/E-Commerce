import { useReducer, useEffect, useState, useCallback } from 'react';
import { CartContext } from './contexts';
import { ordersApi, prebookingsApi } from '../services/api';
import { useAuth } from './useAuth';

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: 1 }]
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        )
      };
    case 'SET_PURCHASE_MODE':
      return {
        ...state,
        purchaseMode: action.payload // 'pay-online' or 'reserve-pickup'
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        purchaseMode: 'reserve-pickup'
      };
    case 'LOAD_CART':
      return action.payload;
    default:
      return state;
  }
};

const initialState = {
  items: [],
  purchaseMode: 'reserve-pickup' // Default to store pickup
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const { user } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('ecommerce-cart');
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('ecommerce-cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const setPurchaseMode = (mode) => {
    dispatch({ type: 'SET_PURCHASE_MODE', payload: mode });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Create a pre-booking (reserve for store pickup)
  const createPreBooking = useCallback(async (customerInfo = {}) => {
    if (state.items.length === 0) {
      throw new Error('Cart is empty');
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      const prebookingData = {
        customer_name: customerInfo.name || user?.full_name || 'Guest',
        customer_phone: customerInfo.phone || user?.phone || '',
        customer_email: customerInfo.email || user?.email || '',
        items: state.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price_at_booking: item.price
        })),
        notes: customerInfo.notes || ''
      };

      const result = await prebookingsApi.create(prebookingData);
      clearCart();
      return result;
    } catch (error) {
      console.error('Error creating pre-booking:', error);
      setOrderError(error.message || 'Failed to create pre-booking');
      throw error;
    } finally {
      setOrderLoading(false);
    }
  }, [state.items, user]);

  // Create an online order (payment required)
  const createOrder = useCallback(async (shippingInfo = {}, paymentInfo = {}) => {
    if (state.items.length === 0) {
      throw new Error('Cart is empty');
    }

    setOrderLoading(true);
    setOrderError(null);

    try {
      const orderData = {
        items: state.items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: shippingInfo.address || '',
        shipping_city: shippingInfo.city || '',
        shipping_state: shippingInfo.state || '',
        shipping_pincode: shippingInfo.pincode || '',
        payment_method: paymentInfo.method || 'cod',
        notes: shippingInfo.notes || ''
      };

      const result = await ordersApi.create(orderData);
      clearCart();
      return result;
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError(error.message || 'Failed to create order');
      throw error;
    } finally {
      setOrderLoading(false);
    }
  }, [state.items]);

  const cartTotal = state.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const cartCount = state.items.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart: state.items,
        purchaseMode: state.purchaseMode,
        cartTotal,
        cartCount,
        orderLoading,
        orderError,
        addToCart,
        removeFromCart,
        updateQuantity,
        setPurchaseMode,
        clearCart,
        createPreBooking,
        createOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// useCart hook is exported from ./useCart.js for Fast Refresh compatibility
