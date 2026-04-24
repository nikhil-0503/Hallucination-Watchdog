import React, { useState } from 'react';
import './BiasAnalysisDashboard.css';

const ExplainabilityDashboard = () => {
  const [biasScore] = useState({
    score: 45,
    level: 'MEDIUM',
    factors: [
      {
        name: 'Demographic Parity',
        contribution: 0.35,
        explanation: 'Women approved at 65% vs men at 80% — a 15% gap',
        sub_factors: [
          { name: 'Gender Gap', value: 0.15 },
          { name: 'Age Gap', value: 0.08 }
        ]
      },
      {
        name: 'Equal Opportunity',
        contribution: 0.30,
        explanation: 'True positive rates differ significantly across groups',
        sub_factors: [
          { name: 'TPR Male', value: 0.85 },
          { name: 'TPR Female', value: 0.70 }
        ]
      },
      {
        name: 'Calibration',
        contribution: 0.20,
        explanation: 'Confidence scores inconsistent across demographics',
        sub_factors: [
          { name: 'Calibration Deviation', value: 0.12 }
        ]
      },
      {
        name: 'Individual Fairness',
        contribution: 0.15,
        explanation: 'Similar profiles receiving different outcomes',
        sub_factors: [
          { name: 'Inconsistency Rate', value: 0.22 }
        ]
      }
    ],
    top_factors: [
      { factor_name: 'Gender-based approval rate', impact: 0.35 },
      { factor_name: 'Age discrimination pattern', impact: 0.20 },
      { factor_name: 'Racial disparity in outcomes', impact: 0.18 },
      { factor_name: 'Geographic bias', impact: 0.12 },
      { factor_name: 'Income-based filtering', impact: 0.10 }
    ]
  });

  const getLevelColor = (level) => {
    switch(level) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'danger';
      case 'CRITICAL': return 'dark';
      default: return 'secondary';
    }
  };

  const getScoreColor = (score) => {
    if (score < 25) return 'text-success';
    if (score < 50) return 'text-warning';
    if (score < 75) return 'text-danger';
    return 'text-dark';
  };

  return (
    <div className="explainability-dashboard container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-info text-white">
          <h2>🔍 Explainable AI Dashboard</h2>
          <p className="mb-0">Understand why this decision was flagged</p>
        </div>
        <div className="card-body">
          <div className="text-center mb-4">
            <h1 className={`display-1 fw-bold ${getScoreColor(biasScore.score)}`}>
              {biasScore.score}
            </h1>
            <h4>
              <span className={`badge bg-${getLevelColor(biasScore.level)}`}>
                {biasScore.level} BIAS
              </span>
            </h4>
          </div>

          <h4 className="mb-3">📊 Factor Contributions</h4>
          <div className="row g-3 mb-4">
            {biasScore.factors.map((factor, idx) => (
              <div key={idx} className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="card-title">{factor.name}</h5>
                      <span className="badge bg-primary">
                        {(factor.contribution * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="card-text text-muted">{factor.explanation}</p>
                    {factor.sub_factors && (
                      <ul className="list-group list-group-flush mt-2">
                        {factor.sub_factors.map((sf, i) => (
                          <li key={i} className="list-group-item d-flex justify-content-between">
                            <span>{sf.name}</span>
                            <span className="fw-bold">{(sf.value * 100).toFixed(1)}%</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
              </div>
            ))}
          </div>

          <h4 className="mb-3">🎯 Most Impactful Factors</h4>
          <div className="card mb-4">
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {biasScore.top_factors.map((f, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-secondary me-2">#{idx + 1}</span>
                      {f.factor_name}
                    </div>
                    <div className="progress flex-grow-1 mx-3" style={{height: '20px'}}>
                      <div
                        className={`progress-bar bg-${idx === 0 ? 'danger' : idx === 1 ? 'warning' : 'info'}`}
                        style={{width: `${f.impact * 100}%`}}
                      >
                        {(f.impact * 100).toFixed(0)}%
                      </div>
                  </li>
                ))}
              </ul>
            </div>

          <div className={`alert alert-${getLevelColor(biasScore.level)}`} role="alert">
            <h5>💡 Recommendation</h5>
            <p className="mb-0">
              {biasScore.level === 'LOW' && "✅ This decision appears fair. Continue monitoring."}
              {biasScore.level === 'MEDIUM' && "⚠️ Review decision criteria. Consider bias mitigation techniques."}
              {biasScore.level === 'HIGH' && "🔴 Significant bias detected. Retrain model or remove biased features."}
              {biasScore.level === 'CRITICAL' && "🚨 Critical fairness violation. Halt deployment immediately."}
            </p>
          </div>
      </div>
  );
};

export default ExplainabilityDashboard;
