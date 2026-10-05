import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User as UserIcon, Mail, Lock, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    } else if (fullName.trim().length < 2) {
      errs.fullName = 'Full Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email format.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      setSuccessMessage('Staff account created successfully! Redirecting to login...');
      showToast('Registration successful! Please sign in with your credentials.', 'success');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'Email address is already registered in the system.'
          : 'Registration failed. Please check the information entered.');
      setServerError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">Staff Registration</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Register a new Staff account to manage projects and tasks</p>
        </div>

        {serverError && (
          <div className="auth-alert auth-alert-error" style={{ marginBottom: 18 }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>{serverError}</div>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert auth-alert-success" style={{ marginBottom: 18 }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>{successMessage}</div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-fullname">
              Full Name *
            </label>
            <div className="auth-input-wrapper">
              <UserIcon size={18} className="auth-input-icon" />
              <input
                id="reg-fullname"
                type="text"
                className={`auth-input ${errors.fullName ? 'error' : ''}`}
                placeholder="Nguyen Van A"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                disabled={isSubmitting || !!successMessage}
              />
            </div>
            {errors.fullName && <div className="auth-error-msg">{errors.fullName}</div>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">
              Email Address *
            </label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="reg-email"
                type="email"
                className={`auth-input ${errors.email ? 'error' : ''}`}
                placeholder="staff.name@tasktrack.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                disabled={isSubmitting || !!successMessage}
              />
            </div>
            {errors.email && <div className="auth-error-msg">{errors.email}</div>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-password">
              Password (min 6 characters) *
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="reg-password"
                type="password"
                className={`auth-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                disabled={isSubmitting || !!successMessage}
              />
            </div>
            {errors.password && <div className="auth-error-msg">{errors.password}</div>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirmpassword">
              Confirm Password *
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="reg-confirmpassword"
                type="password"
                className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
                disabled={isSubmitting || !!successMessage}
              />
            </div>
            {errors.confirmPassword && <div className="auth-error-msg">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting || !!successMessage}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Registering account...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Create Staff Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already registered?{' '}
          <Link to="/login" className="auth-link">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
