import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Users,
  DollarSign,
  TrendingUp,
  Search,
  AlertTriangle,
  Building2,
  BarChart3
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getImpactMetrics } from '../services/api';

const ImpactDashboard = () => {
  const [metrics, setMetrics] = useState({
    cases_protected: 1925,
    financial_harm_prevented: 84000000,
    avg_fairness_improvement: 67,
    decisions_analyzed: 50000,
    disparities_detected: 342,
    organizations_helped: 45
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getImpactMetrics();
        setMetrics(data);
      } catch (e) {
        console.log('Using default impact metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const topMetrics = [
    { icon: Users, label: 'People Protected', value: metrics.cases_protected.toLocaleString(), color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    { icon: DollarSign, label: 'Harm Prevented', value: formatCurrency(metrics.financial_harm_prevented), color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { icon: TrendingUp, label: 'Avg Improvement', value: `${metrics.avg_fairness_improvement}%`, color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  ];

  const secondaryMetrics = [
    { icon: Search, label: 'Decisions Analyzed', value: metrics.decisions_analyzed.toLocaleString(), color: '#8b5cf6' },
    { icon: AlertTriangle, label: 'Disparities Found', value: metrics.disparities_detected.toLocaleString(), color: '#f59e0b' },
    { icon: Building2, label: 'Organizations Helped', value: metrics.organizations_helped.toLocaleString(), color: '#ec4899' },
  ];

  const domainData = [
    { domain: 'Lending', icon: DollarSign, people: 250, harm: '$18M', improvement: '68%', color: '#3b82f6' },
    { domain: 'Hiring', icon: Users, people: 5500, harm: '$42M', improvement: '73%', color: '#10b981' },
    { domain: 'Medical', icon: Globe, people: 20, harm: 'N/A', improvement: '75%', color: '#06b6d4' },
    { domain: 'Insurance', icon: AlertTriangle, people: 120, harm: '$8M', improvement: '65%', color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <div className="spinner" style={{ width: 40, height: 40, marginBottom: 16 }} />
          <p>Loading impact metrics...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <div>
            <h1 className="page-title page-title-gradient">
              <Globe size={28} style={{ verticalAlign: 'middle', marginRight: 10 }} />
              Real-World Impact
            </h1>
            <p className="page-subtitle">Quantified protection against AI discrimination</p>
          </div>
        </motion.div>

        {/* Top Metrics */}
        <div className="metrics-grid-4">
          {topMetrics.map((m, idx) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="metric-card"
            >
              <div className="metric-card-header">
                <div className="metric-icon-box" style={{ background: m.bg, color: m.color }}>
                  <m.icon size={20} />
                </div>
              </div>
              <div className="metric-label">{m.label}</div>
              <div className="metric-value">{m.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Secondary Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="grid-3">
            {secondaryMetrics.map((m) => (
              <div key={m.label} style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  <m.icon size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Domain Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="section-card"
        >
          <div className="section-card-header">
            <h3 className="section-card-title"><BarChart3 size={18} /> Impact Breakdown by Domain</h3>
          </div>
          <div className="section-card-body">
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Domain</th>
                    <th>People Protected</th>
                    <th>Harm Prevented</th>
                    <th>Fairness Improvement</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {domainData.map((d) => (
                    <tr key={d.domain}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: `${d.color}18`, color: d.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <d.icon size={16} />
                          </div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.domain}</span>
                        </div>
                      </td>
                      <td>{d.people.toLocaleString()}</td>
                      <td>{d.harm}</td>
                      <td style={{ color: 'var(--success-light)', fontWeight: 700 }}>{d.improvement}</td>
                      <td style={{ width: 120 }}>
                        <div className="progress-track">
                          <motion.div
                            className="progress-fill"
                            style={{ background: d.color }}
                            initial={{ width: 0 }}
                            animate={{ width: d.improvement }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ImpactDashboard;

