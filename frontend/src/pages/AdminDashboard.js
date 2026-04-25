import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  XCircle,
  TrendingUp,
  Scale,
  FlaskConical,
  Globe,
  BrainCircuit,
  Users,
  AlertTriangle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin-premium.css';

const AdminDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const { prompts } = useData();
  const navigate = useNavigate();

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setIsRefreshing(true);
      setTimeout(() => setIsRefreshing(false), 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Calculate stats with trends
  const stats = useMemo(() => {
    const total = prompts.length;
    const blocked = prompts.filter(p => p.action === 'BLOCK').length;
    const warned = prompts.filter(p => p.action === 'WARN').length;
    const allowed = prompts.filter(p => p.action === 'ALLOW').length;
    const avgConfidence = total > 0
      ? Math.round(prompts.reduce((sum, p) => sum + (p.confidence || 0), 0) / total * 100)
      : 0;

    // Calculate trends (simplified)
    const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;
    const allowRate = total > 0 ? Math.round((allowed / total) * 100) : 0;

    return { total, blocked, warned, allowed, avgConfidence, blockRate, allowRate };
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    let filtered = statusFilter === 'all' ? prompts : prompts.filter(p => p.action === statusFilter);
    
    if (sortBy === 'recent') {
      filtered = filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === 'confidence-high') {
      filtered = filtered.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    } else if (sortBy === 'confidence-low') {
      filtered = filtered.sort((a, b) => (a.confidence || 0) - (b.confidence || 0));
    }
    
    return filtered.slice(0, 10);
  }, [prompts, statusFilter, sortBy]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10b981';
    if (confidence >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'ALLOW': return '#10b981';
      case 'WARN': return '#f59e0b';
      case 'BLOCK': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const quickLinks = [
    { label: 'Bias Analysis', path: '/admin/bias-analysis', icon: Scale, color: '#8b5cf6' },
    { label: 'What-If Scenarios', path: '/admin/what-if', icon: FlaskConical, color: '#06b6d4' },
    { label: 'Impact Dashboard', path: '/admin/impact', icon: Globe, color: '#10b981' },
    { label: 'Explainability', path: '/admin/explainability', icon: BrainCircuit, color: '#f59e0b' },
    { label: 'Activity Logs', path: '/admin/logs', icon: Activity, color: '#ec4899' },
  ];

  const statCards = [
    {
      icon: Activity,
      label: 'Total Prompts',
      value: stats.total,
      trend: '+12%',
      trendUp: true,
      color: '#10b981',
      bgColor: 'rgba(16,185,129,0.1)'
    },
    {
      icon: XCircle,
      label: 'Blocked',
      value: stats.blocked,
      subtext: `${stats.blockRate}% block rate`,
      trend: stats.blockRate > 20 ? 'High' : 'Normal',
      trendUp: false,
      color: '#ef4444',
      bgColor: 'rgba(239,68,68,0.1)'
    },
    {
      icon: AlertTriangle,
      label: 'Warnings',
      value: stats.warned,
      trend: '-5%',
      trendUp: false,
      color: '#f59e0b',
      bgColor: 'rgba(245,158,11,0.1)'
    },
    {
      icon: TrendingUp,
      label: 'Avg Confidence',
      value: `${stats.avgConfidence}%`,
      trend: '+3%',
      trendUp: true,
      color: '#3b82f6',
      bgColor: 'rgba(59,130,246,0.1)'
    }
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard-premium">
        {/* Header with Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-header-premium"
        >
          <div>
            <h2 className="dashboard-title">Dashboard</h2>
            <p className="dashboard-subtitle">Real-time AI safety monitoring & analytics</p>
          </div>
          <div className="dashboard-controls">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsRefreshing(true)}
              className="btn-refresh"
              title="Refresh data"
            >
              <RefreshCw size={18} style={{ animation: isRefreshing ? 'spin 0.5s linear' : 'none' }} />
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
          className="stats-grid-premium"
        >
          <AnimatePresence>
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ translateY: -4 }}
                  className="stat-card-premium"
                >
                  <div className="stat-card-content">
                    <div className="stat-card-header">
                      <div className="stat-icon" style={{ background: stat.bgColor }}>
                        <Icon size={20} style={{ color: stat.color }} />
                      </div>
                      <div className="stat-trend" style={{ color: stat.trendUp ? '#10b981' : '#f59e0b' }}>
                        {stat.trendUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        <span>{stat.trend}</span>
                      </div>
                    </div>
                    <div className="stat-card-body">
                      <div className="stat-label">{stat.label}</div>
                      <div className="stat-value">{stat.value}</div>
                      {stat.subtext && <div className="stat-subtext">{stat.subtext}</div>}
                    </div>
                  </div>
                  <div className="stat-card-gradient" style={{ background: `linear-gradient(135deg, ${stat.bgColor}, transparent)` }}></div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="quick-links-section"
        >
          <h3>Quick Access</h3>
          <div className="quick-links-grid">
            {quickLinks.map((link, idx) => {
              const Icon = link.icon;
              return (
                <motion.button
                  key={link.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(link.path)}
                  className="quick-link-btn"
                >
                  <Icon size={20} style={{ color: link.color }} />
                  <span>{link.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="activity-section"
        >
          <div className="activity-header">
            <h3>Recent Activity</h3>
            <div className="activity-controls">
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="ALLOW">Allowed</option>
                <option value="WARN">Warned</option>
                <option value="BLOCK">Blocked</option>
              </select>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="confidence-high">Highest Confidence</option>
                <option value="confidence-low">Lowest Confidence</option>
              </select>
            </div>
          </div>

          <div className="activity-table">
            {filteredPrompts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="empty-table-state"
              >
                <Zap size={40} />
                <h4>No activity yet</h4>
                <p>Start a chat to see real-time AI safety analysis here</p>
              </motion.div>
            ) : (
              <table>
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
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                        onClick={() => navigate(`/admin/current/${prompt.id}`)}
                        className="activity-table-row"
                      >
                        <td className="activity-id">#{prompt.id}</td>
                        <td className="activity-prompt" title={prompt.prompt}>
                          {prompt.prompt?.substring(0, 60)}...
                        </td>
                        <td>
                          <span className={`status-badge status-${prompt.action.toLowerCase()}`}>
                            {prompt.action}
                          </span>
                        </td>
                        <td>
                          <div className="confidence-cell">
                            <div className="confidence-bar-inline">
                              <motion.div
                                className={`confidence-fill-inline confidence-${
                                  (prompt.confidence || 0) >= 0.8 ? 'high' :
                                  (prompt.confidence || 0) >= 0.5 ? 'medium' :
                                  'low'
                                }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(prompt.confidence || 0) * 100}%` }}
                                transition={{ duration: 0.6 }}
                              ></motion.div>
                            </div>
                            <span className="confidence-text">{Math.round((prompt.confidence || 0) * 100)}%</span>
                          </div>
                        </td>
                        <td className="activity-time">
                          {new Date(prompt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="activity-action">
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

