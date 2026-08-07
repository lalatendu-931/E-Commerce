import { useState, useEffect } from 'react';
import { AuthContext } from './contexts';
import { supabase } from '../services/supabase';
import { authApi } from '../services/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Initialize auth state from Supabase
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
          localStorage.removeItem('ecommerce-token');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile from backend
  const fetchUserProfile = async (supabaseUser) => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (token) {
        localStorage.setItem('ecommerce-token', token);
        const profile = await authApi.getProfile();
        setUser({
          ...profile,
          email: supabaseUser.email,
          provider: supabaseUser.app_metadata?.provider || 'email',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // User might not exist in backend yet, create basic profile
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
        provider: supabaseUser.app_metadata?.provider || 'email',
      });
    } finally {
      setLoading(false);
    }
  };

  // Email/Password signup
  const signup = async (email, password, name, phone = null) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
        },
      });

      if (error) throw error;

      // Register with backend
      if (data.user) {
        try {
          await authApi.register(email, password, name, phone);
        } catch (backendError) {
          console.warn('Backend registration failed:', backendError);
        }
      }

      return data.user;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store token
      if (data.session) {
        localStorage.setItem('ecommerce-token', data.session.access_token);
      }

      return data.user;
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login
  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    localStorage.removeItem('ecommerce-token');
    localStorage.removeItem('ecommerce-cart');
  };

  // Update profile
  const updateProfile = async (updates) => {
    setLoading(true);
    try {
      // Update Supabase user metadata
      await supabase.auth.updateUser({
        data: updates,
      });

      // Update backend profile
      const updatedProfile = await authApi.updateProfile(updates);
      setUser((prev) => ({ ...prev, ...updatedProfile }));
      return updatedProfile;
    } finally {
      setLoading(false);
    }
  };

  // Request password reset
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    resetPassword,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook is exported from ./useAuth.js for Fast Refresh compatibility
