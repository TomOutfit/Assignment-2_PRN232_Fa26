import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { accountApi } from '../services/api';
import type { Account } from '../types';
import { useToast } from '../context/ToastContext';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Search,
  Clock,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  UserPlus,
} from 'lucide-react';

export default function AccountList() {
  const { showToast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Edit Modal State
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editRole, setEditRole] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountApi.getAll();
      setAccounts(data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to load accounts list', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    setEditFullName(account.fullName);
    setEditRole(account.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    if (!editFullName.trim()) {
      showToast('Full Name cannot be empty', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await accountApi.update(editingAccount.accountId, {
        fullName: editFullName.trim(),
        role: editRole,
      });

      setAccounts(
        accounts.map((a) => (a.accountId === updated.accountId ? { ...a, ...updated } : a))
      );
      showToast(`Account #${updated.accountId} updated successfully`, 'success');
      setEditingAccount(null);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update account', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await accountApi.delete(deletingAccount.accountId);
      setAccounts(accounts.filter((a) => a.accountId !== deletingAccount.accountId));
      showToast(`Account "${deletingAccount.fullName}" deleted successfully`, 'success');
      setDeletingAccount(null);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Cannot delete account: This account has created tasks or dependencies in the system.';
      setDeleteError(msg);
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAccounts = accounts.filter(
    (a) =>
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.roleName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
          <Link to="/admin" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={14} /> Admin Hub
          </Link>
          <ChevronRight size={14} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>System Accounts</span>
        </div>

        <Link
          to="/register"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 8,
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <UserPlus size={14} />
          <span>Register New Staff</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          padding: '24px 28px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-base)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 9999,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            <ShieldCheck size={14} /> Admin Role Only
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
            System Account Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 14 }}>
            Manage staff and administrator profiles, assign role privileges, and inspect task creator accountability.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              width: 280,
            }}
          >
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: 8,
                border: '1px solid var(--border-base)',
                fontSize: 13,
                outline: 'none',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Account Table */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-base)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-base)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '14px 20px' }}>Account ID</th>
                <th style={{ padding: '14px 20px' }}>User Details</th>
                <th style={{ padding: '14px 20px' }}>Assigned Role</th>
                <th style={{ padding: '14px 20px' }}>Tasks Created</th>
                <th style={{ padding: '14px 20px' }}>Registration Date</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 12px' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Loading system accounts...</span>
                  </td>
                </tr>
              ) : filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontWeight: 600 }}>No accounts match the criteria</p>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => {
                  const isAccountAdmin = account.role === 1 || account.roleName === 'Admin';
                  return (
                    <tr
                      key={account.accountId}
                      style={{
                        borderBottom: '1px solid var(--border-color, #f3f4f6)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        #{account.accountId}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: isAccountAdmin ? '#EF4444' : '#3B82F6',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: 14,
                              flexShrink: 0,
                            }}
                          >
                            {account.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              {account.fullName}
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                              {account.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 10px',
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: 700,
                            backgroundColor: isAccountAdmin
                              ? 'rgba(239, 68, 68, 0.12)'
                              : 'rgba(59, 130, 246, 0.12)',
                            color: isAccountAdmin ? '#DC2626' : '#2563EB',
                          }}
                        >
                          {isAccountAdmin ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                          {isAccountAdmin ? 'Admin' : 'Staff'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Briefcase size={14} color="var(--text-tertiary)" />
                          <span
                            style={{
                              fontWeight: 600,
                              color:
                                (account.createdTasksCount ?? 0) > 0
                                  ? 'var(--text-primary)'
                                  : 'var(--text-tertiary)',
                            }}
                          >
                            {account.createdTasksCount ?? 0} active tasks
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                          <Clock size={13} />
                          {new Date(account.createdDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(account)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: '1px solid var(--border-base)',
                              background: 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Edit Role / Name"
                          >
                            <Edit2 size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError(null);
                              setDeletingAccount(account);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              background: 'rgba(239, 68, 68, 0.05)',
                              color: '#EF4444',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Delete Account"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Account Modal */}
      {editingAccount && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-modal-backdrop)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-base)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-base)',
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
                Edit Account #{editingAccount.accountId}
              </h2>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  Email Address (Immutable)
                </label>
                <input
                  type="text"
                  value={editingAccount.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-base)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    fontSize: 14,
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-base)',
                    fontSize: 14,
                    outline: 'none',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  System Role *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-base)',
                    fontSize: 14,
                    outline: 'none',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value={0}>Staff (Write access to projects & tasks)</option>
                  <option value={1}>Admin (Full system privilege + account management)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: '1px solid var(--border-base)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
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
                    padding: '10px 20px',
                    borderRadius: 8,
                    background: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAccount && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--bg-modal-backdrop)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-base)',
              padding: 28,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>
              Confirm Account Deletion
            </h3>

            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 16px 0', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete account{' '}
              <strong>"{deletingAccount.fullName}"</strong> ({deletingAccount.email})?
            </p>

            <div
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 12,
                color: '#f59e0b',
                textAlign: 'left',
                marginBottom: 20,
              }}
            >
              <strong>Constraint Rule:</strong> The deletion will be rejected by the server if this account has ever created any tasks in the system.
            </div>

            {deleteError && (
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#EF4444',
                  textAlign: 'left',
                  marginBottom: 20,
                }}
              >
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  setDeletingAccount(null);
                  setDeleteError(null);
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: 8,
                  border: '1px solid var(--border-base)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 20px',
                  borderRadius: 8,
                  backgroundColor: 'var(--accent-rose)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
