import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  SlidersHorizontal
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const WhatIfScenarios = () => {
  const [scenario, setScenario] = useState({
    current_gender_gap: 15,
    current_approval_rate: 80,
    intervention: 'none'
  });
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  const interventions = [
    { value: 'none', label: 'No Change', desc: 'Baseline scenario with no intervention' },
    { value: 'remove_criteria', label: 'Remove Biased Criteria', desc: 'Eliminate features correlated with protected attributes' },
    { value: 'retrain', label: 'Retrain with Fair Data', desc: 'Rebalance training dataset across demographics' },
    { value: 'stratified', label: 'Stratified Sampling', desc: 'Ensure equal representation in training batches' },
    { value: 'all', label: 'All Interventions', desc: 'Combined strategy for maximum fairness improvement' },
  ];

  const runSimulation = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    let new_gap = scenario.current_gender_gap;
    let new_approval = scenario.current_approval_rate;

    switch (scenario.intervention) {
      case 'remove_criteria': new_gap *= 0.6; break;
      case 'retrain': new_gap *= 0.5; new_approval *= 0.95; break;
      case 'stratified': new_gap *= 0.7; break;
      case 'all': new_gap *= 0.3; new_approval *= 0.92; break;
      default: break;
    }

    setSimulation({
      original_gap: scenario.current_gender_gap,
      new_gap: Math.round(new_gap * 10) / 10,
      improvement: Math.round((1 - new_gap / scenario.current_gender_gap) * 100),
      original_approval: scenario.current_approval_rate,
      new_approval: Math.round(new_approval * 10) / 10,
      recommendation: scenario.intervention === 'none'
        ? 'Current system has fairness issues that should be addressed.'
        : 'Intervention will significantly improve fairness metrics.'
    });
    setLoading(false);
  };

  return (
    <AdminLayout>
      <div>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <div>
            <h1 className="page-title page-title-gradient">
              <FlaskConical size={28} style={{ verticalAlign: 'middle', marginRight: 10 }} />
              What-If Simulator
            </h1>
            <p className="page-subtitle">Predict the impact of fairness interventions before deployment</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card">
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={18} /> Scenario Configuration
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Current Gender Approval Gap</label>
              <span style={{ color: 'var(--brand-blue-light)', fontWeight: 700 }}>{scenario.current_gender_gap}%</span>
            </div>
            <input
              type="range" min="0" max="50" step="1"
              value={scenario.current_gender_gap}
              onChange={(e) => setScenario({ ...scenario, current_gender_gap: parseInt(e.target.value) })}
              className="form-input"
              style={{ padding: 0, height: 6, accentColor: 'var(--brand-blue)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>0%</span><span>25%</span><span>50%</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>Current Approval Rate</label>
              <span style={{ color: 'var(--brand-cyan-light)', fontWeight: 700 }}>{scenario.current_approval_rate}%</span>
            </div>
            <input
              type="range" min="0" max="100" step="1"
              value={scenario.current_approval_rate}
              onChange={(e) => setScenario({ ...scenario, current_approval_rate: parseInt(e.target.value) })}
              className="form-input"
              style={{ padding: 0, height: 6, accentColor: 'var(--brand-cyan)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Intervention Strategy</label>
            <div className="grid-2" style={{ gap: '0.75rem' }}>
              {interventions.map((int) => (
                <motion.button
                  key={int.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setScenario({ ...scenario, intervention: int.value })}
                  className="btn"
                  style={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    padding: '1rem',
                    background: scenario.intervention === int.value
                      ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(6,182,212,0.1))'
                      : 'rgba(11,15,26,0.5)',
                    border: scenario.intervention === int.value ? '1.5px solid var(--brand-blue)' : '1.5px solid var(--border)',
                    color: scenario.intervention === int.value ? 'var(--brand-blue-light)' : 'var(--text-secondary)',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '0.25rem'
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{int.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{int.desc}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={runSimulation}
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {loading ? (
              <><div className="spinner" /> Running Simulation...</>
            ) : (
              <><FlaskConical size={18} /> Run Simulation</>
            )}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {simulation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="section-card"
              style={{ marginTop: '1.5rem' }}
            >
              <div className="section-card-header">
                <h3 className="section-card-title"><BarChart3 size={18} /> Simulation Results</h3>
              </div>
              <div className="section-card-body">
                <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                  <div className="glass-card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <TrendingDown size={18} style={{ color: 'var(--success)' }} />
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Gender Gap Reduction</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Before</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger-light)' }}>{simulation.original_gap}%</div>
                      </div>
                      <ArrowRight size={20} style={{ color: 'var(--text-muted)' }} />
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>After</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success-light)' }}>{simulation.new_gap}%</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--success-light)', fontWeight: 700, fontSize: '0.9rem' }}>
                      <CheckCircle2 size={16} /> {simulation.improvement}% fairness improvement
                    </div>
                  </div>

                  <div className="glass-card" style={{ borderColor: 'rgba(6,182,212,0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <AlertTriangle size={18} style={{ color: 'var(--brand-cyan-light)' }} />
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Recommendation</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.75rem', lineHeight: 1.6 }}>{simulation.recommendation}</p>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Approval Rate: <strong style={{ color: 'var(--text-secondary)' }}>{simulation.original_approval}%</strong>
                      {' '}→{' '}
                      <strong style={{ color: 'var(--brand-cyan-light)' }}>{simulation.new_approval}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default WhatIfScenarios;

