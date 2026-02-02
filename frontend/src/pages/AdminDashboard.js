import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  LogOut, 
  User, 
  Search, 
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  BarChart3,
  FileText,
  Database,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const { user, logout } = useAuth();
  const { prompts } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSort = (field) => {
    setSortBy(field);
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  const handleViewDetails = (prompt) => {
    // Show modal with prompt details instead of navigating
    setSelectedPrompt(prompt);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrompt(null);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'var(--status-safe)';
    if (confidence >= 0.5) return 'var(--status-warning)';
    return 'var(--status-blocked)';
  };

  // Helper to check if a date is within the time range
  const isWithinTimeRange = (timestampStr, range) => {
    const promptDate = new Date(timestampStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const promptDay = new Date(promptDate.getFullYear(), promptDate.getMonth(), promptDate.getDate());
    
    switch (range) {
      case 'today':
        return promptDay.getTime() === today.getTime();
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return promptDay >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return promptDay >= monthAgo;
      case 'all':
      default:
        return true;
    }
  };

  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    let filtered = prompts.filter(prompt => {
      const matchesSearch = prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prompt.gpt_raw_answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prompt.user_visible_answer.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || prompt.action === statusFilter;
      const matchesTimeRange = isWithinTimeRange(prompt.timestamp, timeRange);
      
      return matchesSearch && matchesStatus && matchesTimeRange;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (sortBy === 'timestamp') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [prompts, searchQuery, statusFilter, sortBy, sortOrder, timeRange]);

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
            title="Logout"
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
        <main className="admin-main-content">
          {/* Content Card */}
          <motion.div
            className="content-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Card Header with Controls */}
            <div className="card-header">
              <h2 className="card-title">Dashboard</h2>
              
              <div className="card-controls">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search prompts, users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <motion.button
                  className="control-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Export data"
                >
                  <Download size={16} />
                </motion.button>

                <motion.button
                  className="control-button"
                  whileHover={{ scale: 1.05, rotate: 180 }}
                  whileTap={{ scale: 0.95 }}
                  title="Refresh"
                >
                  <RefreshCw size={16} />
                </motion.button>
              </div>
            </div>

            {/* Table */}
            <div className="table-wrapper">
              <motion.table 
                className="data-table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <thead>
                  <tr>
                    <th onClick={() => handleSort('timestamp')}>
                      <Calendar size={14} />
                      Timestamp
                    </th>
                    <th>Prompt</th>
                    <th>GPT Answer</th>
                    <th onClick={() => handleSort('confidence')}>
                      Confidence
                    </th>
                    <th>
                      <Database size={14} />
                      RAG
                    </th>
                    <th>
                      <FileCheck size={14} />
                      Contradiction
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredPrompts.map((prompt, index) => (
                      <motion.tr
                        key={prompt.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className="table-row"
                      >
                        <td className="cell-timestamp">
                          <span className="timestamp-badge">{new Date(prompt.timestamp).toLocaleString()}</span>
                        </td>
                        <td className="cell-prompt">
                          <div className="text-truncate" title={prompt.prompt}>
                            {prompt.prompt.length > 50 
                              ? `${prompt.prompt.substring(0, 50)}...`
                              : prompt.prompt
                            }
                          </div>
                        </td>
                        <td className="cell-response">
                          <div className="text-truncate" title={prompt.gpt_raw_answer}>
                            {prompt.gpt_raw_answer.length > 60 
                              ? `${prompt.gpt_raw_answer.substring(0, 60)}...`
                              : prompt.gpt_raw_answer
                            }
                          </div>
                        </td>
                        <td className="cell-confidence">
                          <span style={{ 
                            color: getConfidenceColor(prompt.confidence * 100),
                            fontWeight: 600
                          }}>
                            {Math.round(prompt.confidence * 100)}%
                          </span>
                        </td>
                        <td className="cell-rag">
                          <span 
                            className={`badge badge-${prompt.rag_status.toLowerCase()}`}
                          >
                            {prompt.rag_status}
                          </span>
                        </td>
                        <td className="cell-contradiction">
                          <div className="status-indicator">
                            {prompt.contradiction_check === 'PASS' ? (
                              <>
                                <CheckCircle size={14} className="icon-safe" />
                                <span className="text-safe">Pass</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={14} className="icon-blocked" />
                                <span className="text-blocked">Fail</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="cell-actions">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: prompt.action === 'ALLOW' ? 'var(--status-safe)' : 
                                     prompt.action === 'WARN' ? 'var(--status-warning)' : 
                                     'var(--status-blocked)'
                            }}>
                              {prompt.action}
                            </span>
                            <span style={{ 
                              fontSize: '0.95rem',
                              color: getConfidenceColor(prompt.confidence * 100),
                              fontWeight: 700,
                              background: 'rgba(255,255,255,0.05)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              border: `1px solid ${getConfidenceColor(prompt.confidence * 100)}`
                            }}>
                              {Math.round(prompt.confidence * 100)}%
                            </span>
                            <motion.button
                              className="action-button"
                              onClick={() => handleViewDetails(prompt)}
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              title="View details"
                            >
                              <Eye size={16} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </motion.table>
              
              {filteredPrompts.length === 0 && prompts.length > 0 && (
                <motion.div 
                  className="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Search size={48} />
                  <h3>No prompts found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </main>
      </div>

      {/* Prompt Details Modal */}
      <AnimatePresence>
        {showModal && selectedPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              overflow: 'auto'
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#0a0f1a',
                border: '1px solid #1e3a4c',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '900px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#FFFFFF' }}>Prompt Analysis</h2>
                <motion.button
                  onClick={closeModal}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#CCCCCC',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    padding: '0.25rem'
                  }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Meta Information */}
              <div style={{
                background: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase' }}>Timestamp</div>
                  <div style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: '0.25rem' }}>{new Date(selectedPrompt.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase' }}>Action</div>
                  <div style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: '0.25rem' }}>{selectedPrompt.action}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#999999', textTransform: 'uppercase' }}>Risk Score</div>
                  <div style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: '0.25rem' }}>{selectedPrompt.risk_score}</div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#999999', marginBottom: '0.5rem' }}>Confidence Level</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: '#EEEEEE' }}>
                    {Math.round(selectedPrompt.confidence * 100)}%
                  </div>
                  <div style={{
                    height: '6px',
                    background: '#2A2A2A',
                    borderRadius: '3px',
                    marginTop: '0.75rem',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${selectedPrompt.confidence * 100}%`,
                      background: getConfidenceColor(selectedPrompt.confidence),
                      borderRadius: '3px'
                    }} />
                  </div>
                </div>
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#999999', marginBottom: '0.5rem' }}>RAG Verification</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedPrompt.rag_status === 'VERIFIED' ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {selectedPrompt.rag_status}
                  </div>
                </div>
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#999999', marginBottom: '0.5rem' }}>Contradiction Check</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: selectedPrompt.contradiction_check === 'PASS' ? 'var(--color-success)' : 'var(--color-error)' }}>
                    {selectedPrompt.contradiction_check}
                  </div>
                </div>
              </div>

              {/* Prompt and Response */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '1rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>User Prompt</h3>
                  <div style={{
                    background: '#000000',
                    border: '1px solid #2A2A2A',
                    borderRadius: '6px',
                    padding: '1rem',
                    color: '#CCCCCC',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {selectedPrompt.prompt}
                  </div>
                </div>
                <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '1rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>GPT Answer</h3>
                  <div style={{
                    background: '#000000',
                    border: '1px solid #2A2A2A',
                    borderRadius: '6px',
                    padding: '1rem',
                    color: '#CCCCCC',
                    fontSize: '0.9rem',
                    lineHeight: '1.6',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {selectedPrompt.gpt_raw_answer}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                <motion.button
                  onClick={closeModal}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: '#1e3a4c',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '0.75rem 2rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;