import React, { useState } from 'react';
import './BiasAnalysisDashboard.css';

const CommunityHub = () => {
  const [patterns] = useState([
    { title: 'Gender Bias in Tech Hiring', domain: 'Hiring', avg_gap: '15%', datasets_analyzed: 150, severity: 'HIGH' },
    { title: 'Age Discrimination in Finance', domain: 'Lending', avg_gap: '22%', datasets_analyzed: 89, severity: 'CRITICAL' },
    { title: 'Racial Bias in Medical AI', domain: 'Medical', avg_gap: '12%', datasets_analyzed: 45, severity: 'MEDIUM' },
    { title: 'Geographic Bias in Insurance', domain: 'Insurance', avg_gap: '18%', datasets_analyzed: 67, severity: 'HIGH' }
  ]);

  const [templates] = useState([
    { name: 'Fair Loan Approval Criteria', author: 'Community', downloads: 234, rating: 4.8 },
    { name: 'Unbiased Resume Screening', author: 'AI Ethics Lab', downloads: 189, rating: 4.6 },
    { name: 'Equitable Medical Triage', author: 'HealthAI Alliance', downloads: 156, rating: 4.9 },
    { name: 'Fair Housing Assessment', author: 'Civil Rights Org', downloads: 312, rating: 4.7 }
  ]);

  const [leaderboard] = useState([
    { rank: 1, org: 'TechCorp AI', score: 94.2, decisions: 5000 },
    { rank: 2, org: 'HealthFirst Systems', score: 91.8, decisions: 3200 },
    { rank: 3, org: 'FinanceFair Inc', score: 89.5, decisions: 7800 },
    { rank: 4, org: 'EduEquity Partners', score: 87.3, decisions: 1200 },
    { rank: 5, org: 'JusticeAI Foundation', score: 85.1, decisions: 5600 }
  ]);

  const getSeverityColor = (s) => {
    const map = { 'LOW': 'success', 'MEDIUM': 'warning', 'HIGH': 'danger', 'CRITICAL': 'dark' };
    return map[s] || 'secondary';
  };

  return (
    <div className="community-hub container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-dark text-white">
          <h2>🌍 Community Fairness Hub</h2>
          <p className="mb-0">Shared patterns, templates, and fairness leaderboards</p>
        </div>
        <div className="card-body">
          <section className="mb-5">
            <h4 className="mb-3">📈 Shared Bias Patterns</h4>
            <div className="row g-3">
              {patterns.map((p, idx) => (
                <div key={idx} className="col-md-6">
                  <div className="card border-primary h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="card-title">{p.title}</h5>
                        <span className={`badge bg-${getSeverityColor(p.severity)}`}>{p.severity}</span>
                      </div>
                      <p><span className="badge bg-secondary me-2">{p.domain}</span></p>
                      <p className="mb-1">Average Gap: <strong>{p.avg_gap}</strong></p>
                      <p className="mb-0">Datasets Analyzed: <strong>{p.datasets_analyzed}</strong></p>
                    </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-5">
            <h4 className="mb-3">✅ Fair Decision Templates</h4>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-success"><tr><th>Template</th><th>Author</th><th>Downloads</th><th>Rating</th><th>Action</th></tr></thead>
                <tbody>
                  {templates.map((t, idx) => (
                    <tr key={idx}><td>{t.name}</td><td>{t.author}</td><td>{t.downloads}</td><td>⭐ {t.rating}</td><td><button className="btn btn-sm btn-success">Download</button></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h4 className="mb-3">🏆 Fairness Leaderboard</h4>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead className="table-dark"><tr><th>Rank</th><th>Organization</th><th>Fairness Score</th><th>Decisions Analyzed</th><th>Badge</th></tr></thead>
                <tbody>
                  {leaderboard.map((e, idx) => (
                    <tr key={idx}>
                      <td>{e.rank <= 3 ? ['🥇','🥈','🥉'][e.rank-1] : e.rank}</td>
                      <td>{e.org}</td>
                      <td>
                        <div className="progress" style={{height: '20px'}}>
                          <div className={`progress-bar ${e.score >= 90 ? 'bg-success' : e.score >= 80 ? 'bg-info' : 'bg-warning'}`} style={{width: `${e.score}%`}}>{e.score}%</div>
                      </td>
                      <td>{e.decisions.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${e.score >= 90 ? 'bg-success' : e.score >= 80 ? 'bg-info' : 'bg-warning'}`}>
                          {e.score >= 90 ? 'Gold' : e.score >= 80 ? 'Silver' : 'Bronze'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </div>
  );
};

export default CommunityHub;
