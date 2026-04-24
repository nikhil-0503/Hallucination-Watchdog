import React, { useState } from 'react';
import './BiasAnalysisDashboard.css';

/**
 * BiasAnalysisDashboard Component
 * 
 * Displays bias and fairness metrics for decisions and datasets
 * Integrates with WATCHDOG backend bias analysis API
 * 
 * Features:
 * - Single decision bias analysis
 * - Dataset-wide fairness audit
 * - Protected attribute detection
 * - Fairness metrics visualization
 * - Gemini AI recommendations
 */

const BiasAnalysisDashboard = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [biasAnalysis, setBiasAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Analyze single decision
  const analyzeSingleDecision = async (decisionData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze-bias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: decisionData,
          outcome_field: 'decision'
        })
      });
      const data = await response.json();
      setBiasAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Audit entire dataset
  const auditDataset = async (decisions) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/audit-dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisions: decisions,
          outcome_field: 'decision'
        })
      });
      const data = await response.json();
      setBiasAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bias-dashboard">
      <div className="bias-header">
        <h1>⚖️ Fairness & Bias Analysis</h1>
        <p>Detect discrimination and ensure fair AI decisions</p>
      </div>

      {/* Tab Navigation */}
      <div className="bias-tabs">
        <button
          className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}
          onClick={() => setActiveTab('single')}
        >
          Single Decision
        </button>
        <button
          className={`tab-btn ${activeTab === 'dataset' ? 'active' : ''}`}
          onClick={() => setActiveTab('dataset')}
        >
          Dataset Audit
        </button>
      </div>

      {/* Single Decision Analysis */}
      {activeTab === 'single' && (
        <div className="analysis-section">
          <h2>Analyze Single Decision for Bias</h2>
          <SingleDecisionForm onSubmit={analyzeSingleDecision} />
        </div>
      )}

      {/* Dataset Audit */}
      {activeTab === 'dataset' && (
        <div className="analysis-section">
          <h2>Audit Dataset for Fairness Issues</h2>
          <DatasetAuditForm onSubmit={auditDataset} />
        </div>
      )}

      {/* Results Display */}
      {loading && <div className="loading">Analyzing...</div>}
      {error && <div className="error">Error: {error}</div>}
      {biasAnalysis && activeTab === 'single' && (
        <BiasScoreDisplay analysis={biasAnalysis} />
      )}
      {biasAnalysis && activeTab === 'dataset' && (
        <DatasetAuditDisplay analysis={biasAnalysis} />
      )}
    </div>
  );
};

/**
 * Single Decision Form Component
 */
const SingleDecisionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    race: '',
    credit_score: '',
    decision: 'approved'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="decision-form">
      <div className="form-group">
        <label>Age</label>
        <input type="number" name="age" value={formData.age} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Gender</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="form-group">
        <label>Race/Ethnicity</label>
        <input type="text" name="race" value={formData.race} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Credit Score (if applicable)</label>
        <input type="number" name="credit_score" value={formData.credit_score} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Decision</label>
        <select name="decision" value={formData.decision} onChange={handleChange}>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <button type="submit" className="submit-btn">Analyze for Bias</button>
    </form>
  );
};

/**
 * Dataset Audit Form Component
 */
const DatasetAuditForm = ({ onSubmit }) => {
  const [datasetFile, setDatasetFile] = useState(null);

  const handleFileChange = (e) => {
    setDatasetFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!datasetFile) {
      alert('Please select a CSV file');
      return;
    }

    // Parse CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const decisions = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, i) => {
              obj[header.trim()] = values[i] ? values[i].trim() : '';
            });
            return obj;
          });
        onSubmit(decisions);
      } catch (error) {
        alert('Error parsing CSV file: ' + error.message);
      }
    };
    reader.readAsText(datasetFile);
  };

  return (
    <form onSubmit={handleSubmit} className="dataset-form">
      <div className="form-group">
        <label>Upload CSV File</label>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <small>Expected columns: age, gender, race, decision, ...</small>
      </div>
      <button type="submit" className="submit-btn">Audit Dataset</button>
    </form>
  );
};

/**
 * Bias Score Display Component
 */
