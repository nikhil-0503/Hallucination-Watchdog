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
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { user, logout } = useAuth();
  const { prompts, systemMetrics } = useData();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleViewDetails = (promptId) => {
    navigate(`/admin/analysis/${promptId}`);
  };

  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    let filtered = prompts.filter(prompt => {
      const matchesSearch = prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prompt.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prompt.response.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || prompt.status === statusFilter;
      
      return matchesSearch && matchesStatus;
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
  }, [prompts, searchQuery, statusFilter, timeRange, sortBy, sortOrder]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Safe':
        return <CheckCircle size={14} className="status-safe" />;
      case 'Warning':
        return <AlertTriangle size={14} className="status-warning" />;
      case 'Blocked':
        return <XCircle size={14} className="status-blocked" />;
      default:
        return <Activity size={14} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Safe': return 'var(--status-safe)';
      case 'Warning': return 'var(--status-warning)';
      case 'Blocked': return 'var(--status-blocked)';
      default: return 'var(--text-primary)';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'var(--status-safe)';
    if (confidence >= 50) return 'var(--status-warning)';
    return 'var(--status-blocked)';
  };

  const getRagStatusColor = (status) => {
    switch (status) {
      case 'Yes': return 'var(--status-safe)';
      case 'Partial': return 'var(--status-warning)';
      case 'No': return 'var(--status-blocked)';
      default: return 'var(--text-tertiary)';
    }
  };

  const statsCards = [
    {
      title: 'Total Prompts',
      value: systemMetrics.totalPrompts.toLocaleString(),
      icon: <Activity size={24} />,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Blocked Prompts',
      value: systemMetrics.blockedPrompts.toLocaleString(),
      icon: <XCircle size={24} />,
      change: '-8%',
      trend: 'down'
    },
    {
      title: 'Avg Confidence',
      value: `${systemMetrics.averageConfidence}%`,
      icon: <TrendingUp size={24} />,
      change: '+2%',
      trend: 'up'
    },
    {
      title: 'System Uptime',
      value: systemMetrics.uptime,
      icon: <Shield size={24} />,
      change: systemMetrics.responseTime,
      trend: 'neutral'
    }
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-left">
          <Shield className="logo-icon-small" />
          <div>
            <h1>WATCHDOG Admin</h1>
            <p>AI Hallucination Detection Dashboard</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <User size={16} />
            <span>{user?.name || user?.email}</span>
            <span className="admin-badge">Administrator</span>
          </div>
          <motion.button
            className="logout-button"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={16} />
            Logout
          </motion.button>
        </div>
      </header>

      <div className="stats-grid">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <div className="stats-header">
              <div className="stats-icon">{stat.icon}</div>
              <div className={`stats-trend ${stat.trend}`}>
                {stat.trend === 'up' && <TrendingUp size={14} />}
                {stat.trend === 'down' && <TrendingDown size={14} />}
                <span>{stat.change}</span>
              </div>
            </div>
            <motion.div 
              className="stats-value"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              {stat.value}
            </motion.div>
            <div className="stats-title">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      <div className="controls-section">
        <div className="search-controls">
          <div className="search-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search prompts, users, or responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="Safe">Safe</option>
            <option value="Warning">Warning</option>
            <option value="Blocked">Blocked</option>
          </select>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="filter-select"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>

          <motion.button
            className="action-button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download size={16} />
            Export
          </motion.button>

          <motion.button
            className="action-button"
            whileHover={{ scale: 1.02, rotate: 180 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={16} />
          </motion.button>
        </div>
      </div>

      <div className="table-container">
        <motion.table 
          className="prompts-table"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <thead>
            <tr>
              <th 
                onClick={() => {
                  setSortBy('timestamp');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
                className="sortable"
              >
                <Calendar size={14} />
                Timestamp
              </th>
              <th 
                onClick={() => {
                  setSortBy('user');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
                className="sortable"
              >
                <User size={14} />
                User
              </th>
              <th>Prompt</th>
              <th>GPT Raw Answer</th>
              <th 
                onClick={() => {
                  setSortBy('confidence');
                  setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                }}
                className="sortable"
              >
                Confidence Level
              </th>
              <th>
                <Database size={14} />
                RAG Status
              </th>
              <th>
                <FileCheck size={14} />
                Contradiction
              </th>
              <th>
                <Clock size={14} />
                Processing
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
                  transition={{ duration: 0.3, delay: index * 0.02, ease: [0.4, 0.0, 0.2, 1] }}
                  className={prompt.flagged ? 'flagged-row' : ''}
                  whileHover={{ backgroundColor: 'var(--surface-hover)' }}
                >
                  <td className="timestamp-cell">
                    {prompt.timestamp}
                  </td>
                  <td className="user-cell">{prompt.user}</td>
                  <td className="prompt-cell">
                    <div className="prompt-preview">
                      {prompt.prompt.length > 60 
                        ? `${prompt.prompt.substring(0, 60)}...`
                        : prompt.prompt
                      }
                    </div>
                  </td>
                  <td className="response-cell">
                    <div className="response-preview">
                      {prompt.response.length > 80 
                        ? `${prompt.response.substring(0, 80)}...`
                        : prompt.response
                      }
                    </div>
                  </td>
                  <td className="confidence-cell">
                    <div className="confidence-indicator">
                      <div className="confidence-bar">
                        <motion.div 
                          className="confidence-fill"
                          style={{ backgroundColor: getConfidenceColor(prompt.confidence) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${prompt.confidence}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + index * 0.02 }}
                        />
                      </div>
                      <span style={{ color: getConfidenceColor(prompt.confidence) }}>
                        {prompt.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="rag-status-cell">
                    <span 
                      className="status-badge"
                      style={{ 
                        color: getRagStatusColor(prompt.ragStatus),
                        borderColor: getRagStatusColor(prompt.ragStatus) 
                      }}
                    >
                      {prompt.ragStatus}
                    </span>
                  </td>
                  <td className="contradiction-cell">
                    <div className="contradiction-check">
                      {prompt.contradictionCheck === 'Pass' ? (
                        <>
                          <CheckCircle size={14} className="status-safe" />
                          <span className="status-safe">Pass</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={14} className="status-blocked" />
                          <span className="status-blocked">Fail</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="processing-cell">
                    {prompt.processingTime.toFixed(1)}s
                  </td>
                  <td className="actions-cell">
                    <motion.button
                      className="view-button"
                      onClick={() => handleViewDetails(prompt.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye size={14} />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </motion.table>
        
        {filteredPrompts.length === 0 && (
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
    </div>
  );
};

export default AdminDashboard;