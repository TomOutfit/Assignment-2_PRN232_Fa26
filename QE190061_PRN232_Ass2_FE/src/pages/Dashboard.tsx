import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  CheckCircle2,
  FolderKanban,
  Building2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Calendar,
  Shield,
  ShieldCheck,
  UserCheck,
  LogIn,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskApi, projectApi, departmentApi } from '../services/api';
import type { Task, Project, Department } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { TaskStatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import './Dashboard.css';

export default function Dashboard() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksData, projectsData, deptsData] = await Promise.all([
          taskApi.getAll(),
          projectApi.getAll(),
          departmentApi.getAll(),
        ]);
        setTasks(tasksData);
        setProjects(projectsData);
        setDepartments(deptsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute Metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 2).length;
  const inProgressTasks = tasks.filter(t => t.status === 1).length;
  const todoTasks = tasks.filter(t => t.status === 0).length;
  const cancelledTasks = tasks.filter(t => t.status === 3).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Overdue / Urgent Tasks
  const now = new Date();
  const upcomingTasks = tasks
    .filter(t => t.status !== 2 && t.status !== 3)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);

  const overdueCount = tasks.filter(t => {
    if (!t.dueDate || t.status === 2 || t.status === 3) return false;
    return new Date(t.dueDate) < now;
  }).length;

  // Priority counts
  const lowPriority = tasks.filter(t => t.priority === 0).length;
  const medPriority = tasks.filter(t => t.priority === 1).length;
  const highPriority = tasks.filter(t => t.priority === 2).length;
  const criticalPriority = tasks.filter(t => t.priority === 3).length;

  // Donut chart calculations
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const doneOffset = circumference - (completedTasks / (totalTasks || 1)) * circumference;
  const inProgressOffset = circumference - (inProgressTasks / (totalTasks || 1)) * circumference;
  const todoOffset = circumference - (todoTasks / (totalTasks || 1)) * circumference;

  return (
    <div className="dashboard-page">
      {/* Unified Hero Header Banner */}
      <div
        className="glass-card ass2-hero-banner"
        style={{
          padding: '24px 28px',
          borderRadius: 16,
          background: isAuthenticated
            ? isAdmin
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(249, 115, 22, 0.04))'
              : 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.04))'
            : 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.05))',
          border: `1px solid ${
            isAuthenticated
              ? isAdmin
                ? 'rgba(239, 68, 68, 0.22)'
                : 'rgba(37, 99, 235, 0.22)'
              : 'rgba(59, 130, 246, 0.22)'
          }`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 9999,
              background: isAuthenticated
                ? isAdmin
                  ? 'rgba(239, 68, 68, 0.12)'
                  : 'rgba(37, 99, 235, 0.12)'
                : 'rgba(59, 130, 246, 0.12)',
              color: isAuthenticated
                ? isAdmin
                  ? '#ef4444'
                  : '#2563eb'
                : '#2563eb',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {isAuthenticated ? (
              isAdmin ? <ShieldCheck size={14} /> : <UserCheck size={14} />
            ) : (
              <Sparkles size={14} />
            )}
            {isAuthenticated ? `Authenticated as ${user?.roleName}` : 'PRN232 Assignment 2 • Read-Only Mode'}
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
            {isAuthenticated ? `Welcome back, ${user?.fullName}!` : 'Operational Overview & TaskHub'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>
            {isAuthenticated
              ? isAdmin
                ? 'You have full administrative control to manage departments, projects, tasks, and system accounts.'
                : 'You have write permissions to create, update, and manage your assigned projects, tasks, and departments.'
              : 'Public visitors can freely explore live metrics across departments, projects, and work items in Read-Only Mode. Sign in with Staff or Admin account to create or edit items.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <>
              <Link to="/admin" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Shield size={16} /> Enter Admin Hub
              </Link>
              <Link to="/admin/tasks" className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <CheckSquare size={16} /> Task Manager
              </Link>
            </>
          ) : (
            <>
              <Link to="/tasks" className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <CheckSquare size={16} /> Browse Tasks
              </Link>
              <Link to="/projects" className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FolderKanban size={16} /> Explore Projects
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
                <LogIn size={16} /> Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Departments"
          value={loading ? '...' : departments.length}
          subtitle="Operational units"
          icon={<Building2 size={22} />}
          colorScheme="cyan"
          trend={{ value: `${departments.filter(d => d.isActive).length} Active`, isPositive: true }}
        />
        <StatCard
          title="Active Projects"
          value={loading ? '...' : projects.length}
          subtitle="Strategic initiatives"
          icon={<FolderKanban size={22} />}
          colorScheme="purple"
          trend={{ value: `${projects.filter(p => p.status === 1).length} In Progress`, isPositive: true }}
        />
        <StatCard
          title="Total Tasks"
          value={loading ? '...' : totalTasks}
          subtitle={`${inProgressTasks} in progress`}
          icon={<CheckSquare size={22} />}
          colorScheme="primary"
          trend={{ value: `${completionRate}% Done`, isPositive: completionRate >= 50 }}
        />
        <StatCard
          title="Attention Needed"
          value={loading ? '...' : overdueCount}
          subtitle="Tasks past due date"
          icon={<AlertCircle size={22} />}
          colorScheme={overdueCount > 0 ? 'rose' : 'emerald'}
          trend={{ value: overdueCount > 0 ? `${overdueCount} Overdue` : 'All On Track', isPositive: overdueCount === 0 }}
        />
      </div>

      {/* Active Projects Cards Showcase (Requirement: list of active projects as cards) */}
      <div className="dashboard-projects-section">
        <div className="section-header-flex">
          <div>
            <h3 className="section-title">Active Projects</h3>
            <p className="section-subtitle">Core initiatives, deliverables, and completion status</p>
          </div>
          <Link to="/projects" className="view-all-link">
            <span>Explore all projects</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-project-cards-grid">
            <Skeleton height="180px" borderRadius="var(--radius-xl)" />
            <Skeleton height="180px" borderRadius="var(--radius-xl)" />
            <Skeleton height="180px" borderRadius="var(--radius-xl)" />
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card empty-mini-state" style={{ padding: '32px' }}>
            <FolderKanban size={32} color="var(--primary)" />
            <span style={{ fontSize: '0.9375rem', fontWeight: 600 }}>No active projects found.</span>
          </div>
        ) : (
          <div className="dashboard-project-cards-grid">
            {projects.slice(0, 6).map(proj => {
              const projTasks = tasks.filter(t => t.projectId === proj.projectId);
              const projTotalTasks = projTasks.length;
              const projDoneTasks = projTasks.filter(t => t.status === 2).length;
              const projPct = projTotalTasks > 0 ? Math.round((projDoneTasks / projTotalTasks) * 100) : 0;

              const statusLabels: Record<number, string> = {
                0: 'Not Started',
                1: 'In Progress',
                2: 'Completed',
                3: 'On Hold',
              };

              return (
                <Link
                  key={proj.projectId}
                  to={`/projects/${proj.projectId}`}
                  className="glass-card project-showcase-card"
                >
                  <div className="project-card-header">
                    <div className="project-card-icon-title">
                      <div className="project-icon-badge">
                        <FolderKanban size={18} />
                      </div>
                      <div>
                        <h4 className="project-card-name">{proj.projectName}</h4>
                        <span className="project-card-dept">
                          <Building2 size={12} />
                          {proj.departmentName}
                        </span>
                      </div>
                    </div>
                    <span className={`status-badge-custom status-badge-${proj.status}`}>
                      {proj.statusName || statusLabels[proj.status] || 'Active'}
                    </span>
                  </div>

                  <p className="project-card-desc">
                    {proj.description || 'No project description recorded.'}
                  </p>

                  <div className="project-card-progress-section">
                    <div className="progress-labels-row">
                      <span>Task Progress ({projDoneTasks}/{projTotalTasks})</span>
                      <span className="progress-pct-val">{projPct}%</span>
                    </div>
                    <div className="progress-track" style={{ height: '6px' }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${projPct}%`,
                          background: projPct === 100 ? 'var(--accent-emerald)' : 'linear-gradient(90deg, var(--primary) 0%, var(--accent-purple) 100%)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="project-card-footer">
                    <div className="project-card-dates">
                      <Calendar size={12} />
                      <span>{new Date(proj.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="project-card-link-action">
                      <span>View Details</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Analytics & Breakdown Section */}
      <div className="dashboard-grid-2">
        {/* Status Breakdown Donut Chart */}
        <div className="glass-card chart-card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Task Distribution</h3>
              <p className="section-subtitle">Real-time status breakdown</p>
            </div>
            <div className="badge-pill">{totalTasks} Total</div>
          </div>

          {loading ? (
            <div style={{ padding: '30px', display: 'flex', justifyContent: 'center' }}>
              <Skeleton width="180px" height="180px" borderRadius="50%" />
            </div>
          ) : totalTasks === 0 ? (
            <div className="chart-empty-state">No tasks created yet.</div>
          ) : (
            <div className="donut-chart-container">
              <div className="svg-donut-wrapper">
                <svg viewBox="0 0 160 160" className="donut-svg">
                  {/* Background Track */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="donut-track"
                  />
                  {/* To Do (Slate) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#64748b"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={todoOffset}
                    className="donut-segment"
                  />
                  {/* In Progress (Blue) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#3b82f6"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={inProgressOffset}
                    className="donut-segment"
                  />
                  {/* Done (Emerald) */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="#10b981"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={doneOffset}
                    className="donut-segment"
                  />
                </svg>
                <div className="donut-center-info">
                  <span className="donut-center-value">{completionRate}%</span>
                  <span className="donut-center-label">Completed</span>
                </div>
              </div>

              <div className="donut-legend">
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: 'var(--accent-emerald)' }} />
                  <span className="legend-name">Done</span>
                  <span className="legend-count">{completedTasks}</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: 'var(--accent-blue)' }} />
                  <span className="legend-name">In Progress</span>
                  <span className="legend-count">{inProgressTasks}</span>
                </div>
                <div className="legend-row">
                  <span className="legend-dot" style={{ background: 'var(--status-todo)' }} />
                  <span className="legend-name">To Do</span>
                  <span className="legend-count">{todoTasks}</span>
                </div>
                {cancelledTasks > 0 && (
                  <div className="legend-row">
                    <span className="legend-dot" style={{ background: 'var(--accent-rose)' }} />
                    <span className="legend-name">Cancelled</span>
                    <span className="legend-count">{cancelledTasks}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Priority Breakdown Progress */}
        <div className="glass-card chart-card">
          <div className="card-header-flex">
            <div>
              <h3 className="section-title">Priority Breakdown</h3>
              <p className="section-subtitle">Workload distribution by urgency</p>
            </div>
            <TrendingUp size={18} className="header-icon-muted" />
          </div>

          <div className="priority-bars-container">
            <div className="priority-item">
              <div className="priority-info">
                <span className="priority-name">Critical Priority</span>
                <span className="priority-val">{criticalPriority} tasks</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${totalTasks ? (criticalPriority / totalTasks) * 100 : 0}%`,
                    background: 'var(--priority-critical)',
                  }}
                />
              </div>
            </div>

            <div className="priority-item">
              <div className="priority-info">
                <span className="priority-name">High Priority</span>
                <span className="priority-val">{highPriority} tasks</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${totalTasks ? (highPriority / totalTasks) * 100 : 0}%`,
                    background: 'var(--priority-high)',
                  }}
                />
              </div>
            </div>

            <div className="priority-item">
              <div className="priority-info">
                <span className="priority-name">Medium Priority</span>
                <span className="priority-val">{medPriority} tasks</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${totalTasks ? (medPriority / totalTasks) * 100 : 0}%`,
                    background: 'var(--priority-medium)',
                  }}
                />
              </div>
            </div>

            <div className="priority-item">
              <div className="priority-info">
                <span className="priority-name">Low Priority</span>
                <span className="priority-val">{lowPriority} tasks</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{
                    width: `${totalTasks ? (lowPriority / totalTasks) * 100 : 0}%`,
                    background: 'var(--priority-low)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Deadlines Widget */}
      <div className="glass-card recent-card">
        <div className="card-header-flex">
          <div>
            <h3 className="section-title">Upcoming Deadlines</h3>
            <p className="section-subtitle">Prioritized pending work items requiring action</p>
          </div>
          <Link to="/tasks" className="view-all-link">
            <span>View all tasks</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="task-mini-list">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
              <Skeleton height="36px" />
              <Skeleton height="36px" />
              <Skeleton height="36px" />
            </div>
          ) : upcomingTasks.length === 0 ? (
            <div className="empty-mini-state">
              <CheckCircle2 size={24} color="var(--accent-emerald)" />
              <span>No pending upcoming tasks! All clear.</span>
            </div>
          ) : (
            upcomingTasks.map(task => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < now;
              return (
                <div key={task.taskId} className="task-mini-item">
                  <div className="task-mini-left">
                    <Link to={`/tasks/${task.taskId}`} className="task-mini-title-link">
                      {task.title}
                    </Link>
                    <div className="task-mini-meta">
                      {task.projectName && <span className="meta-project">{task.projectName}</span>}
                      {task.dueDate && (
                        <span className={`meta-date ${isOverdue ? 'date-overdue' : ''}`}>
                          <Calendar size={12} />
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue && ' (Overdue)'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="task-mini-right">
                    <PriorityBadge priority={task.priority} priorityName={task.priorityName} />
                    <TaskStatusBadge status={task.status} statusName={task.statusName} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
