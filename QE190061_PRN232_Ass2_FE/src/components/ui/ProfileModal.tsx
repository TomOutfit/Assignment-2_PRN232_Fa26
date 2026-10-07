import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../services/api';
import {
  User,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  X,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      showToast('Full Name is required.', 'error');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters.', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('New password and confirmation do not match.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updatedAccount = await authApi.updateProfile({
        fullName: fullName.trim(),
        newPassword: newPassword ? newPassword : undefined,
      });

      // Update localStorage user state
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUserData = { ...currentUser, fullName: updatedAccount.fullName };
      localStorage.setItem('user', JSON.stringify(newUserData));

      showToast('Profile updated successfully!', 'success');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
      // Simple reload to refresh UI with new user name
      window.location.reload();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 20,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-base)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isAdmin
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(249, 115, 22, 0.04))'
              : 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.04))',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                backgroundColor: isAdmin ? '#EF4444' : '#2563EB',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 18,
                boxShadow: isAdmin
                  ? '0 4px 14px rgba(239, 68, 68, 0.35)'
                  : '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                {user.fullName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 9999,
                    backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                    color: isAdmin ? '#EF4444' : '#2563EB',
                  }}
                >
                  {isAdmin ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                  {user.roleName}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{user.accountId}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            padding: '0 16px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <User size={15} /> Personal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            style={{
              padding: '12px 16px',
              fontSize: 13,
              fontWeight: 600,
              color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'security' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Lock size={15} /> Password & Security
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {activeTab === 'profile' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 10,
                      border: '1px solid var(--border-base)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  Email Address (Immutable)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 10,
                      border: '1px solid var(--border-subtle)',
                      fontSize: 14,
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 4,
                }}
              >
                <CheckCircle2 size={20} color="#10b981" />
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Role privileges: <strong>{user.roleName} Mode</strong>. You have permissions to create and manage assigned items.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  New Password (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    placeholder="Leave blank to keep current password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: 10,
                      border: '1px solid var(--border-base)',
                      fontSize: 14,
                      outline: 'none',
                      background: 'var(--bg-input)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {newPassword.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        borderRadius: 10,
                        border: '1px solid var(--border-base)',
                        fontSize: 14,
                        outline: 'none',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: 10,
                border: '1px solid var(--border-base)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '9px 20px',
                borderRadius: 10,
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              }}
            >
              <Save size={15} /> {isSubmitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
