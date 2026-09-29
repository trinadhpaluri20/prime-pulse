import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const SignupView = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validate = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!validate()) return;

    setLoading(true);
    try {
      await signup(fullName, email, password);
      setSuccessMsg('Account created successfully! Initializing workspace...');
      setTimeout(() => {
        navigate('/overview', { replace: true });
      }, 1000);
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        
        {/* Header Branding */}
        <div className="auth-header">
          <Logo size="lg" showSubtitle={true} />
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">
            Get instant access to AI Competitive Intelligence
          </p>
        </div>

        {/* Alerts */}
        {serverError && (
          <div className="auth-alert-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert-success">
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          
          {/* Full Name */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="name-input">
              Full Name
            </label>
            <div className="auth-input-wrapper">
              <input
                id="name-input"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (touched.fullName) validate();
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                placeholder="Alex Vance"
                className={`auth-input ${touched.fullName && errors.fullName ? 'has-error' : ''}`}
              />
            </div>
            {touched.fullName && errors.fullName && (
              <span className="auth-error-msg">{errors.fullName}</span>
            )}
          </div>

          {/* Email Address */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-email">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <input
                id="signup-email"
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

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-password">
              Password
            </label>
            <div className="auth-input-wrapper">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) validate();
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder="Minimum 8 characters"
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

          {/* Confirm Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-confirm-password">
              Confirm Password
            </label>
            <div className="auth-input-wrapper">
              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirmPassword) validate();
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                placeholder="Re-enter password"
                className={`auth-input ${touched.confirmPassword && errors.confirmPassword ? 'has-error' : ''}`}
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="auth-eye-btn"
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {touched.confirmPassword && errors.confirmPassword && (
              <span className="auth-error-msg">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? (
              <>
                <RefreshCw size={18} className="spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SignupView;
