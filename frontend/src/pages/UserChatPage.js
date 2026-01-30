import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ParticleBackground from '../components/ParticleBackground';

const UserChatPage = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const { submitUserPrompt, isLoading } = useData();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');

    try {
      const response = await submitUserPrompt(currentPrompt);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.safe_output || response.message || 'Response received',
        timestamp: new Date(),
        action: response.action
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <ParticleBackground particleCount={60} />
      
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Navbar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="navbar"
          style={{ margin: 'var(--space-6)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="sidebar-brand-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div>
              <h1 className="navbar-title">WATCHDOG Chat</h1>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-tertiary)' }}>
                AI Safety Platform
              </p>
            </div>
          </div>
          <div className="navbar-actions">
            <div className="user-info">
              <div className="user-avatar">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
              <div>
                <div className="user-name">{user?.email}</div>
                <div className="user-role">User</div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
            >
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Chat Container */}
        <div className="chat-container" style={{ padding: '0 var(--space-6) var(--space-6)' }}>
          {/* Messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="chat-messages"
          >
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <div className="empty-state-title">Start a Conversation</div>
                <div className="empty-state-description">
                  Ask anything - WATCHDOG will analyze and ensure safe responses
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`message ${msg.role}`}
                  >
                    <div className="message-avatar">
                      {msg.role === 'user' ? (
                        <i className="fas fa-user"></i>
                      ) : (
                        <i className="fas fa-robot"></i>
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">
                          {msg.role === 'user' ? 'You' : 'WATCHDOG AI'}
                        </span>
                        <span className="message-time">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="message-text">
                        {msg.content}
                        {msg.action && (
                          <div style={{ marginTop: 'var(--space-3)' }}>
                            <span className={`badge badge-${msg.action === 'ALLOW' ? 'success' : msg.action === 'WARN' ? 'warning' : 'error'}`}>
                              {msg.action}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </motion.div>

          {/* Input */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="chat-input-container"
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="chat-input"
              rows={1}
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="chat-send-btn"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default UserChatPage;
