import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, AlertCircle, CheckCircle, ArrowUpRight } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getLatestExplainability } from '../services/api';

const ExplainabilityDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const d = await getLatestExplainability();
        if (mounted) setData(d);
      } catch (e) { console.error(e); }
      finally { if (mounted) setLoading(false); }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const getLevelColor = (level) => {
    switch(level) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'danger';
      case 'CRITICAL': return 'danger';
      default: return 'neutral';
    }
  };

  const getScoreColor = (score) => {
    if (score < 25) return 'var(--success)';
    if (score < 50) return 'var(--warning)';
    if (score < 75) return 'var(--danger)';
    return '#dc2626';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ marginTop: 12 }}>Loading explainability data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <AlertCircle size={48} className="empty-state-icon" />
          <h3>No data available</h3>
          <p>Process some prompts first to see explainability analysis.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title page-title-gradient"><BrainCircuit size={28} style={{ verticalAlign: 'middle', marginRight: 10 }} />Explainable AI</h1>
            <p className="page-subtitle">Understand why decisions were flagged</p>
          </div>
        </div>

        <div className="metrics-grid-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <motion.div className="metric-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="metric-label">Bias Score</div>
            <div className="metric-value" style={{ color: getScoreColor(data.score) }}>{data.score}</div>
            <div className="metric-subtext">{data.level} RISK</div>
          </motion.div>
          <motion.div className="metric-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="metric-label">Confidence</div>
            <div className="metric-value">{Math.round((data.confidence || 0) * 100)}%</div>
            <div className="metric-subtext">Analysis confidence</div>
          </motion.div>
          <motion.div className="metric-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="metric-label">Action Taken</div>
            <div className="metric-value"><span className={`badge badge-${getLevelColor(data.level)}`}>{data.action}</span></div>
          </motion.div>
          <motion.div className="metric-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="metric-label">Decision ID</div>
            <div className="metric-value font-mono" style={{ fontSize: '1.25rem' }}>#{data.decision_id}</div>
          </motion.div>
        </div>

        <motion.div className="section-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div className="section-card-header">
            <h3 className="section-card-title"><ArrowUpRight size={18} /> Factor Contributions</h3>
          </div>
          <div className="section-card-body">
            <div className="grid-2">
              {data.factors.map((factor, idx) => (
                <motion.div
                  key={idx}
                  className="glass-card"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>{factor.name}</h4>
                    <span className="badge badge-info">${(factor.contribution * 100).toFixed(0)}%</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{factor.explanation}</p>
                  <div className="progress-track">
                    <motion.div
                      className="progress-fill purple"
                      initial={{ width: 0 }}
                      animate={{ width: `${factor.contribution * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + idx * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="glass-card" style={{ borderLeft: `4px solid ${getScoreColor(data.score)}` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <CheckCircle size={20} style={{ color: 'var(--success)', marginTop: 2, flexShrink: 0 }} />
            <div>
              <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Recommendation</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {data.level === 'LOW' && 'This decision appears fair. Continue monitoring.'}
                {data.level === 'MEDIUM' && 'Review decision criteria. Consider bias mitigation techniques.'}
                {data.level === 'HIGH' && 'Significant bias detected. Retrain model or remove biased features.'}
                {data.level === 'CRITICAL' && 'Critical fairness violation. Halt deployment immediately.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ExplainabilityDashboard;
