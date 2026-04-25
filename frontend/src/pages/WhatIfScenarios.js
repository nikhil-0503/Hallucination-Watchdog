import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, ArrowRight, CheckCircle, TrendingDown } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getWhatIfState } from '../services/api';

const WhatIfScenarios = () => {
  const [scenario, setScenario] = useState({
    current_gender_gap: 15,
    current_approval_rate: 80,
    intervention: 'none'
  });
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setError(null);
        const d = await getWhatIfState();
        if (mounted && d) {
          setScenario({
            current_gender_gap: d.current_gender_gap || 15,
            current_approval_rate: d.current_approval_rate || 80,
            intervention: scenario.intervention
          });
        }
      } catch (e) {
        if (mounted) {
          console.error('Failed to load what-if state:', e);
          setError('Could not load scenario data. Using defaults.');
        }
      } finally {
        if (mounted) setInitialLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const { current_gender_gap, current_approval_rate, intervention } = scenario;
      // Client-side simulation — no backend POST needed
      const gapReduction = intervention === 'all' ? 0.85
        : intervention === 'retrain' ? 0.70
        : intervention === 'stratified' ? 0.60
        : intervention === 'remove_criteria' ? 0.50
        : 0;
      const newGap = Math.max(0, Math.round(current_gender_gap * (1 - gapReduction)));
      const improvement = current_gender_gap - newGap;
      const approvalBoost = intervention === 'all' ? 12
        : intervention === 'retrain' ? 8
        : intervention === 'stratified' ? 6
        : intervention === 'remove_criteria' ? 4
        : 0;
      const newApproval = Math.min(100, current_approval_rate + approvalBoost);

      setSimulation({
        original_gap: current_gender_gap,
        new_gap: newGap,
        improvement,
        original_approval: current_approval_rate,
        new_approval: newApproval,
        recommendation: improvement > 0
          ? `This intervention reduces the gender gap by ${improvement}pp and raises approvals to ${newApproval}%. Deploy recommended.`
          : 'No intervention selected. Consider removing biased criteria or retraining for measurable improvement.'
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (initialLoading) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ marginTop: 12 }}>Loading scenario data...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title page-title-gradient">
              <FlaskConical size={28} style={{ verticalAlign: 'middle', marginRight: 10 }} />What-If Simulator
            </h1>
            <p className="page-subtitle">Predict the impact of fairness interventions</p>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', marginBottom: '1.5rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--primary)' }}>ℹ️</span>
            <span>{error}</span>
          </motion.div>
        )}

        <div className="grid-2">
          <motion.div className="section-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="section-card-header">
              <h3 className="section-card-title">Scenario Controls</h3>
            </div>
            <div className="section-card-body">
              <div className="form-group">
                <label className="form-label">Current Gender Approval Gap: <strong>{scenario.current_gender_gap}%</strong></label>
                <input type="range" className="form-control" min="0" max="50" step="1" value={scenario.current_gender_gap} onChange={(e) => { setScenario({ ...scenario, current_gender_gap: parseInt(e.target.value) }); setSimulation(null); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Current Approval Rate: <strong>{scenario.current_approval_rate}%</strong></label>
                <input type="range" className="form-control" min="0" max="100" step="1" value={scenario.current_approval_rate} onChange={(e) => { setScenario({ ...scenario, current_approval_rate: parseInt(e.target.value) }); setSimulation(null); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Intervention Strategy</label>
                <select className="form-control" value={scenario.intervention} onChange={(e) => { setScenario({ ...scenario, intervention: e.target.value }); setSimulation(null); }}>
                  <option value="none">No Change</option>
                  <option value="remove_criteria">Remove Biased Criteria</option>
                  <option value="retrain">Retrain with Fair Data</option>
                  <option value="stratified">Stratified Sampling</option>
                  <option value="all">All Interventions</option>
                </select>
              </div>
              <button className="btn btn-primary w-100" onClick={runSimulation} disabled={loading}>
                {loading ? (<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2, marginRight: 8 }} />Simulating...</span>) : (<span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FlaskConical size={18} style={{ marginRight: 8 }} />Run Simulation</span>)}
              </button>
            </div>
          </motion.div>

          <motion.div className="section-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div className="section-card-header">
              <h3 className="section-card-title">Simulation Results</h3>
            </div>
            <div className="section-card-body">
              {!simulation ? (
                <div className="empty-state" style={{ padding: '3rem' }}>
                  <FlaskConical size={48} className="empty-state-icon" />
                  <h3>No simulation yet</h3>
                  <p>Adjust controls and click Run Simulation to see predicted outcomes.</p>
                </div>
              ) : (
                <div className="stack-list">
                  <div className="stack-item">
                    <div className="stack-item-main">
                      <div className="stack-item-title-row">
                        <span className="stack-item-title">Gender Gap</span>
                        <span className="badge badge-success">{simulation.improvement}% improvement</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 8 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)' }}>{simulation.original_gap}%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Before</div>
                        </div>
                        <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>{simulation.new_gap}%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>After</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="stack-item">
                   <div className="stack-item-main">
                      <div className="stack-item-title-row">
                        <span className="stack-item-title">Approval Rate Impact</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 8 }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{simulation.original_approval}%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Before</div>
                        </div>
                        <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{simulation.new_approval}%</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>After</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <motion.div className="glass-card" style={{ borderLeft: '4px solid var(--success)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                   <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      {simulation.improvement > 0 ? <CheckCircle size={20} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} /> : <TrendingDown size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />}
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1rem' }}>Recommendation</h4>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{simulation.recommendation}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      </AdminLayout>
  );
};

export default WhatIfScenarios;
