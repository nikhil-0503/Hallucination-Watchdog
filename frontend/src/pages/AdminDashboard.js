import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  XCircle,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Scale,
  FlaskConical,
  Globe,
  BrainCircuit,
  BarChart3
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const { prompts } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const stats = useMemo(() => {
    const total = prompts.length;
    const blocked = prompts.filter(p => p.action === 'BLOCK').length;
    const warned = prompts.filter(p => p.action === 'WARN').length;
    const allowed = prompts.filter(p => p.action === 'ALLOW').length;
    const avgConfidence = total > 0
      ? Math.round(prompts.reduce((sum, p) => sum + (p.confidence || 0), 0) / total * 100)
      : 0;
    const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;
    return { total, blocked, warned, allowed, avgConfidence, blockRate };
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    let filtered = statusFilter === 'all' ? prompts : prompts.filter(p => p.action === statusFilter);
    if (sortBy === 'recent') {
      filtered = [...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'confidence-high') {
      filtered = [...filtered].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    } else if (sortBy === 'confidence-low') {
      filtered = [...filtered].sort((a, b) => (a.confidence || 0) - (b.confidence || 0));
    }
    return filtered.slice(0, 10);
  }, [prompts, statusFilter, sortBy]);

  const quickLinks = [
    { label: 'Bias Analysis', path: '/admin/bias-analysis', icon: Scale, color: '#8b5cf6' },
    { label: 'What-If Scenarios', path: '/admin/what-if', icon: FlaskConical, color: '#06b6d4' },
    { label: 'Impact Dashboard', path: '/admin/impact', icon: Globe, color: '#10b981' },
    { label: 'Explainability', path: '/admin/explainability', icon: BrainCircuit, color: '#f59e0b' },
    { label: 'Activity Logs', path: '/admin/logs', icon: Activity, color: '#ec4899' },
  ];

  const statCards = [
    { icon: Activity, label: 'Total Prompts', value: stats.total, trend: '+12%', trendUp: true, color: '#10b981' },
    { icon: XCircle, label: 'Blocked', value: stats.blocked, subtext: `${stats.blockRate}% block rate`, trend: stats.blockRate > 20 ? 'High' : 'Normal', trendUp: stats.blockRate > 20 },
    { icon: AlertTriangle, label: 'Warnings', value: stats.warned, trend: '-5%', trendUp: false, color: '#f59e0b' },
    { icon: TrendingUp, label: 'Avg Confidence', value: `${stats.avgConfidence}%`, trend: '+3%', trendUp: true, color: '#3b82f6' },
  ];

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <div>
            <h1 className="page-title page-title-gradient">Dashboard</h1>
            <p className="page-subtitle">Real-time AI safety monitoring & analytics</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRefreshing(true)}
              className="btn btn-ghost btn-icon-only"
              title="Refresh data"
            >
              <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 0.5s linear' : 'none' }} />
            </motion.button>
            <label className="auto-refresh-toggle">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              <span>Auto-refresh</span>
            </label>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="metrics-grid-4">
          <AnimatePresence>
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ translateY: -4 }}
                  className="metric-card"
                >
                  <div className="metric-card-header">
                    <div className="metric-icon-box metric-icon-blue" style={{ background: `${stat.color || '#3b82f6'}18`, color: stat.color || '#3b82f6' }}>
                      <Icon size={20} />
                    </div>
                    <div className={`metric-trend ${stat.trendUp ? 'up' : 'down'}`}>
                      {stat.trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <div className="metric-label">{stat.label}</div>
                  <div className="metric-value">{stat.value}</div>
                  {stat.subtext && <div className="metric-subtext">{stat.subtext}</div>}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="section-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="section-card-header">
            <h3 className="section-card-title">
              <BarChart3 size={18} />
              Quick Access
            </h3>
          </div>
          <div className="section-card-body">
            <div className="quick-links-grid">
              {quickLinks.map((link, idx) => {
                const Icon = link.icon;
                return (
                  <motion.button
                    key={link.path}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(link.path)}
                    className="quick-link-btn"
                    style={{ borderColor: `${link.color}40` }}
                  >
                    <Icon size={20} style={{ color: link.color }} />
                    <span>{link.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="section-card"
        >
          <div className="section-card-header">
            <h3 className="section-card-title">
              <Activity size={18} />
              Recent Activity
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select className="form-select" style={{ width: 'auto', minWidth: '120px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="ALLOW">Allowed</option>
                <option value="WARN">Warned</option>
                <option value="BLOCK">Blocked</option>
              </select>
              <select className="form-select" style={{ width: 'auto', minWidth: '140px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="recent">Most Recent</option>
                <option value="confidence-high">Highest Confidence</option>
                <option value="confidence-low">Lowest Confidence</option>
              </select>
            </div>
          </div>
          <div className="data-table-wrapper">
            {filteredPrompts.length === 0 ? (
              <div className="empty-state">
                <Zap size={40} className="empty-state-icon" />
                <h3>No activity yet</h3>
                <p>Start a chat to see real-time AI safety analysis here</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Prompt</th>
                    <th>Status</th>
                    <th>Confidence</th>
                    <th>Time</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredPrompts.map((prompt, idx) => (
                      <motion.tr
                        key={prompt.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => navigate(`/admin/current/${prompt.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{prompt.id}</td>
                        <td className="truncate" style={{ maxWidth: 280 }} title={prompt.prompt}>
                          {prompt.prompt?.substring(0, 55)}...
                        </td>
                        <td>
                          <span className={`badge badge-${prompt.action.toLowerCase()}`}>{prompt.action}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="confidence-track">
                              <motion.div
                                className={`confidence-fill ${
                                  (prompt.confidence || 0) >= 0.8 ? 'high' :
                                  (prompt.confidence || 0) >= 0.5 ? 'medium' : 'low'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(prompt.confidence || 0) * 100}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', minWidth: 32 }}>
                              {Math.round((prompt.confidence || 0) * 100)}%
                            </span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(prompt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ color: 'var(--brand-blue-light)', opacity: 0, transition: 'opacity 0.2s' }} className="row-hover-show">
                          <ArrowUpRight size={16} />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

