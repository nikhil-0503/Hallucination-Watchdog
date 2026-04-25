import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  XCircle,
  TrendingUp,
  Scale,
  FlaskConical,
  Globe,
  BrainCircuit,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const { prompts } = useData();
  const navigate = useNavigate();

  // Calculate stats from actual prompts data
  const stats = useMemo(() => {
    const total = prompts.length;
    const blocked = prompts.filter(p => p.action === 'BLOCK').length;
    const warned = prompts.filter(p => p.action === 'WARN').length;
    const allowed = prompts.filter(p => p.action === 'ALLOW').length;
    const avgConfidence = total > 0
      ? Math.round(prompts.reduce((sum, p) => sum + (p.confidence || 0), 0) / total * 100)
      : 0;

    return { total, blocked, warned, allowed, avgConfidence };
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    if (statusFilter === 'all') return prompts.slice(0, 10);
    return prompts.filter(p => p.action === statusFilter).slice(0, 10);
  }, [prompts, statusFilter]);

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
    { label: 'Community Hub', path: '/admin/community', icon: Users, color: '#ec4899' },
  ];

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <motion.div
              className="card h-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
            >
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <Activity size={24} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Total Prompts</h6>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="col-md-3">
            <motion.div
              className="card h-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <XCircle size={24} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Blocked</h6>
                  <h3 className="mb-0">{stats.blocked}</h3>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="col-md-3">
            <motion.div
              className="card h-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ background: 'rgba(245,158,11,0.1)' }}>
                  <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Warnings</h6>
                  <h3 className="mb-0">{stats.warned}</h3>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="col-md-3">
            <motion.div
              className="card h-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card-body d-flex align-items-center">
                <div className="rounded-circle p-3 me-3" style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <TrendingUp size={24} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <h6 className="text-muted mb-1">Avg Confidence</h6>
                  <h3 className="mb-0">{stats.avgConfidence}%</h3>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="row g-3 mb-4">
          {quickLinks.map((link, idx) => (
            <div key={link.path} className="col-md-4 col-lg-2">
              <motion.button
                className="card w-100 text-start border-0"
                onClick={() => navigate(link.path)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ cursor: 'pointer', background: link.color + '15' }}
              >
                <div className="card-body d-flex align-items-center">
                  <link.icon size={20} style={{ color: link.color }} className="me-2" />
                  <span style={{ color: link.color, fontWeight: 600 }}>{link.label}</span>
                </div>
              </motion.button>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent Activity</h5>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="ALLOW">Allowed</option>
              <option value="WARN">Warned</option>
              <option value="BLOCK">Blocked</option>
            </select>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Prompt</th>
                    <th>Action</th>
                    <th>Confidence</th>
                    <th>RAG</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrompts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No activity yet. Start chatting to see results here.
                      </td>
                    </tr>
                  ) : (
                    filteredPrompts.map((prompt) => (
                      <tr key={prompt.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/current/${prompt.id}`)}>
                        <td>#{prompt.id}</td>
                        <td className="text-truncate" style={{ maxWidth: '300px' }}>{prompt.prompt}</td>
                        <td>
                          <span className="badge" style={{ background: getActionColor(prompt.action) }}>
                            {prompt.action}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '6px', width: '60px' }}>
                              <div
                                className="progress-bar"
                                style={{ width: `${(prompt.confidence || 0) * 100}%`, background: getConfidenceColor(prompt.confidence || 0) }}
                              />
                            </div>
                            <small>{Math.round((prompt.confidence || 0) * 100)}%</small>
                          </div>
                        </td>
                        <td>
                          <span className={`badge bg-${prompt.rag_status === 'VERIFIED' ? 'success' : 'warning'}`}>
                            {prompt.rag_status}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(prompt.timestamp).toLocaleTimeString()}
                          </small>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