const BiasScoreDisplay = ({ analysis }) => {
  const { bias_score, demographics, recommendation, confidence, gemini_analysis } = analysis;

  const getRiskColor = (level) => {
    switch (level) {
      case 'LOW':
        return '#28a745';
      case 'MEDIUM':
        return '#ffc107';
      case 'HIGH':
        return '#fd7e14';
      case 'CRITICAL':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <div className="results-panel">
      <h3>Bias Analysis Results</h3>

      {/* Bias Score Card */}
      <div className="score-card" style={{ borderColor: getRiskColor(bias_score.level) }}>
        <div className="score-display">
          <div className="score-value" style={{ color: getRiskColor(bias_score.level) }}>
            {bias_score.score.toFixed(1)}/100
          </div>
          <div className="score-level" style={{ color: getRiskColor(bias_score.level) }}>
            {bias_score.level}
          </div>
        </div>
        <div className="score-interpretation">
          {bias_score.level === 'LOW' && '✅ Low bias risk detected'}
          {bias_score.level === 'MEDIUM' && '⚠️ Moderate bias concerns'}
          {bias_score.level === 'HIGH' && '⛔ High bias risk'}
          {bias_score.level === 'CRITICAL' && '🚨 Critical fairness violation'}
        </div>
      </div>

      {/* Demographics Detected */}
      <div className="demographics-section">
        <h4>Protected Attributes Detected:</h4>
        <div className="demographics-list">
          {Object.entries(demographics).map(([attr, info]) => (
            info.detected && (
              <div key={attr} className="demographic-item">
                <span className="attr-name">{attr}</span>
                <span className="attr-value">{info.value}</span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Fairness Metrics */}
      <div className="metrics-section">
        <h4>Fairness Metrics:</h4>
        <div className="metrics-list">
          {Object.entries(bias_score.factors).map(([factor, value]) => (
            <div key={factor} className="metric-item">
              <span>{factor}</span>
              <div className="metric-bar">
                <div className="metric-fill" style={{ width: Math.min(value, 100) + '%' }}></div>
              </div>
              <span className="metric-value">{value.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="recommendation-box">
        <strong>Recommendation:</strong> {recommendation}
        <span className="confidence">Confidence: {(confidence * 100).toFixed(0)}%</span>
      </div>

      {/* Gemini Analysis */}
      {gemini_analysis && (
        <div className="gemini-analysis">
          <h4>🤖 Gemini AI Analysis:</h4>
          <p>{gemini_analysis.analysis}</p>
        </div>
      )}
    </div>
  );
};

/**
 * Dataset Audit Display Component
 */
const DatasetAuditDisplay = ({ analysis }) => {
  const { dataset_size, fairness_metrics, overall_recommendation, summary, gemini_audit_report } = analysis;

  return (
    <div className="results-panel">
      <h3>Dataset Fairness Audit Report</h3>

      <div className="audit-summary">
        <p><strong>Dataset Size:</strong> {dataset_size} decisions analyzed</p>
        <p><strong>Overall Recommendation:</strong> {overall_recommendation}</p>
        <p><strong>Summary:</strong> {summary}</p>
      </div>

      {/* Fairness Metrics by Demographic */}
      <div className="fairness-table">
        <h4>Fairness Metrics by Protected Attribute:</h4>
        {Object.entries(fairness_metrics).map(([attr, data]) => (
          <div key={attr} className="attribute-section">
            <h5>{attr.toUpperCase()}</h5>
            <table>
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Total</th>
                  <th>Approved</th>
                  <th>Approval Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.stats || {}).map(([group, stats]) => (
                  <tr key={group}>
                    <td>{group}</td>
                    <td>{stats.total}</td>
                    <td>{stats.approved}</td>
                    <td>{(stats.approval_rate * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.disparity_detected && (
              <div className="disparity-warning">
                ⚠️ Significant disparity detected: {(data.disparity_gap * 100).toFixed(1)}% gap
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Gemini Audit Report */}
      {gemini_audit_report && (
        <div className="audit-report">
          <h4>🤖 Gemini AI Audit Report:</h4>
          <pre>{gemini_audit_report}</pre>
        </div>
      )}
    </div>
  );
};

export default BiasAnalysisDashboard;
