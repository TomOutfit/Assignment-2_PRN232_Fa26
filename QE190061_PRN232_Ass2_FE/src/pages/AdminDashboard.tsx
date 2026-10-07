import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { departmentApi, projectApi, taskApi, tagApi, accountApi } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import {
  Building2,
  FolderGit2,
  CheckSquare,
  Tags,
  Users,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Activity,
  PlusCircle,
  ChevronRight,
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();

  const [deptCount, setDeptCount] = useState<number>(0);
  const [projCount, setProjCount] = useState<number>(0);
  const [taskCount, setTaskCount] = useState<number>(0);
  const [tagCount, setTagCount] = useState<number>(0);
  const [accountCount, setAccountCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [depts, projs, tasks, tags] = await Promise.all([
          departmentApi.getAll(),
          projectApi.getAll(),
          taskApi.getAll(),
          tagApi.getAll(),
        ]);
        setDeptCount(depts.length);
        setProjCount(projs.length);
        setTaskCount(tasks.length);
        setTagCount(tags.length);

        if (isAdmin) {
          try {
            const accs = await accountApi.getAll();
            setAccountCount(accs.length);
          } catch {
            // Staff or error
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [isAdmin]);

  return (
    <div className="admin-dashboard">
      {/* Hero Welcome Banner */}
      <div className="admin-hero">
        <div className="admin-hero-content">
          <h1>Admin Control Hub</h1>
          <p>
            Welcome, <strong>{user?.fullName}</strong>. Manage your enterprise departments, projects, tasks, and system accounts with full administrative control.
          </p>
        </div>

        <div className="admin-user-pill">
          <div className="admin-user-avatar">
            {user?.fullName.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="admin-user-meta">
            <span className="admin-user-name">{user?.fullName}</span>
            <span className={`admin-role-badge ${isAdmin ? 'admin' : 'staff'}`}>
              {isAdmin ? (
                <>
                  <ShieldCheck size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                  Admin
                </>
              ) : (
                <>
                  <UserCheck size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                  Staff
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div>
        <div className="admin-section-title">
          <Activity size={18} color="#2563EB" /> Real-time System Metrics
        </div>

        <div className="admin-kpi-grid">
          <Link to="/admin/departments" className="admin-kpi-card">
            <div className="admin-kpi-top">
              <span className="admin-kpi-label">Total Departments</span>
              <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <Building2 size={22} />
              </div>
            </div>
            <div className="admin-kpi-value">{loading ? <Skeleton width="44px" height="28px" borderRadius="6px" /> : deptCount}</div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Active enterprise units</span>
          </Link>

          <Link to="/admin/projects" className="admin-kpi-card">
            <div className="admin-kpi-top">
              <span className="admin-kpi-label">Total Projects</span>
              <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <FolderGit2 size={22} />
              </div>
            </div>
            <div className="admin-kpi-value">{loading ? <Skeleton width="44px" height="28px" borderRadius="6px" /> : projCount}</div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Across all departments</span>
          </Link>

          <Link to="/admin/tasks" className="admin-kpi-card">
            <div className="admin-kpi-top">
              <span className="admin-kpi-label">Total Tasks</span>
              <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <CheckSquare size={22} />
              </div>
            </div>
            <div className="admin-kpi-value">{loading ? <Skeleton width="44px" height="28px" borderRadius="6px" /> : taskCount}</div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Tracked work items</span>
          </Link>

          <Link to="/admin/tags" className="admin-kpi-card">
            <div className="admin-kpi-top">
              <span className="admin-kpi-label">Total Tags</span>
              <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <Tags size={22} />
              </div>
            </div>
            <div className="admin-kpi-value">{loading ? <Skeleton width="44px" height="28px" borderRadius="6px" /> : tagCount}</div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Classification taxonomy</span>
          </Link>

          {isAdmin && (
            <Link to="/admin/accounts" className="admin-kpi-card">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">System Accounts</span>
                <div className="admin-kpi-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                  <Users size={22} />
                </div>
              </div>
              <div className="admin-kpi-value">{loading ? <Skeleton width="44px" height="28px" borderRadius="6px" /> : accountCount}</div>
              <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Admin Only Access</span>
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Portals */}
      <div>
        <div className="admin-section-title">
          <PlusCircle size={18} color="#2563EB" /> Management Modules
        </div>

        <div className="admin-nav-grid">
          <Link to="/admin/departments" className="admin-portal-card">
            <div className="admin-portal-header">
              <div className="admin-portal-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                <Building2 size={20} />
              </div>
              <div className="admin-portal-title">Department Management</div>
            </div>
            <div className="admin-portal-desc">
              Create, edit, and safely delete organizational units. Enforces linked project validation.
            </div>
            <div className="admin-portal-action">
              Manage Departments <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/admin/projects" className="admin-portal-card">
            <div className="admin-portal-header">
              <div className="admin-portal-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <FolderGit2 size={20} />
              </div>
              <div className="admin-portal-title">Project Management</div>
            </div>
            <div className="admin-portal-desc">
              Plan and oversee initiatives with status tracking, date scheduling, and department assignment.
            </div>
            <div className="admin-portal-action">
              Manage Projects <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/admin/tasks" className="admin-portal-card">
            <div className="admin-portal-header">
              <div className="admin-portal-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                <CheckSquare size={20} />
              </div>
              <div className="admin-portal-title">Task Management</div>
            </div>
            <div className="admin-portal-desc">
              Create, prioritize, assign multi-tags, and perform soft-deletions on project work tickets.
            </div>
            <div className="admin-portal-action">
              Manage Tasks <ArrowRight size={14} />
            </div>
          </Link>

          <Link to="/admin/tags" className="admin-portal-card">
            <div className="admin-portal-header">
              <div className="admin-portal-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Tags size={20} />
              </div>
              <div className="admin-portal-title">Tag Taxonomy</div>
            </div>
            <div className="admin-portal-desc">
              Maintain color-coded categorical labels. Deletion is automatically protected against active usage.
            </div>
            <div className="admin-portal-action">
              Manage Tags <ArrowRight size={14} />
            </div>
          </Link>

          {isAdmin && (
            <Link to="/admin/accounts" className="admin-portal-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <div className="admin-portal-header">
                <div className="admin-portal-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
                  <Users size={20} />
                </div>
                <div>
                  <div className="admin-portal-title">User Accounts</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                    Admin Restricted
                  </span>
                </div>
              </div>
              <div className="admin-portal-desc">
                View all registered accounts, elevate or downgrade roles (Staff/Admin), and delete accounts (rejects if user has created tasks).
              </div>
              <div className="admin-portal-action" style={{ color: '#ef4444' }}>
                Manage Accounts <ChevronRight size={14} />
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
