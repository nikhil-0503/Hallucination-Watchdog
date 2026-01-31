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

const ActivityLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeNav, setActiveNav] = useState('logs');
  
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
    navigate(`/admin/current/${prompt.id}`);
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

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'var(--status-safe)';
    if (confidence >= 50) return 'var(--status-warning)';
    return 'var(--status-blocked)';
  };

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
              <h2 className="card-title">Activity Logs</h2>
              
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
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="control-select"
                >
                  <option value="all">All Status</option>
                  <option value="ALLOW">ALLOW</option>
                  <option value="WARN">WARN</option>
                  <option value="BLOCK">BLOCK</option>
                </select>

                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="control-select"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>

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
                          <div className="confidence-display">
                            <div className="confidence-bar">
                              <motion.div 
                                className="confidence-fill"
                                style={{ backgroundColor: getConfidenceColor(prompt.confidence * 100) }}
                                initial={{ width: 0 }}
                                animate={{ width: `${prompt.confidence * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.3 + index * 0.02 }}
                              />
                            </div>
                            <span style={{ color: getConfidenceColor(prompt.confidence * 100) }}>
                              {Math.round(prompt.confidence * 100)}%
                            </span>
                          </div>
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
                          <motion.button
                            className="action-button"
                            onClick={() => handleViewDetails(prompt)}
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            title="View details"
                          >
                            <Eye size={16} />
                          </motion.button>
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
    </div>
  );
};

export default ActivityLogs;
