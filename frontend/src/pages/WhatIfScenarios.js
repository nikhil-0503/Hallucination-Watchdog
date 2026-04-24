import React, { useState } from 'react';
import './BiasAnalysisDashboard.css';

const WhatIfScenarios = () => {
  const [scenario, setScenario] = useState({
    current_gender_gap: 15,
    current_approval_rate: 80,
    intervention: 'none'
  });

  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    let new_gap = scenario.current_gender_gap;
    let new_approval = scenario.current_approval_rate;

    switch(scenario.intervention) {
      case 'remove_criteria':
        new_gap *= 0.6;
        break;
      case 'retrain':
        new_gap *= 0.5;
        new_approval *= 0.95;
        break;
      case 'stratified':
        new_gap *= 0.7;
        break;
      case 'all':
        new_gap *= 0.3;
        new_approval *= 0.92;
        break;
      default:
        break;
    }

    setSimulation({
      original_gap: scenario.current_gender_gap,
      new_gap: Math.round(new_gap * 10) / 10,
      improvement: Math.round((1 - new_gap/scenario.current_gender_gap) * 100),
      original_approval: scenario.current_approval_rate,
      new_approval: Math.round(new_approval * 10) / 10,
      recommendation: scenario.intervention === 'none'
        ? "⚠️ Current system has fairness issues"
        : "✅ Intervention will significantly improve fairness"
    });

    setLoading(false);
  };

  return (
    <div className="what-if-simulator container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h2>🔮 Fairness Scenario Simulator</h2>
          <p className="mb-0">Predict the impact of interventions on fairness</p>
        </div>
        <div className="card-body">
          <div className="scenario-controls">
            <div className="mb-4">
              <label className="form-label fw-bold">
                Current Gender Approval Gap: {scenario.current_gender_gap}%
              </label>
              <input
                type="range"
                className="form-range"
                min="0" max="50" step="1"
                value={scenario.current_gender_gap}
                onChange={(e) => setScenario({
                  ...scenario,
                  current_gender_gap: parseInt(e.target.value)
                })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">
                Current Approval Rate: {scenario.current_approval_rate}%
              </label>
              <input
                type="range"
                className="form-range"
                min="0" max="100" step="1"
                value={scenario.current_approval_rate}
                onChange={(e) => setScenario({
                  ...scenario,
                  current_approval_rate: parseInt(e.target.value)
                })}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold">Choose Intervention:</label>
              <select
                className="form-select"
                value={scenario.intervention}
                onChange={(e) => setScenario({
                  ...scenario,
                  intervention: e.target.value
                })}
              >
                <option value="none">No Change</option>
                <option value="remove_criteria">Remove Biased Criteria</option>
                <option value="retrain">Retrain with Fair Data</option>
                <option value="stratified">Stratified Sampling</option>
                <option value="all">All Interventions</option>
              </select>
            </div>

          <button
            className="btn btn-primary btn-lg w-100"
            onClick={runSimulation}
            disabled={loading}
          >
            {loading ? 'Simulating...' : '🚀 Run Simulation'}
          </button>

          {simulation && (
            <div className="simulation-results mt-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="card border-success">
                    <div className="card-body">
                      <h5 className="card-title">📊 Gender Gap</h5>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-center">
                          <small className="text-muted">Before</small>
                          <div className="h4 text-danger">{simulation.original_gap}%</div>
                        <div className="h3">→</div>
                        <div className="text-center">
                          <small className="text-muted">After</small>
                          <div className="h4 text-success">{simulation.new_gap}%</div>
                      </div>
                      <p className="mt-2 mb-0 text-success fw-bold">
                        ✅ {simulation.improvement}% fairness improvement
                      </p>
                    </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-info">
                    <div className="card-body">
                      <h5 className="card-title">🎯 Recommendation</h5>
                      <p className="card-text">{simulation.recommendation}</p>
                      <p className="mb-0">
                        <small>Approval Rate: {simulation.original_approval}% → {simulation.new_approval}%</small>
                      </p>
                    </div>
                </div>
            </div>
          )}
        </div>
    </div>
  );
};

export default WhatIfScenarios;
