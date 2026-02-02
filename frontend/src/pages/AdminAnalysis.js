import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  ArrowLeft, 
  LogOut, 
  User, 
  AlertTriangle,
  Copy,
  Download,
  Clock,
  Calendar,
  Database,
  FileCheck,
  Zap,
  Target,
  BarChart3,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate, useParams } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

const AdminAnalysis = () => {
  const [copiedField, setCopiedField] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { getPromptById, prompts } = useData();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeNav, setActiveNav] = useState('analysis');

  useEffect(() => {
    const loadPrompt = async () => {
      setLoading(true);
      if (id) {
        // Load specific prompt by ID
        const data = await getPromptById(parseInt(id));
        setPrompt(data);
      } else if (prompts && prompts.length > 0) {
        // Load the latest prompt when no ID is provided
        // Prompts are already sorted by timestamp (newest first)
        setPrompt(prompts[0]);
      }
      setLoading(false);
    };
    loadPrompt();
  }, [id, getPromptById, prompts]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-layout" style={{position: 'relative'}}>
        <ParticleBackground particleCount={40} />
        <nav className="admin-navbar" style={{position: 'relative', zIndex: 100}}>
          <div className="navbar-left">
            <div className="navbar-logo">
              <Shield size={24} />
              <span>WATCHDOG</span>
            </div>
          </div>
          <div className="navbar-right">
            <div className="navbar-user">
              <User size={16} />
              <span className="user-name">{user?.name || user?.email}</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        </nav>
        <div className="admin-layout-container">
          <main className="admin-main-content">
            <div className="empty-state">
              <p>Loading...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="admin-dashboard-layout" style={{position: 'relative'}}>
        <ParticleBackground particleCount={40} />
        <nav className="admin-navbar" style={{position: 'relative', zIndex: 100}}>
          <div className="navbar-left">
            <div className="navbar-logo">
              <Shield size={24} />
              <span>WATCHDOG</span>
            </div>
          </div>
          <div className="navbar-right">
            <div className="navbar-user">
              <User size={16} />
              <span className="user-name">{user?.name || user?.email}</span>
              <span className="user-role">Administrator</span>
            </div>
            <motion.button
              className="navbar-logout"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </nav>

        <div className="admin-layout-container">
          <aside className="admin-sidebar">
  <nav className="sidebar-nav">
    <motion.button
      className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
      onClick={() => { setActiveNav('dashboard'); navigate('/admin/dashboard'); }}
      whileHover={{ x: 4 }}
      whileTap={{ x: 2 }}
      style={{
        color: activeNav === 'dashboard' ? '#60a5fa' : '#000',   // active blue, inactive black
        background: activeNav === 'dashboard' ? '#1e3a4c' : '#e5e7eb'
      }}
    >
      <BarChart3 size={18} />
      <span>Dashboard</span>
    </motion.button>

    <motion.button
      className={`nav-item ${activeNav === 'analysis' ? 'active' : ''}`}
      onClick={() => { setActiveNav('analysis'); navigate('/admin/current'); }}
      whileHover={{ x: 4 }}
      whileTap={{ x: 2 }}
      style={{
        color: activeNav === 'analysis' ? '#60a5fa' : '#000',   // black text when not active
        background: activeNav === 'analysis' ? '#1e3a4c' : '#e5e7eb'
      }}
    >
      <AlertTriangle size={18} />
      <span>Current Prompt</span>
    </motion.button>
  </nav>
</aside>


          <main className="admin-main-content">
            <div className="empty-state">
              <AlertTriangle size={48} />
              <h3>No prompt selected</h3>
              <p>Click on a prompt in the Activity Logs to view its analysis</p>
              <motion.button
                className="action-button"
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </motion.button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'var(--status-safe)';
    if (confidence >= 50) return 'var(--status-warning)';
    return 'var(--status-blocked)';
  };

  const confidencePercent = Math.round(prompt.confidence * 100);

  const metrics = [
    {
      title: 'Confidence Level',
      value: `${confidencePercent}%`,
      icon: <Target size={24} />,
      color: getConfidenceColor(confidencePercent),
      description: 'AI response confidence rating',
      showBar: true,
      barValue: confidencePercent
    },
    {
      title: 'RAG Verification',
      value: prompt.rag_status,
      icon: <Database size={24} />,
      color: prompt.rag_status === 'VERIFIED' ? 'var(--color-success)' : 'var(--color-error)',
      description: 'Knowledge base verification status',
      showBar: false
    },
    {
      title: 'Contradiction Check',
      value: prompt.contradiction_check,
      icon: <FileCheck size={24} />,
      color: prompt.contradiction_check === 'PASS' ? 'var(--color-success)' : 'var(--color-error)',
      description: 'Internal consistency verification',
      showBar: false
    }
  ];

  return (
    <div className="admin-dashboard-layout" style={{position: 'relative'}}>
      <ParticleBackground particleCount={40} />
      {/* Top Navbar */}
      <nav className="admin-navbar" style={{position: 'relative', zIndex: 100}}>
        <div className="navbar-left">
          <div className="navbar-logo">
            <Shield size={24} />
            <span>WATCHDOG</span>
          </div>
        </div>
        <div className="navbar-right">
          <div className="navbar-user">
            <User size={16} />
            <span className="user-name">{user?.name || user?.email}</span>
            <span className="user-role">Administrator</span>
          </div>
          <motion.button
            className="navbar-logout"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </nav>

      {/* Main Layout Container */}
      <div className="admin-layout-container">
        {/* Left Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <motion.button
              className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveNav('dashboard'); navigate('/admin/dashboard'); }}
              whileHover={{ x: 4 }}
              whileTap={{ x: 2 }}
              style={{
                color: activeNav === 'dashboard' ? '#60a5fa' : '#000',   // active blue, inactive black
                background: activeNav === 'dashboard' ? '#1e3a4c' : '#e5e7eb'
              }}
            >
              <BarChart3 size={18} />
              <span>Dashboard</span>
            </motion.button>
        
            <motion.button
              className={`nav-item ${activeNav === 'analysis' ? 'active' : ''}`}
              onClick={() => { setActiveNav('analysis'); navigate('/admin/current'); }}
              whileHover={{ x: 4 }}
              whileTap={{ x: 2 }}
              style={{
                color: activeNav === 'analysis' ? '#60a5fa' : '#000',   // black text when not active
                background: activeNav === 'analysis' ? '#1e3a4c' : '#e5e7eb'
              }}
            >
              <AlertTriangle size={18} />
              <span>Current Prompt</span>
            </motion.button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-content" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '2rem'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              maxWidth: '1200px', 
              width: '100%',
              margin: '0 auto'
            }}
          >
            {/* Header with Back Button */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <motion.button
                onClick={handleBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  color: '#FFFFFF',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={18} />
              </motion.button>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#FFFFFF' }}>
                  Prompt Analysis
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#999999' }}>
                  Detailed inspection and verification results
                </p>
              </div>
            </div>

            {/* Meta Information */}
            <div style={{
              background: '#1A1A1A',
              border: '1px solid #2A2A2A',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={16} style={{ color: '#CCCCCC' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase' }}>Timestamp</div>
                  <div style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: '0.25rem' }}>{new Date(prompt.timestamp).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <AlertTriangle size={16} style={{ color: '#CCCCCC' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase' }}>Action</div>
                  <div style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: '0.25rem' }}>{prompt.action}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Target size={16} style={{ color: '#CCCCCC' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase' }}>Risk Score</div>
                  <div style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: '0.25rem' }}>{prompt.risk_score}</div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{
                    background: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: '8px',
                    padding: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ color: metric.color }}>
                      {metric.icon}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>
                        {metric.title}
                      </h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#999999' }}>
                        {metric.description}
                      </p>
                    </div>
                  </div>
                  <motion.div
                    style={{ fontSize: '1.875rem', fontWeight: 700, color: "#EEEEEE", marginBottom: '1rem' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {metric.value}
                  </motion.div>
                  {metric.showBar && (
                    <div style={{
                      height: '6px',
                      background: '#2A2A2A',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        style={{
                          height: '100%',
                          background: metric.color,
                          borderRadius: '3px'
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.barValue}%` }}
                        transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Prompt and Response Sections */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>
                    User Prompt
                  </h3>
                  <motion.button
                    onClick={() => handleCopy(prompt.prompt, 'prompt')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2A2A2A',
                      color: copiedField === 'prompt' ? '#10B981' : '#CCCCCC',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Copy size={14} />
                    {copiedField === 'prompt' ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>
                <div style={{
                  background: '#000000',
                  border: '1px solid #2A2A2A',
                  borderRadius: '6px',
                  padding: '1rem',
                  color: '#CCCCCC',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {prompt.prompt}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  background: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  borderRadius: '8px',
                  padding: '1.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>
                    GPT Answer
                  </h3>
                  <motion.button
                    onClick={() => handleCopy(prompt.gpt_raw_answer, 'response')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'transparent',
                      border: '1px solid #2A2A2A',
                      color: copiedField === 'response' ? '#10B981' : '#CCCCCC',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Copy size={14} />
                    {copiedField === 'response' ? 'Copied!' : 'Copy'}
                  </motion.button>
                </div>
                <div style={{
                  background: '#000000',
                  border: '1px solid #2A2A2A',
                  borderRadius: '6px',
                  padding: '1rem',
                  color: '#CCCCCC',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {prompt.gpt_raw_answer}
                </div>
              </motion.div>
            </div>

            
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminAnalysis;