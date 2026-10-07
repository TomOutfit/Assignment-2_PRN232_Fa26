import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Users,
  Tag,
  Search,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Shield,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  FolderLock,
  Lock,
  Eye,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { CommandPalette } from './ui/CommandPalette';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  // Public Navigation items
  const publicNavItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/tasks', label: 'Browse Tasks', icon: CheckSquare },
    { path: '/projects', label: 'Browse Projects', icon: FolderKanban },
    { path: '/departments', label: 'Departments', icon: Users },
    { path: '/tags', label: 'Tags Explorer', icon: Tag },
    { path: '/search', label: 'Search Hub', icon: Search },
  ];

  // Protected Management Navigation items
  const managementNavItems = [
    { path: '/admin', label: 'Admin Hub', icon: Shield, exact: true, adminOnly: false },
    { path: '/admin/departments', label: 'Manage Departments', icon: Users, exact: false, adminOnly: false },
    { path: '/admin/projects', label: 'Manage Projects', icon: FolderKanban, exact: false, adminOnly: false },
    { path: '/admin/tasks', label: 'Manage Tasks', icon: CheckSquare, exact: false, adminOnly: false },
    { path: '/admin/tags', label: 'Manage Tags', icon: Tag, exact: false, adminOnly: false },
    { path: '/admin/accounts', label: 'User Accounts', icon: ShieldCheck, exact: false, adminOnly: true },
  ];

  return (
    <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile Backdrop */}
      {mobileOpen && <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />}

      {/* Modern Clean Sidebar Navigation */}
      <aside className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header with Brand */}
        <div className="sidebar-header">
          <Link to="/" className="brand-logo" onClick={() => setMobileOpen(false)}>
            <div className="brand-mark">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="2" fill="currentColor" />
                <rect x="14" y="3" width="7" height="7" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="3" y="14" width="7" height="7" rx="2" fill="currentColor" opacity="0.6" />
                <rect x="14" y="14" width="7" height="7" rx="2" fill="#4f46e5" />
              </svg>
            </div>
            {!collapsed && (
              <div className="brand-text">
                <span className="brand-title">TASKTRACK</span>
                <span className="brand-subtitle">ASSIGNMENT 2</span>
              </div>
            )}
          </Link>

          <button
            className="sidebar-toggle-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>

          <button
            className="sidebar-close-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="sidebar-nav">
          {!collapsed && (
            <div className="sidebar-section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>EXPLORE (PUBLIC)</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6' }}>
                READ-ONLY
              </span>
            </div>
          )}
          {publicNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-item-link ${isActive ? 'nav-item-active' : ''}`}
                title={collapsed ? item.label : undefined}
                end={item.path === '/'}
              >
                <div className="nav-item-icon">
                  <Icon size={18} strokeWidth={2} />
                </div>
                {!collapsed && <span className="nav-item-label">{item.label}</span>}
              </NavLink>
            );
          })}

          {/* Section 2: Management (Protected) */}
          {!collapsed && (
            <div className="sidebar-section-heading" style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>MANAGEMENT</span>
              {isAuthenticated ? (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: isAdmin ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)', color: isAdmin ? '#ef4444' : '#2563eb' }}>
                  {isAdmin ? '🛡️ ADMIN' : '👤 STAFF'}
                </span>
              ) : (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  🔒 AUTH REQ.
                </span>
              )}
            </div>
          )}
          {managementNavItems.map((item) => {
            const Icon = item.icon;
            const isRestrictedForStaff = item.adminOnly && !isAdmin;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-item-link ${isActive ? 'nav-item-active' : ''}`}
                title={collapsed ? `${item.label}${!isAuthenticated ? ' (Login Required)' : isRestrictedForStaff ? ' (Admin Only)' : ''}` : undefined}
                end={item.exact}
              >
                <div className="nav-item-icon" style={{ color: item.adminOnly ? '#ef4444' : undefined }}>
                  <Icon size={18} strokeWidth={2} />
                </div>
                {!collapsed && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', overflow: 'hidden' }}>
                    <span className="nav-item-label" style={{ fontWeight: item.exact ? 700 : undefined }}>
                      {item.label}
                    </span>
                    {item.adminOnly && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', marginLeft: 4 }}>
                        ADMIN
                      </span>
                    )}
                    {!isAuthenticated && !item.adminOnly && (
                      <Lock size={12} style={{ color: 'var(--text-tertiary, #9CA3AF)', opacity: 0.7, marginLeft: 4, flexShrink: 0 }} />
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer with Theme Toggle & User Profile */}
        <div className="sidebar-footer">
          {/* Quick theme & system bar */}
          <div className="sidebar-utility-row">
            <button
              className="utility-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
              {!collapsed && <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
            </button>
            <button
              className="utility-btn"
              onClick={() => setCmdOpen(true)}
              title="Command Palette (Ctrl+K)"
            >
              <Sparkles size={16} />
              {!collapsed && <span>Shortcuts</span>}
            </button>
          </div>

          {/* User Profile Card */}
          {isAuthenticated && user ? (
            <div className="sidebar-user-profile">
              <div className="user-avatar-wrapper">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: isAdmin ? '#EF4444' : '#2563EB',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="user-status-dot online" />
              </div>

              {!collapsed && (
                <div className="user-info">
                  <span className="user-name">{user.fullName}</span>
                  <span className="user-email" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isAdmin ? <ShieldCheck size={11} color="#EF4444" /> : <UserCheck size={11} color="#2563EB" />}
                    {user.roleName}
                  </span>
                </div>
              )}

              {!collapsed && (
                <button
                  type="button"
                  className="user-more-btn"
                  onClick={handleLogout}
                  title="Sign out of your account"
                  style={{ color: '#EF4444' }}
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          ) : (
            !collapsed && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Guest Mode</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Read-Only Browsing</div>
                </div>
                <Link
                  to="/login"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#2563EB',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 8px',
                    borderRadius: 6,
                    background: 'rgba(37, 99, 235, 0.1)',
                  }}
                >
                  <LogIn size={13} /> Login
                </Link>
              </div>
            )
          )}
        </div>
      </aside>

      {/* Main App Canvas */}
      <div className="app-main-wrapper">
        {/* Top Header Bar */}
        <header className="app-topbar">
          <div className="topbar-left">
            <button
              className="menu-hamburger-btn mobile-only"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            {/* Role & Access Mode Indicator */}
            {isAuthenticated ? (
              <div className={`topbar-mode-badge ${isAdmin ? 'admin' : 'staff'}`}>
                {isAdmin ? <ShieldCheck size={13} /> : <UserCheck size={13} />}
                <span>{isAdmin ? 'Admin Mode (Full Write)' : 'Staff Mode (Write Access)'}</span>
              </div>
            ) : (
              <div className="topbar-mode-badge public">
                <Eye size={13} />
                <span>Public Mode (Read-Only)</span>
              </div>
            )}
          </div>

          {/* Center / Right Header Tools */}
          <div className="topbar-right">
            {/* Global Search Input */}
            <div className="header-search-bar" onClick={() => setCmdOpen(true)}>
              <Search size={15} className="search-bar-icon" />
              <input
                type="text"
                placeholder="Search tasks, projects..."
                readOnly
                className="search-bar-input"
              />
              <span className="search-kbd-badge">⌘K</span>
            </div>

            {/* Quick Action: Admin Portal */}
            {isAuthenticated && (
              <Link to="/admin" className="btn-new-project" style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>
                <FolderLock size={15} strokeWidth={2.5} />
                <span>Admin Hub</span>
              </Link>
            )}

            {/* Notification Bell */}
            <button className="topbar-icon-btn notification-btn" title="Notifications">
              <Bell size={17} />
              <span className="notification-indicator" />
            </button>

            {/* User Dropdown / Status */}
            {isAuthenticated && user ? (
              <div style={{ position: 'relative' }}>
                <div
                  className="topbar-user-dropdown"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: isAdmin ? '#EF4444' : '#2563EB',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={14} className="dropdown-arrow" />
                </div>

                {userMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: 220,
                      backgroundColor: 'var(--card-bg, #ffffff)',
                      border: '1px solid var(--border-color, #e5e7eb)',
                      borderRadius: 12,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      zIndex: 100,
                      overflow: 'hidden',
                      padding: 8,
                    }}
                  >
                    <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color, #f3f4f6)', marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</div>
                      <div
                        style={{
                          display: 'inline-block',
                          marginTop: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '1px 6px',
                          borderRadius: 9999,
                          backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          color: isAdmin ? '#EF4444' : '#2563EB',
                        }}
                      >
                        {user.roleName}
                      </div>
                    </div>

                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 13,
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <Shield size={15} /> Admin Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/accounts"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontSize: 13,
                          color: '#EF4444',
                          textDecoration: 'none',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <ShieldCheck size={15} /> User Accounts
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: 13,
                        color: '#EF4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginTop: 4,
                        borderTop: '1px solid var(--border-color, #f3f4f6)',
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Link
                  to="/login"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    padding: '6px 12px',
                    borderRadius: 6,
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    backgroundColor: '#2563EB',
                    color: '#ffffff',
                    textDecoration: 'none',
                    padding: '6px 14px',
                    borderRadius: 6,
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="app-main-content animate-fade-in">
          <div className="main-content-inner">{children}</div>
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
