import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  ArrowLeft, 
  LogOut, 
  User, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  Download,
  Clock,
  Calendar,
  TrendingUp,
  Database,
  FileCheck,
  Activity,
  Zap,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate, useParams } from 'react-router-dom';

const AdminAnalysis = () => {
  const [copiedField, setCopiedField] = useState(null);
  const { user, logout } = useAuth();
  const { prompts } = useData();
  const navigate = useNavigate();
  const { promptId } = useParams();

  // Find the specific prompt
  const prompt = prompts.find(p => p.id === promptId);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!prompt) {
    return (
      <div className="admin-container">
        <div className="empty-state">
          <AlertTriangle size={48} />
          <h3>Prompt not found</h3>
          <p>The requested prompt analysis could not be loaded</p>
          <motion.button
            className="back-button"
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </motion.button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Safe':
        return <CheckCircle className="status-safe" />;
      case 'Warning':
        return <AlertTriangle className="status-warning" />;
      case 'Blocked':
        return <XCircle className="status-blocked" />;
      default:
        return <Activity />;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'var(--status-safe)';
    if (confidence >= 50) return 'var(--status-warning)';
    return 'var(--status-blocked)';
  };

  const getRagStatusColor = (status) => {
    switch (status) {
      case 'Yes': return 'var(--status-safe)';
      case 'Partial': return 'var(--status-warning)';
      case 'No': return 'var(--status-blocked)';
      default: return 'var(--text-tertiary)';
    }
  };

  const metrics = [
    {
      title: 'Confidence Level',
      value: `${prompt.confidence}%`,
      icon: <Target size={24} />,
      color: getConfidenceColor(prompt.confidence),
      description: 'AI response confidence rating',
      details: `Based on language model certainty and response coherence. Score: ${prompt.confidence}/100`,
      showBar: true,
      barValue: prompt.confidence
    },
    {
      title: 'RAG Verification',
      value: prompt.ragStatus,
      icon: <Database size={24} />,
      color: getRagStatusColor(prompt.ragStatus),
      description: 'Knowledge base verification status',
      details: prompt.ragStatus === 'Yes' 
        ? 'Response verified against knowledge base'
        : prompt.ragStatus === 'Partial'
        ? 'Partially verified against knowledge base'
        : 'No verification found in knowledge base',
      showBar: false
    },
    {
      title: 'Contradiction Check',
      value: prompt.contradictionCheck,
      icon: <FileCheck size={24} />,
      color: prompt.contradictionCheck === 'Pass' ? 'var(--status-safe)' : 'var(--status-blocked)',
      description: 'Internal consistency verification',
      details: prompt.contradictionCheck === 'Pass'
        ? 'No contradictions detected in response'
        : 'Contradictions found in response logic',
      showBar: false
    }
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-left">
          <motion.button
            className="back-button"
            onClick={handleBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={16} />
          </motion.button>
          <Shield className="logo-icon-small" />
          <div>
            <h1>Prompt Analysis</h1>
            <p>Deep inspection and verification results</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <User size={16} />
            <span>{user?.name || user?.email}</span>
            <span className="admin-badge">Administrator</span>
          </div>
          <motion.button
            className="logout-button"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={16} />
            Logout
          </motion.button>
        </div>
      </header>

      <div className="analysis-container">
        <div className="analysis-header">
          <div className="prompt-meta">
            <div className="meta-item">
              <Calendar size={16} />
              <span>{prompt.timestamp}</span>
            </div>
            <div className="meta-item">
              <User size={16} />
              <span>{prompt.user}</span>
            </div>
            <div className="meta-item">
              <Clock size={16} />
              <span>{prompt.processingTime.toFixed(1)}s processing</span>
            </div>
            <div className="meta-item">
              {getStatusIcon(prompt.status)}
              <span style={{ color: prompt.status === 'Safe' ? 'var(--status-safe)' : 
                           prompt.status === 'Warning' ? 'var(--status-warning)' : 
                           'var(--status-blocked)' }}>
                {prompt.status}
              </span>
            </div>
          </div>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              className="analysis-metric"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0.0, 0.2, 1] }}
            >
              <div className="metric-header">
                <div className="metric-icon" style={{ color: metric.color }}>
                  {metric.icon}
                </div>
                <div className="metric-info">
                  <h3>{metric.title}</h3>
                  <p>{metric.description}</p>
                </div>
              </div>
              
              <motion.div 
                className="metric-value"
                style={{ color: metric.color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {metric.value}
              </motion.div>

              {metric.showBar && (
                <div className="metric-bar">
                  <motion.div 
                    className="metric-bar-fill"
                    style={{ backgroundColor: metric.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.barValue}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: [0.4, 0.0, 0.2, 1] }}
                  />
                </div>
              )}
              
              <div className="metric-details">
                {metric.details}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="content-grid">
          <motion.div
            className="content-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <div className="section-header">
              <h3>User Prompt</h3>
              <div className="section-actions">
                <motion.button
                  className="copy-button"
                  onClick={() => handleCopy(prompt.prompt, 'prompt')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ color: copiedField === 'prompt' ? 'var(--status-safe)' : 'var(--text-secondary)' }}
                >
                  <Copy size={16} />
                  {copiedField === 'prompt' ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            </div>
            <div className="content-box">
              <div className="content-text">
                {prompt.prompt}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="content-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <div className="section-header">
              <h3>GPT Raw Answer</h3>
              <div className="section-actions">
                <motion.button
                  className="copy-button"
                  onClick={() => handleCopy(prompt.response, 'response')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ color: copiedField === 'response' ? 'var(--status-safe)' : 'var(--text-secondary)' }}
                >
                  <Copy size={16} />
                  {copiedField === 'response' ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            </div>
            <div className="content-box">
              <div className="content-text">
                {prompt.response}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="analysis-footer"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="footer-actions">
            <motion.button
              className="action-button secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={16} />
              Export Analysis
            </motion.button>
            
            <motion.button
              className="action-button secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Zap size={16} />
              Re-analyze
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalysis;