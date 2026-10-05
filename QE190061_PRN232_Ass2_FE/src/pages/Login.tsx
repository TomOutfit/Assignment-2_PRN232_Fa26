import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect url from query params if available
  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await login({ email, password });
      showToast(`Welcome back, ${res.fullName}! Logged in as ${res.roleName}.`, 'success');
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">
            <Sparkles size={14} /> Assignment 2 Official
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in with your TaskTrack account to access management</p>
        </div>

        {errorMessage && (
          <div className="auth-alert auth-alert-error" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>{errorMessage}</div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="login-email"
                type="email"
                className="auth-input"
                placeholder="name@tasktrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="login-password"
                type="password"
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Register as Staff
          </Link>
        </div>

        {/* Demo Fast-fill accounts for Grading verification */}
        <div className="auth-demobox">
          <div className="auth-demobox-title">
            <Sparkles size={13} /> Quick Test Credentials (Grading)
          </div>
          <div className="auth-demobox-grid">
            <button
              type="button"
              className="auth-demobtn"
              onClick={() => handleFillDemo('admin@tasktrack.com', 'Admin@123456')}
            >
              <strong>Admin Account</strong>
              <span>admin@tasktrack.com</span>
            </button>
            <button
              type="button"
              className="auth-demobtn"
              onClick={() => handleFillDemo('staff@tasktrack.com', 'Staff@123456')}
            >
              <strong>Staff Account</strong>
              <span>staff@tasktrack.com</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
