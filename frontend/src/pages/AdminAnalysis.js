import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Calendar,
  AlertTriangle,
  Target,
  Database,
  FileCheck,
  Shield
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate, useParams } from 'react-router-dom';
import { toIST } from '../utils/timezone';
import AdminLayout from '../components/AdminLayout';

const AdminAnalysis = () => {
  const [copiedField, setCopiedField] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getPromptById, prompts } = useData();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const loadPrompt = async () => {
      setLoading(true);
      if (id) {
        const data = await getPromptById(parseInt(id));
        setPrompt(data);
      }
      setLoading(false);
    };
    loadPrompt();
  }, [id, getPromptById]);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getConfidenceColor = (confidence) => {
    const pct = Math.round((confidence || 0) * 100);
    if (pct >= 80) return 'var(--success)';
    if (pct >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <div className="spinner" style={{ width: 40, height: 40, marginBottom: 16 }} />
          <p>Loading analysis...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!prompt) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <AlertTriangle size={48} className="empty-state-icon" />
          <h3>No prompt selected</h3>
          <p>Click on a prompt in the Activity Logs to view its analysis</p>
          <motion.button
            className="btn btn-primary"
            onClick={() => navigate('/admin/dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ marginTop: '1rem' }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </motion.button>
        </div>
      </AdminLayout>
    );
  }

  const confidencePercent = Math.round((prompt.confidence || 0) * 100);
  const biasTypes = Array.isArray(prompt.metadata?.bias_types) ? prompt.metadata.bias_types : [];
  const biasDetected = Boolean(prompt.metadata?.bias_detected && biasTypes.length > 0);

  const metrics = [
    {
      title: 'Confidence Level',
      value: `${confidencePercent}%`,
      icon: <Target size={22} />,
      color: getConfidenceColor(prompt.confidence),
      description: 'AI response confidence rating',
      showBar: true,
      barValue: confidencePercent
    },
    {
      title: 'RAG Verification',
      value: prompt.rag_status || 'UNKNOWN',
      icon: <Database size={22} />,
      color: prompt.rag_status === 'VERIFIED' ? 'var(--success)' : 'var(--danger)',
      description: 'Knowledge base verification status',
      showBar: false
    },
    {
      title: 'Contradiction Check',
      value: prompt.contradiction_check || 'UNKNOWN',
      icon: <FileCheck size={22} />,
      color: prompt.contradiction_check === 'PASS' ? 'var(--success)' : 'var(--danger)',
      description: 'Internal consistency verification',
      showBar: false
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <motion.button
              onClick={() => navigate('/admin/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn btn-ghost btn-icon-only"
            >
              <ArrowLeft size={18} />
            </motion.button>
            <div>
              <h1 className="page-title page-title-gradient">Prompt Analysis</h1>
              <p className="page-subtitle">Detailed inspection and verification results</p>
            </div>
          </div>
        </motion.div>

        {/* Meta Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="grid-3" style={{ gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={16} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Timestamp</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>
                  {toIST(prompt.timestamp)}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={16} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Action</div>
                <div style={{ marginTop: 2 }}>
                  <span className={`badge badge-${prompt.action?.toLowerCase()}`}>{prompt.action}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={16} style={{ color: 'var(--text-tertiary)' }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Risk Score</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{prompt.risk_score ?? 'N/A'}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.08 }}
              className="glass-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ color: metric.color, padding: 8, borderRadius: 'var(--radius-md)', background: `${metric.color}15` }}>
                  {metric.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{metric.title}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{metric.description}</p>
                </div>
              </div>
              <motion.div
                style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: metric.showBar ? '1rem' : 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {metric.value}
              </motion.div>
              {metric.showBar && (
                <div className="progress-track">
                  <motion.div
                    className="progress-fill"
                    style={{ background: metric.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.barValue}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {biasDetected && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card"
            style={{ marginBottom: '1.5rem', borderColor: 'rgba(239,68,68,0.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Bias Detected
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {biasTypes.map((biasType) => (
                <span key={biasType} className="badge badge-danger">
                  {biasType}
                </span>
              ))}
            </div>
            {prompt.metadata?.bias_reason && (
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                {prompt.metadata.bias_reason}
              </p>
            )}
          </motion.div>
        )}

        {/* Prompt & Response */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="section-card"
          >
            <div className="section-card-header">
              <h3 className="section-card-title">User Prompt</h3>
              <motion.button
                onClick={() => handleCopy(prompt.prompt, 'prompt')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
              >
                <Copy size={14} />
                {copiedField === 'prompt' ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
            <div className="section-card-body">
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                maxHeight: 300,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {prompt.prompt}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="section-card"
          >
            <div className="section-card-header">
              <h3 className="section-card-title">GPT Answer</h3>
              <motion.button
                onClick={() => handleCopy(prompt.gpt_raw_answer, 'response')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
              >
                <Copy size={14} />
                {copiedField === 'response' ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
            <div className="section-card-body">
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.6,
                maxHeight: 300,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap'
              }}>
                {prompt.gpt_raw_answer}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Explanation */}
        {prompt.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card"
          >
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              WATCHDOG Analysis Explanation
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{prompt.explanation}</p>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalysis;

