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
  MessageSquare
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Safe':
        return <CheckCircle size={16} className="status-safe" />;
      case 'Warning':
        return <AlertTriangle size={16} className="status-warning" />;
      case 'Blocked':
        return <XCircle size={16} className="status-blocked" />;
      default:
        return null;
    }
  };

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