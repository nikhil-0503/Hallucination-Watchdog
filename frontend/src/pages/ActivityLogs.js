import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Database,
  FileCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { toIST } from '../utils/timezone';
import AdminLayout from '../components/AdminLayout';

const ActivityLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const [exportFormat, setExportFormat] = useState('json');

  const { prompts } = useData();
  const navigate = useNavigate();

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const isWithinTimeRange = (timestampStr, range) => {
    const promptDate = new Date(timestampStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const promptDay = new Date(promptDate.getFullYear(), promptDate.getMonth(), promptDate.getDate());

    switch (range) {
      case 'today': return promptDay.getTime() === today.getTime();
      case 'week':
        const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
        return promptDay >= weekAgo;
      case 'month':
        const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);
        return promptDay >= monthAgo;
      default: return true;
    }
  };

  const filteredPrompts = useMemo(() => {
    let filtered = prompts.filter(prompt => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        (prompt.prompt && prompt.prompt.toLowerCase().includes(q)) ||
        (prompt.gpt_raw_answer && prompt.gpt_raw_answer.toLowerCase().includes(q)) ||
        (prompt.user_visible_answer && prompt.user_visible_answer.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || prompt.action === statusFilter;
      const matchesTime = isWithinTimeRange(prompt.timestamp, timeRange);
      return matchesSearch && matchesStatus && matchesTime;
    });

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
      return sortOrder === 'desc' ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });

    return filtered;
  }, [prompts, searchQuery, statusFilter, sortBy, sortOrder, timeRange]);

  const getConfidenceColor = (confidence) => {
    const pct = Math.round((confidence || 0) * 100);
    if (pct >= 80) return 'var(--success)';
    if (pct >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  const handleExport = () => {
    const timestamp = new Date().toISOString().slice(0,10);
    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(filteredPrompts, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watchdog-logs-${timestamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      const headers = ['id','timestamp','prompt','gpt_raw_answer','user_visible_answer','confidence','rag_status','contradiction_check','action','risk_score'];
      const rows = filteredPrompts.map(p => headers.map(h => {
        const val = p[h] ?? '';
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watchdog-logs-${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'txt') {
      const lines = filteredPrompts.map((p, i) => {
        return `Record #${p.id}\nTimestamp: ${toIST(p.timestamp)}\nStatus: ${p.action}\nConfidence: ${Math.round((p.confidence||0)*100)}%\nRAG: ${p.rag_status}\nContradiction: ${p.contradiction_check}\nPrompt: ${p.prompt}\nResponse: ${p.user_visible_answer}\n---`;
      });
      const txt = lines.join('\n\n');
      const blob = new Blob([txt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `watchdog-logs-${timestamp}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AdminLayout>
      <div>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="page-header"
        >
          <div>
            <h1 className="page-title page-title-gradient">Activity Logs</h1>
            <p className="page-subtitle">Searchable, filterable decision history</p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ marginBottom: '1.5rem' }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search prompts, responses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
              />
            </div>
            <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="ALLOW">ALLOW</option>
              <option value="WARN">WARN</option>
              <option value="BLOCK">BLOCK</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select className="form-select" style={{ width: 'auto' }} value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="txt">TXT</option>
            </select>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExport} className="btn btn-secondary btn-icon-only" title="Export">
              <Download size={16} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, rotate: 180 }} whileTap={{ scale: 0.95 }} className="btn btn-ghost btn-icon-only" title="Refresh">
              <RefreshCw size={16} />
            </motion.button>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="section-card"
        >
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer' }}>
                    <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    Timestamp {sortBy === 'timestamp' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th>Prompt</th>
                  <th>GPT Answer</th>
                  <th onClick={() => handleSort('confidence')} style={{ cursor: 'pointer' }}>
                    Confidence {sortBy === 'confidence' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th><Database size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />RAG</th>
                  <th><FileCheck size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />Contradiction</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredPrompts.map((prompt, index) => (
                    <motion.tr
                      key={prompt.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ delay: index * 0.015 }}
                    >
                      <td>
                        <span className="badge badge-neutral font-mono">
                          {toIST(prompt.timestamp)}
                        </span>
                      </td>
                      <td className="truncate" style={{ maxWidth: 200 }} title={prompt.prompt}>
                        {prompt.prompt?.length > 40 ? `${prompt.prompt.substring(0, 40)}...` : prompt.prompt}
                      </td>
                      <td className="truncate" style={{ maxWidth: 240 }} title={prompt.gpt_raw_answer}>
                        {prompt.gpt_raw_answer?.length > 50 ? `${prompt.gpt_raw_answer.substring(0, 50)}...` : prompt.gpt_raw_answer}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="confidence-track" style={{ width: 60 }}>
                            <motion.div
                              className="confidence-fill"
                              style={{ background: getConfidenceColor(prompt.confidence) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${(prompt.confidence || 0) * 100}%` }}
                              transition={{ duration: 0.6, delay: 0.2 + index * 0.02 }}
                            />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getConfidenceColor(prompt.confidence) }}>
                            {Math.round((prompt.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${prompt.rag_status?.toLowerCase() === 'verified' ? 'success' : 'warning'}`}>
                          {prompt.rag_status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          {prompt.contradiction_check === 'PASS' ? (
                            <><CheckCircle2 size={14} style={{ color: 'var(--success)' }} /><span style={{ color: 'var(--success-light)', fontSize: '0.8rem' }}>Pass</span></>
                          ) : (
                            <><XCircle size={14} style={{ color: 'var(--danger)' }} /><span style={{ color: 'var(--danger-light)', fontSize: '0.8rem' }}>Fail</span></>
                          )}
                        </div>
                      </td>
                      <td>
                        <motion.button
                          className="btn btn-secondary btn-icon-only"
                          onClick={() => navigate(`/admin/current/${prompt.id}`)}
                          whileHover={{ scale: 1.1 }}
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
            </table>

            {filteredPrompts.length === 0 && (
              <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Search size={48} className="empty-state-icon" />
                <h3>No prompts found</h3>
                <p>Try adjusting your search criteria or filters</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs;

