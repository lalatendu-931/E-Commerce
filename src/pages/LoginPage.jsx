import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Visual Section */}
      <div className="auth-visual">
        <div className="auth-visual-content">
          {/* Decorative Elements */}
          <div className="visual-decoration">
            <div className="deco-circle deco-circle-1"></div>
            <div className="deco-circle deco-circle-2"></div>
            <div className="deco-pattern"></div>
          </div>

          {/* Main Visual */}
          <div className="visual-main">
            <div className="store-illustration">
              <div className="illustration-glow"></div>
              <div className="illustration-icon">
                <span>🏪</span>
              </div>
            </div>
            
            <h1>Welcome to<br/><span>E-Commerce Store</span></h1>
            <p>Your trusted online store for quality electronics, spare parts, and expert repairs.</p>
            
            {/* Trust Indicators */}
            <div className="trust-badges">
              <div className="trust-badge">
                <span className="badge-icon">⚡</span>
                <span>25+ Years</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">🛠️</span>
                <span>Expert Repairs</span>
              </div>
              <div className="trust-badge">
                <span className="badge-icon">✨</span>
                <span>Genuine Parts</span>
              </div>
            </div>
          </div>

          {/* Subtle cultural motif */}
          <div className="cultural-motif">
            <div className="motif-lamp">🪔</div>
          </div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="auth-form-section">
        <div className="auth-form-wrapper">
          {/* Logo */}
          <Link to="/" className="auth-logo">
            <div className="logo-icon">
              <Zap size={24} />
            </div>
            <span>E-Commerce Store</span>
          </Link>

          {/* Form Header */}
          <div className="form-header">
            <h2>Sign in to your account</h2>
            <p>Continue shopping, track orders, and manage repairs</p>
          </div>

          {error && (
            <div className="auth-error">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label htmlFor="password">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot?</Link>
              </div>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button 
            type="button" 
            className="google-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
