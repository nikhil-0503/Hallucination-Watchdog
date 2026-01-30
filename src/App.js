import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  Settings,
  FileText,
  BarChart3,
  Clock,
  Server,
  Zap
} from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [metrics, setMetrics] = useState({
    monitored: 142847,
    blocked: 23,
    warnings: 156
  });

  // Simulate real-time requests
  useEffect(() => {
    const generateRequest = () => {
      const risks = ['SAFE', 'WARN', 'BLOCKED'];
      const models = ['GPT-4', 'Claude-3', 'Gemini-Pro'];
      const prompts = [
        'Explain quantum computing to a beginner',
        'Calculate the ROI for this investment strategy',
        'Provide medical advice for chest pain symptoms',
        'Generate code for user authentication',
        'Summarize this financial report'
      ];
      
      const riskLevel = Math.random();
      const status = riskLevel > 0.8 ? 'BLOCKED' : riskLevel > 0.6 ? 'WARN' : 'SAFE';
      
      return {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date(),
        model: models[Math.floor(Math.random() * models.length)],
        prompt: prompts[Math.floor(Math.random() * prompts.length)],
        response: 'AI response preview...',
        riskScore: Math.floor(riskLevel * 100),
        status,
        reason: status === 'BLOCKED' ? 'Medical advice detected' : 
                status === 'WARN' ? 'Confidence threshold exceeded' : 
                'All checks passed'
      };
    };

    // Initial requests
    const initialRequests = Array.from({ length: 8 }, generateRequest);
    setRequests(initialRequests);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newRequest = generateRequest();
      setRequests(prev => [newRequest, ...prev.slice(0, 19)]); // Keep last 20
      
      // Update metrics
      setMetrics(prev => ({
        monitored: prev.monitored + 1,
        blocked: newRequest.status === 'BLOCKED' ? prev.blocked + 1 : prev.blocked,
        warnings: newRequest.status === 'WARN' ? prev.warnings + 1 : prev.warnings
      }));
    },5000);

    return () => clearInterval(interval);
  }, []);

  const Sidebar = () => (
    <motion.div 
      className="sidebar"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="logo">
        <Shield className="logo-icon" />
        <span className="logo-text">WATCHDOG</span>
      </div>
      
      <nav className="nav">
        {[
          { id: 'overview', icon: BarChart3, label: 'Overview' },
          { id: 'traffic', icon: Activity, label: 'Live Traffic' },
          { id: 'decisions', icon: AlertTriangle, label: 'Risk Decisions' },
          { id: 'audit', icon: FileText, label: 'Audit & Compliance' },
          { id: 'policies', icon: Settings, label: 'Policies' },
          { id: 'settings', icon: Server, label: 'Settings' }
        ].map(item => (
          <motion.button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <item.icon className="nav-icon" />
            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>
    </motion.div>
  );

  const TopBar = () => (
    <motion.div 
      className="top-bar"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
    >
      <div className="status-section">
        <div className="live-indicator">
          <motion.div 
            className="pulse"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>LIVE — Monitoring Production Traffic</span>
        </div>
        <div className="env-switch">
          <button className="env-btn active">Production</button>
          <button className="env-btn">Staging</button>
        </div>
      </div>
      
      <div className="uptime-section">
        <Clock className="uptime-icon" />
        <span>Uptime: 99.98%</span>
      </div>
    </motion.div>
  );

  const HeroSection = () => (
    <motion.div 
      className="hero-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
    >
      <h1 className="hero-title">AI shouldn't guess in public.</h1>
      <p className="hero-subtitle">Real-time control over AI outputs before they reach users.</p>
      
      <div className="metrics-grid">
        {[
          { label: 'Requests Monitored', value: metrics.monitored.toLocaleString(), icon: Eye },
          { label: 'Responses Blocked', value: metrics.blocked, icon: XCircle },
          { label: 'Warnings Issued Today', value: metrics.warnings, icon: AlertTriangle }
        ].map((metric, index) => (
          <motion.div 
            key={metric.label}
            className="metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
          >
            <metric.icon className="metric-icon" />
            <div className="metric-content">
              <div className="metric-value">{metric.value}</div>
              <div className="metric-label">{metric.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const RequestsTable = () => (
    <motion.div 
      className="requests-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <h2 className="section-title">Live Request Stream</h2>
      
      <div className="requests-table">
        <div className="table-header">
          <div>Timestamp</div>
          <div>Model</div>
          <div>Prompt</div>
          <div>Risk Score</div>
          <div>Status</div>
          <div>Action</div>
        </div>
        
        <AnimatePresence>
          {requests.map((request, index) => (
            <motion.div 
              key={request.id}
              className={`table-row ${request.status.toLowerCase()}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="timestamp">
                {request.timestamp.toLocaleTimeString()}
              </div>
              <div className="model">{request.model}</div>
              <div className="prompt">
                {request.prompt.length > 50 ? 
                  `${request.prompt.substring(0, 50)}...` : 
                  request.prompt
                }
              </div>
              <div className="risk-score">
                <div className="risk-bar">
                  <motion.div 
                    className="risk-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${request.riskScore}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <span>{request.riskScore}%</span>
              </div>
              <div className={`status-badge ${request.status.toLowerCase()}`}>
                {request.status === 'SAFE' && <CheckCircle className="status-icon" />}
                {request.status === 'WARN' && <AlertTriangle className="status-icon" />}
                {request.status === 'BLOCKED' && <XCircle className="status-icon" />}
                {request.status}
              </div>
              <div className="action-reason">{request.reason}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );

  const RequestDetail = () => (
    <AnimatePresence>
      {selectedRequest && (
        <motion.div 
          className="request-detail-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedRequest(null)}
        >
          <motion.div 
            className="request-detail-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="detail-header">
              <h3>Request Analysis</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                ×
              </button>
            </div>
            
            <div className="detail-content">
              <div className="detail-section">
                <h4>Prompt</h4>
                <div className="detail-text">{selectedRequest.prompt}</div>
              </div>
              
              <div className="detail-section">
                <h4>AI Response</h4>
                <div className="detail-text">Generated response content would appear here...</div>
              </div>
              
              <div className="detail-section">
                <h4>Risk Breakdown</h4>
                <div className="risk-breakdown">
                  <div className="risk-item">
                    <span>Retrieval Mismatch:</span>
                    <span className="risk-value">Low</span>
                  </div>
                  <div className="risk-item">
                    <span>Contradiction:</span>
                    <span className="risk-value">None</span>
                  </div>
                  <div className="risk-item">
                    <span>Overconfidence:</span>
                    <span className="risk-value">Medium</span>
                  </div>
                </div>
              </div>
              
              <div className="final-decision">
                <div className={`decision-badge ${selectedRequest.status.toLowerCase()}`}>
                  {selectedRequest.status === 'SAFE' && <CheckCircle />}
                  {selectedRequest.status === 'WARN' && <AlertTriangle />}
                  {selectedRequest.status === 'BLOCKED' && <XCircle />}
                  <span>{selectedRequest.status}</span>
                </div>
                <p>{selectedRequest.reason}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const Footer = () => (
    <motion.div 
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 1.2 }}
    >
      <span>WATCHDOG — Real-time AI output control</span>
    </motion.div>
  );

  return (
    <div className="app">
      <Sidebar />
      
      <div className="main-content">
        <TopBar />
        
        <div className="content-area">
          {activeTab === 'overview' && (
            <>
              <HeroSection />
              <RequestsTable />
            </>
          )}
          
          {activeTab === 'traffic' && (
            <RequestsTable />
          )}
          
          {activeTab === 'decisions' && (
            <div className="placeholder-content">
              <h2>Risk Decisions</h2>
              <p>Risk decision analytics and configuration would be displayed here.</p>
            </div>
          )}
          
          {activeTab === 'audit' && (
            <div className="placeholder-content">
              <h2>Audit & Compliance</h2>
              <p>Comprehensive audit logs and compliance reports would be shown here.</p>
            </div>
          )}
          
          {activeTab === 'policies' && (
            <div className="placeholder-content">
              <h2>Policies & Thresholds</h2>
              <p>Policy configuration and threshold management interface would be here.</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="placeholder-content">
              <h2>System Settings</h2>
              <p>System configuration and settings would be displayed here.</p>
            </div>
          )}
        </div>
        
        <Footer />
      </div>
      
      <RequestDetail />
    </div>
  );
}

export default App;
