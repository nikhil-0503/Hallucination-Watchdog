import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Shield, 
  LogOut, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const UserChatPage = () => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const { chatMessages, isProcessing, submitUserPrompt, clearChat } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isProcessing) return;
    
    await submitUserPrompt(message.trim());
    setMessage('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all messages?')) {
      clearChat();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Safe':
      case 'ALLOW':
        return <CheckCircle size={16} />;
      case 'Warning':
      case 'WARN':
        return <AlertTriangle size={16} />;
      case 'Blocked':
      case 'BLOCK':
        return <XCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    const s = status?.toUpperCase();
    if (s === 'ALLOW' || s === 'SAFE') return 'allow';
    if (s === 'WARN' || s === 'WARNING') return 'warn';
    if (s === 'BLOCK' || s === 'BLOCKED') return 'block';
    return 'allow';
  };

  const renderMessage = (msg, index) => {
    if (msg.type === 'system' && (msg.status === 'BLOCK' || msg.status === 'Blocked')) {
      return (
        <motion.div
          key={msg.id}
          className="message-bubble assistant"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="message-content">
            <span style={{ fontWeight: 600 }}>⛔ Output Blocked</span>
            <p style={{ marginTop: '8px', marginBottom: 0 }}>
              This response has been blocked by the safety system for containing potentially harmful or unsafe content.
            </p>
          </div>
        </motion.div>
      );
    }

    const isWarn = msg.status === 'WARN' || msg.status === 'Warning';
    const statusClass = getStatusClass(msg.status);

    return (
      <motion.div
        key={msg.id}
        className={`message-bubble ${msg.type || 'assistant'}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <div className="message-content">
          {msg.content}
          {isWarn && (
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start',
              fontSize: '0.85rem',
              color: '#fbbf24'
            }}>
              <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>This response may be incomplete or unverified. Please verify independently.</span>
            </div>
          )}
        </div>
        {msg.confidence !== undefined && msg.status !== 'BLOCK' && msg.status !== 'Blocked' && (
          <motion.div 
            className="response-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="status-line">
              <span className="status-label">Status:</span>
              <span className={`status-badge-inline ${statusClass}`}>
                {getStatusIcon(msg.status)}
                <span>{msg.status}</span>
              </span>
            </div>
            <div className="status-line">
              <span className="status-label">Confidence:</span>
              <span className="status-value">{Math.round(msg.confidence * 100)}%</span>
            </div>
            <div className="confidence-bar">
              <motion.div
                className="confidence-fill"
                initial={{ width: 0 }}
                animate={{ width: `${msg.confidence * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="chat-page-premium">
      {/* Header */}
      <motion.header 
        className="chat-header-premium"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="chat-header-left">
          <div className="chat-logo-minimal">
            <Shield size={24} />
            <span>WATCHDOG</span>
          </div>
          <div className="chat-status">
            <div className="status-dot"></div>
            <span>System Active</span>
          </div>
        </div>
        
        <div className="chat-header-right">
          <div className="chat-user-info">
            <div className="chat-user-avatar">
              <User size={16} />
            </div>
            <div className="chat-user-name">{user?.name || user?.email?.split('@')[0]}</div>
          </div>
          <motion.button
            className="btn-chat-logout"
            onClick={handleLogout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Logout"
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </motion.header>

      {/* Chat Container */}
      <div className="chat-container-premium">
        {/* Main Chat */}
        <div className="chat-main-premium">
          {/* Messages Area */}
          <div className="chat-messages-area">
            <AnimatePresence>
              {chatMessages.length === 0 ? (
                <motion.div 
                  className="chat-welcome"
                  key="welcome"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="chat-welcome-icon">
                    <MessageSquare size={40} />
                  </div>
                  <h2 className="chat-welcome-title">Start a Conversation</h2>
                  <p className="chat-welcome-subtitle">
                    Chat with AI knowing your responses are analyzed for safety and fairness in real-time
                  </p>
                  <div className="chat-welcome-tips">
                    <div className="chat-tip">
                      ✓ <strong>Real-time Safety:</strong> Every response is checked for hallucinations
                    </div>
                    <div className="chat-tip">
                      ✓ <strong>Bias Detection:</strong> Automatically analyzes for discrimination patterns
                    </div>
                    <div className="chat-tip">
                      ✓ <strong>Enforced Protection:</strong> Risky responses are blocked or warned
                    </div>
                  </div>
                </motion.div>
              ) : (
                <>
                  {chatMessages.map((msg, index) => renderMessage(msg, index))}
                  {isProcessing && (
                    <motion.div
                      key="loading"
                      className="loading-indicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span>Analyzing response...</span>
                      <div className="loading-dots">
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                        <div className="loading-dot"></div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <motion.div 
            className="chat-input-area"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="chat-input-form">
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Type your question here... (Shift+Enter for new line)"
                  disabled={isProcessing}
                  rows="1"
                />
                <motion.button
                  type="submit"
                  className="btn-send"
                  disabled={isProcessing || !message.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Send size={20} />
                </motion.button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="chat-action-buttons">
              <motion.button
                className="btn-action"
                onClick={handleClearChat}
                disabled={chatMessages.length === 0 || isProcessing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 size={16} />
                Clear Chat
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserChatPage;

  const renderMessage = (msg, index) => {
    if (msg.type === 'system' && msg.status === 'Blocked') {
      // Critical behavior: BLOCKED responses show only this message
      return (
        <motion.div
          key={msg.id}
          className="message system"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <div className="message-content">
            The output cannot be displayed.
          </div>
        </motion.div>
      );
    }

    // Show a visible warning for WARN responses
    const isWarn = msg.status === 'WARN' || msg.status === 'Warning';

    return (
      <motion.div
        key={msg.id}
        className={`message ${msg.type}${isWarn ? ' message-warn' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <div className="message-content">
          {msg.content}
          {isWarn && (
            <div className="warn-banner">
              <AlertTriangle size={16} className="status-warning" style={{ marginRight: 6 }} />
              <span className="warn-text">Caution: This answer may be incomplete, unverified, or risky.</span>
            </div>
          )}
        </div>
        {msg.confidence !== undefined && msg.status !== 'Blocked' && (
          <div className="message-footer">
            <div className="status-indicator">
              {getStatusIcon(msg.status)}
              <span className={`status-${msg.status.toLowerCase()}`}>
                {msg.status}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="header-left">
          <Shield className="logo-icon-small" />
          <div>
            <h1>WATCHDOG Chat</h1>
            <p>AI-Protected Interface</p>
          </div>
        </div>
        
        <div className="header-right">
          <div className="user-info">
            <User size={16} />
            <span>{user?.name || user?.email}</span>
          </div>
          <motion.button
            className="logout-button"
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <LogOut size={16} />
            Logout
          </motion.button>
        </div>
      </header>

      <div className="chat-main">
        <div className="messages-container">
          <AnimatePresence>
            {chatMessages.length === 0 ? (
              <motion.div 
                className="welcome-message"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
              >
                <Shield size={48} />
                <h2>Welcome to WATCHDOG</h2>
                <p>Your AI-protected conversation starts here. All responses are automatically analyzed for safety and accuracy.</p>
                <div className="safety-indicators">
                  <motion.div 
                    className="indicator"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <CheckCircle size={16} className="status-safe" />
                    <span>Safe responses are delivered</span>
                  </motion.div>
                  <motion.div 
                    className="indicator"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <AlertTriangle size={16} className="status-warning" />
                    <span>Warnings for low confidence</span>
                  </motion.div>
                  <motion.div 
                    className="indicator"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <XCircle size={16} className="status-blocked" />
                    <span>Unsafe outputs are blocked</span>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              chatMessages.map((msg, index) => renderMessage(msg, index))
            )}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div 
              className="typing-indicator"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="typing-dots">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
              <span>WATCHDOG analyzing...</span>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="chat-input"
            />
            <motion.button
              type="submit"
              disabled={!message.trim() || isProcessing}
              className="send-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {isProcessing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Shield size={20} />
                </motion.div>
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserChatPage;