import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  User,
  Users,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Ban,
  BrainCircuit,
  Upload,
  BarChart3,
  Loader2
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { analyzeBias, auditDataset } from '../services/api';

const BiasAnalysisDashboard = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [biasAnalysis, setBiasAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyzeSingle = async (decisionData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeBias(decisionData, null, 'decision');
      setBiasAnalysis(data);
    } catch (err) {
      setError(err.message || 'Bias analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAuditDataset = async (decisions) => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditDataset(decisions, 'decision');
      setBiasAnalysis(data);
    } catch (err) {
      setError(err.message || 'Dataset audit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div>
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="page-header">
          <div>
            <h1 className="page-title page-title-gradient">
              <Scale size={28} style={{ verticalAlign: 'middle', marginRight: 10 }} />
              Fairness & Bias Analysis
            </h1>
            <p className="page-subtitle">Detect discrimination and ensure fair AI decisions</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="tab-bar">
            <button className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`} onClick={() => setActiveTab('single')}>
              <User size={14} /> Single Decision
            </button>
            <button className={`tab-btn ${activeTab === 'dataset' ? 'active' : ''}`} onClick={() => setActiveTab('dataset')}>
              <Users size={14} /> Dataset Audit
            </button>
          </div>
        </motion.div>

        {activeTab === 'single' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SingleDecisionForm onSubmit={handleAnalyzeSingle} />
          </motion.div>
        )}
        {activeTab === 'dataset' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <DatasetAuditForm onSubmit={handleAuditDataset} />
          </motion.div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
            <Loader2 size={32} className="spinner" style={{ border: 'none', animation: 'spin 1s linear infinite' }} />
            <p>Analyzing...</p>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ borderColor: 'rgba(239,68,68,0.3)', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger-light)' }}>
              <AlertTriangle size={18} />
              <span>Error: {error}</span>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {biasAnalysis && activeTab === 'single' && (
            <BiasScoreDisplay key="single" analysis={biasAnalysis} />
          )}
          {biasAnalysis && activeTab === 'dataset' && (
            <DatasetAuditDisplay key="dataset" analysis={biasAnalysis} />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

const SingleDecisionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ age: '', gender: '', race: '', credit_score: '', decision: 'approved' });
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(formData); };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
      <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        <BarChart3 size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Analyze Single Decision for Bias
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="grid-2" style={{ gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input type="number" name="age" value={formData.age} onChange={handleChange} className="form-input" placeholder="35" />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className="form-select">
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Race / Ethnicity</label>
            <input type="text" name="race" value={formData.race} onChange={handleChange} className="form-input" placeholder="e.g. Asian, Black, White" />
          </div>
          <div className="form-group">
            <label className="form-label">Credit Score</label>
            <input type="number" name="credit_score" value={formData.credit_score} onChange={handleChange} className="form-input" placeholder="750" />
          </div>
          <div className="form-group">
            <label className="form-label">Decision</label>
            <select name="decision" value={formData.decision} onChange={handleChange} className="form-select">
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          <Scale size={16} /> Analyze for Bias
        </motion.button>
      </form>
    </motion.div>
  );
};

const DatasetAuditForm = ({ onSubmit }) => {
  const [datasetFile, setDatasetFile] = useState(null);
  const [parsedCount, setParsedCount] = useState(0);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setDatasetFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const lines = event.target.result.split('\n').filter(l => l.trim());
        setParsedCount(Math.max(0, lines.length - 1));
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!datasetFile) { alert('Please select a CSV file'); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const decisions = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj = {};
          headers.forEach((h, i) => { obj[h] = values[i] ? values[i].trim() : ''; });
          return obj;
        }).filter(d => Object.keys(d).length > 0);
        onSubmit(decisions);
      } catch (error) { alert('Error parsing CSV: ' + error.message); }
    };
    reader.readAsText(datasetFile);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card">
      <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        <FileSpreadsheet size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        Audit Dataset for Fairness Issues
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Upload CSV File</label>
          <div style={{
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'var(--transition)',
            background: 'rgba(11,15,26,0.4)'
          }} onClick={() => document.getElementById('csv-upload').click()}>
            <Upload size={32} style={{ color: 'var(--brand-blue-light)', marginBottom: '0.75rem' }} />
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              {datasetFile ? datasetFile.name : 'Click to upload CSV'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Expected columns: age, gender, race, decision, ...
            </div>
            {parsedCount > 0 && (
              <div style={{ color: 'var(--success-light)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                {parsedCount} rows detected
              </div>
            )}
          </div>
          <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-primary">
          <Scale size={16} /> Audit Dataset
        </motion.button>
      </form>
    </motion.div>
  );
};

const BiasScoreDisplay = ({ analysis }) => {
  const { bias_score, demographics, recommendation, confidence, gemini_analysis } = analysis;
  const getLevelColor = (level) => {
    switch (level) {
      case 'LOW': return { color: 'var(--success)', bg: 'rgba(16,185,129,0.12)' };
      case 'MEDIUM': return { color: 'var(--warning)', bg: 'rgba(245,158,11,0.12)' };
      case 'HIGH': return { color: 'var(--danger)', bg: 'rgba(239,68,68,0.12)' };
      case 'CRITICAL': return { color: '#dc2626', bg: 'rgba(220,38,38,0.15)' };
      default: return { color: 'var(--text-muted)', bg: 'rgba(100,130,180,0.1)' };
    }
  };
  const style = getLevelColor(bias_score?.level);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="section-card" style={{ marginTop: '1.5rem' }}>
      <div className="section-card-header">
        <h3 className="section-card-title"><BarChart3 size={18} /> Bias Analysis Results</h3>
        <span className="badge" style={{ background: style.bg, color: style.color, border: `1px solid ${style.color}30` }}>
          {bias_score?.level}
        </span>
      </div>
      <div className="section-card-body">
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ borderColor: `${style.color}40` }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: style.color }}>
              {bias_score?.score?.toFixed?.(1) ?? 'N/A'}
              <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginLeft: 4 }}>/100</span>
            </div>
            <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              {bias_score?.level === 'LOW' && <><CheckCircle2 size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Low bias risk detected</>}
              {bias_score?.level === 'MEDIUM' && <><AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Moderate bias concerns</>}
              {bias_score?.level === 'HIGH' && <><Ban size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> High bias risk</>}
              {bias_score?.level === 'CRITICAL' && <><AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Critical fairness violation</>}
            </div>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              Protected Attributes Detected
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {Object.entries(demographics || {}).map(([attr, info]) => info.detected && (
                <span key={attr} className="badge badge-info">
                  {attr}: {info.value}
                </span>
              ))}
            </div>
          </div>
        </div>

        {bias_score?.factors && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              Fairness Metrics
            </h4>
            <div className="grid-2">
              {Object.entries(bias_score.factors).map(([factor, value]) => (
                <div key={factor} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: 160 }}>{factor}</span>
                  <div className="progress-track" style={{ flex: 1 }}>
                    <motion.div
                      className="progress-fill purple"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(value, 100)}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', minWidth: 45, textAlign: 'right' }}>
                    {typeof value === 'number' ? value.toFixed(1) : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass-card" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Recommendation:</span>
            <span className={`badge badge-${recommendation?.toLowerCase() === 'allow' ? 'success' : recommendation?.toLowerCase() === 'warn' ? 'warning' : 'danger'}`}>
              {recommendation}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confidence: {((confidence || 0) * 100).toFixed(0)}%</span>
          </div>
        </div>

        {gemini_analysis?.analysis && (
          <div className="glass-card" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-purple)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
              <BrainCircuit size={16} /> Gemini AI Analysis
            </h4>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{gemini_analysis.analysis}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const DatasetAuditDisplay = ({ analysis }) => {
  const { dataset_size, fairness_metrics, overall_recommendation, summary, gemini_audit_report } = analysis;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="section-card" style={{ marginTop: '1.5rem' }}>
      <div className="section-card-header">
        <h3 className="section-card-title"><FileSpreadsheet size={18} /> Dataset Fairness Audit Report</h3>
        <span className={`badge badge-${overall_recommendation?.toLowerCase() === 'allow' ? 'success' : overall_recommendation?.toLowerCase() === 'warn' ? 'warning' : 'danger'}`}>
          {overall_recommendation}
        </span>
      </div>
      <div className="section-card-body">
        <div className="metrics-grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="metric-card">
            <div className="metric-label">Dataset Size</div>
            <div className="metric-value">{dataset_size?.toLocaleString?.() ?? dataset_size}</div>
          </div>
        </div>

        {summary && (
          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{summary}</p>
          </div>
        )}

        {fairness_metrics && Object.entries(fairness_metrics).map(([attr, data]) => (
          <div key={attr} className="glass-card" style={{ marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
              {attr}
            </h4>
            {data.stats && (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr><th>Group</th><th>Total</th><th>Approved</th><th>Approval Rate</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.stats).map(([group, stats]) => (
                      <tr key={group}>
                        <td>{group}</td>
                        <td>{stats.total}</td>
                        <td>{stats.approved}</td>
                        <td>{(stats.approval_rate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data.disparity_detected && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', color: 'var(--warning-light)', fontSize: '0.85rem' }}>
                <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Significant disparity detected: {(data.disparity_gap * 100).toFixed(1)}% gap
              </div>
            )}
          </div>
        ))}

        {gemini_audit_report && (
          <div className="glass-card" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-purple)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
              <BrainCircuit size={16} /> Gemini AI Audit Report
            </h4>
            <pre style={{ color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font)', fontSize: '0.9rem', lineHeight: 1.7 }}>
              {gemini_audit_report}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BiasAnalysisDashboard;

