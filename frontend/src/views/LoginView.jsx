import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const LoginView = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setTouched({ email: true, password: true });

    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      navigate('/overview', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        
        {/* Brand Header */}
        <div className="auth-header">
          <Logo size="lg" showSubtitle={true} />
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">
            Access your AI Strategic Intelligence Console
          </p>
        </div>

        {/* Global Server Error */}
        {serverError && (
          <div className="auth-alert-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          
          {/* Email Field */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email-input">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) validate();
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                placeholder="analyst@company.com"
                className={`auth-input ${touched.email && errors.email ? 'has-error' : ''}`}
              />
            </div>
            {touched.email && errors.email && (
              <span className="auth-error-msg">{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="password-input">
              Password
            </label>
            <div className="auth-input-wrapper">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) validate();
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder="••••••••"
                className={`auth-input ${touched.password && errors.password ? 'has-error' : ''}`}
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-eye-btn"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.password && errors.password && (
              <span className="auth-error-msg">{errors.password}</span>
            )}
          </div>

          {/* Remember Me & Options */}
          <div className="auth-row-between">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="auth-checkbox"
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? (
              <>
                <RefreshCw size={18} className="spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Platform</span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="auth-link">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginView;
