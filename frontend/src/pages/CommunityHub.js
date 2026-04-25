import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  TrendingUp,
  Download,
  Trophy,
  Medal,
  Award,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileCheck,
  Star
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const CommunityHub = () => {
  const [patterns, setPatterns] = useState([
    { title: 'Gender Bias in Tech Hiring', domain: 'Hiring', avg_gap: '15%', datasets_analyzed: 150, severity: 'HIGH' },
    { title: 'Age Discrimination in Finance', domain: 'Lending', avg_gap: '22%', datasets_analyzed: 89, severity: 'CRITICAL' },
    { title: 'Racial Bias in Medical AI', domain: 'Medical', avg_gap: '12%', datasets_analyzed: 45, severity: 'MEDIUM' },
    { title: 'Geographic Bias in Insurance', domain: 'Insurance', avg_gap: '18%', datasets_analyzed: 67, severity: 'HIGH' },
  ]);

  const [templates, setTemplates] = useState([
    { name: 'Fair Loan Approval Criteria', author: 'Community', downloads: 234, rating: 4.8 },
    { name: 'Unbiased Resume Screening', author: 'AI Ethics Lab', downloads: 189, rating: 4.6 },
    { name: 'Equitable Medical Triage', author: 'HealthAI Alliance', downloads: 156, rating: 4.9 },
    { name: 'Fair Housing Assessment', author: 'Civil Rights Org', downloads: 312, rating: 4.7 },
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, org: 'TechCorp AI', score: 94.2, decisions: 5000 },
    { rank: 2, org: 'HealthFirst Systems', score: 91.8, decisions: 3200 },
    { rank: 3, org: 'FinanceFair Inc', score: 89.5, decisions: 7800 },
    { rank: 4, org: 'EduEquity Partners', score: 87.3, decisions: 1200 },
    { rank: 5, org: 'JusticeAI Foundation', score: 85.1, decisions: 5600 },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, these would come from /api/community-patterns, /api/templates, /api/leaderboard
        await new Promise(r => setTimeout(r, 400));
      } catch (e) {
        console.log('Using demo community data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getSeverityStyle = (s) => {
    const map = {
      'LOW': { badge: 'badge-success', color: 'var(--success)' },
      'MEDIUM': { badge: 'badge-warning', color: 'var(--warning)' },
      'HIGH': { badge: 'badge-danger', color: 'var(--danger)' },
      'CRITICAL': { badge: 'badge-danger', color: '#dc2626' }
    };
    return map[s] || { badge: 'badge-neutral', color: 'var(--text-muted)' };
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={18} style={{ color: '#fbbf24' }} />;
    if (rank === 2) return <Medal size={18} style={{ color: '#94a3b8' }} />;
    if (rank === 3) return <Award size={18} style={{ color: '#b45309' }} />;
    return <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>{rank}</span>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <div className="spinner" style={{ width: 40, height: 40, marginBottom: 16 }} />
          <p>Loading community data...</p>
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
              Community Hub
            </h1>
            <p className="page-subtitle">Shared patterns, templates, and fairness leaderboards</p>
          </div>
        </motion.div>

        {/* Shared Bias Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="section-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="section-card-header">
            <h3 className="section-card-title"><TrendingUp size={18} /> Shared Bias Patterns</h3>
          </div>
          <div className="section-card-body">
            <div className="grid-2">
              {patterns.map((p, idx) => {
                const sev = getSeverityStyle(p.severity);
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.06 }}
                    className="glass-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{p.title}</h4>
                      <span className={`badge ${sev.badge}`}>{p.severity}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span className="badge badge-neutral">{p.domain}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Avg Gap</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: sev.color }}>{p.avg_gap}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Datasets</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{p.datasets_analyzed}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Templates */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="section-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <div className="section-card-header">
            <h3 className="section-card-title"><FileCheck size={18} /> Fair Decision Templates</h3>
          </div>
          <div className="section-card-body">
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th>Author</th>
                    <th>Downloads</th>
                    <th>Rating</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</td>
                      <td style={{ color: 'var(--text-tertiary)' }}>{t.author}</td>
                      <td>{t.downloads.toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                          <Star size={14} fill="#fbbf24" />
                          <span style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>{t.rating}</span>
                        </div>
                      </td>
                      <td>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-secondary"
                          style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          <Download size={14} /> Download
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="section-card"
        >
          <div className="section-card-header">
            <h3 className="section-card-title"><Trophy size={18} /> Fairness Leaderboard</h3>
          </div>
          <div className="section-card-body">
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Rank</th>
                    <th>Organization</th>
                    <th>Fairness Score</th>
                    <th>Decisions</th>
                    <th>Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((e, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center' }}>{getRankIcon(e.rank)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.org}</td>
                      <td style={{ width: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="progress-track" style={{ flex: 1 }}>
                            <motion.div
                              className="progress-fill"
                              style={{
                                background: e.score >= 90 ? 'linear-gradient(90deg, var(--success), var(--success-light))' :
                                  e.score >= 80 ? 'linear-gradient(90deg, var(--brand-cyan), var(--brand-cyan-light))' :
                                  'linear-gradient(90deg, var(--warning), var(--warning-light))'
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${e.score}%` }}
                              transition={{ duration: 0.8, delay: 0.35 + idx * 0.06 }}
                            />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', minWidth: 40, textAlign: 'right' }}>
                            {e.score}%
                          </span>
                        </div>
                      </td>
                      <td>{e.decisions.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${e.score >= 90 ? 'badge-success' : e.score >= 80 ? 'badge-info' : 'badge-warning'}`}>
                          {e.score >= 90 ? 'Gold' : e.score >= 80 ? 'Silver' : 'Bronze'}
                        </span>
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

export default CommunityHub;

