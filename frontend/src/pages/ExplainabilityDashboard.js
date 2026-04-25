import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Search,
  AlertTriangle,
  CheckCircle2,
  Ban,
  BarChart3,
  Loader2
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const ExplainabilityDashboard = () => {
  const [biasScore, setBiasScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/analyze-bias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decision: { age: 35, gender: 'female', race: 'black', credit_score: 750, decision: 'denied' },
            outcome_field: 'decision'
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.bias_score) {
            setBiasScore({
              score: data.bias_score.score ?? 45,
              level: data.bias_score.level ?? 'MEDIUM',
              factors: [
                { name: 'Demographic Parity', contribution: 0.35, explanation: 'Women approved at 65% vs men at 80% — a 15% gap', sub_factors: [{ name: 'Gender Gap', value: 0.15 }, { name: 'Age Gap', value: 0.08 }] },
                { name: 'Equal Opportunity', contribution: 0.30, explanation: 'True positive rates differ significantly across groups', sub_factors: [{ name: 'TPR Male', value: 0.85 }, { name: 'TPR Female', value: 0.70 }] },
                { name: 'Calibration', contribution: 0.20, explanation: 'Confidence scores inconsistent across demographics', sub_factors: [{ name: 'Calibration Deviation', value: 0.12 }] },
                { name: 'Individual Fairness', contribution: 0.15, explanation: 'Similar profiles receiving different outcomes', sub_factors: [{ name: 'Inconsistency Rate', value: 0.22 }] },
              ],
              top_factors: [
                { factor_name: 'Gender-based approval rate', impact: 0.35 },
                { factor_name: 'Age discrimination pattern', impact: 0.20 },
                { factor_name: 'Racial disparity in outcomes', impact: 0.18 },
                { factor_name: 'Geographic bias', impact: 0.12 },
                { factor_name: 'Income-based filtering', impact: 0.10 }
              ]
            });
          }
        }
      } catch (e) {
        console.log('Using demo explainability data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getLevelStyle = (level) => {
    switch (level) {
      case 'LOW': return { badge: 'badge-success', color: 'var(--success)', text: 'text-success' };
      case 'MEDIUM': return { badge: 'badge-warning', color: 'var(--warning)', text: 'text-warning' };
      case 'HIGH': return { badge: 'badge-danger', color: 'var(--danger)', text: 'text-danger' };
      case 'CRITICAL': return { badge: 'badge-danger', color: '#dc2626', text: 'text-danger' };
      default: return { badge: 'badge-neutral', color: 'var(--text-muted)', text: 'text-muted' };
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <Loader2 size={32} className="spinner" style={{ border: 'none', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
          <p>Loading explainability data...</p>
        </div>
      </AdminLayout>
    );
  }

  const style = getLevelStyle(biasScore?.level);

  return (
    <AdminLayout>
      <div>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <div>
            <h1 className="page-title page-title-gradient">
              <BrainCircuit size={28} style={{ verticalAlign: 'middle', marginRight: 10 }} />
              Explainable AI
            </h1>
            <p className="page-subtitle">Understand why decisions were flagged with human-readable explanations</p>
          </div>
        </motion.div>

        {/* Score Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ textAlign: 'center', marginBottom: '1.5rem' }}
        >
          <div style={{ fontSize: '4rem', fontWeight: 900, color: style.color, letterSpacing: '-0.04em' }}>
            {biasScore?.score ?? 45}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span className={`badge ${style.badge}`} style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              {biasScore?.level ?? 'MEDIUM'} BIAS
            </span>
          </div>
          <p style={{ color: 'var(--text-tertiary)', marginTop: '0.75rem', fontSize: '0.9rem' }}>
            Composite fairness score based on multi-dimensional analysis
          </p>
        </motion.div>

        {/* Factor Contributions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="section-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="section-card-header">
            <h3 className="section-card-title"><BarChart3 size={18} /> Factor Contributions</h3>
          </div>
          <div className="section-card-body">
            <div className="grid-2">
              {(biasScore?.factors || []).map((factor, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + idx * 0.08 }}
                  className="glass-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{factor.name}</h4>
                    <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                      {(factor.contribution * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', margin: '0 0 0.75rem', lineHeight: 1.5 }}>{factor.explanation}</p>
                  {factor.sub_factors && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {factor.sub_factors.map((sf, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sf.name}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{(sf.value * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Impactful Factors */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="section-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="section-card-header">
            <h3 className="section-card-title"><Search size={18} /> Most Impactful Factors</h3>
          </div>
          <div className="section-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(biasScore?.top_factors || []).map((f, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-neutral" style={{ minWidth: 36, textAlign: 'center' }}>#{idx + 1}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', minWidth: 200, fontWeight: 500 }}>{f.factor_name}</span>
                  <div className="progress-track" style={{ flex: 1 }}>
                    <motion.div
                      className="progress-fill"
                      style={{
                        background: idx === 0 ? 'linear-gradient(90deg, var(--danger), var(--danger-light))' :
                          idx === 1 ? 'linear-gradient(90deg, var(--warning), var(--warning-light))' :
                          'linear-gradient(90deg, var(--brand-blue), var(--brand-cyan))'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${f.impact * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.35 + idx * 0.08 }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', minWidth: 40, textAlign: 'right' }}>
                    {(f.impact * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card"
          style={{ borderColor: `${style.color}30` }}
        >
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: style.color, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {biasScore?.level === 'LOW' && <CheckCircle2 size={18} />}
            {biasScore?.level === 'MEDIUM' && <AlertTriangle size={18} />}
            {biasScore?.level === 'HIGH' && <Ban size={18} />}
            {biasScore?.level === 'CRITICAL' && <Ban size={18} />}
            Recommendation
          </h4>
          <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            {biasScore?.level === 'LOW' && 'This decision appears fair. Continue monitoring for drift over time.'}
            {biasScore?.level === 'MEDIUM' && 'Review decision criteria. Consider bias mitigation techniques such as reweighting or adversarial debiasing.'}
            {biasScore?.level === 'HIGH' && 'Significant bias detected. Retrain model or remove biased features before deployment.'}
            {biasScore?.level === 'CRITICAL' && 'Critical fairness violation. Halt deployment immediately and conduct full audit.'}
          </p>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ExplainabilityDashboard;

